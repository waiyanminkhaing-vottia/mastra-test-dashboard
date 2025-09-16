import { Provider } from '@prisma/client';
import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';
import { REGEX_PATTERNS } from '@/lib/utils';
import { COMMON_VALIDATION_MESSAGES } from '@/lib/validation-messages';

/** Use Prisma's generated enum with Zod */
export const providerSchema = z.enum(Object.values(Provider));

export type { Provider };

// Default fallback messages for server-side validation
const defaultMessages = {
  nameRequired: COMMON_VALIDATION_MESSAGES.NAME_REQUIRED,
  nameMaxLength: COMMON_VALIDATION_MESSAGES.NAME_MAX_LENGTH(
    VALIDATION_LIMITS.MODEL_NAME_MAX_LENGTH
  ),
  nameInvalidChars: COMMON_VALIDATION_MESSAGES.NAME_INVALID_CHARS,
  providerRequired: COMMON_VALIDATION_MESSAGES.PROVIDER_REQUIRED,
};

/**
 * Creates a Zod validation schema for model data with provider validation
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating model name and provider
 */
export const modelSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`models.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(VALIDATION_LIMITS.MODEL_NAME_MAX_LENGTH, getMessage('nameMaxLength'))
      .regex(REGEX_PATTERNS.ALPHANUMERIC_WITH_SPECIAL, {
        message: getMessage('nameInvalidChars'),
      }),
    provider: providerSchema,
  });
};
