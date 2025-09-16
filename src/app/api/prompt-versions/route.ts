import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createPromptVersionSchema } from '@/lib/validations/prompt-version';

/**
 * Creates a new version for an existing prompt
 * @param request The incoming HTTP request containing version data
 * @returns Created prompt version with label information or error response
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(
    request,
    createPromptVersionSchema()
  );
  if (error) return error;

  const { promptId, content, changeNote, labelId } = data;

  const promptVersion = await prisma.$transaction(async tx => {
    // Verify the prompt exists and get the highest version number
    const promptWithLatestVersion = await tx.prompt.findUniqueOrThrow({
      where: { id: promptId },
      select: {
        id: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: { version: true },
        },
      },
    });

    const nextVersion = (promptWithLatestVersion.versions[0]?.version || 0) + 1;

    // If setting a label, first remove that label from any other versions of the same prompt
    if (labelId) {
      await tx.promptVersion.updateMany({
        where: {
          labelId: labelId,
          promptId: promptId,
        },
        data: {
          labelId: null,
        },
      });
    }

    // Create the new version
    return await tx.promptVersion.create({
      data: {
        promptId,
        content,
        changeNote,
        version: nextVersion,
        labelId: labelId || null,
      },
      include: {
        label: true,
      },
    });
  });

  return createSuccessResponse(promptVersion, 201);
});
