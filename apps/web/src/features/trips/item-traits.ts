import type { BadgeTone } from '@/components/ui/badge.variants';
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

export type ItemTraitName = (typeof itemTraits)[ItemTraitKey];

/** Zaškrtnuté vlastnosti – formulář je drží jako objekt, ne jako pole řetězců. */
export type ItemTraitValues = Record<ItemTraitKey, boolean>;

/** Popisek a barva odznaku pro příznak z bitové masky. */
export const itemTraitMeta = {
  CarryOnOnly: { messageKey: 'item.trait.carryOnOnly', tone: 'info' },
  Fragile: { messageKey: 'item.trait.fragile', tone: 'warning' },
  TsaLiquid: { messageKey: 'item.trait.tsaLiquid', tone: 'info' },
  Battery: { messageKey: 'item.trait.battery', tone: 'warning' },
} as const satisfies Record<ItemTraitName, { messageKey: MessageKey; tone: BadgeTone }>;

/** Popisky checkboxů; hodnoty sedí na klíče `item.trait.*` v katalogu. */
export const itemTraitLabels = {
  carryOnOnly: 'item.trait.carryOnOnly',
  fragile: 'item.trait.fragile',
  tsaLiquid: 'item.trait.tsaLiquid',
  battery: 'item.trait.battery',
} as const satisfies Record<ItemTraitKey, MessageKey>;

export const itemTraitKeys = Object.keys(itemTraits) as ItemTraitKey[];

/** Bitová maska z API (`None`, `Fragile, Battery`) na seznam jmen příznaků. */
export function itemTraitNames(flags: string): ItemTraitName[] {
  const names = flags.split(',').map((name) => name.trim());

  return names.filter((name): name is ItemTraitName =>
    Object.values(itemTraits).includes(name as ItemTraitName),
  );
}

/** Bitová maska z API do checkboxů formuláře. */
export function parseItemFlags(flags: string): ItemTraitValues {
  const names = itemTraitNames(flags);

  return Object.fromEntries(
    itemTraitKeys.map((key) => [key, names.includes(itemTraits[key])]),
  ) as ItemTraitValues;
}

/** Checkboxy formuláře do bitové masky API. Prázdný výběr posíláme jako `None`. */
export function formatItemFlags(values: ItemTraitValues): string {
  const names = itemTraitKeys.filter((key) => values[key]).map((key) => itemTraits[key]);

  return names.length === 0 ? 'None' : names.join(', ');
}
