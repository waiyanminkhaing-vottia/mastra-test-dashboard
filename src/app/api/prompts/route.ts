import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createPromptSchema } from '@/lib/validations/prompt';

/**
 * GET /api/prompts
 * Retrieves all prompts with their versions, ordered by creation date (newest first)
 * @returns JSON array of prompts with embedded versions
 */
export const GET = withErrorHandling(async () => {
  const prompts = await prisma.prompt.findMany({
    include: {
      versions: {
        include: {
          label: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return createSuccessResponse(prompts);
});

/**
 * POST /api/prompts
 * Creates a new prompt with initial version
 * @param request - NextRequest containing JSON body with { name, description?, content, promptLabelId? }
 * @returns JSON of created prompt with 201 status, or validation/conflict errors
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(
    request,
    createPromptSchema()
  );
  if (error) return error;

  const { name, description, content, promptLabelId } = data;
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

  return createSuccessResponse(prompt, 201);
});
