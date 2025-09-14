import { NextRequest, NextResponse } from 'next/server';

import { createInvalidIDError, handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { isValidUUID } from '@/lib/utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { updatePromptSchema } from '@/lib/validations/prompt';

/**
 * Retrieves a specific prompt with its versions and labels
 * @param _request The incoming HTTP request (unused)
 * @param params The route parameters containing the prompt ID
 * @returns Prompt data with versions and labels or error response
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate the ID parameter
    if (!isValidUUID(id)) {
      return createInvalidIDError();
    }

    const prompt = await prisma.prompt.findUnique({
      where: {
        id,
      },
      include: {
        versions: {
          include: {
            label: true,
          },
          orderBy: {
            version: 'desc',
          },
        },
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return createSecureResponse(prompt);
  } catch (error) {
    return handleAPIError(error, 'prompt');
  }
}

/**
 * Updates an existing prompt's basic information
 * @param request The incoming HTTP request containing updated prompt data
 * @param params The route parameters containing the prompt ID
 * @returns Updated prompt data or error response
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
    const schema = updatePromptSchema();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;

    const prompt = await prisma.prompt.update({
      where: {
        id,
      },
      data: {
        name,
        description,
      },
    });

    return createSecureResponse(prompt);
  } catch (error: unknown) {
    return handleAPIError(error, 'prompt');
  }
}
