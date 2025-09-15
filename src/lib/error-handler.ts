import { NextResponse } from 'next/server';

import { logError, logger } from './logger';

/**
 * Common error types that can occur in API routes
 */
export interface APIError {
  message: string;
  status: number;
}

/**
 * Handles Prisma errors and converts them to appropriate HTTP responses
 * @param error - The error object from Prisma or other sources
 * @param resourceName - Name of the resource for error messages (e.g., 'prompt', 'model')
 * @param t - Translation function (optional, defaults to returning key as-is)
 * @returns NextResponse with appropriate error message and status
 */
export function handleAPIError(
  error: unknown,
  resourceName: string,
  t: (key: string) => string = (key: string) => key
): NextResponse {
  // Map resource names to their translation namespace
  const getNamespace = (resource: string) => {
    if (resource.startsWith('prompt')) {
      return 'prompts';
    }
    if (resource === 'model') {
      return 'models';
    }
    if (resource === 'label') {
      return 'labels';
    }
    return `${resource}s`; // fallback
  };
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 'P2025':
        // Record not found
        logger.info({
          msg: `${resourceName} not found`,
          resourceName,
          errorCode: 'P2025',
        });
        return NextResponse.json(
          {
            error: t(
              `${getNamespace(resourceName)}.errors.${resourceName}NotFound`
            ),
          },
          { status: 404 }
        );

      case 'P2002':
        // Unique constraint violation
        logger.info({
          msg: `${resourceName} already exists`,
          resourceName,
          errorCode: 'P2002',
        });
        return NextResponse.json(
          {
            error: t(
              `${getNamespace(resourceName)}.errors.${resourceName}AlreadyExists`
            ),
          },
          { status: 409 }
        );

      case 'P2003':
        // Foreign key constraint violation
        return NextResponse.json(
          {
            error: t(
              `${getNamespace(resourceName)}.errors.invalid${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Reference`
            ),
          },
          { status: 400 }
        );

      default:
        break;
    }
  }

  // Log error with structured logging for actual errors (not business logic)
  if (error instanceof Error) {
    logError(`API error in ${resourceName}`, error);
  } else {
    logError(
      `API error in ${resourceName}: ${String(error)}`,
      new Error(String(error))
    );
  }

  // Default server error
  return NextResponse.json(
    { error: t('errors.somethingWentWrong') },
    { status: 500 }
  );
}

/**
 * Creates an invalid ID format error response
 * @param t - Translation function (optional, defaults to returning key as-is)
 * @returns NextResponse with invalid ID error
 */
export function createInvalidIDError(
  t: (key: string) => string = (key: string) => key
): NextResponse {
  return NextResponse.json(
    { error: t('errors.invalidIDFormat') },
    { status: 400 }
  );
}
