/**
 * Security utilities for API routes and data validation
 * Provides protection against common web vulnerabilities
 */
import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
} as const;

/**
 * Adds security headers to a NextResponse
 * @param response - NextResponse to add headers to
 * @returns The same NextResponse with security headers added
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Creates a NextResponse with security headers already applied and logs the response
 * @param data - Data to return
 * @param init - Response init options
 * @returns NextResponse with security headers
 */
export function createSecureResponse(
  data: unknown,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, init);
  const secureResponse = addSecurityHeaders(response);

  // Log successful API responses (only in development)
  if (process.env.NODE_ENV !== 'production') {
    logger.info({
      msg: 'API Response',
      status: secureResponse.status,
    });
  }

  return secureResponse;
}
