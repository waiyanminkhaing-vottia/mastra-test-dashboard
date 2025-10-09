import { getAssetPath } from './utils';

/**
 * Get tenant-specific asset path with fallback
 * If tenantId is not set, returns default asset path
 * Otherwise returns tenant-specific asset path with tenant suffix
 * Note: Returns an object with primary and fallback paths for client-side fallback handling
 */
export function getTenantAsset(assetType: 'brand' | 'favicon'): {
  primary: string;
  fallback: string;
} {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const defaultPath = assetType === 'brand' ? '/brand.png' : '/favicon.svg';

  if (!tenantId) {
    // Default assets when no tenant is specified
    return {
      primary: getAssetPath(defaultPath),
      fallback: getAssetPath(defaultPath),
    };
  }

  // Tenant-specific assets with fallback to default
  const tenantPath =
    assetType === 'brand'
      ? `/brand-${tenantId}.png`
      : `/favicon-${tenantId}.svg`;

  return {
    primary: getAssetPath(tenantPath),
    fallback: getAssetPath(defaultPath),
  };
}

/**
 * Get brand image path for current tenant
 * Returns primary path (use with error handling to fallback)
 */
export function getBrandImage(): string {
  return getTenantAsset('brand').primary;
}

/**
 * Get brand image fallback path
 */
export function getBrandImageFallback(): string {
  return getTenantAsset('brand').fallback;
}

/**
 * Get favicon path for current tenant
 */
export function getFavicon(): string {
  return getTenantAsset('favicon').primary;
}

/**
 * Get favicon fallback path
 */
export function getFaviconFallback(): string {
  return getTenantAsset('favicon').fallback;
}

/**
 * Get tenant-specific brand image height class
 * Returns Tailwind height class based on tenant
 */
export function getBrandImageHeight(): string {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

  // Define tenant-specific heights
  const heightMap: Record<string, string> = {
    fasthelp: 'h-8',
    tsuzumi: 'h-12',
    default: 'h-12',
  };

  return heightMap[tenantId || 'default'] || 'h-12';
}

/**
 * Tenant-specific theme color configurations
 */
export interface TenantThemeColors {
  light: {
    primary: string;
    primaryForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccentForeground: string;
  };
  dark: {
    primary: string;
    primaryForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccentForeground: string;
  };
}

/**
 * Get tenant-specific theme colors
 * Returns OKLCH color values for CSS custom properties (matching shadcn theme format)
 */
export function getTenantThemeColors(): TenantThemeColors {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

  // Default theme colors (using shadcn default values)
  const defaultTheme: TenantThemeColors = {
    light: {
      primary: 'oklch(0.41 0.12 185)',
      primaryForeground: 'oklch(0.985 0 0)',
      sidebarPrimary: 'oklch(0.41 0.12 185)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccentForeground: 'oklch(0.41 0.12 185)',
    },
    dark: {
      primary: 'oklch(0.65 0.15 185)',
      primaryForeground: 'oklch(0.985 0 0)',
      sidebarPrimary: 'oklch(0.65 0.15 185)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccentForeground: 'oklch(0.65 0.15 185)',
    },
  };

  const themeMap: Record<string, TenantThemeColors> = {
    fasthelp: {
      light: {
        primary: 'oklch(0.63 0.23 233)', // Blue (#009DFE) converted to OKLCH
        primaryForeground: 'oklch(1 0 0)',
        sidebarPrimary: 'oklch(0.63 0.23 233)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccentForeground: 'oklch(0.63 0.23 233)',
      },
      dark: {
        primary: 'oklch(0.70 0.23 233)', // Lighter blue for dark mode
        primaryForeground: 'oklch(1 0 0)',
        sidebarPrimary: 'oklch(0.70 0.23 233)',
        sidebarPrimaryForeground: 'oklch(1 0 0)',
        sidebarAccentForeground: 'oklch(0.70 0.23 233)',
      },
    },
    tsuzumi: defaultTheme,
    default: defaultTheme,
  };

  return themeMap[tenantId || 'default'] || defaultTheme;
}
