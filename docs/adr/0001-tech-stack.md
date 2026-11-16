# 0001 – Technický stack

- **Status:** Přijato
- **Datum:** 2026-11-16
- **Kontext:** Webová aplikace na balicí seznamy, jeden vývojář s dlouhou praxí v C#/.NET, bez
  předchozí zkušenosti s Reactem. Cíl: dodat funkční v1, ne si hrát s technologiemi.

## Rozhodnutí

| Vrstva | Volba |
|---|---|
| Backend | .NET 10 LTS, ASP.NET Core minimal APIs |
| Databáze | PostgreSQL 18, EF Core + Npgsql |
| Autentizace | ASP.NET Core Identity, cookie |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 4 |
| Server state | TanStack Query |
| Routování | React Router |
| Komponenty | vlastní design systém + Storybook |
| Validace | FluentValidation (BE), Zod (FE) |
| Testy | xUnit + Testcontainers, Vitest + Playwright |
| Kontejnery | Podman |

## Důsledky

**Pozitiva**

- Backend zůstává v jazyce, který vývojář zná – největší část rizika je pryč.
- Frontend v Reactu má největší ekosystém a nejvíc materiálů; investice do učení se vrátí.
- OpenAPI kontrakt drží obě strany v synchronu – změna v C# rozbije build fronty, což je žádoucí.
- PostgreSQL je relační databáze pro relační data (výlet → kategorie → položka).

**Negativa**

- Dva toolchainy (NuGet + npm) a dvě sady závislostí k udržování.
- React je pro vývojáře z .NET nová mentální modelace (stav, efekty, re-render).
- Vlastní design systém znamená víc práce než vzít hotovou knihovnu – ale design to vyžaduje.

## Alternativy a proč ne

| Alternativa | Proč ne |
|---|---|
| Next.js full-stack (TypeScript) | nutilo by vývojáře opustit C# na obou stranách |
| Blazor Server | UI ekosystém slabší, design by se implementoval složitěji |
| Razor Pages + HTMX | méně interaktivní UI, horší sdílení komponent a Storybook |
| React + GraphQL | další vrstva bez přínosu pro tuto velikost |
| MongoDB | data jsou relační, transakce a JOINy potřebujeme |
