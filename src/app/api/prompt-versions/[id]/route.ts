import { NextRequest, NextResponse } from 'next/server';

import { createInvalidIDError, handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { isValidUUID } from '@/lib/utils';
import { updatePromptVersionSchema } from '@/lib/validations/prompt-version';

/**
 * Updates a prompt version's label assignment
 * @param request The incoming HTTP request containing label assignment data
 * @param params The route parameters containing the prompt version ID
 * @returns Updated prompt version with label information or error response
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

    // Validate request body
    const validationResult = updatePromptVersionSchema().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { labelId } = validationResult.data;

    const promptVersion = await prisma.$transaction(async tx => {
      // If setting a label, first remove that label from any other versions
      if (labelId) {
        await tx.promptVersion.updateMany({
          where: {
            labelId: labelId,
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

    return createSecureResponse(promptVersion);
  } catch (error: unknown) {
    return handleAPIError(error, 'promptVersion');
  }
}
