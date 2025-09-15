import { NextRequest, NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { modelSchema } from '@/lib/validations/model';

/**
 * PUT /api/models/[id]
 * Updates an existing model and creates a new version
 * @param request - NextRequest containing JSON body with model updates
 * @param props - Route parameters object
 * @param props.params - Route parameters containing the model ID
 * @returns JSON of updated model with new version, or validation/error responses
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
