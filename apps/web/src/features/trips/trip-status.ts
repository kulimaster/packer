import type { BadgeTone } from '@/components/ui/badge.variants';
import type { MessageKey } from '@/lib/i18n';

export type TripStatus = 'not-started' | 'in-progress' | 'ready' | 'archived';

/** Překladový klíč stavu – text se bere z katalogu, ne z komponenty. */
export const tripStatusMessageKey: Record<TripStatus, MessageKey> = {
  'not-started': 'tripStatus.notStarted',
  'in-progress': 'tripStatus.inProgress',
  ready: 'tripStatus.ready',
  archived: 'tripStatus.archived',
};

export const tripStatusTone: Record<TripStatus, BadgeTone> = {
  'not-started': 'neutral',
  'in-progress': 'packed',
  ready: 'success',
  archived: 'neutral',
};
