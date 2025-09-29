import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and merges conflicting Tailwind classes with twMerge
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common regex patterns used throughout the application
 */
export const REGEX_PATTERNS = {
  /** Alphanumeric with hyphens, underscores, and dots (for model names, etc.) */
  ALPHANUMERIC_WITH_SPECIAL: /^[a-zA-Z0-9\-_\.]+$/,
} as const;

/**
 * Format a date using locale-specific formatting
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}
