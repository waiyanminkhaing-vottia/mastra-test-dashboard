import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { toolSchema } from '@/lib/validations/tool';

/**
 * GET /api/tools
 * Retrieves all tools
 * @returns JSON response with array of tool objects or error message
 */
export const GET = withErrorHandling(async () => {
  const tools = await prisma.tool.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return createSuccessResponse(tools);
});

/**
 * POST /api/tools
 * Creates a new tool
 * @param request - NextRequest containing JSON body with tool data
 * @returns JSON of created tool with 201 status, or validation/error responses
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(request, toolSchema());
  if (error) return error;

  const { name, description } = data as {
    name: string;
    description?: string;
  };

  const tool = await prisma.tool.create({
    data: {
      name,
      description: description || null,
    },
  });

  return createSuccessResponse(tool, 201);
});
