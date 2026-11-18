import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { formatWeight } from '@/features/trips/format';
import { categoryIcons, defaultCategoryIcon, type CategoryIconKey } from '@/features/trips/icons';

export type TemplateCardData = {
  id: string;
  name: string;
  description?: string;
  /** Klíč ikony z registru kategorií. */
  icon: string;
  /** Klíč barvy karty; neznámý accent spadne na výchozí mint. */
  accent: string;
  itemCount: number;
  estimatedWeightGrams: number;
  categories: string[];
};

export type TemplateCardProps = {
  template: TemplateCardData;
  /** Když je vyplněné, karta se chová jako přepínač výběru. */
  onToggle?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
};

const accents: Record<string, string> = {
  mint: 'bg-tertiary text-primary',
  rose: 'bg-danger-bg text-danger-fg',
  amber: 'bg-warning-bg text-warning-fg',
  violet: 'bg-info-bg text-info-fg',
};

function accentClass(accent: string): string {
  return accents[accent] ?? accents.mint;
}

/**
 * Karta šablony. Bez `onToggle` je jen informativní (knihovna), s ním slouží
 * jako multi-select v importním panelu.
 */
export function TemplateCard({
  template,
  onToggle,
  selected = false,
  disabled = false,
  className,
}: TemplateCardProps) {
  const { t, locale, plural } = useI18n();
  const Icon =
    categoryIcons[template.icon as CategoryIconKey] ?? categoryIcons[defaultCategoryIcon];
  const interactive = Boolean(onToggle);

  const content = (
    <>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          accentClass(template.accent),
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold tracking-tight text-on-surface">{template.name}</span>

          {interactive ? (
            <span
              aria-hidden
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-outline-strong bg-card text-transparent',
              )}
            >
              <Check className="size-3.5" />
            </span>
          ) : null}
        </span>

        {template.description ? (
          <span className="mt-1 block text-xs text-on-surface-variant">{template.description}</span>
        ) : null}

        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
          <span className="font-semibold text-on-surface">
            {plural('templateCard.itemCount', template.itemCount)}
          </span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">
            {template.estimatedWeightGrams > 0
              ? formatWeight(template.estimatedWeightGrams, locale)
              : t('templateCard.noWeight')}
          </span>
        </span>

        {template.categories.length > 0 ? (
          <span className="mt-1.5 block truncate text-xs text-on-surface-variant">
            {template.categories.join(' · ')}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <Card
      className={cn(
        'overflow-hidden transition-colors',
        selected && 'border-primary ring-2 ring-tertiary',
        className,
      )}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={selected}
          className="flex w-full items-start gap-3 px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3.5">{content}</div>
      )}
    </Card>
  );
}
