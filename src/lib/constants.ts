/**
 * Application-wide constants and configuration values
 */

import type { Provider } from '@prisma/client';

// Provider Configuration
/**
 * Available AI model providers with display labels
 * Used in forms and UI components for provider selection
 */
export const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'AZURE_OPENAI', label: 'Azure OpenAI' },
  { value: 'COHERE', label: 'Cohere' },
  { value: 'HUGGING_FACE', label: 'Hugging Face' },
  { value: 'OLLAMA', label: 'Ollama' },
  { value: 'MISTRAL', label: 'Mistral' },
] as const;

/**
 * Get the display label for a provider
 * @param provider The provider enum value
 * @returns The formatted display label
 */
export const getProviderLabel = (provider: Provider): string => {
  return PROVIDERS.find(p => p.value === provider)?.label || provider;
};

// Form Validation Limits
/**
 * Form validation limits for input fields
 * Ensures consistent validation across the application
 */
export const VALIDATION_LIMITS = {
  LABEL_NAME_MAX_LENGTH: 50,
  PROMPT_NAME_MAX_LENGTH: 100,
  MODEL_NAME_MAX_LENGTH: 100,
  MCP_NAME_MAX_LENGTH: 100,
  AGENT_NAME_MAX_LENGTH: 100,
  AGENT_DESCRIPTION_MAX_LENGTH: 500,
  CHANGE_NOTE_MAX_LENGTH: 500,
} as const;

// Tenant Configuration
/**
 * Gets the tenant ID from environment variables
 * @returns The tenant ID
 * @throws Error if TENANT_ID is not set in environment
 */
export const getTenantId = (): string => {
  const tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    throw new Error('TENANT_ID environment variable is not set');
  }
  return tenantId;
};

/**
 * Tenant name mapping for display purposes
 */
export const TENANT_NAMES: Record<string, { en: string; ja: string }> = {
  fasthelp: { en: 'FastHelp', ja: 'FastHelp' },
  tsuzumi: { en: 'Tsuzumi', ja: 'Tsuzumi' },
  default: { en: 'vottia', ja: 'vottia' },
} as const;

/**
 * Get tenant-specific title
 * @returns The tenant display name
 */
export const getTenantTitle = (): string => {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'default';
  return TENANT_NAMES[tenantId]?.en || 'vottia';
};

/**
 * Dashboard text translations
 */
export const DASHBOARD_TEXT = {
  en: 'Dashboard',
  ja: '管理画面',
} as const;

/**
 * Get tenant-specific page title with Dashboard suffix
 * Note: Uses English by default since metadata is static in Next.js App Router
 * For dynamic titles based on user language, use document.title in client components
 * @param language - The language code (defaults to 'en')
 * @returns The formatted page title (e.g., "vottia | Dashboard")
 */
export const getTenantPageTitle = (language: 'en' | 'ja' = 'en'): string => {
  const tenantName = getTenantTitle();
  const dashboardText = DASHBOARD_TEXT[language];
  return `${tenantName} | ${dashboardText}`;
};
