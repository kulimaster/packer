import { Backpack, Briefcase, Luggage, type LucideIcon } from 'lucide-react';
import type { components } from '@/lib/api/schema';
import type { MessageKey } from '@/lib/i18n';

export type BagKind = components['schemas']['BagKind'];

/** Překladové klíče druhů zavazadel – v API jsou hodnoty bez diakritiky. */
export const bagKindMessageKey: Record<BagKind, MessageKey> = {
  CarryOn: 'bagKind.CarryOn',
  Checked: 'bagKind.Checked',
  Personal: 'bagKind.Personal',
};

export const bagKindIcon: Record<BagKind, LucideIcon> = {
  CarryOn: Backpack,
  Checked: Luggage,
  Personal: Briefcase,
};

export const bagKindKeys = Object.keys(bagKindMessageKey) as BagKind[];
