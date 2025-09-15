/**
 * Common API client utilities for making HTTP requests with consistent error handling
 */

/**
 * Common headers for API requests
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
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
  const response = await fetch(url, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || 'Request failed',
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
  const response = await fetch(url, {
    method: 'PUT',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || 'Request failed',
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
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || 'Request failed',
      response.status,
      errorData
    );
  }

  return response.json();
}
