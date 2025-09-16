import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

/**
 * GET /api/prompt-labels
 * Retrieves all prompt labels ordered by creation date (newest first)
 * @returns JSON response with array of prompt label objects or error message
 */
export const GET = withErrorHandling(async () => {
  const promptLabels = await prisma.promptLabel.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });

  return createSuccessResponse(promptLabels);
});

/**
 * POST /api/prompt-labels
 * Creates a new prompt label
 * @param request - NextRequest containing JSON body with label data
 * @returns JSON of created prompt label with 201 status, or validation/error responses
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(
    request,
    promptLabelSchema()
  );
  if (error) return error;

  const { name } = data;

  const promptLabel = await prisma.promptLabel.create({
    data: {
      name,
    },
  });

  return createSuccessResponse(promptLabel, 201);
});
