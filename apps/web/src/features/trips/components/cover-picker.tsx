import { Check, ImageOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import type { Cover } from '../covers';

type CoverPickerProps = {
  covers: readonly Cover[];
  /** Id vybraného coveru. */
  value?: string | null;
  onSelect: (cover: Cover) => void;
  className?: string;
};

/**
 * Mřížka výchozích cover fotek. Výběr je `button` s `aria-pressed`,
 * takže funguje klávesnicí i ve čtečce. Filtrování si řídí volající
 * (`searchCovers`, `coversByTag`) – komponenta zůstává bez stavu.
 */
export function CoverPicker({ covers, value = null, onSelect, className }: CoverPickerProps) {
  const { t } = useI18n();

  if (covers.length === 0) {
    return (
      <p className="flex flex-col items-center gap-2 rounded-input border border-dashed border-outline-strong bg-surface-container px-4 py-10 text-center text-sm text-on-surface-variant">
        <ImageOff className="size-5" aria-hidden />
        {t('coverPicker.empty')}
      </p>
    );
  }

  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {covers.map((cover) => {
        const selected = cover.id === value;

        return (
          <li key={cover.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(cover)}
              className={cn(
                'group relative block w-full overflow-hidden rounded-input border border-outline bg-surface-container text-left transition-colors',
                'hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                selected && 'border-primary ring-2 ring-primary',
              )}
            >
              <img
                src={cover.file}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-on-surface/80 to-transparent px-2.5 pt-6 pb-2 text-xs font-semibold text-white">
                {cover.label}
                {selected ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
