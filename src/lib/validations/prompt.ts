import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';
import { COMMON_VALIDATION_MESSAGES } from '@/lib/validation-messages';

/** Default fallback validation messages for server-side validation when no translation function is provided */
const defaultMessages = {
  nameRequired: COMMON_VALIDATION_MESSAGES.NAME_REQUIRED,
  nameMaxLength: COMMON_VALIDATION_MESSAGES.NAME_MAX_LENGTH(
    VALIDATION_LIMITS.PROMPT_NAME_MAX_LENGTH
  ),
  descriptionMaxLength: COMMON_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH(
    VALIDATION_LIMITS.CHANGE_NOTE_MAX_LENGTH
  ),
  contentRequired: COMMON_VALIDATION_MESSAGES.CONTENT_REQUIRED,
};

/**
 * Helper function to get validation message with fallback
 * @param key - The message key
 * @param t - Optional translation function
 * @returns Localized message or default fallback
 */
const getValidationMessage = (key: string, t?: (key: string) => string) => {
  if (t) {
    return t(`prompts.validation.${key}`);
  }
  return defaultMessages[key as keyof typeof defaultMessages];
};

/**
 * Creates common validation fields for prompt schemas
 * @param t - Optional translation function for localized error messages
 * @returns Object with common validation fields
 */
const createCommonFields = (t?: (key: string) => string) => ({
  name: z
    .string()
    .min(1, getValidationMessage('nameRequired', t))
    .max(
      VALIDATION_LIMITS.PROMPT_NAME_MAX_LENGTH,
      getValidationMessage('nameMaxLength', t)
    ),
  description: z
    .string()
    .max(
      VALIDATION_LIMITS.CHANGE_NOTE_MAX_LENGTH,
      getValidationMessage('descriptionMaxLength', t)
    )
    .optional(),
});

/**
 * Creates a Zod validation schema for prompt creation
 * @param t - Optional translation function for localized error messages
 * @returns Zod schema for validating { name, description?, content, promptLabelId? }
 * @example
 * const schema = createPromptSchema(t);
 * const result = schema.safeParse(formData);
 */
export const createPromptSchema = (t?: (key: string) => string) => {
  return z.object({
    ...createCommonFields(t),
    content: z.string().min(1, getValidationMessage('contentRequired', t)),
    promptLabelId: z.string().optional(),
  });
};

/**
 * Creates a Zod validation schema for prompt updates (excludes content and label)
 * @param t - Optional translation function for localized error messages
 * @returns Zod schema for validating { name, description? }
 * @example
 * const schema = updatePromptSchema(t);
 * const result = schema.safeParse(updateData);
 */
export const updatePromptSchema = (t?: (key: string) => string) => {
  return z.object(createCommonFields(t));
};
