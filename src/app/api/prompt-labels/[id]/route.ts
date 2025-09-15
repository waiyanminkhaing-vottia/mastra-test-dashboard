import { NextRequest, NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';
import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

/**
 * Updates an existing prompt label with new data
 * @param request The incoming HTTP request containing label data
 * @param params Route parameters object
 * @param params.params The route parameters containing the label ID
 * @returns Updated prompt label data or error response
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
