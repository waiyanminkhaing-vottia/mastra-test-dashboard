import { NextRequest, NextResponse } from 'next/server';

import { createSecureResponse } from '@/lib/security-utils';

/**
 * Rate limiting configuration options
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in milliseconds */
  window: number;
  /** Optional custom identifier function */
  keyGenerator?: (request: NextRequest) => string;
  /** Optional custom error message */
  message?: string;
  /** Skip rate limiting function */
  skip?: (request: NextRequest) => boolean;
}

/**
 * Rate limit entry with request count and window start time
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limiting (use Redis in production)
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Default rate limit message
 */
const DEFAULT_RATE_LIMIT_MESSAGE = 'Too many requests';

/**
 * Cleanup interval to remove expired entries (runs every minute)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Default key generator based on IP address
 * Optimized for nginx proxy with proper header precedence
 * Falls back to a constant if IP is not available
 */
function defaultKeyGenerator(request: NextRequest): string {
  // Nginx typically sets these headers in order of preference
  const xRealIp = request.headers.get('x-real-ip');
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  let ip: string;

  // Priority order for nginx proxy setup:
  // 1. X-Real-IP (most reliable for nginx)
  // 2. First IP from X-Forwarded-For (in case of multiple proxies)
  // 3. CF-Connecting-IP (if using Cloudflare)
  // 4. Direct connection IP (fallback)
  if (xRealIp) {
    ip = xRealIp;
  } else if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // Take the first (leftmost) IP which is the original client
    ip = xForwardedFor.split(',')[0].trim();
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  } else {
    // Fallback for direct connections or development
    ip = '127.0.0.1';
  }

  // Handle IPv6 mapped IPv4 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Validate IP format and use fallback if invalid
  if (!isValidIP(ip)) {
    ip = '127.0.0.1';
  }

  return `rate_limit:${ip}`;
}

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 * @param ip IP address string to validate
 * @returns true if valid IP, false otherwise
 */
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Creates a rate limiting middleware function
 * @param config Rate limiting configuration
 * @returns Middleware function that returns null if allowed, or NextResponse if rate limited
 */
export function createRateLimit(config: RateLimitConfig) {
  const {
    limit,
    window,
    keyGenerator = defaultKeyGenerator,
    message = DEFAULT_RATE_LIMIT_MESSAGE,
    skip,
  } = config;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Skip rate limiting if skip function returns true
    if (skip && skip(request)) {
      return null;
    }

    const key = keyGenerator(request);
    const now = Date.now();
    const resetTime = now + window;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // First request in window or window has expired
      entry = { count: 1, resetTime };
      rateLimitStore.set(key, entry);
      return null;
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      const response = createSecureResponse(
        {
          error: message,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        { status: 429 }
      );

      // Add rate limiting headers
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(entry.resetTime / 1000).toString()
      );
      response.headers.set(
        'Retry-After',
        Math.ceil((entry.resetTime - now) / 1000).toString()
      );

      return response;
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return null;
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * 5 requests per 15 minutes
   */
  auth: createRateLimit({
    limit: 5,
    window: 15 * 60 * 1000,
    message: 'Too many authentication attempts',
  }),

  /**
   * Standard rate limiter for regular API endpoints
   * 100 requests per 15 minutes
   */
  api: createRateLimit({
    limit: 100,
    window: 15 * 60 * 1000,
    message: DEFAULT_RATE_LIMIT_MESSAGE,
  }),

  /**
   * Permissive rate limiter for read-only endpoints
   * 300 requests per 15 minutes
   */
  readonly: createRateLimit({
    limit: 300,
    window: 15 * 60 * 1000,
    message: DEFAULT_RATE_LIMIT_MESSAGE,
  }),

  /**
   * Very strict rate limiter for resource-intensive operations
   * 10 requests per hour
   */
  intensive: createRateLimit({
    limit: 10,
    window: 60 * 60 * 1000,
    message: 'Too many resource-intensive requests',
  }),
};

/**
 * Higher-order function that combines rate limiting with existing API handlers
 * @param rateLimiter Rate limiting function
 * @param handler Original API handler
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit<T extends unknown[]>(
  rateLimiter: (request: NextRequest) => Promise<NextResponse | null>,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitResult = await rateLimiter(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    return handler(request, ...args);
  };
}
