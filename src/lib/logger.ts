import { NextRequest } from 'next/server';
import pino from 'pino';

// Create the base logger configuration
const createLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Base configuration
  const config: pino.LoggerOptions = {
    name: 'mastra-dashboard',
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

    // AWS CloudWatch friendly timestamp format
    timestamp: pino.stdTimeFunctions.isoTime,

    // Add useful base fields for AWS
    base: {
      service: 'mastra-dashboard',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      aws_region: process.env.AWS_REGION,
      aws_account_id: process.env.AWS_ACCOUNT_ID,
    },
  };

  // Production configuration optimized for AWS CloudWatch
  if (isProduction) {
    // Use structured JSON logging in production
    config.formatters = {
      level: label => ({ level: label }),
    };
  }

  return pino(config);
};

// Create the main logger instance
export const logger = createLogger();

/**
 * Log errors with full context and structured error information
 * @param message Descriptive message about the error
 * @param error The error object to log
 * @param context Additional context data to include in the log
 */
export function logError(
  message: string,
  error: Error,
  context?: Record<string, unknown>
) {
  logger.error({
    msg: message,
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      code: 'code' in error ? error.code : undefined,
    },
    ...context,
  });
}

/**
 * Simple API request logging
 * @param request The incoming NextRequest
 */
export function logRequest(request: NextRequest) {
  const url = new URL(request.url);
  logger.info({
    msg: 'API Request',
    method: request.method,
    path: url.pathname,
  });
}

// Export the main logger as default
export default logger;
