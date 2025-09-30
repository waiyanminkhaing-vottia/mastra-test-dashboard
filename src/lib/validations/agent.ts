import { z } from 'zod';

import { VALIDATION_LIMITS } from '@/lib/constants';
import { createEntityValidation } from '@/lib/validation-helpers';

// Create validation using the helper factory
const agentValidation = createEntityValidation<{
  name: string;
  description?: string;
  modelId: string;
  promptId: string;
  labelId?: string;
  config?: Record<string, unknown> | null;
  mcpTools?: string[];
}>({
  entityName: 'Agent',
  namespace: 'agents',
  limits: {
    nameMaxLength: VALIDATION_LIMITS.AGENT_NAME_MAX_LENGTH,
    descriptionMaxLength: VALIDATION_LIMITS.AGENT_DESCRIPTION_MAX_LENGTH,
  },
  customFields: getMessage => ({
    modelId: z
      .string()
      .min(1, getMessage('modelIdRequired') || 'Model is required'),
    promptId: z
      .string()
      .min(1, getMessage('promptIdRequired') || 'Prompt is required'),
    labelId: z.string().optional(),
    config: z.record(z.string(), z.unknown()).nullable().optional(),
    mcpTools: z.array(z.string()).optional(),
  }),
});

/**
 * Creates a Zod validation schema for agent data
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating agent data
 */
export const agentSchema = agentValidation.createSchema;
