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

`TripCard` · `TripHeader` · `PackingCategory` · `ItemRow` · `ItemCheckbox` · `WeightWidget` ·
`TemplateCard` · `TemplatePicker` · `TripProgress`

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
