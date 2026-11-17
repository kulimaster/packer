import { Backpack, Briefcase, Luggage, type LucideIcon } from 'lucide-react';
import type { components } from '@/lib/api/schema';

export type BagKind = components['schemas']['BagKind'];

/** Lidsky čitelné názvy druhů zavazadel – v API jsou hodnoty bez diakritiky. */
export const bagKindLabel: Record<BagKind, string> = {
  CarryOn: 'Carry-on',
  Checked: 'Checked',
  Personal: 'Personal item',
};

export const bagKindIcon: Record<BagKind, LucideIcon> = {
  CarryOn: Backpack,
  Checked: Luggage,
  Personal: Briefcase,
};

export const bagKindKeys = Object.keys(bagKindLabel) as BagKind[];
