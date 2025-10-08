import { Provider } from '@prisma/client';
import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';
import { createEntityValidation } from '@/lib/validation-helpers';
import { COMMON_VALIDATION_MESSAGES } from '@/lib/validation-messages';

/** Use Prisma's generated enum with Zod */
export const providerSchema = z.enum(Object.values(Provider));

export type { Provider };

/**
 * Regex pattern for model names
 * Allows:
 * - Standard model names: alphanumeric with hyphens, underscores, and dots
 * - Azure ML URIs: azureml://registries/.../models/.../versions/...
 */
const MODEL_NAME_PATTERN = /^(?:[a-zA-Z0-9\-_\.]+|azureml:\/\/[\w\-\/]+)$/;

// Create validation using the helper factory
const modelValidation = createEntityValidation<{
  name: string;
  provider: Provider;
}>({
  entityName: 'Model',
  namespace: 'models',
  limits: {
    nameMaxLength: VALIDATION_LIMITS.MODEL_NAME_MAX_LENGTH,
  },
  customFields: getMessage => ({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(VALIDATION_LIMITS.MODEL_NAME_MAX_LENGTH, getMessage('nameMaxLength'))
      .regex(MODEL_NAME_PATTERN, {
        message: getMessage('nameInvalidChars'),
      }),
    provider: providerSchema.refine(val => val, {
      message:
        getMessage('providerRequired') ||
        COMMON_VALIDATION_MESSAGES.PROVIDER_REQUIRED,
    }),
  }),
});

/**
 * Creates a Zod validation schema for model data with provider validation
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating model name and provider
 */
export const modelSchema = modelValidation.createSchema;
