import { ArrowLeft, Backpack, Calendar, MapPin, Plus, Scale } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ApiError } from '@/lib/api/client';
import {
  formatDateRange,
  toPackingBag,
  toPackingCategory,
  toTripStatus,
  useAssignCategoryBag,
  useCreateBag,
  useCreateCategory,
  useCreateItem,
  useDeleteBag,
  useDeleteItem,
  useSetItemPacked,
  useTrip,
  useUpdateBag,
  type BagInput,
  type TripDetailsDto,
} from '@/features/trips/api';
import {
  AddCategoryForm,
  type AddCategoryValues,
} from '@/features/trips/components/add-category-form';
import type { AddItemValues } from '@/features/trips/components/add-item-form';
import type { BagValues } from '@/features/trips/components/bag-form';
import { BagsPanel } from '@/features/trips/components/bags-panel';
import { CategoryCard } from '@/features/trips/components/category-card';
import { tripStatusLabel, tripStatusTone } from '@/features/trips/trip-status';
import { getCover } from '@/features/trips/covers';
import { formatWeight } from '@/features/trips/format';

export function TripDetailPage() {
  const { tripId = '' } = useParams();
  const trip = useTrip(tripId);

  if (trip.isPending) {
    return <TripDetailLoading />;
  }

  if (trip.isError) {
    const notFound = trip.error instanceof ApiError && trip.error.status === 404;

    return (
      <Card className="space-y-4 px-6 py-12 text-center">
        <h1 className="text-lg font-semibold">
          {notFound ? 'Trip not found' : 'Trip could not be loaded'}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {notFound
            ? 'The trip may have been deleted, or it belongs to another account.'
            : trip.error.message}
        </p>
        <div className="flex justify-center gap-3">
          {!notFound ? (
            <Button variant="secondary" onClick={() => void trip.refetch()}>
              Try again
            </Button>
          ) : null}
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Back to trips
          </Link>
        </div>
      </Card>
    );
  }

  return <TripDetailContent trip={trip.data} tripId={tripId} />;
}

