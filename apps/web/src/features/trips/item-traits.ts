import type { MessageKey } from '@/lib/i18n';

/**
 * Vlastnosti položky v pořadí, ve kterém je skládá bitová maska.
 * Klíč je pole formuláře, hodnota jméno příznaku (`ItemTraits`) v API.
 */
export const itemTraits = {
  carryOnOnly: 'CarryOnOnly',
  fragile: 'Fragile',
  tsaLiquid: 'TsaLiquid',
  battery: 'Battery',
} as const;

export type ItemTraitKey = keyof typeof itemTraits;

/** Zaškrtnuté vlastnosti – formulář je drží jako objekt, ne jako pole řetězců. */
export type ItemTraitValues = Record<ItemTraitKey, boolean>;

/** Popisky checkboxů; hodnoty sedí na klíče `item.trait.*` v katalogu. */
export const itemTraitLabels = {
  carryOnOnly: 'item.trait.carryOnOnly',
  fragile: 'item.trait.fragile',
  tsaLiquid: 'item.trait.tsaLiquid',
  battery: 'item.trait.battery',
} as const satisfies Record<ItemTraitKey, MessageKey>;

export const itemTraitKeys = Object.keys(itemTraits) as ItemTraitKey[];

/** Bitová maska z API (`None`, `Fragile, Battery`) do checkboxů formuláře. */
export function parseItemFlags(flags: string): ItemTraitValues {
  const names = flags.split(',').map((name) => name.trim());

  return Object.fromEntries(
    itemTraitKeys.map((key) => [key, names.includes(itemTraits[key])]),
  ) as ItemTraitValues;
}

/** Checkboxy formuláře do bitové masky API. Prázdný výběr posíláme jako `None`. */
export function formatItemFlags(values: ItemTraitValues): string {
  const names = itemTraitKeys.filter((key) => values[key]).map((key) => itemTraits[key]);

  return names.length === 0 ? 'None' : names.join(', ');
}
