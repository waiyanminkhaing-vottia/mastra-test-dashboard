/**
 * Security configuration for MCP operations
 */
export const MCP_SECURITY_CONFIG = {
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: Number(process.env.MCP_REQUEST_TIMEOUT) || 30000,

  // Maximum number of concurrent MCP connections
  MAX_CONCURRENT_CONNECTIONS: Number(process.env.MCP_MAX_CONNECTIONS) || 10,
} as const;

/**
 * Validates MCP server URLs
 */
export function validateMcpUrl(url: string): {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: URL;
} {
  try {
    const parsedUrl = new URL(url.trim());

    // Basic protocol validation
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are allowed',
      };
    }

    return {
      isValid: true,
      sanitizedUrl: parsedUrl,
    };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Sanitizes error messages to prevent information leakage
 */
export function sanitizeErrorMessage(
  error: unknown,
  isProduction = process.env.NODE_ENV === 'production'
): string {
  if (!isProduction) {
    // In development, return full error details
    return error instanceof Error ? error.message : 'Unknown error occurred';
  }

  // In production, return generic messages to prevent information disclosure
  if (error instanceof Error) {
    // Map specific errors to safe messages
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network connection failed';
    }

    if (errorMessage.includes('timeout')) {
      return 'Request timed out';
    }

    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return 'MCP server not found';
    }

    if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
      return 'Access denied';
    }
  }

  return 'MCP operation failed';
}

/**
 * Validates MCP client configuration
 */
export function validateMcpClientConfig(config: {
  id?: string;
  timeout?: number;
  maxRetries?: number;
}): {
  isValid: boolean;
  errors: string[];
  sanitizedConfig: typeof config;
} {
  const errors: string[] = [];
  const sanitizedConfig = { ...config };

  // Validate client ID
  if (config.id) {
    if (typeof config.id !== 'string' || config.id.length === 0) {
      errors.push('Client ID must be a non-empty string');
    } else if (config.id.length > 100) {
      errors.push('Client ID is too long (maximum 100 characters)');
      sanitizedConfig.id = config.id.substring(0, 100);
    }
  }

  // Validate timeout
  if (config.timeout !== undefined) {
    if (typeof config.timeout !== 'number' || config.timeout <= 0) {
      errors.push('Timeout must be a positive number');
      sanitizedConfig.timeout = MCP_SECURITY_CONFIG.REQUEST_TIMEOUT;
    } else if (config.timeout > 300000) {
      // Max 5 minutes
      errors.push('Timeout is too long (maximum 5 minutes)');
      sanitizedConfig.timeout = 300000;
    }
  }

  // Validate max retries
  if (config.maxRetries !== undefined) {
    if (typeof config.maxRetries !== 'number' || config.maxRetries < 0) {
      errors.push('Max retries must be a non-negative number');
      sanitizedConfig.maxRetries = 3;
    } else if (config.maxRetries > 10) {
      errors.push('Max retries is too high (maximum 10)');
      sanitizedConfig.maxRetries = 10;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedConfig,
  };
}
