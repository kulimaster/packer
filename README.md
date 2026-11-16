# Packer

Aplikace na **balicí seznamy na cesty**. Naplánuješ výlet, rozdělíš věci do kategorií a bagů,
zaškrtáváš sbaleno a vidíš, kolik ti zbývá a kolik to váží.

> Produktový a vizuální návrh: [`design/`](design/) · Architektura: [`docs/architecture.md`](docs/architecture.md)

## Stav

`bootstrap` – hotová kostra repa a dokumentace. Aplikační kód se teprve začíná psát.

## Stack

| Část | Technologie |
|---|---|
| Backend | .NET 10 (LTS), ASP.NET Core minimal APIs, EF Core + Npgsql |
| Databáze | PostgreSQL 18 |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router |
| Komponenty | vlastní design systém + Storybook |
| Testy | xUnit + Testcontainers (API), Vitest + Playwright (web) |
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

# 3. testy
dotnet test apps/api/Packer.slnx
```

Frontend zatím není založený – přibude v dalším kroku (`npm run dev` v `apps/web`).

## Dokumentace

| Dokument | Obsah |
|---|---|
| [docs/architecture.md](docs/architecture.md) | vrstvy, tok requestu, kam co patří |
| [docs/domain-model.md](docs/domain-model.md) | entity, invarianty, rozsah v1 |
| [docs/ui-guidelines.md](docs/ui-guidelines.md) | tokeny, komponenty, Storybook |
| [docs/api-contract.md](docs/api-contract.md) | OpenAPI a generování TS typů |
| [docs/roadmap.md](docs/roadmap.md) | co je v v1 a co až potom |
| [docs/adr/](docs/adr/) | záznamy architektonických rozhodnutí |
| [deploy/README.md](deploy/README.md) | nasazení, zálohy, rollback |
