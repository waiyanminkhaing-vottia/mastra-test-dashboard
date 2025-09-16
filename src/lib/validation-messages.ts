/**
 * Centralized validation error messages to reduce string duplication
 * across validation schemas and maintain consistency
 */

/**
 *
 */
export const COMMON_VALIDATION_MESSAGES = {
  // Required field messages
  NAME_REQUIRED: 'Name is required',
  PROVIDER_REQUIRED: 'Provider is required',
  CONTENT_REQUIRED: 'Content is required',

  // Length validation messages
  NAME_MAX_LENGTH: (max: number) => `Name must be ${max} characters or less`,
  DESCRIPTION_MAX_LENGTH: (max: number) =>
    `Description must be ${max} characters or less`,

  // Format validation messages
  NAME_INVALID_CHARS:
    'Name can only contain letters, numbers, hyphens, underscores, and dots',

  // Label-specific messages
  LABEL_NAME_REQUIRED: 'Label name is required',
  LABEL_NAME_MAX_LENGTH: (max: number) =>
    `Label name must be ${max} characters or less`,
} as const;

/**
 * Helper function to get localized or fallback validation message
 * @param messageKey - Key from COMMON_VALIDATION_MESSAGES
 * @param t - Optional translation function
 * @param translationKey - Optional translation key path
 * @returns Localized message or fallback
 */
export function getValidationMessage(
  messageKey: keyof typeof COMMON_VALIDATION_MESSAGES,
  t?: (key: string) => string,
  translationKey?: string
): string {
  if (t && translationKey) {
    return t(translationKey);
  }

  const message = COMMON_VALIDATION_MESSAGES[messageKey];
  return typeof message === 'function' ? message.toString() : message;
}

/**
 * Helper function to get validation message with parameter
 * @param messageKey - Key from COMMON_VALIDATION_MESSAGES
 * @param param - Parameter to pass to message function
 * @param t - Optional translation function
 * @param translationKey - Optional translation key path
 * @returns Formatted validation message
 */
export function getValidationMessageWithParam(
  messageKey: keyof typeof COMMON_VALIDATION_MESSAGES,
  param: number,
  t?: (key: string) => string,
  translationKey?: string
): string {
  if (t && translationKey) {
    return t(translationKey);
  }

  const message = COMMON_VALIDATION_MESSAGES[messageKey];
  return typeof message === 'function' ? message(param) : message;
}
