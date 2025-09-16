import type { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { agentSchema } from '@/lib/validations/agent';

/**
 * GET /api/agents/[id]
 * Retrieves a single agent with relations
 * @param request - NextRequest
 * @param props - Route parameters object
 * @param props.params - Route parameters containing the agent ID
 * @returns JSON of agent with relations, or error response
 */
export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const agent = await prisma.agent.findUniqueOrThrow({
      where: { id },
      include: {
        model: true,
        prompt: true,
        label: true,
      },
    });

    return createSuccessResponse(agent);
  }
);

/**
 * PUT /api/agents/[id]
 * Updates an existing agent
 * @param request - NextRequest containing JSON body with agent updates
 * @param props - Route parameters object
 * @param props.params - Route parameters containing the agent ID
 * @returns JSON of updated agent with relations, or validation/error responses
 */
export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    const { data, error } = await validateRequestBody(request, agentSchema());
    if (error) return error;

    const { name, modelId, promptId, labelId, config } = data;

    // Update the agent
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        name,
        modelId,
        promptId,
        labelId,
        config: config as Prisma.InputJsonValue,
      },
      include: {
        model: true,
        prompt: true,
        label: true,
      },
    });

    return createSuccessResponse(updatedAgent);
  }
);
