import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type InputProps = ComponentProps<'input'> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
};

export function Input({ label, hint, error, icon, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  const describedBy = hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-on-surface">
          {label}
        </label>
      ) : null}

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-input border border-outline-strong bg-card px-3 text-sm text-on-surface transition-colors',
            'placeholder:text-muted',
            'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-tertiary/60 focus-visible:outline-none',
            icon ? 'pl-10' : undefined,
            hasError && 'border-danger focus-visible:border-danger focus-visible:ring-danger-bg',
            className,
          )}
          {...props}
        />
      </div>

      {hasError ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
