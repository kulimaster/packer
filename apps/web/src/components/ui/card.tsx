import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Základní karta design systému. Padding si řídí konzument – karty s obrázkem ho nepotřebují. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-card border border-outline bg-card shadow-card', className)}
      {...props}
    />
  );
}
