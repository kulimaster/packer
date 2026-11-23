import { Archive } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';
import { toTripCard, useArchiveTrip, useTrips } from '@/features/trips/api';
import { TripCard } from '@/features/trips/components/trip-card';

export function ArchivePage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const trips = useTrips(true);
  const archiveTrip = useArchiveTrip();

  const archived = (trips.data ?? []).filter((trip) => trip.isArchived);
  const error = errorText(archiveTrip.error, t);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('archive.title')}</h1>
        <p className="text-sm text-on-surface-variant">{t('archive.subtitle')}</p>
      </header>

      {error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {error}
        </p>
      ) : null}

      {trips.isPending ? <ArchiveLoading /> : null}

      {trips.isError ? (
        <Card className="space-y-4 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">{t('archive.error.title')}</h2>
          <p className="text-sm text-on-surface-variant">{errorText(trips.error, t)}</p>
          <Button variant="secondary" onClick={() => void trips.refetch()}>
            {t('common.tryAgain')}
          </Button>
        </Card>
      ) : null}

      {!trips.isPending && !trips.isError && archived.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
            <Archive className="size-7" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">{t('archive.empty.title')}</h2>
          <p className="max-w-sm text-sm text-on-surface-variant">{t('archive.empty.body')}</p>
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {t('archive.empty.action')}
          </Link>
        </Card>
      ) : null}

      {archived.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {archived.map((trip) => (
            <li key={trip.id}>
              <TripCard
                trip={toTripCard(trip, locale)}
                onContinue={() => void navigate(`/trips/${trip.id}`)}
                onRestore={() => archiveTrip.mutate({ tripId: trip.id, isArchived: false })}
                restorePending={archiveTrip.isPending && archiveTrip.variables?.tripId === trip.id}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ArchiveLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {[0, 1, 2].map((key) => (
        <Card key={key} className="h-80 animate-pulse bg-surface-container" />
      ))}
    </div>
  );
}
