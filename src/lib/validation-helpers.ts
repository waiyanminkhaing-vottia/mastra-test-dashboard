import { z } from 'zod';

import { REGEX_PATTERNS } from '@/lib/utils';
import { COMMON_VALIDATION_MESSAGES } from '@/lib/validation-messages';

/**
 * Creates a validation message getter function with fallback
 * @param namespace - The translation namespace (e.g., 'models', 'prompts')
 * @param defaultMessages - Object with default message mappings
 * @param t - Optional translation function
 * @returns Function to get validation messages
 */
export function createMessageGetter(
  namespace: string,
  defaultMessages: Record<string, string>,
  t?: (key: string) => string
) {
  return (key: string) => {
    if (t) {
      return t(`${namespace}.validation.${key}`);
    }
    return defaultMessages[key] || `Validation error for ${key}`;
  };
}

/**
 * Creates a standard name validation field with customizable limits
 * @param maxLength - Maximum length for the name
 * @param getMessage - Function to get validation messages
 * @param options - Additional validation options
 * @param options.allowSpecialChars - Whether to allow special characters in the name
 * @param options.required - Whether the name field is required
 * @returns Zod string schema for name validation
 */
export function createNameField(
  maxLength: number,
  getMessage: (key: string) => string,
  options: {
    allowSpecialChars?: boolean;
    required?: boolean;
  } = {}
) {
  const { allowSpecialChars = true, required = true } = options;

  let schema = z.string();

  if (required) {
    schema = schema.min(1, getMessage('nameRequired'));
  }

  schema = schema.max(maxLength, getMessage('nameMaxLength'));

  if (allowSpecialChars) {
    schema = schema.regex(REGEX_PATTERNS.ALPHANUMERIC_WITH_SPECIAL, {
      message: getMessage('nameInvalidChars'),
    });
  }

  return schema;
}

/**
 * Creates a standard description validation field
 * @param maxLength - Maximum length for the description
 * @param getMessage - Function to get validation messages
 * @param required - Whether the description is required
 * @returns Zod string schema for description validation
 */
export function createDescriptionField(
  maxLength: number,
  getMessage: (key: string) => string,
  required: boolean = false
): z.ZodOptional<z.ZodString> | z.ZodString {
  if (!required) {
    return z
      .string()
      .max(maxLength, getMessage('descriptionMaxLength'))
      .optional();
  } else {
    return z
      .string()
      .min(1, getMessage('descriptionRequired'))
      .max(maxLength, getMessage('descriptionMaxLength'));
  }
}

/**
 * Creates a standard URL validation field
 * @param getMessage - Function to get validation messages
 * @param options - Additional validation options
 * @param options.allowedProtocols - Array of allowed URL protocols
 * @param options.required - Whether the URL field is required
 * @returns Zod string schema for URL validation
 */
export function createUrlField(
  getMessage: (key: string) => string,
  options: {
    allowedProtocols?: string[];
    required?: boolean;
  } = {}
) {
  const { allowedProtocols = ['http', 'https'], required = true } = options;

  let schema = z.string();

  if (required) {
    schema = schema.min(1, getMessage('urlRequired'));
  }

  // Create regex pattern for allowed protocols
  const protocolPattern = allowedProtocols.join('|');
  const urlRegex = new RegExp(`^(${protocolPattern})://\\S+$`, 'i');

  return schema.regex(urlRegex, getMessage('urlInvalid'));
}

/**
 * Common default messages for standard fields
 */
export const createStandardDefaultMessages = (
  entityName: string,
  limits: {
    nameMaxLength: number;
    descriptionMaxLength?: number;
  }
) => ({
  nameRequired: COMMON_VALIDATION_MESSAGES.NAME_REQUIRED,
  nameMaxLength: COMMON_VALIDATION_MESSAGES.NAME_MAX_LENGTH(
    limits.nameMaxLength
  ),
  nameInvalidChars: COMMON_VALIDATION_MESSAGES.NAME_INVALID_CHARS,
  ...(limits.descriptionMaxLength && {
    descriptionMaxLength: COMMON_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH(
      limits.descriptionMaxLength
    ),
    descriptionRequired: `${entityName} description is required`,
  }),
  urlRequired: 'URL is required',
  urlInvalid: 'Please enter a valid URL',
  contentRequired: COMMON_VALIDATION_MESSAGES.CONTENT_REQUIRED,
});

/**
 * Creates a complete validation schema factory for an entity
 * @param config - Configuration for the entity validation
 * @param config.entityName - Name of the entity being validated
 * @param config.namespace - Translation namespace for the entity
 * @param config.limits - Validation limits for the entity
 * @param config.limits.nameMaxLength - Maximum length for the name field
 * @param config.limits.descriptionMaxLength - Maximum length for the description field
 * @param config.customFields - Optional function to add custom validation fields
 * @returns Object with validation schema creators
 */
export function createEntityValidation<
  _T extends Record<string, unknown>,
>(config: {
  entityName: string;
  namespace: string;
  limits: {
    nameMaxLength: number;
    descriptionMaxLength?: number;
  };
  customFields?: (
    getMessage: (key: string) => string
  ) => Record<string, z.ZodType<unknown>>;
}) {
  const { entityName, namespace, limits, customFields } = config;

  const defaultMessages = createStandardDefaultMessages(entityName, limits);

  return {
    /**
     * Creates a validation schema with standard fields
     */
    createSchema: (t?: (key: string) => string) => {
      const getMessage = createMessageGetter(namespace, defaultMessages, t);

      const baseFields = {
        name: createNameField(limits.nameMaxLength, getMessage),
        ...(limits.descriptionMaxLength && {
          description: createDescriptionField(
            limits.descriptionMaxLength,
            getMessage
          ),
        }),
      };

      const additionalFields = customFields ? customFields(getMessage) : {};

      return z.object({
        ...baseFields,
        ...additionalFields,
      });
    },

    /**
     * Creates update schema (typically excluding some fields)
     */
    createUpdateSchema: (
      t?: (key: string) => string,
      excludeFields: string[] = []
    ) => {
      const getMessage = createMessageGetter(namespace, defaultMessages, t);

      const baseFields = {
        name: createNameField(limits.nameMaxLength, getMessage),
        ...(limits.descriptionMaxLength && {
          description: createDescriptionField(
            limits.descriptionMaxLength,
            getMessage
          ),
        }),
      };

      const additionalFields = customFields ? customFields(getMessage) : {};

      const allFields = { ...baseFields, ...additionalFields };

      // Remove excluded fields
      const filteredFields = Object.fromEntries(
        Object.entries(allFields).filter(
          ([key]) => !excludeFields.includes(key)
        )
      );

      return z.object(filteredFields);
    },

    // Utility functions
    getMessage: (t?: (key: string) => string) =>
      createMessageGetter(namespace, defaultMessages, t),

    defaultMessages,
  };
}
