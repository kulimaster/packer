# Design reference

Vstupní materiál pro UI. **Není to zdroj pravdy pro kód** – tím je až `apps/web/src/components`.

| Soubor | Co to je |
|---|---|
| `DESIGN.md` | Design systém: barvy, typografie, spacing, elevation, komponenty. Extrahováno z Google Stitch. |
| `screens/trips-mobile.png` | Seznam výletů, mobil |
| `screens/trips-desktop.png` | Seznam výletů, desktop |
| `screens/trip-detail-mobile.png` | Detail výletu (balicí seznam), mobil |
| `screens/trip-detail-desktop.png` | Detail výletu, desktop (sidebar, masonry sloupce, weight widget) |
| `screens/add-templates-mobile.png` | Modal pro přidání šablon, mobil |
| `screens/add-templates-desktop.png` | Modal pro přidání šablon, desktop |

## Pravidla

1. **Obrázky jsou referentní, ne kopírovatelné.** Nestahuj HTML export ze Stitch do projektu – je to jednorázový výstup s Tailwind CDN a inline konfigurací. Komponenty píšeme znovu, pořádně.
2. **Tokeny z `DESIGN.md` jdou do `apps/web/src/styles/tokens.css`** (`@theme` v Tailwind v4). Barvu nikdy nepiš natvrdo do komponenty – vždy přes token (`bg-surface`, `text-on-surface`…).
3. **Každá komponenta má story** v Storybooku (`*.stories.tsx`) a projde review ve všech stavech: default, hover, focus, disabled, loading, empty, error, dlouhý text.
4. Když se design a realita rozejdou, **uprav `DESIGN.md`** – ať dokument nezastará.

## Zdroj

Vygenerováno v Google Stitch, projekt `PackFlow – Smart Packing Dashboard`.
Původní export (HTML + PNG) je mimo repo; v repu držíme jen to, co má trvalou hodnotu.
