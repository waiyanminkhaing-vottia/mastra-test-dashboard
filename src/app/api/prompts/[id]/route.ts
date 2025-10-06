import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { getTenantId } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { updatePromptSchema } from '@/lib/validations/prompt';

/**
 * Retrieves a specific prompt with its versions and labels
 * @param _request The incoming HTTP request (unused)
 * @param props Route parameters object
 * @param props.params The route parameters containing the prompt ID
 * @returns Prompt data with versions and labels or error response
 */
export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const tenantId = getTenantId();

    const prompt = await prisma.prompt.findUniqueOrThrow({
      where: {
        id,
        tenantId,
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

    return createSuccessResponse(prompt);
  }
);

/**
 * Updates an existing prompt's basic information
 * @param request The incoming HTTP request containing updated prompt data
 * @param props Route parameters object
 * @param props.params The route parameters containing the prompt ID
 * @returns Updated prompt data or error response
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const { data, error } = await validateRequestBody(
      request,
      updatePromptSchema()
    );
    if (error) return error;

    const { name, description } = data;
    const tenantId = getTenantId();

    const prompt = await prisma.prompt.update({
      where: {
        id,
        tenantId,
      },
      data: {
        name,
        description,
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

    return createSuccessResponse(prompt);
  }
);
