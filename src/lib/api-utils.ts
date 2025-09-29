import { NextRequest, NextResponse } from 'next/server';
import type { ZodError } from 'zod';

import { createSecureResponse } from '@/lib/security-utils';
import { createValidationErrorResponse } from '@/lib/validation-utils';

/**
 * Validates request body against a Zod schema
 * @param request - NextRequest object
 * @param schema - Schema object with safeParse method
 * @param schema.safeParse - Function to validate data
 * @returns Promise with either validated data or error response
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: {
    safeParse: (
      data: unknown
    ) => { success: true; data: T } | { success: false; error: ZodError };
  }
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const body = await request.json();

    // Add request size validation
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 50000) {
      // 50KB limit
      return {
        error: createSecureResponse(
          { error: 'Request too large' },
          { status: 413 }
        ),
      };
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      return {
        error: createSecureResponse(
          createValidationErrorResponse(result.error),
          { status: 400 }
        ),
      };
    }

    return { data: result.data };
  } catch {
    return {
      error: createSecureResponse({ error: 'Invalid JSON' }, { status: 400 }),
    };
  }
}

/**
 * Creates a standardized API success response
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with security headers
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return createSecureResponse(data, { status });
}

/**
 * Creates a standardized API error response
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with security headers
 */
export function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return createSecureResponse({ error: message }, { status });
}

/**
 * Higher-order function for API route handling with comprehensive error catching
 * Includes specific Prisma error handling for better user experience
 * @param handler - API route handler function
 * @returns Wrapped handler with error catching and Prisma error mapping
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handlePrismaError(error);
    }
  };
}

/**
 * Higher-order function that combines rate limiting and error handling for API routes
 * @param rateLimiter - Rate limiting function (use rateLimiters.api, rateLimiters.readonly, etc.)
 * @param handler - API route handler function
 * @returns Wrapped handler with rate limiting and error catching
 */
export function withApiProtection<T extends unknown[]>(
  rateLimiter: (request: NextRequest) => Promise<NextResponse | null>,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return withErrorHandling(
    async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      // Apply rate limiting first
      const rateLimitResult = await rateLimiter(request);
      if (rateLimitResult) {
        return rateLimitResult;
      }

      // Then execute the handler
      return handler(request, ...args);
    }
  );
}

/**
 * Handles Prisma errors and converts them to appropriate HTTP responses
 * @param error - The error object from Prisma or other sources
 * @returns NextResponse with appropriate error message and status
 */
function handlePrismaError(error: unknown): NextResponse {
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 'P2025':
        // Record not found
        return createErrorResponse('Resource not found', 404);

      case 'P2002':
        // Unique constraint violation
        return createErrorResponse('Resource already exists', 409);

      case 'P2003':
        // Foreign key constraint violation
        return createErrorResponse('Invalid reference', 422);

      case 'P2014':
        // Required relation violation
        return createErrorResponse(
          'Cannot delete resource with dependencies',
          409
        );

      default:
        // Unknown Prisma error
        return createErrorResponse('Database error', 500);
    }
  }

  // Handle other types of errors
  if (error instanceof Error) {
    // Don't expose internal error details in production
    return createErrorResponse('Internal server error', 500);
  }

  // Fallback for unknown error types
  return createErrorResponse('Internal server error', 500);
}

/**
 * Extracts and validates route parameters
 * @param params - Route parameters object
 * @param requiredParams - Array of required parameter names
 * @returns Object with validated parameters or error response
 */
export function validateRouteParams(
  params: Record<string, string | string[]>,
  requiredParams: string[]
): { data?: Record<string, string>; error?: NextResponse } {
  const validatedParams: Record<string, string> = {};

  for (const param of requiredParams) {
    const value = params[param];

    if (!value || Array.isArray(value)) {
      return {
        error: createErrorResponse(
          `Missing or invalid parameter: ${param}`,
          400
        ),
      };
    }

    validatedParams[param] = value;
  }

  return { data: validatedParams };
}
