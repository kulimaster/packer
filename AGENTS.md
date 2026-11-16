# AGENTS.md

Instrukce pro AI agenty pracující v tomto repu. Čti je dřív, než napíšeš první řádek.

## Co je tento projekt

**Packer** – webová aplikace na balicí seznamy na cesty.
Uživatel má výlety, výlet má kategorie, kategorie mají položky. Položky se zaškrtávají,
počítá se progress a odhad hmotnosti. Podrobně: [`docs/domain-model.md`](docs/domain-model.md).

## Příkazy

Vše z rootu repa, pokud není řečeno jinak.

```bash
# --- API ---
dotnet build apps/api/Packer.slnx
dotnet test  apps/api/Packer.slnx
dotnet run --project apps/api/src/Packer.Api                    # http://localhost:5000

# EF Core (DbContext přibude v Infrastructure)
dotnet ef migrations add <Nazev> -p apps/api/src/Packer.Infrastructure -s apps/api/src/Packer.Api
dotnet ef database update -p apps/api/src/Packer.Infrastructure -s apps/api/src/Packer.Api

# --- DB pro lokální vývoj ---
podman compose -f deploy/compose.dev.yaml up -d

# --- Web ---
cd apps/web && npm run dev            # http://localhost:5173 (proxy /api -> :5000)
cd apps/web && npm run storybook      # http://localhost:6006
cd apps/web && npm run build
cd apps/web && npm run typecheck
cd apps/web && npm run lint           # oxlint
cd apps/web && npm run format         # prettier
cd apps/web && npm test               # vitest
cd apps/web && npm run api:types      # OpenAPI -> src/lib/api/schema.d.ts
```

## Architektura – pravidla, která se nesmí porušit

1. **Směr závislostí:** `Api → Application → Domain`, `Infrastructure → Application/Domain`.
   `Domain` nesmí referencovat nic – ani EF Core, ani ASP.NET.
2. **Business logika patří do `Application`**, doménová pravidla do `Domain`.
   Endpointy v `Api` jen přijmou vstup, zavolají use case a namapují výsledek na HTTP.
3. **`Infrastructure` implementuje porty** definované v `Application` (`IAppDbContext`, `IClock`, …).
4. **Vertical slices:** složka na feature (`Application/Trips/AddItem/…`), ne vrstva na typ operace.
5. **Zakázáno:** `IRepository<T>`, `UnitOfWork`, MediatR, AutoMapper, vlastní event bus.
   `DbContext` je repository i unit of work.
6. **`schema.d.ts` ve frontendu je generovaný** (`npm run api:types`). Nikdy ho needituj ručně.

## C# konvence

- `Nullable` je zapnutý, `TreatWarningsAsErrors` taky. Warning = chyba.
- `async`/`await` všude, kde je I/O. Vždy předávej `CancellationToken`.
- Primární konstruktory a `record` pro DTO. `sealed` na třídách, které nejsou děděné.
- Žádné `DateTime.Now` – čas jde přes `IClock`.
- Názvy: třídy/metody anglicky, komentáře a dokumentace česky.

## Frontend konvence

```
src/
  app/           providery, router, AppShell
  components/ui/ primitiva design systému (Button, Card, Checkbox…)
  features/      doménové komponenty (trips/components/TripCard…)
  pages/         obrazovky
  lib/           cn(), api klient
  styles/        tokens.css
```

- **Barvy a spacing jen přes tokeny** z `apps/web/src/styles/tokens.css`. Žádné `#0f766e` v komponentě.
- **Každá komponenta má story** (`*.stories.tsx`) ve stavech: default, hover, focus, disabled, loading, empty, error, dlouhý text.
- `any` je zakázané. `unknown` + narrowing, nebo typ z `schema.d.ts`.
- Server state = TanStack Query. Žádný Redux. Lokální UI state = `useState`/`useReducer`.
- Alias `@/` = `src/`. Používej ho, ne `../../..`.
- Formuláře = `react-hook-form` + `zod`.
- `.storybook/` je tooling, ne aplikace. Nestaví se do produkce.

## Dokumentace

- Architektonické rozhodnutí = nový ADR v `docs/adr/` (`NNNN-nazev.md`, 1 stránka: kontext → rozhodnutí → důsledky).
- Změna doménového modelu = úprava `docs/domain-model.md` ve stejném commitu.
- Změna design systému = úprava `design/DESIGN.md`.
- Nezakládej prázdné dokumenty "pro jistotu". Dokument, který lže, je horší než žádný.

## Commity

Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`.
Jeden commit = jedna věc. Do repa nikdy nepatří `.env`, connection stringy ani secrety.
