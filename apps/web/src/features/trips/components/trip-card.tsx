import { Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/cn';
import { getCover } from '../covers';
import { tripStatusLabel, tripStatusTone, type TripStatus } from '../trip-status';

export type TripSummary = {
  id: string;
  title: string;
  destination?: string;
  dateRange?: string;
  packed: number;
  total: number;
  status: TripStatus;
  /** Id výchozí fotky z registru `covers`. */
  coverId?: string;
  /** Vlastní fotka (upload) – má přednost před `coverId`. */
  imageUrl?: string;
};

type TripCardProps = {
  trip: TripSummary;
  onContinue?: () => void;
  /**
   * `primary` = plná teal (výchozí, hlavní akce karty), `soft` = světle mint
   * jako v původním mocku. Mint varianta se v design systému neukotvila,
   * protože soutěží s hlavním CTA obrazovky.
   */
  ctaVariant?: 'soft' | 'primary';
  className?: string;
};

export function TripCard({ trip, onContinue, ctaVariant = 'primary', className }: TripCardProps) {
  // Vlastní fotka vyhrává; jinak výchozí cover; jinak gradient.
  const imageUrl = trip.imageUrl ?? getCover(trip.coverId)?.file;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative h-40 w-full bg-gradient-to-br from-primary to-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : null}
        <Badge tone={tripStatusTone[trip.status]} className="absolute top-3 right-3">
          {trip.status === 'ready' ? '✓ ' : ''}
          {tripStatusLabel[trip.status]}
        </Badge>
        {/* Scrim drží název čitelný i na světlé fotce (skála, pláž, sníh). */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-on-surface/75 via-on-surface/25 to-transparent"
        />
        <p className="absolute bottom-3 left-4 font-display text-2xl font-bold text-white drop-shadow-sm">
          {trip.title}
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {trip.destination ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
              <MapPin className="size-3.5" aria-hidden />
              {trip.destination}
            </span>
          ) : null}
          {trip.dateRange ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
              <Calendar className="size-3.5" aria-hidden />
              {trip.dateRange}
            </span>
          ) : null}
        </div>

        <ProgressBar
          value={trip.packed}
          max={trip.total > 0 ? trip.total : 1}
          label={`${trip.packed} / ${trip.total} packed`}
          showValue
        />

        <Button variant={ctaVariant} fullWidth onClick={onContinue}>
          Continue Packing
        </Button>
      </div>
    </Card>
  );
}