function TripDetailContent({ trip, tripId }: { trip: TripDetailsDto; tripId: string }) {
  const createCategory = useCreateCategory(tripId);
  const createItem = useCreateItem(tripId);
  const setPacked = useSetItemPacked(tripId);
  const deleteItem = useDeleteItem(tripId);
  const createBag = useCreateBag(tripId);
  const updateBag = useUpdateBag(tripId);
  const deleteBag = useDeleteBag(tripId);
  const assignBag = useAssignCategoryBag(tripId);

  const [addingCategory, setAddingCategory] = useState(false);
  const [addingItemCategoryId, setAddingItemCategoryId] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [addingBag, setAddingBag] = useState(false);
  const [editingBagId, setEditingBagId] = useState<string | null>(null);
  const [deletingBagId, setDeletingBagId] = useState<string | null>(null);
  const [pendingBagCategoryId, setPendingBagCategoryId] = useState<string | null>(null);

  const status = toTripStatus(trip.status);
  const packed = Number(trip.packedCount);
  const total = Number(trip.totalCount);
  const weight = Number(trip.estimatedWeightGrams);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const cover = getCover(trip.coverImage ?? undefined);
  const categories = trip.categories.map(toPackingCategory);
  const bags = trip.bags.map(toPackingBag);

  const handleAddCategory = (values: AddCategoryValues) => {
    createCategory.mutate(
      { name: values.name, icon: values.icon, note: values.note || undefined },
      { onSuccess: () => setAddingCategory(false) },
    );
  };

  const handleAddItem = (categoryId: string, values: AddItemValues) => {
    createItem.mutate(
      {
        categoryId,
        title: values.title,
        quantity: values.quantity,
        isEssential: values.isEssential,
        weightGrams: values.weightGrams === '' ? null : Number(values.weightGrams),
      },
      { onSuccess: () => setAddingItemCategoryId(null) },
    );
  };

  const handleToggleItem = (itemId: string, isPacked: boolean) => {
    setPendingItemId(itemId);
    setPacked.mutate({ itemId, isPacked }, { onSettled: () => setPendingItemId(null) });
  };

  const handleDeleteItem = (itemId: string) => {
    setPendingItemId(itemId);
    deleteItem.mutate(itemId, { onSettled: () => setPendingItemId(null) });
  };

  const handleCreateBag = (values: BagValues) => {
    createBag.mutate(toBagInput(values), { onSuccess: () => setAddingBag(false) });
  };

  const handleUpdateBag = (bagId: string, values: BagValues) => {
    updateBag.mutate({ bagId, ...toBagInput(values) }, { onSuccess: () => setEditingBagId(null) });
  };

  const handleDeleteBag = (bagId: string) => {
    setDeletingBagId(bagId);
    deleteBag.mutate(bagId, { onSettled: () => setDeletingBagId(null) });
  };

  const handleAssignBag = (categoryId: string, bagId: string | null) => {
    setPendingBagCategoryId(categoryId);
    assignBag.mutate({ categoryId, bagId }, { onSettled: () => setPendingBagCategoryId(null) });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All trips
      </Link>

      <Card className="overflow-hidden">
        <div className="relative h-40 w-full bg-gradient-to-br from-primary to-secondary sm:h-48">
          {cover ? (
            <img src={cover.file} alt="" decoding="async" className="size-full object-cover" />
          ) : null}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/35 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6">
            <div className="min-w-0">
              <Badge tone={tripStatusTone[status]}>{tripStatusLabel[status]}</Badge>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {trip.title}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {trip.destination ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <MapPin className="size-3.5" aria-hidden />
                    {trip.destination}
                  </span>
                ) : null}
                {dateRange ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Calendar className="size-3.5" aria-hidden />
                    {dateRange}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              Packed
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {packed}{' '}
              <span className="text-base font-medium text-on-surface-variant">/ {total}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              Progress
            </p>
            <ProgressBar className="mt-3" value={packed} max={total > 0 ? total : 1} showValue />
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              <Scale className="size-3.5" aria-hidden />
              Estimated weight
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatWeight(weight)}</p>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                bags={bags}
                onAssignBag={(bagId) => handleAssignBag(category.id, bagId)}
                bagAssignPending={pendingBagCategoryId === category.id}
                adding={addingItemCategoryId === category.id}
                onStartAdding={() => setAddingItemCategoryId(category.id)}
                onCancelAdding={() => setAddingItemCategoryId(null)}
                onAddItem={(values) => handleAddItem(category.id, values)}
                addingPending={createItem.isPending && addingItemCategoryId === category.id}
                addError={
                  addingItemCategoryId === category.id ? errorMessage(createItem.error) : null
                }
                addFieldErrors={
                  createItem.error instanceof ApiError ? createItem.error.fieldErrors : {}
                }
                onToggleItem={handleToggleItem}
                onDeleteItem={handleDeleteItem}
                pendingItemId={pendingItemId}
              />
            ))
          ) : (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
                <Backpack className="size-7" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold">No categories yet</h2>
              <p className="max-w-sm text-sm text-on-surface-variant">
                Rozděl balení na sekce – třeba carry-on, elektroniku a oblečení.
              </p>
              <Button onClick={() => setAddingCategory(true)}>
                <Plus className="size-4" aria-hidden />
                Add first category
              </Button>
            </Card>
          )}

          {addingCategory ? (
            <AddCategoryForm
              onSubmit={handleAddCategory}
              onCancel={() => setAddingCategory(false)}
              pending={createCategory.isPending}
              error={errorMessage(createCategory.error)}
              fieldErrors={
                createCategory.error instanceof ApiError ? createCategory.error.fieldErrors : {}
              }
            />
          ) : categories.length > 0 ? (
            <Button variant="secondary" onClick={() => setAddingCategory(true)}>
              <Plus className="size-4" aria-hidden />
              Add category
            </Button>
          ) : null}
        </div>

        <BagsPanel
          className="lg:sticky lg:top-6"
          bags={bags}
          categories={categories}
          totalWeightGrams={weight}
          creating={addingBag}
          onStartCreating={() => setAddingBag(true)}
          onCancelCreating={() => setAddingBag(false)}
          onCreate={handleCreateBag}
          createPending={createBag.isPending}
          createError={errorMessage(createBag.error)}
          createFieldErrors={createBag.error instanceof ApiError ? createBag.error.fieldErrors : {}}
          editingBagId={editingBagId}
          onStartEditing={setEditingBagId}
          onCancelEditing={() => setEditingBagId(null)}
          onUpdate={handleUpdateBag}
          updatePending={updateBag.isPending}
          updateError={errorMessage(updateBag.error)}
          updateFieldErrors={updateBag.error instanceof ApiError ? updateBag.error.fieldErrors : {}}
          deletingBagId={deletingBagId}
          onDelete={handleDeleteBag}
        />
      </div>
    </div>
  );
}

/** Prázdné pole v formuláři = „bez limitu“, ne nula kilogramů. */
function toBagInput(values: BagValues): BagInput {
  return {
    name: values.name,
    kind: values.kind,
    allowanceKg: values.allowanceKg === '' ? null : Number(values.allowanceKg),
  };
}

function errorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}

function TripDetailLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-5 w-24 animate-pulse rounded-full bg-surface-container" />
      <Card className="h-64 animate-pulse bg-surface-container" />
      <Card className="h-48 animate-pulse bg-surface-container" />
      <Card className="h-48 animate-pulse bg-surface-container" />
    </div>
  );
}
