import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

/**
 * Updates an existing prompt label with new data
 * @param request The incoming HTTP request containing label data
 * @param params Route parameters object
 * @param params.params The route parameters containing the label ID
 * @returns Updated prompt label data or error response
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const { data, error } = await validateRequestBody(
      request,
      promptLabelSchema()
    );
    if (error) return error;

    // Update the label
    const updatedLabel = await prisma.promptLabel.update({
      where: { id },
      data,
    });

    return createSuccessResponse(updatedLabel);
  }
);
