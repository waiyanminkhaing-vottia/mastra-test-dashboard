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
    const tenantId = getTenantId();

    const agent = await prisma.agent.findUniqueOrThrow({
      where: { id, tenantId },
      include: {
        model: true,
        prompt: true,
        label: true,
        mcpTools: true,
        tools: {
          include: {
            tool: true,
          },
        },
        subAgents: true,
        parent: true,
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

    const {
      name,
      description,
      modelId,
      promptId,
      labelId,
      config,
      mcpTools,
      tools,
      subAgents,
    } = data as {
      name: string;
      description?: string;
      modelId: string;
      promptId: string;
      labelId?: string;
      config?: Record<string, unknown> | null;
      mcpTools?: string[];
      tools?: string[];
      subAgents?: string[];
    };

    const tenantId = getTenantId();

    // Parse MCP tool IDs if provided
    const mcpToolConnections =
      mcpTools?.map((toolId: string) => {
        const [mcpId, toolName] = toolId.split(':');
        return { mcpId, toolName };
      }) || [];

    const updateData = {
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
      tools: tools
        ? {
            deleteMany: {}, // Remove all existing tool associations
            create: tools.map(toolId => ({
              toolId,
            })),
          }
        : { deleteMany: {} }, // Remove all if no tools provided
      subAgents: subAgents
        ? {
            set: subAgents.map(agentId => ({ id: agentId })),
          }
        : { set: [] },
    };

    // Update the agent (ensure it belongs to the tenant)
    const updatedAgent = await prisma.agent.update({
      where: { id, tenantId },
      data: updateData,
      include: {
        model: true,
        prompt: true,
        label: true,
        mcpTools: true,
        tools: {
          include: {
            tool: true,
          },
        },
        subAgents: true,
        parent: true,
      },
    });

    return createSuccessResponse(updatedAgent);
  }
);
