import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Select } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { formatWeight } from '../format';
import { categoryIcons, type CategoryIconKey } from '../icons';
import type { PackingBag } from './bag-card';
import { ItemForm, type ItemValues } from './item-form';
import { ItemRow, type PackingItem } from './item-row';

export type PackingCategory = {
  id: string;
  name: string;
  icon: string;
  note?: string;
  /** Bag, do kterého kategorie patří; `undefined` = zatím nikam. */
  bagId?: string;
  packed: number;
  total: number;
  estimatedWeightGrams: number;
  items: PackingItem[];
};

export type CategoryCardProps = {
  category: PackingCategory;
  /** Bagy výletu pro select přiřazení. Prázdné pole select schová. */
  bags?: PackingBag[];
  onAssignBag?: (bagId: string | null) => void;
  bagAssignPending?: boolean;
  /** Archivovaný výlet je jen ke čtení – skryjí se všechny mutace. */
  readOnly?: boolean;
  /** Otevřený formulář pro přidání položky – stav drží stránka, aby ho šlo po úspěchu zavřít. */
  adding?: boolean;
  onStartAdding?: () => void;
  onCancelAdding?: () => void;
  onAddItem?: (values: ItemValues) => void;
  addingPending?: boolean;
  addError?: string | null;
  addFieldErrors?: Record<string, string[]>;
  /** Úprava položky; bez callbacku se tužka u řádku nezobrazí. */
  onUpdateItem?: (itemId: string, values: ItemValues) => Promise<unknown>;
  /** Zavolá se před otevřením formuláře – stránka tu resetuje chybu poslední mutace. */
  onStartEditingItem?: () => void;
  updateItemError?: string | null;
  updateItemFieldErrors?: Record<string, string[]>;
  onToggleItem?: (itemId: string, isPacked: boolean) => void;
  onDeleteItem?: (itemId: string) => void;
  pendingItemId?: string | null;
  className?: string;
};

export function CategoryCard({
  category,
  bags = [],
  onAssignBag,
  bagAssignPending = false,
  readOnly = false,
  adding = false,
  onStartAdding,
  onCancelAdding,
  onAddItem,
  addingPending = false,
  addError,
  addFieldErrors,
  onUpdateItem,
  onStartEditingItem,
  updateItemError,
  updateItemFieldErrors,
  onToggleItem,
  onDeleteItem,
  pendingItemId,
  className,
}: CategoryCardProps) {
  const { t, locale } = useI18n();
  const Icon = categoryIcons[category.icon as CategoryIconKey] ?? categoryIcons.backpack;
  // Který řádek je otevřený v editaci drží karta – je to čistě UI stav.
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  const handleUpdateItem = async (itemId: string, values: ItemValues) => {
    setSavingItem(true);

    try {
      await onUpdateItem?.(itemId, values);
      setEditingItemId(null);
    } catch {
      // Chybu zobrazí formulář – tu samou mutaci drží stránka a předává ji v props.
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <Card className={className}>
      <div className="flex items-start gap-3 border-b border-outline px-4 py-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tertiary text-primary">
          <Icon className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-base font-bold tracking-tight">{category.name}</h3>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">
              {category.packed} / {category.total}
            </span>
          </div>

          {category.note ? (
            <p className="mt-0.5 truncate text-xs text-on-surface-variant">{category.note}</p>
          ) : null}

          <ProgressBar
            className="mt-2"
            size="sm"
            value={category.packed}
            max={category.total > 0 ? category.total : 1}
            label={t('category.progress', { name: category.name })}
          />

          {!readOnly && onAssignBag && bags.length > 0 ? (
            <div className="mt-2">
              <Select
                aria-label={t('category.bagSelect', { name: category.name })}
                className="h-8 py-0 text-xs"
                value={category.bagId ?? ''}
                disabled={bagAssignPending}
                onChange={(event) =>
                  onAssignBag(event.target.value === '' ? null : event.target.value)
                }
              >
                <option value="">{t('category.noBag')}</option>
                {bags.map((bag) => (
                  <option key={bag.id} value={bag.id}>
                    {bag.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>

        {category.estimatedWeightGrams > 0 ? (
          <span className="mt-1 shrink-0 text-xs tabular-nums text-on-surface-variant">
            {formatWeight(category.estimatedWeightGrams, locale)}
          </span>
        ) : null}
      </div>

      {category.items.length > 0 ? (
        <ul className="divide-y divide-outline px-2 py-1">
          {category.items.map((item) =>
            editingItemId === item.id ? (
              <li key={item.id} className="py-2">
                <ItemForm
                  mode="edit"
                  defaultValues={toItemValues(item)}
                  onSubmit={(values) => handleUpdateItem(item.id, values)}
                  onCancel={() => setEditingItemId(null)}
                  pending={savingItem}
                  error={updateItemError}
                  fieldErrors={updateItemFieldErrors}
                />
              </li>
            ) : (
              <ItemRow
                key={item.id}
                item={item}
                pending={pendingItemId === item.id}
                onTogglePacked={
                  onToggleItem ? (isPacked) => onToggleItem(item.id, isPacked) : undefined
                }
                onEdit={
                  onUpdateItem && !readOnly
                    ? () => {
                        onStartEditingItem?.();
                        setEditingItemId(item.id);
                      }
                    : undefined
                }
                onDelete={onDeleteItem ? () => onDeleteItem(item.id) : undefined}
              />
            ),
          )}
        </ul>
      ) : (
        <p className="px-4 py-5 text-sm text-on-surface-variant">{t('category.empty')}</p>
      )}

      {readOnly ? null : (
        <div className="px-4 py-3">
          {adding ? (
            <ItemForm
              onSubmit={(values) => onAddItem?.(values)}
              onCancel={() => onCancelAdding?.()}
              pending={addingPending}
              error={addError}
              fieldErrors={addFieldErrors}
            />
          ) : (
            <Button variant="ghost" size="sm" onClick={onStartAdding}>
              <Plus className="size-4" aria-hidden />
              {t('category.addItem')}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/** Hodnoty pro formulář úpravy – prázdné pole znamená „bez hmotnosti“, ne nula gramů. */
function toItemValues(item: PackingItem): Partial<ItemValues> {
  return {
    title: item.title,
    quantity: item.quantity,
    weightGrams: item.weightGrams === undefined ? '' : String(item.weightGrams),
    isEssential: item.isEssential,
  };
}
