import { cn } from '@/lib/cn';

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div className={cn('w-full', className)}>
      {label || showValue ? (
        <div className="mb-1 flex items-baseline justify-between gap-3">
          {label ? (
            <span className="text-xs font-medium text-on-surface-variant">{label}</span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className="text-xs font-semibold text-on-surface-variant">
              {Math.round(percent)} %
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-container-high',
          size === 'sm' ? 'h-1' : 'h-1.5',
        )}
      >
        <div
          className="h-full rounded-full bg-secondary transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
