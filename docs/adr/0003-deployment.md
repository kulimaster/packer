# 0003 – Nasazení

- **Status:** Přijato
- **Datum:** 2026-11-16
- **Kontext:** Aplikace poběží na vlastním VPS. Vývojář preferuje Podman před Dockerem.
  Jsou potřeba TLS certifikáty, zálohy databáze a rozumný rollback.

## Rozhodnutí

**Jeden VPS + Podman + Caddy.**

```
Caddy (TLS, statický build, /api → proxy)
  ├── Packer.Api (kontejner)
  └── PostgreSQL (kontejner, jen interní síť)
```

| Věc | Volba |
|---|---|
| Runtime | Podman, rootless |
| Orchestrace na serveru | **Quadlet** (systemd units), ne compose |
| Orchestrace lokálně | `podman compose` (`deploy/compose.dev.yaml`) |
| TLS | Caddy, automatické Let's Encrypt |
| Registry | GHCR, image tagované commitem SHA |
| Migrace | `dotnet ef migrations bundle`, spouští se před `up` |
| Zálohy | `pg_dump` denně + offsite (B2/S3), testovaná obnova |

## Důsledky

**Pozitiva**

- Žádný vendor lock-in, plná kontrola, řádově nižší cena než managed platforma.
- Caddy řeší TLS bez konfigurace.
- Quadlet = kontejnery jsou systemd služby: start po rebootu, `journalctl`, `systemctl restart`.

**Negativa**

- Veškerý ops je na vývojáři: update OS, TLS (řeší Caddy), zálohy, monitoring.
- Rootless Podman nemůže bindovat 80/443 bez `sysctl net.ipv4.ip_unprivileged_port_start=80`.
- `podman compose` je tenčí než `docker compose` – proto na serveru Quadlet, ne compose.
- Quadlet neumí v `Image=` číst proměnné prostředí. Tag commitu proto doplňuje
  `deploy/deploy.sh` při generování units (v repu je placeholder `@SHA@`),
  místo aby se tag tahal z `.env` až za běhu.

## Pravidla pro produkci

- Firewall: jen 22, 80, 443. Postgres nikdy ven.
- SSH jen klíče, root login zakázán.
- `latest` tag se nepoužívá. Rollback = předchozí SHA tag.
- **Bez otestované obnovy ze zálohy se nenasazuje.**

## Alternativy a proč ne

| Alternativa | Proč ne |
|---|---|
| Azure App Service | měsíční náklady, vendor lock-in, vývojář chce vlastní VPS |
| Kubernetes | massively overkill pro jednu aplikaci |
| Vercel + managed Postgres | Vercel je JS-only, backend v .NET tam nepatří |
| Docker Swarm | mrtvá technologie |
