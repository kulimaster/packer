import { Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BadgeTone } from '@/components/ui/badge.variants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/cn';

export type TripStatus = 'not-started' | 'in-progress' | 'ready';

export type TripSummary = {
  id: string;
  title: string;
  destination?: string;
  dateRange?: string;
  packed: number;
  total: number;
  status: TripStatus;
  imageUrl?: string;
};

const statusLabel: Record<TripStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  ready: 'Ready to go',
};

const statusTone: Record<TripStatus, BadgeTone> = {
  'not-started': 'neutral',
  'in-progress': 'packed',
  ready: 'success',
};

type TripCardProps = {
  trip: TripSummary;
  onContinue?: () => void;
  className?: string;
};

export function TripCard({ trip, onContinue, className }: TripCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative h-40 w-full bg-gradient-to-br from-primary to-secondary">
        {trip.imageUrl ? (
          <img src={trip.imageUrl} alt="" className="size-full object-cover" />
        ) : null}
        <Badge tone={statusTone[trip.status]} className="absolute top-3 right-3">
          {trip.status === 'ready' ? '✓ ' : ''}
          {statusLabel[trip.status]}
        </Badge>
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

        <Button variant="soft" fullWidth onClick={onContinue}>
          Continue Packing
        </Button>
      </div>
    </Card>
  );
}
