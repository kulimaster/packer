import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type ChipProps = ComponentProps<'button'> & {
  selected?: boolean;
};

/** Filtr / přepínač. `selected` se hlásí čtečce přes `aria-pressed`. */
export function Chip({ selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-white'
          : 'border-outline bg-card text-on-surface-variant hover:bg-surface-container',
        className,
      )}
      {...props}
    />
  );
}
