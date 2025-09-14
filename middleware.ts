import { NextRequest, NextResponse } from 'next/server';

import { logRequest } from '@/lib/logger';

/**
 * Middleware to automatically log all API requests
 * Note: Response logging is handled in security-utils createSecureResponse
 */
export function middleware(request: NextRequest) {
  // Only apply logging to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Log the incoming request
    logRequest(request);
  }

  // Let all requests pass through
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
