import { NextRequest, NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

/**
 * GET /api/prompt-labels
 * Retrieves all prompt labels ordered by creation date (newest first)
 * @returns JSON response with array of prompt label objects or error message
 */
export async function GET() {
  try {
    const promptLabels = await prisma.promptLabel.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSecureResponse(promptLabels);
  } catch (error) {
    return handleAPIError(error, 'label');
  }
}

/**
 * POST /api/prompt-labels
 * Creates a new prompt label
 * @param request - NextRequest containing JSON body with label data
 * @returns JSON of created prompt label with 201 status, or validation/error responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = promptLabelSchema().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name } = validationResult.data;

    const promptLabel = await prisma.promptLabel.create({
      data: {
        name,
      },
    });

    return createSecureResponse(promptLabel, { status: 201 });
  } catch (error: unknown) {
    return handleAPIError(error, 'label');
  }
}
