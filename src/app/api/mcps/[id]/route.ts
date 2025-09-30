import { NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { mcpSchema } from '@/lib/validations/mcp';

/**
 * GET /api/mcps/[id]
 * Retrieves a specific MCP by ID with related data
 * @param request - NextRequest object
 * @param params - Route parameters containing the MCP ID
 * @returns JSON response with MCP object or error message
 */
export const GET = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const mcp = await prisma.mcp.findUnique({
      where: { id },
    });

    if (!mcp) {
      return createErrorResponse('MCP not found', 404);
    }

    return createSuccessResponse(mcp);
  }
);

/**
 * PUT /api/mcps/[id]
 * Updates an existing MCP
 * @param request - NextRequest containing JSON body with updated MCP data
 * @param params - Route parameters containing the MCP ID
 * @returns JSON of updated MCP or validation/error responses
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const { data, error } = await validateRequestBody(request, mcpSchema());
    if (error) return error;

    const { name, url } = data as { name: string; url: string };

    const existingMcp = await prisma.mcp.findUnique({
      where: { id },
    });

    if (!existingMcp) {
      return createErrorResponse('MCP not found', 404);
    }

    const updatedMcp = await prisma.mcp.update({
      where: { id },
      data: {
        name,
        url,
      },
    });

    return createSuccessResponse(updatedMcp);
  }
);
