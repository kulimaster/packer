import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { badgeVariants, type BadgeTone } from './badge.variants';

type BadgeProps = ComponentProps<'span'> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
