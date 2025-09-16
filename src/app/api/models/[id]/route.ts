import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { modelSchema } from '@/lib/validations/model';

/**
 * PUT /api/models/[id]
 * Updates an existing model and creates a new version
 * @param request - NextRequest containing JSON body with model updates
 * @param props - Route parameters object
 * @param props.params - Route parameters containing the model ID
 * @returns JSON of updated model with new version, or validation/error responses
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const { data, error } = await validateRequestBody(request, modelSchema());
    if (error) return error;

    const { name, provider } = data;

    // Update the model
    const updatedModel = await prisma.model.update({
      where: { id },
      data: {
        name,
        provider,
      },
    });

    return createSuccessResponse(updatedModel);
  }
);
