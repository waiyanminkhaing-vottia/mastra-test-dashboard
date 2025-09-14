import { z } from 'zod';

import { REGEX_PATTERNS } from '@/lib/utils';

/** Default fallback validation messages for server-side validation when no translation function is provided */
const defaultMessages = {
  labelIdInvalid: 'Invalid UUID format',
};

/**
 * Creates a Zod validation schema for updating prompt version label assignments
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating { labelId?: string | null }
 */
export const updatePromptVersionSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`promptVersions.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    labelId: z
      .string()
      .regex(REGEX_PATTERNS.UUID, {
        message: getMessage('labelIdInvalid'),
      })
      .nullish(),
  });
};
