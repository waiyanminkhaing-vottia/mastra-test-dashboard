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
 * GET /api/agents
 * Retrieves all agents with related model, prompt, and label data
 * @returns JSON response with array of agent objects or error message
 */
export const GET = withErrorHandling(async () => {
  const agents = await prisma.agent.findMany({
    include: {
      model: true,
      prompt: true,
      label: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return createSuccessResponse(agents);
});

/**
 * POST /api/agents
 * Creates a new agent
 * @param request - NextRequest containing JSON body with agent data
 * @returns JSON of created agent with 201 status, or validation/error responses
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(request, agentSchema());
  if (error) return error;

  const { name, description, modelId, promptId, labelId, config } = data;

  const agent = await prisma.agent.create({
    data: {
      name,
      description,
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

  return createSuccessResponse(agent, 201);
});
