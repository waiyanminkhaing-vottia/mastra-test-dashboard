import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createModelSchema } from '@/lib/validations/model';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body with Zod
    const schema = createModelSchema();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, provider } = validationResult.data;

    // Check if model exists
    const existingModel = await prisma.model.findUnique({
      where: { id },
    });

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Update the model
    const updatedModel = await prisma.model.update({
      where: { id },
      data: {
        name,
        provider,
      },
    });

    return NextResponse.json(updatedModel);
  } catch (error: unknown) {
    console.error('Error updating model:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A model with this provider and name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}
