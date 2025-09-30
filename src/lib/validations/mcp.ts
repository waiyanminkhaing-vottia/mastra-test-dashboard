import { VALIDATION_LIMITS } from '@/lib/constants';
import {
  createEntityValidation,
  createUrlField,
} from '@/lib/validation-helpers';

// Create validation using the helper factory
const mcpValidation = createEntityValidation<{
  name: string;
  url: string;
}>({
  entityName: 'MCP',
  namespace: 'mcps',
  limits: {
    nameMaxLength: VALIDATION_LIMITS.MCP_NAME_MAX_LENGTH,
  },
  customFields: getMessage => ({
    url: createUrlField(getMessage),
  }),
});

/**
 * Creates a Zod validation schema for MCP data
 * @param t Optional translation function for localized error messages
 * @returns Zod schema for validating MCP data
 */
export const mcpSchema = mcpValidation.createSchema;
