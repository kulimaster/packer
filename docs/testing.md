# Testy

| Projekt | Co testuje | Databáze |
|---|---|---|
| `apps/api/tests/Packer.Domain.Tests` | invarianty entit, odvozený stav | ne |
| `apps/api/tests/Packer.Api.IntegrationTests` | HTTP kontrakt end-to-end | ano, Postgres |
| `apps/web` (Vitest) | čisté funkce frontendu | ne |

## API integrační testy

Testy spouštějí skutečné `Program.cs` přes `WebApplicationFactory` (TestServer v paměti)
a mluví s ním přes HTTP – testují tedy routing, serializaci, middleware, CSRF i EF dotazy.
Databáze je **skutečný Postgres**, ne in-memory náhrada, aby prošly migrace a Npgsql překlad.

```bash
# 1. databáze musí běžet
podman compose -f deploy/compose.dev.yaml up -d

# 2. všechny testy
dotnet test apps/api/Packer.slnx

# 3. jen integrační testy
dotnet test apps/api/tests/Packer.Api.IntegrationTests/Packer.Api.IntegrationTests.csproj
```

### Testovací databáze

- Výchozí připojení: `Host=localhost;Port=5442;Database=packer_tests;Username=packer;Password=packer`
  (stejné údaje jako `deploy/compose.dev.yaml`, žádný nový secret).
- Jinam se dá ukázat proměnnou `PACKER_TEST_DB` (`dotnet test` i CI ji čtou).
- Před každým během se databáze **zahodí a znovu zmigruje** – proto musí mít v názvu `test`
  (pojistka v `TestDatabase.Reset`). Nikdy nemiř na vývojovou nebo produkční DB.
- Systémové šablony seeduje start API, takže je testy vidí stejně jako produkce.
- Data mezi testy se neuklízí: každý test si zakládá vlastního uživatele a vlastnictví je
  hranice viditelnosti, takže se testy navzájem nevidí.

### Co je pokryté

- auth: registrace, login, logout, 401 bez cookie, CSRF (chybějící i recyklovaný token)
- výlety: založení, validace, seznam s archivem i bez, izolace uživatelů (cizí = 404)
- kategorie a položky: součty, packed, odvozený stav, mazání, validace
- bagy: limit, přiřazení kategorie, přepočet hmotnosti, smazání odpojí kategorie
- archivace: read-only výlet vrací `409 trip_archived`
- šablony: knihovna, detail, import, párování kategorií, opakovaný import, cizí/archivovaný výlet

## CI

GitHub Actions pouští `postgres:18-alpine` jako service a předává `PACKER_TEST_DB`
(viz `.github/workflows/ci.yml`). Bez databáze integrační testy záměrně spadnou –
radši viditelná chyba než tichý skip.
