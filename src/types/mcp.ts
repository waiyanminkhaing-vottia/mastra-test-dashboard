import type { Mcp } from '@prisma/client';

/**
 * MCP with relations type with computed fields
 */
export type McpWithRelations = Mcp & {
  domain: string;
};

/**
 * MCP form data type for creating/updating MCPs
 */
export type McpFormData = {
  name: string;
  url: string;
};

/**
 * MCP validation error type
 */
export type McpValidationError = {
  field: keyof McpFormData;
  message: string;
};
