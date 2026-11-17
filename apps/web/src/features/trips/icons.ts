import {
  Backpack,
  BookOpen,
  Briefcase,
  Camera,
  Footprints,
  Glasses,
  HeartPulse,
  Laptop,
  Luggage,
  Pill,
  Plane,
  Plug,
  Shirt,
  Smartphone,
  Sparkles,
  Umbrella,
  type LucideIcon,
} from 'lucide-react';

/**
 * Registr ikon kategorií. V DB je jen klíč (`plane`), ne název komponenty –
 * frontend tak může ikony měnit bez migrace a neznámý klíč nespadne.
 */
export const categoryIcons = {
  backpack: Backpack,
  plane: Plane,
  briefcase: Briefcase,
  camera: Camera,
  laptop: Laptop,
  shirt: Shirt,
  sparkles: Sparkles,
  umbrella: Umbrella,
  plug: Plug,
  footprints: Footprints,
  luggage: Luggage,
  smartphone: Smartphone,
  pill: Pill,
  glasses: Glasses,
  book: BookOpen,
  health: HeartPulse,
} satisfies Record<string, LucideIcon>;

export type CategoryIconKey = keyof typeof categoryIcons;

export const categoryIconKeys = Object.keys(categoryIcons) as CategoryIconKey[];

export const defaultCategoryIcon: CategoryIconKey = 'backpack';

export function getCategoryIcon(key: string): LucideIcon {
  return categoryIcons[key as CategoryIconKey] ?? categoryIcons[defaultCategoryIcon];
}
