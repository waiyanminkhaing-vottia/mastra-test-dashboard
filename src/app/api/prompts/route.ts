import { NextRequest, NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { createPromptSchema } from '@/lib/validations/prompt';

/**
 * GET /api/prompts
 * Retrieves all prompts with their versions, ordered by creation date (newest first)
 * @returns JSON array of prompts with embedded versions
 */
export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      include: {
        versions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSecureResponse(prompts);
  } catch (error) {
    return handleAPIError(error, 'prompt');
  }
}

/**
 * POST /api/prompts
 * Creates a new prompt with initial version
 * @param request - NextRequest containing JSON body with { name, description?, content, promptLabelId? }
 * @returns JSON of created prompt with 201 status, or validation/conflict errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const schema = createPromptSchema();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name, description, content, promptLabelId } = validationResult.data;
    const prompt = await prisma.prompt.create({
      data: {
        name,
        description,
        versions: {
          create: {
            version: 1,
            content,
            labelId: promptLabelId || null,
          },
        },
      },
      include: {
        versions: {
          include: {
            label: true,
          },
        },
      },
    });

    return createSecureResponse(prompt, { status: 201 });
  } catch (error: unknown) {
    return handleAPIError(error, 'prompt');
  }
}
