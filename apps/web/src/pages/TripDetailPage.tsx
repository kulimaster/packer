import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Backpack,
  BookmarkPlus,
  Calendar,
  Copy,
  MapPin,
  Pencil,
  Plus,
  Scale,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ApiError } from '@/lib/api/client';
import { errorText } from '@/lib/api/errors';
import {
  toTemplateCard,
  useCreateTemplate,
  useImportTemplates,
  useTemplates,
} from '@/features/templates/api';
import { TemplateForm, type TemplateValues } from '@/features/templates/components/template-form';
import { TemplateImportPanel } from '@/features/templates/components/template-import-panel';
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
  useDeleteCategory,
  useDeleteItem,
  useDeleteTrip,
  useDuplicateTrip,
  useSetItemPacked,
  useSetTripArchived,
  useTrip,
  useUpdateBag,
  useUpdateCategory,
  useUpdateItem,
  useUpdateTrip,
  type BagInput,
  type TripDetailsDto,
} from '@/features/trips/api';
import { CategoryForm, type CategoryValues } from '@/features/trips/components/category-form';
import type { BagValues } from '@/features/trips/components/bag-form';
import { BagsPanel } from '@/features/trips/components/bags-panel';
import { CategoryCard } from '@/features/trips/components/category-card';
import type { ItemValues } from '@/features/trips/components/item-form';
import { formatItemFlags } from '@/features/trips/item-traits';
import { TripForm, type TripValues } from '@/features/trips/components/trip-form';
import { tripStatusMessageKey, tripStatusTone } from '@/features/trips/trip-status';
import { getCover } from '@/features/trips/covers';
import { formatWeight } from '@/features/trips/format';
import { useI18n } from '@/lib/i18n';

export function TripDetailPage() {
  const { t } = useI18n();
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
          {notFound ? t('tripDetail.notFound.title') : t('tripDetail.error.title')}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {notFound ? t('tripDetail.notFound.body') : errorText(trip.error, t)}
        </p>
        <div className="flex justify-center gap-3">
          {!notFound ? (
            <Button variant="secondary" onClick={() => void trip.refetch()}>
              {t('common.tryAgain')}
            </Button>
          ) : null}
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {t('tripDetail.back')}
          </Link>
        </div>
      </Card>
    );
  }

  return <TripDetailContent trip={trip.data} tripId={tripId} />;
}

