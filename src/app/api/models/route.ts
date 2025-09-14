import { NextRequest, NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { modelSchema } from '@/lib/validations/model';

/**
 * GET /api/models
 * Retrieves all models ordered by creation date (newest first)
 * @returns JSON response with array of model objects or error message
 */
export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSecureResponse(models);
  } catch (error) {
    return handleAPIError(error, 'model');
  }
}

/**
 * POST /api/models
 * Creates a new model
 * @param request - NextRequest containing JSON body with model data
 * @returns JSON of created model with 201 status, or validation/error responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const schema = modelSchema();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name, provider } = validationResult.data;

    const model = await prisma.model.create({
      data: {
        name,
        provider,
      },
    });

    return createSecureResponse(model, { status: 201 });
  } catch (error: unknown) {
    return handleAPIError(error, 'model');
  }
}
