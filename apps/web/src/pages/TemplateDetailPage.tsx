import { ArrowLeft, BookmarkPlus, Copy, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ApiError } from '@/lib/api/client';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';
import { formatWeight } from '@/features/trips/format';
import {
  formatItemFlags,
  itemTraitMeta,
  itemTraitNames,
  parseItemFlags,
  type ItemTraitValues,
} from '@/features/trips/item-traits';
import {
  useAddTemplateItem,
  useDeleteTemplate,
  useDeleteTemplateItem,
  useDuplicateTemplate,
  useTemplate,
  useUpdateTemplate,
  useUpdateTemplateItem,
  type TemplateDetailsDto,
  type TemplateItemDto,
} from '@/features/templates/api';
import { TemplateForm, type TemplateValues } from '@/features/templates/components/template-form';
import {
  TemplateItemForm,
  type TemplateItemValues,
} from '@/features/templates/components/template-item-form';
import { templateCopyName } from '@/features/templates/copy-name';

export function TemplateDetailPage() {
  const { t } = useI18n();
  const { templateId = '' } = useParams();
  const template = useTemplate(templateId);

  if (template.isPending) {
    return <TemplateDetailLoading />;
  }

  if (template.isError) {
    const notFound = template.error instanceof ApiError && template.error.status === 404;

    return (
      <Card className="space-y-4 px-6 py-12 text-center">
        <h1 className="text-lg font-semibold">
          {notFound ? t('templateDetail.notFound.title') : t('templateDetail.error.title')}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {notFound ? t('templateDetail.notFound.body') : errorText(template.error, t)}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/templates"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {t('templateDetail.back')}
          </Link>

          {notFound ? null : (
            <Button variant="secondary" onClick={() => void template.refetch()}>
              {t('common.tryAgain')}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return <TemplateDetailContent template={template.data} templateId={templateId} />;
}

function TemplateDetailContent({
  template,
  templateId,
}: {
  template: TemplateDetailsDto;
  templateId: string;
}) {
  const { t, locale, plural } = useI18n();
  const navigate = useNavigate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const addItem = useAddTemplateItem(templateId);
  const updateItem = useUpdateTemplateItem(templateId);
  const deleteItem = useDeleteTemplateItem(templateId);

  const [editingMetadata, setEditingMetadata] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const categories = [...new Set(template.items.map((item) => item.categoryName))];
  const groups = [
    ...template.items.reduce((map, item) => {
      const list = map.get(item.categoryName) ?? [];
      list.push(item);
      map.set(item.categoryName, list);
      return map;
    }, new Map<string, TemplateItemDto[]>()),
  ];

  const toInput = (values: TemplateItemValues) => ({
    categoryName: values.categoryName,
    title: values.title,
    note: values.note || null,
    quantity: values.quantity,
    isEssential: values.isEssential,
    flags: formatItemFlags(values.flags),
    weightGrams: values.weightGrams === '' ? null : Number(values.weightGrams),
  });

  const handleUpdateMetadata = (values: TemplateValues) => {
    updateTemplate.mutate(
      {
        templateId,
        name: values.name,
        description: values.description,
        icon: template.icon,
        accent: template.accent,
      },
      { onSuccess: () => setEditingMetadata(false) },
    );
  };

  const handleDeleteTemplate = () => {
    deleteTemplate.mutate(templateId, { onSuccess: () => void navigate('/templates') });
  };

  const handleDuplicateTemplate = () => {
    duplicateTemplate.mutate(
      { templateId, name: templateCopyName(template.name, t) },
      { onSuccess: (copy) => void navigate(`/templates/${copy.id}`) },
    );
  };

  const handleAddItem = (values: TemplateItemValues) => {
    addItem.mutate(toInput(values), { onSuccess: () => setAdding(false) });
  };

  const handleUpdateItem = (itemId: string, values: TemplateItemValues) => {
    return updateItem.mutateAsync({ itemId, ...toInput(values) }).then(() => {
      setEditingItemId(null);
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setDeletingItemId(itemId);
    deleteItem.mutate(itemId, { onSettled: () => setDeletingItemId(null) });
  };

  const updateItemError = errorText(updateItem.error, t);
  const mutationError = errorText(
    updateTemplate.error ??
      deleteTemplate.error ??
      duplicateTemplate.error ??
      addItem.error ??
      deleteItem.error,
    t,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/templates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('templateDetail.back')}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicateTemplate}
            isLoading={duplicateTemplate.isPending}
          >
            <Copy className="size-4" aria-hidden />
            {t('templates.duplicate')}
          </Button>

          {!template.isSystem && !editingMetadata ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateTemplate.reset();
                setEditingMetadata(true);
              }}
            >
              <Pencil className="size-4" aria-hidden />
              {t('templates.edit')}
            </Button>
          ) : null}

          {!template.isSystem ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteTemplate}
              isLoading={deleteTemplate.isPending}
            >
              <Trash2 className="size-4" aria-hidden />
              {t('templates.delete')}
            </Button>
          ) : null}
        </div>
      </div>

      {mutationError ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {mutationError}
        </p>
      ) : null}

      {template.isSystem ? (
        <div className="flex items-start gap-3 rounded-card border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{t('templateDetail.systemNotice')}</p>
        </div>
      ) : null}

      {editingMetadata ? (
        <Card className="p-3">
          <TemplateForm
            mode="edit"
            defaultValues={{
              name: template.name,
              description: template.description ?? '',
            }}
            onSubmit={handleUpdateMetadata}
            onCancel={() => setEditingMetadata(false)}
            pending={updateTemplate.isPending}
            fieldErrors={
              updateTemplate.error instanceof ApiError ? updateTemplate.error.fieldErrors : {}
            }
          />
        </Card>
      ) : null}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">{template.name}</h1>
              <Badge tone={template.isSystem ? 'info' : 'essential'}>
                {template.isSystem ? t('templateDetail.system') : t('templateDetail.own')}
              </Badge>
            </div>

            {template.description ? (
              <p className="mt-1 text-sm text-on-surface-variant">{template.description}</p>
            ) : null}

            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                {plural('templateCard.itemCount', template.items.length)}
              </span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                {Number(template.estimatedWeightGrams) > 0
                  ? formatWeight(Number(template.estimatedWeightGrams), locale)
                  : t('templateCard.noWeight')}
              </span>
              {categories.length > 0 ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{categories.join(' · ')}</span>
                </>
              ) : null}
            </p>
          </div>

          {!template.isSystem && !adding ? (
            <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
              <Plus className="size-4" aria-hidden />
              {t('templateDetail.addItem')}
            </Button>
          ) : null}
        </div>
      </Card>

      {adding ? (
        <Card className="p-3">
          <TemplateItemForm
            categories={categories}
            onSubmit={handleAddItem}
            onCancel={() => setAdding(false)}
            pending={addItem.isPending}
            error={errorText(addItem.error, t)}
            fieldErrors={addItem.error instanceof ApiError ? addItem.error.fieldErrors : {}}
          />
        </Card>
      ) : null}

      {template.items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
            <BookmarkPlus className="size-7" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">{t('templateDetail.empty.title')}</h2>
          <p className="max-w-sm text-sm text-on-surface-variant">
            {t('templateDetail.empty.body')}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(([categoryName, items]) => (
            <Card key={categoryName}>
              <div className="flex items-baseline justify-between gap-3 border-b border-outline px-4 py-3">
                <h2 className="text-sm font-bold tracking-tight">{categoryName}</h2>
                <span className="text-xs font-semibold tabular-nums text-on-surface-variant">
                  {items.length}
                </span>
              </div>

              <ul className="divide-y divide-outline px-2 py-1">
                {items.map((item) =>
                  editingItemId === item.id ? (
                    <li key={item.id} className="py-2">
                      <TemplateItemForm
                        mode="edit"
                        categories={categories}
                        defaultValues={toItemValues(item)}
                        onSubmit={(values) => handleUpdateItem(item.id, values)}
                        onCancel={() => setEditingItemId(null)}
                        pending={updateItem.isPending && updateItem.variables?.itemId === item.id}
                        error={updateItemError}
                        fieldErrors={
                          updateItem.error instanceof ApiError ? updateItem.error.fieldErrors : {}
                        }
                      />
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-input px-2 py-2.5 transition-colors hover:bg-surface-container/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-medium text-on-surface">{item.title}</span>

                          {Number(item.quantity) > 1 ? (
                            <span className="text-xs font-semibold text-on-surface-variant">
                              ×{item.quantity}
                            </span>
                          ) : null}

                          {item.isEssential ? (
                            <Badge tone="essential">{t('item.essential')}</Badge>
                          ) : null}

                          {itemTraitNames(item.flags).map((trait) => (
                            <Badge key={trait} tone={itemTraitMeta[trait].tone}>
                              {t(itemTraitMeta[trait].messageKey)}
                            </Badge>
                          ))}
                        </div>

                        {item.note ? (
                          <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                            {item.note}
                          </p>
                        ) : null}
                      </div>

                      {Number(item.estimatedWeightGrams) > 0 ? (
                        <span className="mt-0.5 shrink-0 text-xs tabular-nums text-on-surface-variant">
                          {formatWeight(Number(item.estimatedWeightGrams), locale)}
                        </span>
                      ) : null}

                      {!template.isSystem ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              updateItem.reset();
                              setEditingItemId(item.id);
                            }}
                            aria-label={t('item.edit', { title: item.title })}
                            className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Pencil className="size-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deleteItem.isPending && deletingItemId === item.id}
                            aria-label={t('item.delete', { title: item.title })}
                            className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-danger-bg hover:text-danger-fg disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </>
                      ) : null}
                    </li>
                  ),
                )}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/** Hodnoty pro formulář úpravy – prázdné pole znamená „bez hmotnosti“, ne nula gramů. */
function toItemValues(item: TemplateItemDto): Partial<TemplateItemValues> {
  return {
    categoryName: item.categoryName,
    title: item.title,
    quantity: Number(item.quantity),
    weightGrams: item.weightGrams === null ? '' : String(item.weightGrams),
    note: item.note ?? '',
    isEssential: item.isEssential,
    flags: parseItemFlags(item.flags) satisfies ItemTraitValues,
  };
}

function TemplateDetailLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-5 w-28 animate-pulse rounded-full bg-surface-container" />
      <Card className="h-40 animate-pulse bg-surface-container" />
      <Card className="h-48 animate-pulse bg-surface-container" />
    </div>
  );
}
