import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { prisma } from '@/lib/prisma';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // For now, use English for server-side validation
    const t = (key: string) => key;
    const schema = promptLabelSchema(t);
    const validatedData = schema.parse(body);

    const { id } = await params;

    // Update the label
    const updatedLabel = await prisma.promptLabel.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedLabel);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    // Check if it's a unique constraint violation (duplicate name)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A label with this name already exists' },
        { status: 409 }
      );
    }

    console.error('Error updating prompt label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
