import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Sloučí Tailwind třídy tak, aby pozdější přebily dřívější. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
