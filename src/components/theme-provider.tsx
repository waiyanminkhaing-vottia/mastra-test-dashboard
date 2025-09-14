'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

/**
 * Theme provider wrapper component that uses next-themes for theme management
 * Provides dark/light mode functionality throughout the application
 * @param children - Child components to render within the theme provider
 * @param props - Props to pass through to NextThemesProvider
 * @returns ThemeProvider component with next-themes integration
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
