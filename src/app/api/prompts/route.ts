import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createValidationErrorResponse } from '@/lib/validation-utils';
import { createPromptSchema } from '@/lib/validations/prompt';

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      include: {
        versions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const schema = createPromptSchema();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { name, description, content } = validationResult.data;

    const prompt = await prisma.prompt.create({
      data: {
        name,
        description,
        versions: {
          create: {
            version: 1,
            content,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating prompt:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A prompt with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
