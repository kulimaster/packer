# Architektura

## Přehled

```
┌──────────────┐    HTTPS     ┌──────────────────────────────┐
│   prohlížeč  │ ───────────► │  Caddy (proxy)               │
└──────────────┘              │  /        → React SPA (dist) │
                              │  /api/*   → API kontejner    │
                              └───────────┬──────────────────┘
                                          │
                              ┌───────────▼──────────┐
                              │  Packer.Api (.NET)   │
                              │  Domain / Application│
                              │  Infrastructure      │
                              └───────────┬──────────┘
                                          │
                              ┌───────────▼──────────┐
                              │  PostgreSQL          │
                              └──────────────────────┘
```

Jedna doména, žádný CORS (proxy i API jsou same-origin). V devu tutéž roli hraje Vite proxy.

## Vrstvy backendu

| Projekt | Obsah | Smí referencovat |
|---|---|---|
| `Packer.Domain` | entity, value objects, invarianty, doménové výjimky | nic |
| `Packer.Application` | use cases, business pravidla, DTO, porty (rozhraní) | `Domain` |
| `Packer.Infrastructure` | `AppDbContext`, migrace, Identity, e-mail, externí služby | `Domain`, `Application` |
| `Packer.Api` | endpointy, validace vstupu, DI, middleware, OpenAPI | všechny |

Pravidlo: **`Api` neobsahuje rozhodnutí, jen překlad.** Kdyby endpoint obsahoval `if (user.CanEdit(trip))`,
patří to do `Application`.

### Tok requestu

```
GET /api/trips/{id}
  → Api: autorizace, validace vstupu, volání handleru
  → Application: GetTripHandler – načte data, zkontroluje oprávnění, vrátí DTO
  → Infrastructure: EF Core dotaz do Postgresu
  → Api: 200 + JSON / 404 / 403 / 400
```

### Struktura složek

```
Packer.Application/
  Trips/           CreateTrip/, GetTrips/, GetTrip/, CreateCategory/, CreateItem/,
                   SetItemPacked/, DeleteItem/, CreateBag/, UpdateBag/, DeleteBag/,
                   AssignCategoryBag/, SetTripArchived/, ImportTemplates/,
                   TripQueries.cs, TripDetails.cs
  Templates/       GetTemplates/, GetTemplate/
  Common/          IAppDbContext.cs, IClock.cs, ICurrentUser.cs, Exceptions/
```

Feature = složka. Ne `Services/`, ne `Handlers/`. Důvod: když potřebuješ změnit "přidání položky",
vidíš všechny související soubory na jednom místě.

## Chybové stavy

- `Application` vyhazuje vlastní výjimky (`NotFoundException`, `ConflictException`,
  `UnauthenticatedException`, `ValidationFailedException`), doména `DomainException`.
- `Api` je mapuje middlewarem na HTTP: 400, 401, 404, 409.
- Tělo chyby má vždy stejný tvar: `{ "code": "...", "message": "...", "errors": { ... } }`.
- Nikdy neposílej klientovi stack trace ani text výjimky z databáze.

## Autentizace

- ASP.NET Core Identity, **cookie** (httpOnly, SameSite=Lax), ne JWT.
- Důvod: same-origin SPA, žádné tokeny v localStorage.
- CSRF: antiforgery token, posílaný v hlavičce `X-CSRF-TOKEN`.
- Až bude mobilní app, přidá se token endpoint – nemění to zbytek architektury.

## Konfigurace a secrety

- `appsettings.json` = výchozí hodnoty bez secretů.
- Lokálně: `dotnet user-secrets set "ConnectionStrings:Default" "..."`.
- Produkce: proměnné prostředí z `~/.config/containers/systemd/packer.env` na serveru (mimo git).
  Detaily: [`deploy/README.md`](../deploy/README.md).
- Validace konfigurace při startu (fail fast), ne až u prvního requestu.

## Co záměrně není v v1

| Věc | Proč | Kdy |
|---|---|---|
| Realtime synchronizace (SignalR) | bez ní appka funguje | až bude potřeba |
| Sdílení výletů | v1 = každý má své výlety | v1.1 – `TripMember` |
| Počasí destinace | integrace, ne jádro | v2 (`IWeatherProvider`) |
| AI travel intel | náklady a závislost na LLM | v2 (`ITravelAdvisor`) |
| Cache (Redis) | jedna instance, Postgres stačí | až bude potřeba |
| Background jobs | žádná úloha neběží na pozadí | až bude potřeba |
