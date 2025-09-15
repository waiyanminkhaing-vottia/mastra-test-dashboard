import { NextRequest, NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { updatePromptSchema } from '@/lib/validations/prompt';

/**
 * Retrieves a specific prompt with its versions and labels
 * @param _request The incoming HTTP request (unused)
 * @param props Route parameters object
 * @param props.params The route parameters containing the prompt ID
 * @returns Prompt data with versions and labels or error response
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prompt = await prisma.prompt.findUniqueOrThrow({
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

    return createSecureResponse(prompt);
  } catch (error) {
    return handleAPIError(error, 'prompt');
  }
}

/**
 * Updates an existing prompt's basic information
 * @param request The incoming HTTP request containing updated prompt data
 * @param props Route parameters object
 * @param props.params The route parameters containing the prompt ID
 * @returns Updated prompt data or error response
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
