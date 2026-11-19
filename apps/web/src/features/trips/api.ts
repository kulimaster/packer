import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api, toApiError } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { BagKind } from './bag-kind';
import type { PackingBag } from './components/bag-card';
import type { PackingCategory } from './components/category-card';
import type { PackingItem } from './components/item-row';
import type { TripSummary } from './components/trip-card';
import type { TripStatus } from './trip-status';

export type TripDto = components['schemas']['TripSummary'];
export type TripDetailsDto = components['schemas']['TripDetails'];
export type CategoryDto = components['schemas']['CategoryDetails'];
export type ItemDto = components['schemas']['ItemDetails'];
export type BagDto = components['schemas']['BagDetails'];
export type CreateTripInput = components['schemas']['CreateTripRequest'];

export const tripKeys = {
  active: ['trips', { includeArchived: false }] as const,
  list: (includeArchived: boolean) => ['trips', { includeArchived }] as const,
  detail: (tripId: string) => ['trips', tripId] as const,
};

/** Detail i seznam se mění společně – počet přebalených položek je na kartě výletu. */
function invalidateTrip(queryClient: QueryClient, tripId: string) {
  void queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
  void queryClient.invalidateQueries({ queryKey: ['trips'] });
}

export function useTrips(includeArchived = false) {
  return useQuery({
    queryKey: tripKeys.list(includeArchived),
    queryFn: async (): Promise<TripDto[]> => {
      const { data, error, response } = await api.GET('/api/trips', {
        params: { query: { includeArchived } },
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

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: async (): Promise<TripDetailsDto> => {
      const { data, error, response } = await api.GET('/api/trips/{tripId}', {
        params: { path: { tripId } },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    enabled: tripId.length > 0,
  });
}

export type CreateCategoryInput = {
  name: string;
  icon: string;
  note?: string;
};

export function useCreateCategory(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput): Promise<CategoryDto> => {
      const { data, error, response } = await api.POST('/api/trips/{tripId}/categories', {
        params: { path: { tripId } },
        body: {
          name: input.name,
          icon: input.icon,
          note: input.note || null,
          maxWeightKg: null,
          bagId: null,
        },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type UpdateCategoryInput = {
  categoryId: string;
  name: string;
  icon: string;
  note?: string;
  /** Limit se v UI needituje – posíláme současnou hodnotu, ať ji úprava nesmaže. */
  maxWeightKg: number | null;
};

export function useUpdateCategory(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, ...input }: UpdateCategoryInput): Promise<CategoryDto> => {
      const { data, error, response } = await api.PUT('/api/categories/{categoryId}', {
        params: { path: { categoryId } },
        body: {
          name: input.name,
          icon: input.icon,
          note: input.note || null,
          maxWeightKg: input.maxWeightKg,
        },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export function useDeleteCategory(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<void> => {
      const { error, response } = await api.DELETE('/api/categories/{categoryId}', {
        params: { path: { categoryId } },
      });

      if (error) {
        throw toApiError(error, response.status);
      }
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type CreateItemInput = {
  categoryId: string;
  title: string;
  quantity: number;
  isEssential: boolean;
  weightGrams: number | null;
};

export function useCreateItem(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateItemInput): Promise<ItemDto> => {
      const { data, error, response } = await api.POST('/api/categories/{categoryId}/items', {
        params: { path: { categoryId: input.categoryId } },
        body: {
          title: input.title,
          note: null,
          quantity: input.quantity,
          isEssential: input.isEssential,
          flags: 'None',
          weightGrams: input.weightGrams,
        },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type SetItemPackedInput = {
  itemId: string;
  isPacked: boolean;
};

export function useSetItemPacked(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SetItemPackedInput): Promise<ItemDto> => {
      const { data, error, response } = await api.PATCH('/api/items/{itemId}/packed', {
        params: { path: { itemId: input.itemId } },
        body: { isPacked: input.isPacked },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type UpdateItemInput = {
  itemId: string;
  title: string;
  note: string | null;
  quantity: number;
  isEssential: boolean;
  /** Bitová maska z API jako string (`None`, `Fragile, Battery`). */
  flags: string;
  weightGrams: number | null;
};

export function useUpdateItem(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, ...body }: UpdateItemInput): Promise<ItemDto> => {
      const { data, error, response } = await api.PUT('/api/items/{itemId}', {
        params: { path: { itemId } },
        body,
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export function useDeleteItem(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<void> => {
      const { error, response } = await api.DELETE('/api/items/{itemId}', {
        params: { path: { itemId } },
      });

      if (error) {
        throw toApiError(error, response.status);
      }
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type BagInput = {
  name: string;
  kind: BagKind;
  allowanceKg: number | null;
};

export function useCreateBag(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BagInput): Promise<BagDto> => {
      const { data, error, response } = await api.POST('/api/trips/{tripId}/bags', {
        params: { path: { tripId } },
        body: input,
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type UpdateBagInput = BagInput & { bagId: string };

export function useUpdateBag(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bagId, ...input }: UpdateBagInput): Promise<BagDto> => {
      const { data, error, response } = await api.PUT('/api/bags/{bagId}', {
        params: { path: { bagId } },
        body: input,
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export function useDeleteBag(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bagId: string): Promise<void> => {
      const { error, response } = await api.DELETE('/api/bags/{bagId}', {
        params: { path: { bagId } },
      });

      if (error) {
        throw toApiError(error, response.status);
      }
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export type AssignCategoryBagInput = {
  categoryId: string;
  bagId: string | null;
};

export function useAssignCategoryBag(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, bagId }: AssignCategoryBagInput): Promise<CategoryDto> => {
      const { data, error, response } = await api.PUT('/api/categories/{categoryId}/bag', {
        params: { path: { categoryId } },
        body: { bagId },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

export function useSetTripArchived(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isArchived: boolean): Promise<void> => {
      const { error, response } = await api.PATCH('/api/trips/{tripId}/archived', {
        params: { path: { tripId } },
        body: { isArchived },
      });

      if (error) {
        throw toApiError(error, response.status);
      }
    },
    onSuccess: () => invalidateTrip(queryClient, tripId),
  });
}

/**
 * API vrací stav jako enum (`InProgress`), karta používá kebab-case. Mapování je tady,
 * ne v komponentě – karta nemá vědět, jak vypadá kontrakt.
 */
export function toTripStatus(status: TripDto['status']): TripStatus {
  switch (status) {
    case 'Ready':
      return 'ready';
    case 'InProgress':
      return 'in-progress';
    case 'Archived':
      return 'archived';
    default:
      return 'not-started';
  }
}

const monthFormats = new Map<string, Intl.DateTimeFormat>();

function monthDayFormat(locale: string): Intl.DateTimeFormat {
  let format = monthFormats.get(locale);

  if (!format) {
    format = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
    monthFormats.set(locale, format);
  }

  return format;
}

export function formatDateRange(
  start: string | null,
  end: string | null,
  locale = 'cs-CZ',
): string | undefined {
  if (!start && !end) {
    return undefined;
  }

  const monthDay = monthDayFormat(locale);

  // DateOnly nemá čas; parsujeme půlnoc lokálně, aby se datum neposunulo o den.
  const parse = (iso: string) => new Date(`${iso}T00:00:00`);

  if (start && end) {
    const last = parse(end);
    return `${monthDay.format(parse(start))} – ${monthDay.format(last)}, ${last.getFullYear()}`;
  }

  const single = parse((start ?? end) as string);
  return `${monthDay.format(single)}, ${single.getFullYear()}`;
}

export function toTripCard(trip: TripDto, locale = 'cs-CZ'): TripSummary {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination ?? undefined,
    dateRange: formatDateRange(trip.startDate, trip.endDate, locale),
    packed: Number(trip.packedCount),
    total: Number(trip.totalCount),
    status: toTripStatus(trip.status),
    coverId: trip.coverImage ?? undefined,
  };
}

function toPackingItem(item: ItemDto): PackingItem {
  return {
    id: item.id,
    title: item.title,
    note: item.note ?? undefined,
    quantity: Number(item.quantity),
    isEssential: item.isEssential,
    flags: item.flags,
    weightGrams: item.weightGrams === null ? undefined : Number(item.weightGrams),
    isPacked: item.isPacked,
    estimatedWeightGrams: Number(item.estimatedWeightGrams),
  };
}

export function toPackingCategory(category: CategoryDto): PackingCategory {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    note: category.note ?? undefined,
    bagId: category.bagId ?? undefined,
    maxWeightKg: category.maxWeightKg === null ? undefined : Number(category.maxWeightKg),
    packed: Number(category.packedCount),
    total: Number(category.totalCount),
    estimatedWeightGrams: Number(category.estimatedWeightGrams),
    items: category.items.map(toPackingItem),
  };
}

export function toPackingBag(bag: BagDto): PackingBag {
  return {
    id: bag.id,
    name: bag.name,
    kind: bag.kind,
    allowanceKg: bag.allowanceKg === null ? undefined : Number(bag.allowanceKg),
    estimatedWeightGrams: Number(bag.estimatedWeightGrams),
  };
}
