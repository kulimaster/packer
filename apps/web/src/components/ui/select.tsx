import { useId, type ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type SelectProps = ComponentProps<'select'> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hasError = Boolean(error);
  const describedBy = hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-semibold text-on-surface">
          {label}
        </label>
      ) : null}

      <select
        id={selectId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-11 w-full rounded-input border border-outline-strong bg-card px-3 text-sm text-on-surface transition-colors',
          'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-tertiary/60 focus-visible:outline-none',
          hasError && 'border-danger focus-visible:border-danger focus-visible:ring-danger-bg',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </select>

      {hasError ? (
        <p id={`${selectId}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
