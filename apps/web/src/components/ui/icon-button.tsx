import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        ghost: 'text-on-surface-variant hover:bg-surface-container',
        outline: 'border border-outline bg-card text-on-surface hover:bg-surface-container',
        solid: 'bg-primary text-white hover:bg-primary-hover',
      },
      size: {
        sm: 'size-9',
        md: 'size-11',
        lg: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

type IconButtonProps = ComponentProps<'button'> & VariantProps<typeof iconButtonVariants>;

/**
 * Ikonové tlačítko. `aria-label` je povinný – jinak ho čtečka ohlásí jako "tlačítko".
 */
export function IconButton({ className, variant, size, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
