import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { modelSchema } from '@/lib/validations/model';

/**
 * GET /api/models
 * Retrieves all models ordered by creation date (newest first)
 * @returns JSON response with array of model objects or error message
 */
export const GET = withErrorHandling(async () => {
  const models = await prisma.model.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return createSuccessResponse(models);
});

/**
 * POST /api/models
 * Creates a new model
 * @param request - NextRequest containing JSON body with model data
 * @returns JSON of created model with 201 status, or validation/error responses
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(request, modelSchema());
  if (error) return error;

  const { name, provider } = data;

  const model = await prisma.model.create({
    data: {
      name,
      provider,
    },
  });

  return createSuccessResponse(model, 201);
});
