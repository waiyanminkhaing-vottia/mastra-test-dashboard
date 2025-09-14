import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and merges conflicting Tailwind classes with twMerge
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * @example
 * cn('px-2 py-1', 'px-4', { 'text-red-500': true }) // Returns: 'py-1 px-4 text-red-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common regex patterns used throughout the application
 */
export const REGEX_PATTERNS = {
  /** UUID v4 pattern (case-insensitive) */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  /** Alphanumeric with hyphens, underscores, and dots (for model names, etc.) */
  ALPHANUMERIC_WITH_SPECIAL: /^[a-zA-Z0-9\-_\.]+$/,
} as const;

/**
 * Validates if a string is a valid UUID (v4)
 * @param str - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isValidUUID(str: string): boolean {
  return REGEX_PATTERNS.UUID.test(str);
}

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
