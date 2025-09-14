import { NextRequest, NextResponse } from 'next/server';

import { createInvalidIDError, handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { isValidUUID } from '@/lib/utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { modelSchema } from '@/lib/validations/model';

/**
 * PUT /api/models/[id]
 * Updates an existing model and creates a new version
 * @param request - NextRequest containing JSON body with model updates
 * @param props - Route parameters containing the model ID
 * @returns JSON of updated model with new version, or validation/error responses
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate the ID parameter
    if (!isValidUUID(id)) {
      return createInvalidIDError();
    }

    const body = await request.json();

    // Validate request body with Zod
    const validationResult = modelSchema().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name, provider } = validationResult.data;

    // Update the model
    const updatedModel = await prisma.model.update({
      where: { id },
      data: {
        name,
        provider,
      },
    });

    return createSecureResponse(updatedModel);
  } catch (error: unknown) {
    return handleAPIError(error, 'model');
  }
}
