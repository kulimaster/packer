import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BadgeTone } from '@/components/ui/badge.variants';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/cn';
import { useI18n, type MessageKey } from '@/lib/i18n';
import { formatWeight } from '../format';

export type PackingItem = {
  id: string;
  title: string;
  note?: string;
  quantity: number;
  isEssential: boolean;
  /** Bitová maska z API jako string (`None`, `Fragile`, `Fragile, Battery`). */
  flags: string;
  weightGrams?: number;
  isPacked: boolean;
  estimatedWeightGrams: number;
};

const traitLabels: Record<string, { messageKey: MessageKey; tone: BadgeTone }> = {
  CarryOnOnly: { messageKey: 'item.trait.carryOnOnly', tone: 'info' },
  Fragile: { messageKey: 'item.trait.fragile', tone: 'warning' },
  TsaLiquid: { messageKey: 'item.trait.tsaLiquid', tone: 'info' },
  Battery: { messageKey: 'item.trait.battery', tone: 'warning' },
};

function traitKeys(flags: string): string[] {
  return flags
    .split(',')
    .map((flag) => flag.trim())
    .filter((flag) => flag.length > 0 && flag !== 'None');
}

type ItemRowProps = {
  item: PackingItem;
  onTogglePacked?: (isPacked: boolean) => void;
  onDelete?: () => void;
  /** Během ukládání se řádek nepočítá jako interaktivní. */
  pending?: boolean;
  className?: string;
};

export function ItemRow({
  item,
  onTogglePacked,
  onDelete,
  pending = false,
  className,
}: ItemRowProps) {
  const { t, locale } = useI18n();
  const traits = traitKeys(item.flags);

  return (
    <li
      className={cn(
        'group flex items-start gap-3 rounded-input px-2 py-2.5 transition-colors',
        pending ? 'opacity-60' : 'hover:bg-surface-container/60',
        className,
      )}
    >
      <Checkbox
        checked={item.isPacked}
        disabled={pending || !onTogglePacked}
        onChange={(event) => onTogglePacked?.(event.target.checked)}
        aria-label={
          item.isPacked
            ? t('item.markUnpacked', { title: item.title })
            : t('item.markPacked', { title: item.title })
        }
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              'text-sm font-medium text-on-surface',
              item.isPacked && 'text-on-surface-variant line-through decoration-1',
            )}
          >
            {item.title}
          </span>

          {item.quantity > 1 ? (
            <span className="text-xs font-semibold text-on-surface-variant">×{item.quantity}</span>
          ) : null}

          {item.isEssential ? <Badge tone="essential">{t('item.essential')}</Badge> : null}

          {traits.map((trait) => {
            const meta = traitLabels[trait];

            return meta ? (
              <Badge key={trait} tone={meta.tone}>
                {t(meta.messageKey)}
              </Badge>
            ) : null;
          })}
        </div>

        {item.note ? (
          <p className="mt-0.5 truncate text-xs text-on-surface-variant">{item.note}</p>
        ) : null}
      </div>

      {item.estimatedWeightGrams > 0 ? (
        <span className="mt-0.5 shrink-0 text-xs tabular-nums text-on-surface-variant">
          {formatWeight(item.estimatedWeightGrams, locale)}
        </span>
      ) : null}

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          aria-label={t('item.delete', { title: item.title })}
          className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-danger-bg hover:text-danger-fg disabled:pointer-events-none disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      ) : null}
    </li>
  );
}
