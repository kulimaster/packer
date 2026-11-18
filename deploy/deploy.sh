#!/usr/bin/env bash
#
# Nasazení Packeru na VPS.
#
# Pouští se jako uživatel, který vlastní rootless Podman (typicky `packer`), ne jako root.
#
#   ./deploy.sh <commit-sha>              # pull → migrace → restart → health
#   ./deploy.sh <commit-sha> --no-migrate # bez migrací (např. když běží sólo oprava)
#   ./deploy.sh <starší-sha>              # rollback kódu (migrace jsou dopředné!)
#
# Předpoklady: naklonované repo na serveru a vyplněný
# ~/.config/containers/systemd/packer.env (vzor: deploy/quadlet/packer.env.example).

set -euo pipefail

die() { printf 'chyba: %s\n' "$*" >&2; exit 1; }
step() { printf '\n==> %s\n' "$*"; }

TAG="${1:-}"
SKIP_MIGRATE=false
if [[ "${2:-}" == "--no-migrate" ]]; then
  SKIP_MIGRATE=true
fi

REGISTRY="${PACKER_REGISTRY:-ghcr.io/kulimaster}"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/containers/systemd"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$UNIT_DIR/packer.env"

if [[ -z "$TAG" ]]; then
  die "použití: $0 <commit-sha> [--no-migrate]"
fi

if [[ "$TAG" == "latest" ]]; then
  die "tag 'latest' se nepoužívá – nasazuj konkrétní commit"
fi

if [[ ! "$TAG" =~ ^[0-9a-f]{7,40}$ ]]; then
  die "tag musí být commit SHA (7–40 hex znaků), ne '$TAG'"
fi

command -v podman >/dev/null || die "chybí podman"
command -v systemctl >/dev/null || die "chybí systemctl"
[[ -f "$ENV_FILE" ]] || die "chybí $ENV_FILE – vzor je deploy/quadlet/packer.env.example"
chmod 600 "$ENV_FILE"

mkdir -p "$UNIT_DIR"

step "Stahuji image pro commit $TAG"
podman pull "$REGISTRY/packer-api:$TAG"
podman pull "$REGISTRY/packer-web:$TAG"

step "Instaluji Quadlet units do $UNIT_DIR"
shopt -s nullglob
units=("$REPO_DIR"/deploy/quadlet/*.container "$REPO_DIR"/deploy/quadlet/*.network "$REPO_DIR"/deploy/quadlet/*.volume)
shopt -u nullglob

if [[ ${#units[@]} -eq 0 ]]; then
  die "v $REPO_DIR/deploy/quadlet nejsou žádné units"
fi

# Quadlet neumí v Image= číst proměnné prostředí, proto se tag doplňuje sem.
for unit in "${units[@]}"; do
  sed "s|@SHA@|$TAG|g" "$unit" > "$UNIT_DIR/$(basename "$unit")"
done

systemctl --user daemon-reload
systemctl --user start packer-network.service

if [[ "$SKIP_MIGRATE" == true ]]; then
  step "Migrace přeskočeny (--no-migrate)"
else
  step "Aplikuji migrace"
  podman run --rm \
    --network packer \
    --env-file "$ENV_FILE" \
    --entrypoint /app/efbundle \
    "$REGISTRY/packer-api:$TAG"
fi

step "Restartuji API a web"
systemctl --user enable packer-api.service packer-web.service
systemctl --user restart packer-api.service
systemctl --user restart packer-web.service

health_url="${PACKER_HEALTH_URL:-}"
if [[ -z "$health_url" ]]; then
  domain="$(sed -n 's/^PACKER_DOMAIN=//p' "$ENV_FILE" | head -n1)"
  [[ -n "$domain" ]] || die "v $ENV_FILE chybí PACKER_DOMAIN"
  if [[ "$domain" == :* ]]; then
    health_url="http://127.0.0.1${domain}/health"
  else
    health_url="https://${domain}/health"
  fi
fi

step "Čekám na $health_url"
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 "$health_url" >/dev/null 2>&1; then
    printf 'hotovo – %s odpovídá\n' "$health_url"
    exit 0
  fi
  sleep 2
done

die "API neodpovídá na $health_url. Logy: journalctl --user -u packer-api -n 100 --no-pager"
