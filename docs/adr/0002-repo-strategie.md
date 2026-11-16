# 0002 – Repo strategie

- **Status:** Přijato
- **Datum:** 2026-11-16
- **Kontext:** Backend (.NET) a frontend (React) jsou dva technologické celky. Volba: dva repozitáře,
  nebo jeden?

## Rozhodnutí

**Jeden repozitář**, uvnitř `apps/api` a `apps/web`. Dva artefakty (image API + image web), ale jedno repo,
jeden CI, jeden PR.

```
apps/api/     .NET solution
apps/web/     React SPA
deploy/       Podman compose, Containerfile, Caddyfile
design/       design systém
docs/         dokumentace + ADR
```

## Důsledky

**Pozitiva**

- Atomická změna: endpoint + typy + UI v jednom commitu, žádný "chvíli to nefunguje" stav.
- Jeden OpenAPI kontrakt na jednom místě, generování typů je triviální.
- Jeden CI pipeline, jeden review, jedna historie.
- Sdílená dokumentace a design systém.

**Negativa**

- CI musí řešit dva toolchainy (cache pro NuGet i npm).
- `git clone` je větší; checkout fronty nesouvisí s backendem (řešitelné path filtry v CI).
- Přístupová práva nelze omezit po částech (u sólového vývoje nepodstatné).

## Kdy to přehodnotit

- Až přibude **druhý klient** (mobilní app) → `apps/mobile` + `packages/shared`, pořád jeden repo.
- Až bude API mít **vlastní tým a release cyklus** → rozdělení dává smysl.
- Až bude repo tak velké, že `git status` trvá nezanedbatelně → path filtry, ne split.

## Proč ne dva repa

`food-be` / `food-fe` vzor funguje, ale platí se za něj: duplikované typy kontraktu, dva CI,
dva PR na jednu změnu, ruční synchronizace verzí. Pro sólový vývoj je to čistá ztráta.
