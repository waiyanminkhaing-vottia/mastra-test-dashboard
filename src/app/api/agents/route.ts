import type { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { getTenantId } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { agentSchema } from '@/lib/validations/agent';

/**
 * GET /api/agents
 * Retrieves all agents for the current tenant with related model, prompt, and label data
 * @returns JSON response with array of agent objects or error message
 */
export const GET = withErrorHandling(async () => {
  const tenantId = getTenantId();
  const agents = await prisma.agent.findMany({
    where: {
      tenantId,
    },
    include: {
      model: true,
      prompt: true,
      label: true,
      mcpTools: true,
      subAgents: true,
      parent: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Collect all unique MCP IDs to avoid N+1 query
  const allMcpIds = new Set<string>();
  agents.forEach(agent => {
    agent.mcpTools?.forEach(mcpTool => {
      allMcpIds.add(mcpTool.mcpId);
    });
  });

  // Fetch all MCPs in a single query
  const mcps = await prisma.mcp.findMany({
    where: {
      id: { in: Array.from(allMcpIds) },
    },
  });

  // Create lookup map for O(1) access
  const mcpLookup = new Map(mcps.map(mcp => [mcp.id, mcp]));

  // Map agents with MCP details using the lookup
  const agentsWithMcpDetails = agents.map(agent => {
    if (!agent.mcpTools?.length) return agent;

    const mcpToolsWithDetails = agent.mcpTools.map(mcpTool => ({
      ...mcpTool,
      mcp: mcpLookup.get(mcpTool.mcpId) || null,
    }));

    return {
      ...agent,
      mcpTools: mcpToolsWithDetails,
    };
  });

  return createSuccessResponse(agentsWithMcpDetails);
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

  const {
    name,
    description,
    modelId,
    promptId,
    labelId,
    config,
    mcpTools,
    subAgents,
  } = data as {
    name: string;
    description?: string;
    modelId: string;
    promptId: string;
    labelId?: string;
    config?: Record<string, unknown> | null;
    mcpTools?: string[];
    subAgents?: string[];
  };

  const tenantId = getTenantId();

  // Parse MCP tool IDs if provided
  const mcpToolConnections =
    mcpTools?.map((toolId: string) => {
      const [mcpId, toolName] = toolId.split(':');
      return { mcpId, toolName };
    }) || [];

  const agentData = {
    name,
    description: description || null,
    modelId,
    promptId,
    labelId,
    tenantId,
    config: config as Prisma.InputJsonValue,
    mcpTools: {
      create: mcpToolConnections.map(
        ({ mcpId, toolName }: { mcpId: string; toolName: string }) => ({
          mcpId,
          toolName,
        })
      ),
    },
    subAgents: subAgents
      ? {
          connect: subAgents.map(id => ({ id })),
        }
      : undefined,
  };

  const agent = await prisma.agent.create({
    data: agentData,
    include: {
      model: true,
      prompt: true,
      label: true,
      mcpTools: true,
      subAgents: true,
      parent: true,
    },
  });

  return createSuccessResponse(agent, 201);
});
