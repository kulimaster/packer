import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>;

/**
 * 22px checkbox z design systému. Používá nativní `<input type="checkbox">`,
 * takže funguje klávesnice, čtečka i formuláře.
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span
      className={cn(
        'relative inline-flex size-[22px] shrink-0 items-center justify-center',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer size-[22px] cursor-pointer appearance-none rounded-control border-[1.5px] border-outline-strong bg-card transition-colors checked:border-primary checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <Check
        className="pointer-events-none absolute size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        strokeWidth={3}
        aria-hidden
      />
    </span>
  );
}