function TripDetailContent({ trip, tripId }: { trip: TripDetailsDto; tripId: string }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const createCategory = useCreateCategory(tripId);
  const updateCategory = useUpdateCategory(tripId);
  const deleteCategory = useDeleteCategory(tripId);
  const createItem = useCreateItem(tripId);
  const setPacked = useSetItemPacked(tripId);
  const updateItem = useUpdateItem(tripId);
  const deleteItem = useDeleteItem(tripId);
  const createBag = useCreateBag(tripId);
  const updateBag = useUpdateBag(tripId);
  const deleteBag = useDeleteBag(tripId);
  const assignBag = useAssignCategoryBag(tripId);
  const setArchived = useSetTripArchived(tripId);
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const duplicateTrip = useDuplicateTrip();
  const templates = useTemplates();
  const importTemplates = useImportTemplates(tripId);
  const createTemplate = useCreateTemplate();

  const [editingTrip, setEditingTrip] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSavedName, setTemplateSavedName] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingItemCategoryId, setAddingItemCategoryId] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [addingBag, setAddingBag] = useState(false);
  const [editingBagId, setEditingBagId] = useState<string | null>(null);
  const [deletingBagId, setDeletingBagId] = useState<string | null>(null);
  const [pendingBagCategoryId, setPendingBagCategoryId] = useState<string | null>(null);
  const [importingTemplates, setImportingTemplates] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const status = toTripStatus(trip.status);
  const packed = Number(trip.packedCount);
  const total = Number(trip.totalCount);
  const weight = Number(trip.estimatedWeightGrams);
  const dateRange = formatDateRange(trip.startDate, trip.endDate, locale);
  const cover = getCover(trip.coverImage ?? undefined);
  const categories = trip.categories.map(toPackingCategory);
  const bags = trip.bags.map(toPackingBag);
  const archived = trip.isArchived;

  /** Cover formulář neřeší – posíláme současný, ať ho úprava nesmaže. */
  const handleUpdateTrip = (values: TripValues) => {
    updateTrip.mutate(
      {
        tripId,
        title: values.title,
        destination: values.destination || null,
        coverImage: trip.coverImage ?? null,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      },
      { onSuccess: () => setEditingTrip(false) },
    );
  };

  const handleDeleteTrip = () => {
    deleteTrip.mutate(tripId, { onSuccess: () => void navigate('/') });
  };

  const handleDuplicateTrip = () => {
    duplicateTrip.mutate(
      { tripId, title: t('tripDetail.duplicate.title', { title: trip.title }) },
      { onSuccess: (copy) => void navigate(`/trips/${copy.id}`) },
    );
  };

  /** Nová šablona je dědicem výletu – položky kopíruje API, tady jde jen název a popis. */
  const handleSaveAsTemplate = (values: TemplateValues) => {
    createTemplate.mutate(
      {
        tripId,
        name: values.name,
        description: values.description,
        icon: 'backpack',
        accent: 'mint',
      },
      {
        onSuccess: () => {
          setSavingTemplate(false);
          setTemplateSavedName(values.name);
        },
      },
    );
  };

  const handleAddCategory = (values: CategoryValues) => {
    createCategory.mutate(
      { name: values.name, icon: values.icon, note: values.note || undefined },
      { onSuccess: () => setAddingCategory(false) },
    );
  };

  /** Limit hmotnosti formulář neřeší – posíláme současný, ať ho úprava nevynuluje. */
  const handleUpdateCategory = (categoryId: string, values: CategoryValues) => {
    const category = categories.find((candidate) => candidate.id === categoryId);

    return updateCategory.mutateAsync({
      categoryId,
      name: values.name,
      icon: values.icon,
      note: values.note || undefined,
      maxWeightKg: category?.maxWeightKg ?? null,
    });
  };

  const handleAddItem = (categoryId: string, values: ItemValues) => {
    createItem.mutate(
      {
        categoryId,
        title: values.title,
        note: values.note || null,
        quantity: values.quantity,
        isEssential: values.isEssential,
        flags: formatItemFlags(values.flags),
        weightGrams: values.weightGrams === '' ? null : Number(values.weightGrams),
      },
      { onSuccess: () => setAddingItemCategoryId(null) },
    );
  };

  const handleUpdateItem = (itemId: string, values: ItemValues) => {
    return updateItem.mutateAsync({
      itemId,
      title: values.title,
      note: values.note || null,
      quantity: values.quantity,
      isEssential: values.isEssential,
      flags: formatItemFlags(values.flags),
      weightGrams: values.weightGrams === '' ? null : Number(values.weightGrams),
    });
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

  const openTemplatePicker = () => {
    setSelectedTemplateIds([]);
    setImportingTemplates(true);
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplateIds((selected) =>
      selected.includes(templateId)
        ? selected.filter((id) => id !== templateId)
        : [...selected, templateId],
    );
  };

  const handleImportTemplates = () => {
    importTemplates.mutate(selectedTemplateIds, {
      onSuccess: () => {
        setImportingTemplates(false);
        setSelectedTemplateIds([]);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('tripDetail.allTrips')}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {!archived && !editingTrip ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateTrip.reset();
                setConfirmingDelete(false);
                setEditingTrip(true);
              }}
            >
              <Pencil className="size-4" aria-hidden />
              {t('tripDetail.edit')}
            </Button>
          ) : null}

          {!confirmingDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                deleteTrip.reset();
                setEditingTrip(false);
                setConfirmingDelete(true);
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {t('tripDetail.delete')}
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setArchived.mutate(!archived)}
            disabled={setArchived.isPending}
          >
            {archived ? (
              <ArchiveRestore className="size-4" aria-hidden />
            ) : (
              <Archive className="size-4" aria-hidden />
            )}
            {archived ? t('tripDetail.restore') : t('tripDetail.archive')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              duplicateTrip.reset();
              setEditingTrip(false);
              setConfirmingDelete(false);
              handleDuplicateTrip();
            }}
            isLoading={duplicateTrip.isPending}
          >
            <Copy className="size-4" aria-hidden />
            {t('tripDetail.duplicate')}
          </Button>
        </div>
      </div>

      {confirmingDelete ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-danger bg-danger-bg px-4 py-3">
          <p className="text-sm text-danger-fg">
            {t('tripDetail.deleteConfirm.body', { title: trip.title })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleteTrip.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteTrip}
              isLoading={deleteTrip.isPending}
            >
              {t('tripDetail.deleteConfirm.confirm')}
            </Button>
          </div>
        </div>
      ) : null}

      {deleteTrip.error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {errorText(deleteTrip.error, t)}
        </p>
      ) : null}

      {setArchived.error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {errorText(setArchived.error, t)}
        </p>
      ) : null}

      {duplicateTrip.error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {errorText(duplicateTrip.error, t)}
        </p>
      ) : null}

      {archived ? (
        <div className="flex items-start gap-3 rounded-card border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
          <Archive className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{t('tripDetail.archivedNotice')}</p>
        </div>
      ) : null}

      {!archived && editingTrip ? (
        <TripForm
          mode="edit"
          defaultValues={{
            title: trip.title,
            destination: trip.destination ?? '',
            startDate: trip.startDate ?? '',
            endDate: trip.endDate ?? '',
          }}
          onSubmit={handleUpdateTrip}
          onCancel={() => setEditingTrip(false)}
          pending={updateTrip.isPending}
          error={errorText(updateTrip.error, t)}
          fieldErrors={updateTrip.error instanceof ApiError ? updateTrip.error.fieldErrors : {}}
        />
      ) : null}

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
              <Badge tone={tripStatusTone[status]}>{t(tripStatusMessageKey[status])}</Badge>
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
              {t('tripDetail.packed')}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {packed}{' '}
              <span className="text-base font-medium text-on-surface-variant">/ {total}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              {t('tripDetail.progress')}
            </p>
            <ProgressBar
              className="mt-3"
              value={packed}
              max={total > 0 ? total : 1}
              label={t('tripDetail.progress')}
              showValue
            />
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              <Scale className="size-3.5" aria-hidden />
              {t('tripDetail.weight')}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatWeight(weight, locale)}</p>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t('tripDetail.packingList')}
            </h2>

            <div className="flex flex-wrap items-center gap-1">
              {total > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    createTemplate.reset();
                    setTemplateSavedName(null);
                    setSavingTemplate(true);
                  }}
                >
                  <BookmarkPlus className="size-4" aria-hidden />
                  {t('tripDetail.saveAsTemplate')}
                </Button>
              ) : null}

              {!archived && !importingTemplates ? (
                <Button variant="secondary" size="sm" onClick={openTemplatePicker}>
                  <Sparkles className="size-4" aria-hidden />
                  {t('tripDetail.addTemplates')}
                </Button>
              ) : null}
            </div>
          </div>

          {templateSavedName ? (
            <p role="status" className="rounded-input bg-tertiary px-3 py-2 text-sm text-primary">
              {t('tripDetail.templateSaved', { name: templateSavedName })}{' '}
              <Link to="/templates" className="font-semibold underline">
                {t('tripDetail.openTemplates')}
              </Link>
            </p>
          ) : null}

          {savingTemplate ? (
            <TemplateForm
              defaultValues={{ name: trip.title }}
              onSubmit={handleSaveAsTemplate}
              onCancel={() => setSavingTemplate(false)}
              pending={createTemplate.isPending}
              error={errorText(createTemplate.error, t)}
              fieldErrors={
                createTemplate.error instanceof ApiError ? createTemplate.error.fieldErrors : {}
              }
            />
          ) : null}

          {!archived && importingTemplates ? (
            <TemplateImportPanel
              templates={(templates.data ?? []).map(toTemplateCard)}
              selectedIds={selectedTemplateIds}
              onToggle={toggleTemplate}
              onClose={() => setImportingTemplates(false)}
              onConfirm={handleImportTemplates}
              pending={importTemplates.isPending}
              loading={templates.isPending}
              error={
                errorText(importTemplates.error, t) ??
                (templates.isError ? errorText(templates.error, t) : null)
              }
            />
          ) : null}

          {categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                bags={bags}
                onAssignBag={(bagId) => handleAssignBag(category.id, bagId)}
                bagAssignPending={pendingBagCategoryId === category.id}
                readOnly={archived}
                adding={addingItemCategoryId === category.id}
                onStartAdding={() => setAddingItemCategoryId(category.id)}
                onCancelAdding={() => setAddingItemCategoryId(null)}
                onAddItem={(values) => handleAddItem(category.id, values)}
                addingPending={createItem.isPending && addingItemCategoryId === category.id}
                addError={
                  addingItemCategoryId === category.id ? errorText(createItem.error, t) : null
                }
                addFieldErrors={
                  createItem.error instanceof ApiError ? createItem.error.fieldErrors : {}
                }
                onUpdateItem={archived ? undefined : handleUpdateItem}
                onStartEditingItem={() => updateItem.reset()}
                updateItemError={errorText(updateItem.error, t)}
                updateItemFieldErrors={
                  updateItem.error instanceof ApiError ? updateItem.error.fieldErrors : {}
                }
                onToggleItem={archived ? undefined : handleToggleItem}
                onDeleteItem={archived ? undefined : handleDeleteItem}
                pendingItemId={pendingItemId}
                onUpdateCategory={
                  archived ? undefined : (values) => handleUpdateCategory(category.id, values)
                }
                onStartEditingCategory={() => updateCategory.reset()}
                updateCategoryError={errorText(updateCategory.error, t)}
                updateCategoryFieldErrors={
                  updateCategory.error instanceof ApiError ? updateCategory.error.fieldErrors : {}
                }
                onDeleteCategory={archived ? undefined : () => deleteCategory.mutate(category.id)}
                categoryPending={updateCategory.isPending || deleteCategory.isPending}
              />
            ))
          ) : (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
                <Backpack className="size-7" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold">{t('tripDetail.noCategories.title')}</h2>
              <p className="max-w-sm text-sm text-on-surface-variant">
                {t('tripDetail.noCategories.body')}
              </p>
              {archived ? null : (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => setAddingCategory(true)}>
                    <Plus className="size-4" aria-hidden />
                    {t('tripDetail.addFirstCategory')}
                  </Button>
                  <Button variant="secondary" onClick={openTemplatePicker}>
                    <Sparkles className="size-4" aria-hidden />
                    {t('tripDetail.startFromTemplate')}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {!archived && addingCategory ? (
            <CategoryForm
              onSubmit={handleAddCategory}
              onCancel={() => setAddingCategory(false)}
              pending={createCategory.isPending}
              error={errorText(createCategory.error, t)}
              fieldErrors={
                createCategory.error instanceof ApiError ? createCategory.error.fieldErrors : {}
              }
            />
          ) : !archived && categories.length > 0 ? (
            <Button variant="secondary" onClick={() => setAddingCategory(true)}>
              <Plus className="size-4" aria-hidden />
              {t('tripDetail.addCategory')}
            </Button>
          ) : null}
        </div>

        <BagsPanel
          className="lg:sticky lg:top-6"
          bags={bags}
          categories={categories}
          totalWeightGrams={weight}
          readOnly={archived}
          creating={addingBag}
          onStartCreating={() => setAddingBag(true)}
          onCancelCreating={() => setAddingBag(false)}
          onCreate={handleCreateBag}
          createPending={createBag.isPending}
          createError={errorText(createBag.error, t)}
          createFieldErrors={createBag.error instanceof ApiError ? createBag.error.fieldErrors : {}}
          editingBagId={editingBagId}
          onStartEditing={setEditingBagId}
          onCancelEditing={() => setEditingBagId(null)}
          onUpdate={handleUpdateBag}
          updatePending={updateBag.isPending}
          updateError={errorText(updateBag.error, t)}
          updateFieldErrors={updateBag.error instanceof ApiError ? updateBag.error.fieldErrors : {}}
          deletingBagId={deletingBagId}
          onDelete={handleDeleteBag}
        />
      </div>
    </div>
  );
}

/**
 * Prázdné pole v BagFormu = „bez limitu“, ne nula kilogramů.
 */
function toBagInput(values: BagValues): BagInput {
  return {
    name: values.name,
    kind: values.kind,
    allowanceKg: values.allowanceKg === '' ? null : Number(values.allowanceKg),
  };
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
