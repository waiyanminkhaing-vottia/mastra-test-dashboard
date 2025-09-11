import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createModelSchema } from '@/lib/validations/model';

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const model = await prisma.model.create({
      data: {
        name,
        provider,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating model:', error);

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
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}
