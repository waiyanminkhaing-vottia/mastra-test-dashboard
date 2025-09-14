import { Provider } from '@prisma/client';
import { z } from 'zod';

import { REGEX_PATTERNS } from '@/lib/utils';

// Use Prisma's generated enum with Zod
export const providerSchema = z.enum(Object.values(Provider));

export type { Provider };

// Default fallback messages for server-side validation
const defaultMessages = {
  nameRequired: 'Name is required',
  nameMaxLength: 'Name must be less than 100 characters',
  nameInvalidChars:
    'Name can only contain letters, numbers, hyphens, underscores, and dots',
  providerRequired: 'Provider is required',
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
      .max(100, getMessage('nameMaxLength'))
      .regex(REGEX_PATTERNS.ALPHANUMERIC_WITH_SPECIAL, {
        message: getMessage('nameInvalidChars'),
      }),
    provider: providerSchema,
  });
};
