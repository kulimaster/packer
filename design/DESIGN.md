---
name: PackFlow Minimalist Packing Utility
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3e4947'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#2d5951'
  on-tertiary: '#ffffff'
  tertiary-container: '#467169'
  on-tertiary-container: '#c5f3ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#bdece2'
  tertiary-fixed-dim: '#a2d0c6'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#224e47'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes an intentional, friction-free travel preparation utility designed to alleviate executive dysfunction and packing anxiety. The core personality is serene, methodic, structured, and lightweight.

The aesthetic fuses contemporary **Soft Minimalism** with tactile utility accents:
- Generous breathable whitespace creating a mental reset.
- Controlled hierarchy anchored by crisp pure white tactile cards resting upon an airy warm-tinted neutral foundation.
- Deep, stabilizing coastal teals balanced against crisp mint highlights signaling completion, satisfaction, and readiness.
- Restrained visual density: elements present clear spatial separation and crisp touch targets, eschewing visual clutter for immediate scanning.

## Colors
The palette leverages a calm, light-first spectrum engineered for high legibility under varying ambient lighting conditions (bright airport terminals to dim hotel bedrooms):

- **Primary (`#0F766E`)**: Deep teal used for focal calls-to-action, navigation anchors, active state fills, and major structural accents.
- **Secondary (`#10B981`)**: Vivid emerald used selectively for completed checklist tallies, ready states, and positive progress indicators.
- **Tertiary (`#CCFBF1`)**: Light mint container fill used for badge backdrops, subtle selection pills, and contextual highlight banners.
- **Neutral Surface (`#F8F9FA`)**: Calibrated soft canvas background reducing glare compared to stark white.
- **Pure White (`#FFFFFF`)**: Card surfaces, modal sheets, and floating bars that float above the neutral canvas.
- **Text & Borders**:
  - Headings: `#111827` (Slate 900) for sharp editorial weight.
  - Body & Interactive Secondary: `#4B5563` (Slate 600) for reading comfort.
  - Captions & Inactive Elements: `#9CA3AF` (Slate 400).
  - Outlines & Dividers: `#E5E7EB` (Slate 200) for crisp, low-contrast boundary definition.

## Typography
The system combines **Plus Jakarta Sans** for headlines and structural titles with **Inter** for data items, counts, list views, and dense functional labeling.

- **Plus Jakarta Sans**: Injected at display and headline scales to infuse organic geometric character, welcoming curve transitions, and premium editorial polish.
- **Inter**: Drives readability across micro-copy, checklists, weights, quantities, and input fields.
- Letter spacing is intentionally tightened on headings larger than 20px to maintain optical compactness and expanded on labels smaller than 12px for glanceable readability in transit.

## Layout & Spacing
A fluid 4-column layout governs mobile viewport form factors, expanding to 8 columns on tablet and 12 columns on desktop web views.

- **Mobile First Focus**: Screen margins are standardized at `1rem` (16px) horizontally to maximize lateral card area while maintaining separation from physical hardware borders.
- **Vertical Rhythm**: Built upon an 8px base module (represented by `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px).
- **Reflow Behavior**: Checklist items span the entire column width on mobile. When viewed on larger tablet and desktop breakpoints, packing categories split into responsive masonry columns (e.g., "Toiletries", "Documents", "Clothing") conforming to fixed card widths between 340px and 420px.

## Elevation & Depth
Depth is expressed through subtle tonal separation, ambient low-opacity drop shadows, and ghost borders:

- **Base Layer (Canvas)**: Tinted flat `#F8F9FA`. Zero shadow.
- **Layer 1 (Cards & Containers)**: Pure white `#FFFFFF` surface enclosed by a fine 1px structural outline of `#E5E7EB`. Supported by an ultra-soft ambient shadow: `box-shadow: 0 1px 3px 0 rgba(17, 24, 39, 0.04), 0 1px 2px -1px rgba(17, 24, 39, 0.02)`.
- **Layer 2 (Floating Action Buttons & Bottom Navigation Bars)**: Pure white or deep teal surfaces elevated with `box-shadow: 0 10px 15px -3px rgba(15, 118, 110, 0.08), 0 4px 6px -4px rgba(17, 24, 39, 0.04)`.
- **Layer 3 (Modal Bottom Sheets & Overlays)**: `#FFFFFF` sheets framed by a smooth top border and elevated over a dimmed backdrop (`rgba(17, 24, 39, 0.35)` with `backdrop-filter: blur(4px)`).

## Shapes
The shape language conveys safety, modernity, and tactile approachability through uniform 16px card curvature paired with circular pill accents:

- **Cards & Category Panels**: Follow the `rounded-lg` token (1rem / 16px), giving individual trip cards and categorized packing sections a soft, pocket-notebook feel.
- **Interactive Buttons & Badges**: Utilize full pill geometry (`rounded-full` / 9999px) for chips, category filters, progress badges, and primary action buttons.
- **Inner Controls (Checkboxes & Micro-inputs)**: Scaled to `0.375rem` (6px) rounded corners to balance readability and geometric consistency with larger cards.

## Components

### Buttons
- **Primary Button**: Solid `#0F766E` fill, `#FFFFFF` text (`label-lg`), pill-shaped (height 48px), padded horizontally with `space-lg`. On tap/active: darkens to `#115E59`.
- **Secondary Button**: `#FFFFFF` surface with 1px border in `#E5E7EB`, text `#111827`.
- **Tertiary / Ghost Button**: No background or border, text `#0F766E`, height 40px, intended for inline contextual actions like "Add Item" or "Select All".

### Cards & Packing Sections
- **Trip & Category Cards**: `#FFFFFF` background, 16px corner radius, 1px border (`#E5E7EB`), internal padding `space-md` (16px).
- **Packed Item Row**: A horizontal layout within category cards. Contains a 22px custom rounded checkbox, item title (`body-md`), quantity counter badge, and optional weight/note caption.

### Chips & Badges
- **Status Pills**: Pill-shaped container (`rounded-full`) with `space-xs` vertical padding and `space-sm` horizontal padding.
  - Packed/Complete: `#CCFBF1` background with `#0F766E` text (`label-sm`).
  - Essential/Critical: Light amber or rose tint with high-contrast text.
- **Filter Chips**: Pill-shaped with `#FFFFFF` background and `#E5E7EB` outline when unselected; transitioning to `#0F766E` background with white text when active.

### Checkboxes & Selection Controls
- **Checkboxes**: 22px × 22px, 6px border radius.
  - Unchecked: `#FFFFFF` fill with 1.5px border `#D1D5DB`.
  - Checked: Solid `#0F766E` (primary) fill with an animated white checkmark glyph. Strikethrough and muted gray transition (`#9CA3AF`) applied instantly to the paired label text.

### Input Fields
- **Search & Add Inputs**: 44px height, `#FFFFFF` background, 1px `#E5E7EB` border, 12px rounded corners, left-aligned utility icon in `#9CA3AF`, text in `#111827`. Focus state triggers a 1.5px `#0F766E` border and subtle mint glow (`0 0 0 3px rgba(204, 251, 241, 0.6)`).

### Progress Indicators
- **Category Completion Bar**: Thin 6px track with `#F3F4F6` base and animated `#0F766E` (primary) fill, capped with rounded endpoints. Accompanied by micro label "14/18 packed" (`label-sm`, `#4B5563`).