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
        mcpTools: true,
      },
    });

    // Fetch MCP details for the agent's tools (optimized to avoid N+1)
    let agentWithMcpDetails = agent;
    if (agent.mcpTools?.length) {
      const mcpIds = agent.mcpTools.map(mcpTool => mcpTool.mcpId);
      const mcps = await prisma.mcp.findMany({
        where: {
          id: { in: mcpIds },
        },
      });

      const mcpLookup = new Map(mcps.map(mcp => [mcp.id, mcp]));

      const mcpToolsWithDetails = agent.mcpTools.map(mcpTool => ({
        ...mcpTool,
        mcp: mcpLookup.get(mcpTool.mcpId) || null,
      }));

      agentWithMcpDetails = {
        ...agent,
        mcpTools: mcpToolsWithDetails,
      };
    }

    return createSuccessResponse(agentWithMcpDetails);
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

    const { name, description, modelId, promptId, labelId, config, mcpTools } =
      data as {
        name: string;
        description?: string;
        modelId: string;
        promptId: string;
        labelId?: string;
        config?: Record<string, unknown> | null;
        mcpTools?: string[];
      };

    // Parse MCP tool IDs if provided
    const mcpToolConnections =
      mcpTools?.map((toolId: string) => {
        const [mcpId, toolName] = toolId.split(':');
        return { mcpId, toolName };
      }) || [];

    // Update the agent
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        name,
        description: description || null,
        modelId,
        promptId,
        labelId,
        config: config as Prisma.InputJsonValue,
        mcpTools: {
          deleteMany: {}, // Remove all existing MCP tool associations
          create: mcpToolConnections.map(
            ({ mcpId, toolName }: { mcpId: string; toolName: string }) => ({
              mcpId,
              toolName,
            })
          ),
        },
      },
      include: {
        model: true,
        prompt: true,
        label: true,
        mcpTools: true,
      },
    });

    return createSuccessResponse(updatedAgent);
  }
);
