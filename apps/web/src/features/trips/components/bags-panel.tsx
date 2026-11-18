import { Plus, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { formatWeight } from '../format';
import { BagCard, type PackingBag } from './bag-card';
import { BagForm, type BagValues } from './bag-form';

export type BagsPanelProps = {
  bags: PackingBag[];
  /** Kategorie výletu – z nich panel skládá seznam přiřazených názvů k bagu. */
  categories: { id: string; name: string; bagId?: string }[];
  totalWeightGrams: number;
  /** Archivovaný výlet je jen ke čtení – skryjí se všechny mutace. */
  readOnly?: boolean;
  creating: boolean;
  onStartCreating: () => void;
  onCancelCreating: () => void;
  onCreate: (values: BagValues) => void;
  createPending?: boolean;
  createError?: string | null;
  createFieldErrors?: Record<string, string[]>;
  editingBagId: string | null;
  onStartEditing: (bagId: string) => void;
  onCancelEditing: () => void;
  onUpdate: (bagId: string, values: BagValues) => void;
  updatePending?: boolean;
  updateError?: string | null;
  updateFieldErrors?: Record<string, string[]>;
  deletingBagId?: string | null;
  onDelete: (bagId: string) => void;
  className?: string;
};

/**
 * Postranní panel bagů. Stav formulářů drží stránka, panel je jen presentational –
 * stejně jako kategorie, aby šlo po úspěchu zavřít správný formulář.
 */
export function BagsPanel({
  bags,
  categories,
  totalWeightGrams,
  readOnly = false,
  creating,
  onStartCreating,
  onCancelCreating,
  onCreate,
  createPending = false,
  createError,
  createFieldErrors,
  editingBagId,
  onStartEditing,
  onCancelEditing,
  onUpdate,
  updatePending = false,
  updateError,
  updateFieldErrors,
  deletingBagId,
  onDelete,
  className,
}: BagsPanelProps) {
  const { t, locale } = useI18n();

  return (
    <section className={className} aria-labelledby="bags-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="bags-heading" className="font-display text-lg font-bold tracking-tight">
            {t('bags.title')}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Scale className="size-3.5" aria-hidden />
            {t('bags.total', { weight: formatWeight(totalWeightGrams, locale) })}
          </p>
        </div>

        {bags.length > 0 && !creating && !readOnly ? (
          <Button variant="secondary" size="sm" onClick={onStartCreating}>
            <Plus className="size-4" aria-hidden />
            {t('bags.add')}
          </Button>
        ) : null}
      </div>

      {bags.length > 0 ? (
        <ul className="space-y-3">
          {bags.map((bag) => (
            <li key={bag.id}>
              <BagCard
                bag={bag}
                categoryNames={categories
                  .filter((category) => category.bagId === bag.id)
                  .map((category) => category.name)}
                editing={!readOnly && editingBagId === bag.id}
                onStartEditing={readOnly ? undefined : () => onStartEditing(bag.id)}
                onCancelEditing={onCancelEditing}
                onSubmit={(values) => onUpdate(bag.id, values)}
                updatePending={updatePending && editingBagId === bag.id}
                updateError={editingBagId === bag.id ? updateError : null}
                updateFieldErrors={editingBagId === bag.id ? updateFieldErrors : {}}
                onDelete={readOnly ? undefined : () => onDelete(bag.id)}
                deleting={deletingBagId === bag.id}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {creating && !readOnly ? (
        <Card className="mt-3 p-3">
          <BagForm
            mode="create"
            onSubmit={onCreate}
            onCancel={onCancelCreating}
            pending={createPending}
            error={createError}
            fieldErrors={createFieldErrors}
          />
        </Card>
      ) : bags.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-tertiary text-primary">
            <Scale className="size-5" aria-hidden />
          </span>
          <h3 className="text-sm font-semibold">{t('bags.empty.title')}</h3>
          <p className="text-xs text-on-surface-variant">
            {readOnly ? t('bags.empty.bodyReadOnly') : t('bags.empty.body')}
          </p>
          {readOnly ? null : (
            <Button size="sm" onClick={onStartCreating}>
              <Plus className="size-4" aria-hidden />
              {t('bags.empty.action')}
            </Button>
          )}
        </Card>
      ) : null}
    </section>
  );
}
