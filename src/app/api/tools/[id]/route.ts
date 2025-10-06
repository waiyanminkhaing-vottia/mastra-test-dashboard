import { NextRequest } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { toolSchema } from '@/lib/validations/tool';

const TOOL_NOT_FOUND_ERROR = 'tools.errors.toolNotFound';

/**
 * GET /api/tools/[id]
 * Retrieves a specific tool by ID
 * @param _request - NextRequest object
 * @param params - Route parameters containing the tool ID
 * @returns JSON response with tool object or error message
 */
export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const tool = await prisma.tool.findUnique({
      where: { id },
    });

    if (!tool) {
      return createErrorResponse(TOOL_NOT_FOUND_ERROR, 404);
    }

    return createSuccessResponse(tool);
  }
);

/**
 * PUT /api/tools/[id]
 * Updates an existing tool
 * @param request - NextRequest containing JSON body with updated tool data
 * @param params - Route parameters containing the tool ID
 * @returns JSON of updated tool or validation/error responses
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const { data, error } = await validateRequestBody(request, toolSchema());
    if (error) return error;

    const { name, description } = data as {
      name: string;
      description?: string;
    };

    const existingTool = await prisma.tool.findUnique({
      where: { id },
    });

    if (!existingTool) {
      return createErrorResponse(TOOL_NOT_FOUND_ERROR, 404);
    }

    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    return createSuccessResponse(updatedTool);
  }
);

/**
 * DELETE /api/tools/[id]
 * Deletes a specific tool
 * @param _request - NextRequest object
 * @param params - Route parameters containing the tool ID
 * @returns JSON response with success message or error
 */
export const DELETE = withErrorHandling(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const existingTool = await prisma.tool.findUnique({
      where: { id },
    });

    if (!existingTool) {
      return createErrorResponse(TOOL_NOT_FOUND_ERROR, 404);
    }

    await prisma.tool.delete({
      where: { id },
    });

    return createSuccessResponse({ message: 'Tool deleted successfully' });
  }
);
