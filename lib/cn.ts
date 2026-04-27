import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Used to merge Tailwind CSS class names.
 * @param inputs
 */
export function cn(...inputs: ClassValue[]): string {
   return twMerge(clsx(inputs))
}