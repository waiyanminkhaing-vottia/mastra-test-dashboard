import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';
import { REGEX_PATTERNS } from '@/lib/utils';
import { COMMON_VALIDATION_MESSAGES } from '@/lib/validation-messages';

// Default fallback messages for server-side validation
const defaultMessages = {
  nameRequired: COMMON_VALIDATION_MESSAGES.NAME_REQUIRED,
  nameMaxLength: COMMON_VALIDATION_MESSAGES.NAME_MAX_LENGTH(
    VALIDATION_LIMITS.AGENT_NAME_MAX_LENGTH
  ),
  nameInvalidChars: COMMON_VALIDATION_MESSAGES.NAME_INVALID_CHARS,
  modelIdRequired: 'Model is required',
  promptIdRequired: 'Prompt is required',
};

/**
 * Creates a Zod validation schema for agent data
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating agent data
 */
export const agentSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`agents.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(VALIDATION_LIMITS.AGENT_NAME_MAX_LENGTH, getMessage('nameMaxLength'))
      .regex(REGEX_PATTERNS.ALPHANUMERIC_WITH_SPECIAL, {
        message: getMessage('nameInvalidChars'),
      }),
    modelId: z.string().min(1, getMessage('modelIdRequired')),
    promptId: z.string().min(1, getMessage('promptIdRequired')),
    labelId: z.string().optional(),
    config: z.record(z.string(), z.unknown()).nullable().optional(),
  });
};
