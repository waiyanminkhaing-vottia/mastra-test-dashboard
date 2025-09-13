import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

export async function GET() {
  try {
    const promptLabels = await prisma.promptLabel.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(promptLabels);
  } catch (error) {
    console.error('Error fetching prompt labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt labels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = promptLabelSchema().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name } = validationResult.data;

    const promptLabel = await prisma.promptLabel.create({
      data: {
        name,
      },
    });

    return NextResponse.json(promptLabel, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating prompt label:', error);

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

    return NextResponse.json(
      { error: 'Failed to create prompt label' },
      { status: 500 }
    );
  }
}
