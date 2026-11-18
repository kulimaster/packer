# Deploy runbook

Dvě prostředí, dva různé nástroje:

| Prostředí | Co běží | Čím se to spravuje |
|---|---|---|
| Lokálně | jen PostgreSQL, API i web nativně (`dotnet run`, `npm run dev`) | `deploy/compose.dev.yaml` |
| VPS | PostgreSQL + API + Caddy s frontendem | Quadlet units v `deploy/quadlet/`, nasazuje `deploy/deploy.sh` |

Soubory:

```
deploy/Containerfile.api        API image (nese i migrační bundle)
deploy/Containerfile.web        frontend build + Caddy
deploy/Caddyfile                TLS, statický build, /api proxy
deploy/compose.yaml             smoke test produkčních image na jednom stroji
deploy/deploy.sh                nasazení, upgrade, rollback
deploy/backup.sh                záloha databáze + kontrola, že je čitelná
deploy/quadlet/                 systemd units pro VPS
```

## Lokální vývoj

```bash
cp deploy/.env.example deploy/.env
podman compose -f deploy/compose.dev.yaml up -d
```

Connection string do API (mimo git, jen pro Development):

```bash
dotnet user-secrets set "ConnectionStrings:Default" \
  "Host=localhost;Port=5442;Database=packer;Username=packer;Password=packer" \
  --project apps/api/src/Packer.Api
```

Port 5442 proto, že 5432 na vývojovém stroji často zabírá jiný projekt.
Uvnitř kontejneru je to pořád standardních 5432.

Zastavení: `podman compose -f deploy/compose.dev.yaml down`
Smazání dat: `podman volume rm packer-dev_db-data`

## Smoke test produkčních image

Než se image pošle na server, dá se celý řetěz spustit lokálně. Buildí se stejné
Containerfily jako v CI, takže se chytí rozbitý Dockerfile i chybějící soubor.

```bash
podman compose -f deploy/compose.yaml up --build
# http://localhost:8080 – přihlášení, výlet, import šablony
podman compose -f deploy/compose.yaml down -v
```

