'use client';

import { useEffect } from 'react';

import { getTenantThemeColors } from '@/lib/tenant';

/**
 * Client component that applies tenant-specific theme colors
 * Sets CSS custom properties for theme colors based on tenant configuration
 * Applies colors for both light and dark modes
 */
export function TenantTheme() {
  useEffect(() => {
    const colors = getTenantThemeColors();

    // Create style element for tenant theme overrides
    const styleId = 'tenant-theme-override';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Apply theme colors using CSS
    styleElement.textContent = `
      :root {
        --primary: ${colors.light.primary};
        --primary-foreground: ${colors.light.primaryForeground};
        --sidebar-primary: ${colors.light.sidebarPrimary};
        --sidebar-primary-foreground: ${colors.light.sidebarPrimaryForeground};
        --sidebar-accent-foreground: ${colors.light.sidebarAccentForeground};
      }

      .dark {
        --primary: ${colors.dark.primary};
        --primary-foreground: ${colors.dark.primaryForeground};
        --sidebar-primary: ${colors.dark.sidebarPrimary};
        --sidebar-primary-foreground: ${colors.dark.sidebarPrimaryForeground};
        --sidebar-accent-foreground: ${colors.dark.sidebarAccentForeground};
      }
    `;
  }, []);

  return null;
}
