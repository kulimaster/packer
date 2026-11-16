import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-container text-on-surface-variant',
        packed: 'bg-tertiary text-primary',
        essential: 'bg-danger-bg text-danger-fg',
        warning: 'bg-warning-bg text-warning-fg',
        info: 'bg-info-bg text-info-fg',
        success: 'bg-secondary-container text-on-secondary-container',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
