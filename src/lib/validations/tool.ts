import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';
import { createEntityValidation } from '@/lib/validation-helpers';

// Create validation using the helper factory
const toolValidation = createEntityValidation<{
  name: string;
  description?: string;
}>({
  entityName: 'Tool',
  namespace: 'tools',
  limits: {
    nameMaxLength: VALIDATION_LIMITS.AGENT_NAME_MAX_LENGTH, // Reusing agent name limit
    descriptionMaxLength: VALIDATION_LIMITS.AGENT_DESCRIPTION_MAX_LENGTH,
  },
  customFields: () => ({
    description: z.string().optional(),
  }),
});

/**
 * Creates a Zod validation schema for tool data
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating tool name and description
 */
export const toolSchema = toolValidation.createSchema;
