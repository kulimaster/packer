# UI guidelines

Vizuální zdroj pravdy je [`design/DESIGN.md`](../design/DESIGN.md) (barvy, typografie, spacing, elevation).
Tento dokument říká, **jak ho převést do kódu** a jak udržet konzistenci.

## Tokeny

Design tokeny žijí na jednom místě: `apps/web/src/styles/tokens.css` (Tailwind v4 `@theme`).
Z `DESIGN.md` se mapují 1:1:

```css
@theme {
  /* plochy */
  --color-surface: #f8f9fa;
  --color-surface-container: #edeeef;
  --color-surface-container-high: #e7e8e9;
  --color-card: #ffffff;

  /* text */
  --color-on-surface: #191c1d;
  --color-on-surface-variant: #3e4947;
  --color-muted: #9ca3af;

  /* akcenty */
  --color-primary: #0f766e;
  --color-primary-hover: #115e59;
  --color-secondary: #10b981;
  --color-secondary-container: #6cf8bb;
  --color-on-secondary-container: #00714d;
  --color-tertiary: #ccfbf1;

  /* linky */
  --color-outline: #e5e7eb;

  /* radius */
  --radius-card: 1rem;
  --radius-control: 0.375rem;

  /* fonty */
  --font-display: "Plus Jakarta Sans", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

**Pravidlo:** v komponentách se nikdy neobjeví hex hodnota ani `rgb()`. Vždy `bg-surface`, `text-on-surface`,
`border-outline`, `rounded-card`. Když token chybí, přidej ho do `tokens.css`, ne do komponenty.

## Měřítka

| Breakpoint | Šířka | Chování |
|---|---|---|
| mobile | < 640 px | jeden sloupec, bottom nav, modaly jako bottom sheet |
| tablet | 640–1024 px | 2 sloupce, bottom nav zůstává |
| desktop | > 1024 px | sidebar, obsah + pravý panel s widgety |

Spacing stojí na 8px modulu. Touch target min. **44×44 px** – i na desktopu (myš nemá ráda drobnosti).

## Komponenty

Primitiva (`src/components/ui/`) – bez business logiky, plně řízená props:

`Button` · `IconButton` · `Card` · `Input` · `Checkbox` · `Badge` · `Chip` · `ProgressBar` ·
`Avatar` · `BottomSheet` / `Modal` · `EmptyState` · `Skeleton` · `Tooltip`

Kompozitní (`src/features/*/components/`) – skládají primitiva a znají doménu:

`TripCard` · `CoverPicker` · `TripHeader` · `PackingCategory` · `ItemRow` · `ItemCheckbox` · `WeightWidget` ·
`TemplateCard` · `TemplateImportPanel` · `TripProgress`

## Jazyk a překlady

Čeština je **výchozí jazyk UI**, angličtina je volitelná přepínačem v `AppShell` (funguje i nepřihlášený).
Volba se ukládá do `localStorage` (`packer.language`) a do `<html lang>`.

| Věc | Kde |
|---|---|
| České texty (zdroj typů) | `apps/web/src/lib/i18n/messages.cs.ts` |
| Anglické texty | `apps/web/src/lib/i18n/messages.en.ts` |
| Provider | `apps/web/src/lib/i18n/i18n.tsx` |
| `useI18n()` a kontext | `apps/web/src/lib/i18n/context.ts` |
| Interpolace, plurály, locale | `apps/web/src/lib/i18n/translate.ts` |

Pravidla:

1. **V komponentách není ani jedno uživatelské slovo.** Text se bere přes
   `const { t } = useI18n()` a `t('oblast.nazev')`. Platí to i pro `aria-label`, `placeholder`,
   `title` a `hint`.
2. **Hodnoty do textu jdou jako placeholder**, ne skládáním stringů:
   `t('trips.subtitle', { name })` pro `„… Přihlášený jako {name}.“`.
3. **Plurály přes `plural('…', count)`**, ne `count === 1 ? … : …`. Tvary se píšou do katalogu
   (`one` / `few` / `other`) a jazyk si vybere `Intl.PluralRules`.
4. **Formátování je lokalizované**: `formatWeight(grams, locale)`, `formatKilograms(kg, locale)`,
   `formatDateRange(start, end, locale)` – `locale` vždy z `useI18n()`.
5. **Validační hlášky v Zod schématu** patří do katalogu. Schéma je proto funkce
   `(t: I18n['t']) => …` a v komponentě se drží přes `useMemo(() => schema(t), [t])`.
6. **Paritu katalogů hlídá typecheck**: `Messages` je odvozený z `cs`, takže chybějící klíč v `en`
   je chyba buildu. Nový text = klíč v obou souborech, žádné „přeložím později“.
7. **Chyby z API zůstávají v angličtině** – backend je zdroj kontraktu a jeho hlášky se zobrazují
   tak, jak přijdou. Překládá se jen to, co vzniká ve frontendu.
8. **Story pro oba jazyky**: obal komponentu `<I18nProvider initialLanguage="en">`, ať je vidět,
   že se texty opravdu berou z katalogu a rozložení se nerozsype.

## Cover fotky

Výlet má výchozí fotografii z kurátorované sady (`asia-tokyo`, `trip-bike-trail`, …), takže nový
výlet nikdy nezačíná prázdnou kartou.

| Věc | Kde |
|---|---|
| Fotky | `apps/web/public/covers/*.jpg` (900 px, lokálně – ne hotlink) |
| Kurátorský seznam + stahování | `apps/web/scripts/fetch-covers.mjs` |
| Metadata a atribuce | `apps/web/public/covers/covers.json`, `CREDITS.md` |
| Typovaný registr pro UI | `apps/web/src/features/trips/covers.generated.ts` |

Pravidla:

1. **Novou fotku přidáš jen do manifestu** ve skriptu a spustíš `npm run covers:fetch`. Nikdy
   needituj `covers.generated.ts` ani `CREDITS.md` – přepíše je skript.
2. **Zdroj musí být volný** (Wikimedia Commons: CC0 / CC BY / CC BY-SA / public domain). Fotky
   se ukládají do repa, aby aplikace nezávisela na cizím serveru.
3. **Fotky se needitují** (žádné ořezy v Photoshopu) – karty je ořezávají přes `object-cover`.
4. Když je potřeba fotku vyměnit, přidej `title` do manifestu (připne konkrétní soubor),
   ne jen změň `query` – hledání není stabilní.
5. `CREDITS.md` je součást distribuce, ne dokumentace „pro jistotu“ – bez atribuce fotky
   nesmí do repa.

## Storybook

- Storybook 10 + `@storybook/react-vite`, start: `npm run storybook` (port 6006).
- Story je **součást definice hotové komponenty**. Komponenta bez story = nedokončená.
- Povinné story (kde dává smysl): `Default`, `Loading`, `Empty`, `Error`, `Disabled`, `LongText`.
- Žádné `style={{ color: ... }}` ve stories – jen props a tokeny.
- Storybook se **nestaví do produkce**.

## Přístupnost

- Každý interaktivní prvek je dosažitelný klávesnicí a má viditelný focus ring (`outline` v primary barvě).
- Checkbox položky je skutečný `<input type="checkbox">`, ne `div` s `onClick`.
- Progress bar má `role="progressbar"` + `aria-valuenow/min/max`.
- Modal: focus trap, `Escape` zavírá, po zavření se focus vrací na spouštěč.
- Barva není jediný nositel informace – "Packed" má i text/ikonu, ne jen zelenou.

## Responzivita v praxi

- Mobil a desktop nejsou dva weby. Stejné komponenty, jiné rozložení.
- Sidebar na desktopu = bottom nav na mobilu (jeden seznam položek, dvě prezentace).
- Karty kategorií na desktopu v masonry sloupcích 340–420 px, na mobilu plná šířka.
