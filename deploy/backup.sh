#!/usr/bin/env bash
#
# Denní záloha databáze. Spouští se jako uživatel, který vlastní rootless Podman.
#
#   ./backup.sh
#   PACKER_BACKUP_DIR=/mnt/backup PACKER_BACKUP_KEEP_DAYS=30 ./backup.sh
#
# Výstup: $PACKER_BACKUP_DIR/packer-<UTC>.dump (pg_dump custom formát, obnovitelný
# přes pg_restore). Záloha se hned ověří čtením katalogu – prázdný nebo
# poškozený soubor nesmí zůstat ležet jako "záloha".

set -euo pipefail

BACKUP_DIR="${PACKER_BACKUP_DIR:-$HOME/backups/packer}"
KEEP_DAYS="${PACKER_BACKUP_KEEP_DAYS:-14}"
CONTAINER="${PACKER_DB_CONTAINER:-packer-db}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$BACKUP_DIR/packer-$STAMP.dump"

mkdir -p "$BACKUP_DIR"

# Uživatel i databázi bere z prostředí kontejneru – nikde je neduplikujeme.
podman exec "$CONTAINER" sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$FILE"

if [[ ! -s "$FILE" ]]; then
  rm -f "$FILE"
  echo "chyba: záloha je prázdná" >&2
  exit 1
fi

if ! podman exec -i "$CONTAINER" pg_restore --list < "$FILE" > /dev/null; then
  echo "chyba: záloha $FILE se nedá přečíst" >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'packer-*.dump' -type f -mtime "+$KEEP_DAYS" -delete

printf 'záloha hotova: %s (%s)\n' "$FILE" "$(du -h "$FILE" | cut -f1)"
