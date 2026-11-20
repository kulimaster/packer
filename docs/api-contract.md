# API kontrakt

Backend a frontend jsou dva jazyky, ale **jeden kontrakt**. Ten kontrakt je OpenAPI specifikace
generovaná z C# kódu – ne ručně psaná dokumentace, která zestárne.

## Tok

```
C# endpointy
   ↓  ASP.NET Core OpenAPI (Microsoft.AspNetCore.OpenApi)
/openapi/v1.json
   ↓  openapi-typescript
apps/web/src/lib/api/schema.d.ts
   ↓  openapi-fetch
typed klient v Reactu
```

## Příkazy

```bash
# API musí běžet (http://localhost:5000)
cd apps/web && npm run api:types
```

Skript stáhne spec a přepíše `src/lib/api/schema.d.ts`.

## Pravidla

1. **`schema.d.ts` se needituje ručně.** Je v `.gitattributes` označený jako generated.
2. **Spec musí být v repu v synchronu s kódem.** Když se změní endpoint, regeneruj typy ve stejném commitu.
3. **Breaking change = build fronty spadne.** To je feature, ne bug. Oprav obě strany společně.

## Konvence

- Všechny endpointy pod `/api`.
- JSON je `camelCase` (ASP.NET default).
- Enumy se serializují jako **string**, ne číslo (`"CarryOn"`, ne `0`).
- `DateOnly` jako `"2026-11-20"`, časy jako ISO 8601 s offsetem.
- Žádná verze v URL pro v1. Až bude potřeba, půjde o `/api/v2` vedle `/api`.

## Endpointy v1

| Metoda | Cesta | Poznámka |
|---|---|---|
| `GET` | `/api/trips?includeArchived=false` | seznam výletů s počty položek a odvozeným stavem |
| `POST` | `/api/trips` | založení výletu, `201` + `Location` |
| `GET` | `/api/trips/{tripId}` | detail výletu: kategorie, položky, bagy, součty |
| `PUT` | `/api/trips/{tripId}` | úprava výletu (název, cíl, termín, cover), `200`; archivovaný vrátí `409` |
| `DELETE` | `/api/trips/{tripId}` | smazání výletu i s balicím seznamem, `204` (funguje i pro archivovaný) |
| `PATCH` | `/api/trips/{tripId}/archived` | archivace / obnovení, `204`; archivovaný výlet je jen ke čtení |
| `POST` | `/api/trips/{tripId}/categories` | nová kategorie, `201` |
| `PUT` | `/api/categories/{categoryId}` | úprava kategorie (název, ikona, poznámka, limit), `200` |
| `DELETE` | `/api/categories/{categoryId}` | smazání kategorie i s položkami, `204` |
| `POST` | `/api/categories/{categoryId}/items` | nová položka v kategorii, `201` |
| `PUT` | `/api/items/{itemId}` | úprava položky (název, poznámka, počet, essential, vlastnosti, hmotnost), `200` |
| `PATCH` | `/api/items/{itemId}/packed` | přebalení / vrácení položky, `200` |
| `DELETE` | `/api/items/{itemId}` | smazání položky, `204` |
| `POST` | `/api/trips/{tripId}/bags` | nový bag, `201` |
| `PUT` | `/api/bags/{bagId}` | úprava bagu (název, druh, limit), `200` |
| `DELETE` | `/api/bags/{bagId}` | smazání bagu, kategorie se odpojí, `204` |
| `PUT` | `/api/categories/{categoryId}/bag` | přiřazení kategorie k bagu, `null` = odebrání, `200` |
| `GET` | `/api/templates` | knihovna šablon s počty položek a odhadem hmotnosti |
| `GET` | `/api/templates/{templateId}` | detail šablony s položkami |
| `POST` | `/api/trips/{tripId}/templates` | import šablon do výletu, `200` s počty vytvořených kategorií a položek |
| `GET` | `/api/auth/csrf` | antiforgery token |
| `POST` | `/api/auth/register` | registrace + přihlášení |
| `POST` | `/api/auth/login` | přihlášení |
| `POST` | `/api/auth/logout` | odhlášení |
| `GET` | `/api/auth/me` | aktuální uživatel |

Mutace (`POST`, `PUT`, `PATCH`, `DELETE`) vyžadují `X-CSRF-TOKEN` i platnou cookie.

## Chybová odpověď

Vždy stejný tvar:

```json
{
  "code": "item_not_found",
  "message": "Item was not found.",
  "errors": {
    "title": ["Title is required."]
  }
}
```

| HTTP | Kdy |
|---|---|
| 400 | validační chyba vstupu (`errors` vyplněné) |
| 401 | nepřihlášený |
| 403 | přihlášený, ale nemá oprávnění (role `viewer` až se sdílením) |
| 404 | entita neexistuje **nebo** nepatří uživateli (nezrazuj existenci) |
| 409 | konflikt stavu (editace archivovaného výletu) |

## Autentizace v klientovi

Cookie je httpOnly, takže ji JS nevidí – jen se posílá. Klient musí mít `credentials: "include"`
a posílat antiforgery token v hlavičce `X-CSRF-TOKEN` u mutací.

```text
GET  /api/auth/csrf      → { token } + nastaví cookie
POST /api/auth/register  → 201, přihlásí
POST /api/auth/login     → 200, přihlásí
POST /api/auth/logout    → 204
GET  /api/auth/me        → 200 { id, email, displayName } | 401
```

**Token je vázaný na uživatele.** Po `register`/`login`/`logout` je token získaný dřív neplatný –
klient si musí vyžádat nový (`GET /api/auth/csrf`). Jinak dostane `400 csrf_invalid`.
