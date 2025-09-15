'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

/**
 * Provides Sonner toast notifications with theme integration
 * Automatically adapts to the current theme (light/dark/system)
 * @returns Toaster component configured with theme and position
 */
export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-center"
    />
  );
}
