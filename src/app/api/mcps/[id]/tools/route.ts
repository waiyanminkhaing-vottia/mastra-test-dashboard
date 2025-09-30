import {
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
} from '@/lib/api-utils';
import { logError, logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/mcp-security';
import { McpService } from '@/lib/mcp-service';
import { prisma } from '@/lib/prisma';

/**
 * Handles MCP-specific errors and returns appropriate response
 */
function handleMcpError(error: unknown, responseTime: number, mcpId: string) {
  // Handle Prisma NotFound error specifically
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'P2025'
  ) {
    logger.warn({ msg: 'MCP not found in database', mcpId });
    return createErrorResponse('MCP not found', 404);
  }

  // Enhanced error categorization with proper logging
  if (error instanceof TypeError && error.message.includes('fetch')) {
    logError('Network error connecting to MCP server', error, { responseTime });
    return createErrorResponse(
      'Network error: Unable to reach MCP server',
      502
    );
  }

  if (error instanceof Error && error.message.includes('timeout')) {
    logError('MCP server timeout', error, { responseTime });
    return createErrorResponse(
      'Request timeout: MCP server did not respond',
      504
    );
  }

  if (error instanceof Error && error.message.includes('ENOTFOUND')) {
    logError('DNS resolution failed for MCP server', error, { responseTime });
    return createErrorResponse('DNS error: MCP server not found', 502);
  }

  if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
    logError('Connection refused by MCP server', error, { responseTime });
    return createErrorResponse(
      'Connection refused: MCP server is not accessible',
      502
    );
  }

  if (error instanceof Error) {
    logError('Failed to fetch MCP tools', error, { responseTime });
    const sanitizedMessage = sanitizeErrorMessage(error);
    return createErrorResponse(
      `Failed to fetch tools: ${sanitizedMessage}`,
      500
    );
  }

  logger.error({
    msg: 'Unknown error fetching MCP tools',
    error,
    responseTime,
  });
  return createErrorResponse('Failed to fetch tools from MCP server', 500);
}

/**
 * GET /api/mcps/[id]/tools
 * Fetches tools from an MCP server using @mastra/mcp
 * @param request - NextRequest (unused but required by Next.js)
 * @param params - Route parameters containing MCP ID
 * @returns JSON response with tools array or error message
 */
export const GET = withErrorHandling(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const mcpService = McpService.getInstance();
    const startTime = Date.now();
    const { id: mcpId } = await params;

    try {
      // Input validation
      if (!mcpId || typeof mcpId !== 'string') {
        logger.warn({
          msg: 'MCP Tools API request missing MCP ID parameter',
        });
        return createErrorResponse('MCP ID is required', 400);
      }

      logger.debug({ msg: 'Fetching MCP tools', mcpId });

      // Fetch MCP from database
      const mcp = await prisma.mcp.findUniqueOrThrow({
        where: { id: mcpId },
        select: { id: true, name: true, url: true },
      });

      logger.debug({ msg: 'Found MCP in database', mcpName: mcp.name });

      // Use MCP service to get tools with comprehensive error handling and connection pooling
      const tools = await mcpService.getTools({
        id: mcp.id,
        name: mcp.name,
        url: mcp.url,
      });

      const responseTime = Date.now() - startTime;
      logger.info({
        msg: 'Successfully fetched MCP tools via service',
        mcpName: mcp.name,
        toolCount: tools.length,
        responseTime,
      });

      const response = createSuccessResponse({ tools });

      // Add service headers
      response.headers.set('X-MCP-Service-Status', 'healthy');

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return handleMcpError(error, responseTime, mcpId || 'unknown');
    }
  }
);
