/**
 * Common API client utilities for making HTTP requests with consistent error handling
 */

/**
 * Get the base URL for API requests, accounting for basePath
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_BASE_URL || '';
}

/**
 * Build full URL with basePath support
 */
function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${baseUrl}${basePath}${path}`;
}

/**
 * Common headers for API requests
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

/**
 * Common error messages to avoid duplication
 */
const ERROR_MESSAGES = {
  REQUEST_FAILED: 'Request failed',
} as const;

/**
 * Custom error for API requests
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Makes a POST request with JSON body
 * @param url - The API endpoint
 * @param data - The data to send
 * @returns Promise resolving to the response data
 */
export async function apiPost<T = unknown>(
  url: string,
  data: unknown
): Promise<T> {
  const response = await fetch(buildUrl(url), {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || ERROR_MESSAGES.REQUEST_FAILED,
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Makes a PUT request with JSON body
 * @param url - The API endpoint
 * @param data - The data to send
 * @returns Promise resolving to the response data
 */
export async function apiPut<T = unknown>(
  url: string,
  data: unknown
): Promise<T> {
  const response = await fetch(buildUrl(url), {
    method: 'PUT',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || ERROR_MESSAGES.REQUEST_FAILED,
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Makes a GET request
 * @param url - The API endpoint
 * @returns Promise resolving to the response data
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const response = await fetch(buildUrl(url));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || ERROR_MESSAGES.REQUEST_FAILED,
      response.status,
      errorData
    );
  }

  return response.json();
}
