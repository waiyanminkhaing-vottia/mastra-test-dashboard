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