Web tu běží na `PACKER_DOMAIN=:80`, tedy prosté HTTP bez TLS (na localhostu by
Let's Encrypt stejně nefungoval). Pro produkci se doména předává z `packer.env`.

Když `podman compose` na tvém stroji spustí docker-compose, který neumí mluvit
s Podman socketem (typicky Windows), projdi tytéž kroky ručně:

```bash
podman network create packer-smoke
podman run -d --name smoke-db --network packer-smoke --network-alias smoke-db \
  -e POSTGRES_USER=packer -e POSTGRES_PASSWORD=packer -e POSTGRES_DB=packer \
  docker.io/library/postgres:18-alpine

podman build -f deploy/Containerfile.api -t packer-api:smoke .
podman build -f deploy/Containerfile.web -t packer-web:smoke .

# migrace: stejný image, jiný entrypoint
podman run --rm --network packer-smoke \
  -e "ConnectionStrings__Default=Host=smoke-db;Port=5432;Database=packer;Username=packer;Password=packer" \
  --entrypoint /app/efbundle packer-api:smoke

podman run -d --name smoke-api --network packer-smoke --network-alias packer-api \
  -e "ConnectionStrings__Default=Host=smoke-db;Port=5432;Database=packer;Username=packer;Password=packer" \
  -e DataProtection__KeysPath=/var/lib/packer/keys \
  -v smoke-keys:/var/lib/packer/keys packer-api:smoke

podman run -d --name smoke-web --network packer-smoke \
  -e PACKER_DOMAIN=:80 -e PACKER_ACME_EMAIL=smoke@example.invalid \
  -p 8080:80 packer-web:smoke
```

Úklid: `podman rm -f smoke-web smoke-api smoke-db && podman network rm packer-smoke && podman volume rm smoke-keys`.

## Produkce – jak to vypadá

```
┌──────────────────────────┐
│ packer-web (Caddy)       │  80/443 ven, TLS, /srv = statický build
│   /api/*, /health ───────┼──► packer-api:8080 (jen v síti packer)
└──────────────────────────┘
             packer-api ───┼──► packer-db:5432 (bez publikovaného portu)
```

Všechno rootless pod uživatelem, který vlastní Podman (dál `packer`). Kontejnery
jsou systemd user services, takže přežijí reboot a mají logy v `journalctl`.

### Jednorázové nastavení VPS

```bash
# 1. Podman a user services běžící i bez přihlášení
sudo apt install podman            # nebo dnf
sudo loginctl enable-linger packer

# 2. Rootless Podman smí na porty 80/443
echo 'net.ipv4.ip_unprivileged_port_start=80' | sudo tee /etc/sysctl.d/99-packer.conf
sudo sysctl --system

# 3. Firewall: jen SSH a HTTP(S)
sudo ufw allow 22,80,443/tcp && sudo ufw enable

# 4. Repo na serveru (drží units, deploy a backup skript)
sudo mkdir -p /srv && sudo chown packer: /srv
git clone https://github.com/kulimaster/packer.git /srv/packer

# 5. Prostředí – heslo k DB, doména, e-mail pro Let's Encrypt
mkdir -p ~/.config/containers/systemd
cp /srv/packer/deploy/quadlet/packer.env.example ~/.config/containers/systemd/packer.env
chmod 600 ~/.config/containers/systemd/packer.env
$EDITOR ~/.config/containers/systemd/packer.env
```

`packer.env` obsahuje heslo, proto je jen na serveru (mimo git) a s právy 600.
Soubor musí mít LF konce řádků a hodnoty se v něm neinterpolují – heslo je proto
na dvou místech (`POSTGRES_PASSWORD` i v `ConnectionStrings__Default`).

### GHCR

CI publikuje image jen z `main`, s tagem commitu (nikdy `latest`). Balíčky jsou
po prvním pushi privátní; buď je v GitHubu přepni na public, nebo se na serveru
přihlas tokenem s právem `read:packages`:

```bash
podman login ghcr.io -u <github-uzivatel>
```

### První nasazení

Nejdřív musí doména z `PACKER_DOMAIN` mířit na VPS (A/AAAA záznam), jinak Caddy
nedostane certifikát. Pak:

```bash
cd /srv/packer
./deploy/deploy.sh <commit-sha>
```

Skript dělá čtyři věci a na konci ověří `/health`:

1. `podman pull` obou image – když chybí, spadne dřív, než se něco restartuje.
2. Vygeneruje units do `~/.config/containers/systemd/` (dosadí tag za `@SHA@`).
3. Aplikuje migrace jedním `podman run --entrypoint /app/efbundle`.
4. Restartuje `packer-api` a `packer-web`.

Migrace neběží při bootu – jsou explicitní krok nasazení. Automatická migrace
při startu je pohodlná, dokud jednou neaktualizuje databázi, kterou ještě
obsluhuje stará verze.

### Běžný upgrade

Stejný příkaz s novým SHA (typicky `git rev-parse HEAD` po pullu):

```bash
git -C /srv/packer pull
./deploy/deploy.sh "$(git -C /srv/packer rev-parse HEAD)"
```

### Rollback

```bash
./deploy/deploy.sh <predchozi-sha> --no-migrate
```

Migrace jsou dopředné. Když nová verze přidala sloupec nebo tabulku, starý kód
funguje dál a `--no-migrate` je bezpečné. Když migrace něco měnila nebo mazala,
rollback kódu nestačí – obnov zálohu (níže).

## Zálohy

`deploy/backup.sh` udělá `pg_dump -Fc`, ověří, že se soubor dá přečíst
(`pg_restore --list`), a smaže zálohy starší než `PACKER_BACKUP_KEEP_DAYS` (14 dní).

```bash
/srv/packer/deploy/backup.sh          # ručně
```

Denní automatika přes systemd user timer:

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/packer-backup.service <<'EOF'
[Unit]
Description=Packer – záloha databáze

[Service]
Type=oneshot
ExecStart=/srv/packer/deploy/backup.sh
EOF

cat > ~/.config/systemd/user/packer-backup.timer <<'EOF'
[Unit]
Description=Packer – denní záloha

[Timer]
OnCalendar=*-*-* 03:15:00
RandomizedDelaySec=10m
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now packer-backup.timer
systemctl --user list-timers packer-backup.timer
```

Zálohy samotné jsou jen půlka věci – **offsite kopie** je druhá. Nejjednodušší
varianta je `rclone` v témže timeru (`ExecStartPost=`), cílí na B2/S3.

### Ověření, že záloha opravdu jde obnovit

Jednou za čas (a vždycky po změně schématu) projdi obnovu do vedlejší databáze:

```bash
DUMP=$(ls -t ~/backups/packer/*.dump | head -n1)
podman exec packer-db createdb -U packer packer_restore_check
podman exec -i packer-db pg_restore -U packer -d packer_restore_check --no-owner < "$DUMP"
podman exec packer-db psql -U packer -d packer_restore_check -c 'select count(*) from trips'
podman exec packer-db dropdb -U packer packer_restore_check
```

### Obnova naostro

```bash
systemctl --user stop packer-api
podman exec -i packer-db pg_restore -U packer -d packer --clean --if-exists --no-owner < ~/backups/packer/<soubor>.dump
systemctl --user start packer-api
```

## Provoz a diagnostika

```bash
systemctl --user status packer-api packer-web packer-db
journalctl --user -u packer-api -n 100 --no-pager
journalctl --user -u packer-web -n 50 --no-pager      # Caddy: access log i chyby
podman ps --format '{{.Names}}\t{{.Status}}'
podman healthcheck run packer-api
curl -fsS https://<doména>/health                       # {"status":"ok"}
```

Časté případy:

| Příznak | Příčina a řešení |
|---|---|
| `bind: permission denied` na portu 80 | chybí `net.ipv4.ip_unprivileged_port_start=80` |
| Caddy hlásí ACME chybu | doména nemíří na VPS, nebo je port 80 zavřený |
| Caddy: `wrong argument count … after 'email'` | v `packer.env` chybí `PACKER_ACME_EMAIL` |
| API padá hned po startu | chybí/nesedí `ConnectionStrings__Default` v `packer.env` |
| Po nasazení jsou všichni odhlášení | nepřipojený volume `packer-dp-keys` (`DataProtection__KeysPath`) |
| `401` na všechny mutace | chybí CSRF token – klient si musí vyžádat `GET /api/auth/csrf` |

## Checklist před prvním nasazením

- [ ] VPS: firewall jen 22/80/443, SSH jen klíče, root login zakázán
- [ ] `net.ipv4.ip_unprivileged_port_start=80` + `loginctl enable-linger`
- [ ] Doména míří na VPS, `packer.env` má správné heslo a doménu
- [ ] GHCR: balíčky public nebo `podman login` na serveru
- [ ] Smoke test image lokálně (`deploy/compose.yaml`)
- [ ] Zálohy: timer běží a **obnova je vyzkoušená**
- [ ] Monitoring: alespoň `/health` a alert na pád služby
