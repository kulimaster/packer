import type { BadgeTone } from '@/components/ui/badge.variants';

export type TripStatus = 'not-started' | 'in-progress' | 'ready' | 'archived';

export const tripStatusLabel: Record<TripStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  ready: 'Ready to go',
  archived: 'Archived',
};

export const tripStatusTone: Record<TripStatus, BadgeTone> = {
  'not-started': 'neutral',
  'in-progress': 'packed',
  ready: 'success',
  archived: 'neutral',
};
