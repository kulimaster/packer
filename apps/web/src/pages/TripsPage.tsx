import { LogOut, Plus, Plane } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useCurrentUser, useLogout } from '@/features/auth/api';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import { toTripCard, useCreateTrip, useTrips } from '@/features/trips/api';
import { TripForm, type TripValues } from '@/features/trips/components/trip-form';
import { TripCard } from '@/features/trips/components/trip-card';
import { ApiError } from '@/lib/api/client';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';

export function TripsPage() {
  const { t } = useI18n();
  const user = useCurrentUser();

  if (user.isPending) {
    return <TripsLoading />;
  }

  if (user.isError) {
    return (
      <Card className="space-y-4 px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">{t('trips.sessionError.title')}</h2>
        <p className="text-sm text-on-surface-variant">{errorText(user.error, t)}</p>
        <Button variant="secondary" onClick={() => void user.refetch()}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (!user.data) {
    return (
      <div className="py-6">
        <AuthPanel />
      </div>
    );
  }

  return <TripsBoard displayName={user.data.displayName} />;
}

function TripsBoard({ displayName }: { displayName: string }) {
  const { t, locale } = useI18n();
  const [includeArchived, setIncludeArchived] = useState(false);
  const trips = useTrips(includeArchived);
  const createTrip = useCreateTrip();
  const logout = useLogout();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = (values: TripValues) => {
    createTrip.mutate(
      {
        title: values.title,
        destination: values.destination || null,
        coverImage: null,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      },
      { onSuccess: () => setCreating(false) },
    );
  };

  const createError = errorText(createTrip.error, t);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('trips.title')}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t('trips.subtitle', { name: displayName })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" aria-hidden />
            {t('trips.signOut')}
          </Button>
          <Button onClick={() => setCreating(true)} disabled={creating}>
            <Plus className="size-4" aria-hidden />
            {t('trips.new')}
          </Button>
        </div>
      </header>

      {creating ? (
        <TripForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
          pending={createTrip.isPending}
          error={createError}
          fieldErrors={createTrip.error instanceof ApiError ? createTrip.error.fieldErrors : {}}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={!includeArchived} onClick={() => setIncludeArchived(false)}>
          {t('trips.filter.active')}
        </Chip>
        <Chip selected={includeArchived} onClick={() => setIncludeArchived(true)}>
          {t('trips.filter.archived')}
        </Chip>
      </div>

      {trips.isPending ? <TripsLoading /> : null}

      {trips.isError ? (
        <Card className="space-y-4 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">{t('trips.error.title')}</h2>
          <p className="text-sm text-on-surface-variant">{errorText(trips.error, t)}</p>
          <Button variant="secondary" onClick={() => void trips.refetch()}>
            {t('common.tryAgain')}
          </Button>
        </Card>
      ) : null}

      {trips.data?.length === 0 && !creating ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
            <Plane className="size-7" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">
            {includeArchived ? t('trips.empty.titleAll') : t('trips.empty.title')}
          </h2>
          <p className="max-w-sm text-sm text-on-surface-variant">
            {includeArchived ? t('trips.empty.bodyAll') : t('trips.empty.body')}
          </p>
          {!includeArchived ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden />
              {t('trips.empty.action')}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {trips.data && trips.data.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {trips.data.map((trip) => (
            <li key={trip.id}>
              <TripCard
                trip={toTripCard(trip, locale)}
                onContinue={() => navigate(`/trips/${trip.id}`)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TripsLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {[0, 1, 2].map((key) => (
        <Card key={key} className="h-80 animate-pulse bg-surface-container" />
      ))}
    </div>
  );
}
