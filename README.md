# Packer

Aplikace na **balicí seznamy na cesty**. Naplánuješ výlet, rozdělíš věci do kategorií a bagů,
zaškrtáváš sbaleno a vidíš, kolik ti zbývá a kolik to váží.

> Produktový a vizuální návrh: [`design/`](design/) · Architektura: [`docs/architecture.md`](docs/architecture.md)

## Stav

`v1 funkčně hotová` – účty (cookie + CSRF), výlety, kategorie a položky, bagy s váhami,
archivace i šablony s importem. API má unit i integrační testy, web unit testy. Připravené
je i produkční nasazení (image, Quadlet units, runbook v [`deploy/README.md`](deploy/README.md));
zbývá polish. Rozsah v1: [`docs/roadmap.md`](docs/roadmap.md).

## Stack

| Část | Technologie |
|---|---|
| Backend | .NET 10 (LTS), ASP.NET Core minimal APIs, EF Core + Npgsql |
| Databáze | PostgreSQL 18 |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router |
| Komponenty | vlastní design systém + Storybook |
| Testy | xUnit (doména + API přes `WebApplicationFactory`), Vitest (web) |
| Kontejnery | Podman (lokálně i na VPS), Caddy jako reverse proxy |
| CI/CD | GitHub Actions, image do GHCR |

## Struktura

```
apps/api/     ASP.NET Core – Domain / Application / Infrastructure / Api
apps/web/     React SPA
deploy/       Podman compose, Containerfile, Caddyfile, runbook
design/       design systém a referenční obrazovky
docs/         architektura, doménový model, ADR
```

## Rychlý start

Požadavky: .NET SDK 10.0.403, Node 24, Podman.

```bash
# 1. databáze
podman compose -f deploy/compose.dev.yaml up -d

# 2. API (http://localhost:5000)
dotnet run --project apps/api/src/Packer.Api

# 3. web (http://localhost:5173)
cd apps/web && npm install && npm run dev

# 4. Storybook (http://localhost:6006) – katalog komponent
cd apps/web && npm run storybook

# testy (integrační testy API potřebují běžící Postgres)
dotnet test apps/api/Packer.slnx
cd apps/web && npm test
```

V devu jde `/api` z Vite přes proxy na `http://localhost:5000`, takže žádný CORS.
Detaily k testovací databázi a pokrytí: [`docs/testing.md`](docs/testing.md).

## Dokumentace

| Dokument | Obsah |
|---|---|
| [docs/architecture.md](docs/architecture.md) | vrstvy, tok requestu, kam co patří |
| [docs/domain-model.md](docs/domain-model.md) | entity, invarianty, rozsah v1 |
| [docs/ui-guidelines.md](docs/ui-guidelines.md) | tokeny, komponenty, Storybook |
| [docs/api-contract.md](docs/api-contract.md) | OpenAPI a generování TS typů |
| [docs/roadmap.md](docs/roadmap.md) | co je v v1 a co až potom |
| [docs/testing.md](docs/testing.md) | testovací projekty, testovací databáze, pokrytí |
| [docs/adr/](docs/adr/) | záznamy architektonických rozhodnutí |
| [deploy/README.md](deploy/README.md) | nasazení, zálohy, rollback |
