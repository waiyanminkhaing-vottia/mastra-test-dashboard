import { NextRequest } from 'next/server';

import {
  createSuccessResponse,
  validateRequestBody,
  withErrorHandling,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { getDomainFromUrl } from '@/lib/url-utils';
import { mcpSchema } from '@/lib/validations/mcp';

/**
 * GET /api/mcps
 * Retrieves all MCPs for the current tenant with computed domain field
 * @returns JSON response with array of MCP objects with domain or error message
 */
export const GET = withErrorHandling(async () => {
  const mcps = await prisma.mcp.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Add computed domain field
  const mcpsWithDomain = mcps.map(mcp => ({
    ...mcp,
    domain: getDomainFromUrl(mcp.url),
  }));

  return createSuccessResponse(mcpsWithDomain);
});

/**
 * POST /api/mcps
 * Creates a new MCP
 * @param request - NextRequest containing JSON body with MCP data
 * @returns JSON of created MCP with domain field with 201 status, or validation/error responses
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { data, error } = await validateRequestBody(request, mcpSchema());
  if (error) return error;

  const { name, url } = data as { name: string; url: string };

  const mcp = await prisma.mcp.create({
    data: {
      name,
      url,
    },
  });

  // Add computed domain field
  const mcpWithDomain = {
    ...mcp,
    domain: getDomainFromUrl(mcp.url),
  };

  return createSuccessResponse(mcpWithDomain, 201);
});
