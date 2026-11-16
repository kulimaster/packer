# Deploy runbook

## Lokální vývoj

```bash
cp deploy/.env.example deploy/.env
podman compose -f deploy/compose.dev.yaml up -d
```

Connection string do API (mimo git):

```bash
dotnet user-secrets set "ConnectionStrings:Default" \
  "Host=localhost;Port=5442;Database=packer;Username=packer;Password=packer" \
  --project apps/api/src/Packer.Api
```

Port 5442 proto, že 5432 na vývojovém stroji často zabírá jiný projekt.
Uvnitř kontejneru je to pořád standardních 5432.

Zastavení: `podman compose -f deploy/compose.dev.yaml down`
Smazání dat: `podman volume rm packer-dev_db-data`

## Produkce – cílový stav (ADR 0003)

```
Caddy (TLS + statický build)  →  Packer.Api  →  PostgreSQL
```

Na VPS poběží kontejnery jako **Quadlet** systemd units, ne compose.
Soubory (`deploy/Containerfile.api`, `deploy/compose.yaml`, `deploy/Caddyfile`, `deploy/quadlet/`)
přibudou ve chvíli, kdy bude co nasazovat – prázdné konfigurace v repu jen matou.

### Checklist před prvním nasazením

- [ ] VPS: firewall jen 22/80/443, SSH jen klíče, root login zakázán
- [ ] `net.ipv4.ip_unprivileged_port_start=80` (rootless Podman)
- [ ] GHCR image tagovaný commitem, ne `latest`
- [ ] Migrace jako samostatný krok před startem API (`dotnet ef migrations bundle`)
- [ ] Denní `pg_dump` + offsite kopie
- [ ] **Otestovaná obnova ze zálohy** – bez toho se nenasazuje
- [ ] Monitoring: alespoň healthcheck endpoint a alert na pád kontejneru

### Rollback

```bash
# image tag = commit SHA, žádný latest
podman pull ghcr.io/kulimaster/packer-api:<predchozi-sha>
# přepnutí Quadlet unit na předchozí tag + systemctl --user restart packer-api
```

## Zálohy

```bash
podman exec packer-db pg_dump -U packer packer | gzip > packer-$(date +%F).sql.gz
```

Obnova: `gunzip -c packer-2026-11-16.sql.gz | podman exec -i packer-db psql -U packer -d packer`

Automatizace (cron na hostiteli) a offsite úložiště přijdou s nasazením.
