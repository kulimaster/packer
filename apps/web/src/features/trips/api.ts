import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, toApiError } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { TripStatus, TripSummary } from './components/trip-card';

export type TripDto = components['schemas']['TripSummary'];
export type CreateTripInput = components['schemas']['CreateTripRequest'];

export const tripKeys = {
  active: ['trips', { includeArchived: false }] as const,
};

export function useTrips() {
  return useQuery({
    queryKey: tripKeys.active,
    queryFn: async (): Promise<TripDto[]> => {
      const { data, error, response } = await api.GET('/api/trips', {
        params: { query: { includeArchived: false } },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTripInput): Promise<TripDto> => {
      const { data, error, response } = await api.POST('/api/trips', { body: input });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * API vrací stav jako enum (`InProgress`), karta používá kebab-case. Mapování je tady,
 * ne v komponentě – karta nemá vědět, jak vypadá kontrakt.
 */
function toCardStatus(status: TripDto['status']): TripStatus {
  switch (status) {
    case 'Ready':
      return 'ready';
    case 'InProgress':
      return 'in-progress';
    default:
      return 'not-started';
  }
}

const monthDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

function formatDateRange(start: string | null, end: string | null): string | undefined {
  if (!start && !end) {
    return undefined;
  }

  // DateOnly nemá čas; parsujeme půlnoc lokálně, aby se datum neposunulo o den.
  const parse = (iso: string) => new Date(`${iso}T00:00:00`);

  if (start && end) {
    const last = parse(end);
    return `${monthDay.format(parse(start))} – ${monthDay.format(last)}, ${last.getFullYear()}`;
  }

  const single = parse((start ?? end) as string);
  return `${monthDay.format(single)}, ${single.getFullYear()}`;
}

export function toTripCard(trip: TripDto): TripSummary {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination ?? undefined,
    dateRange: formatDateRange(trip.startDate, trip.endDate),
    packed: Number(trip.packedCount),
    total: Number(trip.totalCount),
    status: toCardStatus(trip.status),
    coverId: trip.coverImage ?? undefined,
  };
}
