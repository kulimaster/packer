import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { bagKindIcon, bagKindMessageKey, type BagKind } from '../bag-kind';
import { formatKilograms, formatWeight } from '../format';
import { BagForm, type BagValues } from './bag-form';

export type PackingBag = {
  id: string;
  name: string;
  kind: BagKind;
  /** Limit dopravce v kg; `undefined` = bez limitu. */
  allowanceKg?: number;
  estimatedWeightGrams: number;
};

export type BagCardProps = {
  bag: PackingBag;
  /** Názvy kategorií přiřazených k bagu – počítá je panel, karta jen zobrazuje. */
  categoryNames?: string[];
  editing?: boolean;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
  onSubmit?: (values: BagValues) => void;
  updatePending?: boolean;
  updateError?: string | null;
  updateFieldErrors?: Record<string, string[]>;
  onDelete?: () => void;
  deleting?: boolean;
  className?: string;
};

function weightText(grams: number, locale: string): string {
  return grams > 0 ? formatWeight(grams, locale) : '0 g';
}

export function BagCard({
  bag,
  categoryNames = [],
  editing = false,
  onStartEditing,
  onCancelEditing,
  onSubmit,
  updatePending = false,
  updateError,
  updateFieldErrors,
  onDelete,
  deleting = false,
  className,
}: BagCardProps) {
  const { t, locale } = useI18n();
  const Icon = bagKindIcon[bag.kind];
  const allowanceGrams = bag.allowanceKg === undefined ? null : Math.round(bag.allowanceKg * 1000);
  const remaining = allowanceGrams === null ? null : allowanceGrams - bag.estimatedWeightGrams;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tertiary text-primary">
          <Icon className="size-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold tracking-tight">{bag.name}</h3>
              <Badge tone="neutral" className="mt-1">
                {t(bagKindMessageKey[bag.kind])}
              </Badge>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {onStartEditing || onDelete ? (
                <>
                  <IconButton
                    size="sm"
                    aria-label={t('bag.edit', { name: bag.name })}
                    onClick={onStartEditing}
                    disabled={editing || deleting}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </IconButton>
                  <IconButton
                    size="sm"
                    aria-label={t('bag.delete', { name: bag.name })}
                    onClick={onDelete}
                    disabled={editing || deleting}
                    className="text-danger hover:bg-danger-bg"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </IconButton>
                </>
              ) : null}
            </div>
          </div>

          {allowanceGrams !== null ? (
            <>
              <ProgressBar
                className="mt-2.5"
                size="sm"
                label={t('bag.capacity', {
                  packed: weightText(bag.estimatedWeightGrams, locale),
                  allowance: formatKilograms(bag.allowanceKg ?? 0, locale),
                })}
                value={bag.estimatedWeightGrams}
                max={allowanceGrams > 0 ? allowanceGrams : 1}
              />
              <p
                className={cn(
                  'mt-1 text-xs font-medium tabular-nums',
                  remaining !== null && remaining < 0 ? 'text-danger' : 'text-on-surface-variant',
                )}
              >
                {remaining === null
                  ? null
                  : remaining > 0
                    ? t('bag.left', { weight: formatWeight(remaining, locale) })
                    : remaining === 0
                      ? t('bag.atLimit')
                      : t('bag.over', { weight: formatWeight(-remaining, locale) })}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs tabular-nums text-on-surface-variant">
              {t('bag.noLimit', { weight: weightText(bag.estimatedWeightGrams, locale) })}
            </p>
          )}

          <p className="mt-1.5 truncate text-xs text-on-surface-variant">
            {categoryNames.length > 0 ? categoryNames.join(' · ') : t('bag.noCategories')}
          </p>
        </div>
      </div>

      {editing ? (
        <div className="border-t border-outline px-3 py-3">
          <BagForm
            mode="edit"
            defaultValues={{
              name: bag.name,
              kind: bag.kind,
              allowanceKg: bag.allowanceKg === undefined ? '' : String(bag.allowanceKg),
            }}
            onSubmit={(values) => onSubmit?.(values)}
            onCancel={() => onCancelEditing?.()}
            pending={updatePending}
            error={updateError}
            fieldErrors={updateFieldErrors}
          />
        </div>
      ) : null}
    </Card>
  );
}
