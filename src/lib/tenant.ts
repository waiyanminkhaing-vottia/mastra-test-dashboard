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
