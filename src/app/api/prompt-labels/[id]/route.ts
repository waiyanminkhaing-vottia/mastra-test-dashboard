import { NextRequest, NextResponse } from 'next/server';

import { createInvalidIDError, handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { isValidUUID } from '@/lib/utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

/**
 * Updates an existing prompt label with new data
 * @param request The incoming HTTP request containing label data
 * @param params The route parameters containing the label ID
 * @returns Updated prompt label data or error response
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

    // Use default validation messages
    const schema = promptLabelSchema();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    // Update the label
    const updatedLabel = await prisma.promptLabel.update({
      where: { id },
      data: validationResult.data,
    });

    return createSecureResponse(updatedLabel);
  } catch (error) {
    return handleAPIError(error, 'label');
  }
}
