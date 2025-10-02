import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { getTenantId } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { updatePromptVersionSchema } from '@/lib/validations/prompt-version';

/**
 * Updates a prompt version's label assignment
 * @param request The incoming HTTP request containing label assignment data
 * @param params Route parameters object
 * @param params.params The route parameters containing the prompt version ID
 * @returns Updated prompt version with label information or error response
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const { data, error } = await validateRequestBody(
      request,
      updatePromptVersionSchema()
    );
    if (error) return error;

    const { labelId } = data;
    const tenantId = getTenantId();

    const promptVersion = await prisma.$transaction(async tx => {
      // Get the current prompt version and verify prompt belongs to tenant
      const currentVersion = await tx.promptVersion.findUniqueOrThrow({
        where: { id: id },
        select: {
          promptId: true,
          prompt: {
            select: { tenantId: true },
          },
        },
      });

      // Verify the prompt belongs to the current tenant
      if (currentVersion.prompt.tenantId !== tenantId) {
        throw new Error('Unauthorized access to prompt version');
      }

      // If setting a label, first remove that label from any other versions of the same prompt
      if (labelId) {
        await tx.promptVersion.updateMany({
          where: {
            labelId: labelId,
            promptId: currentVersion.promptId,
            NOT: { id: id },
          },
          data: {
            labelId: null,
          },
        });
      }

      // Then update the current version with the new label
      return await tx.promptVersion.update({
        where: { id: id },
        data: {
          labelId: labelId || null,
        },
        include: {
          label: true,
        },
      });
    });

    return createSuccessResponse(promptVersion);
  }
);
