'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import logger from '@/lib/logger';

interface McpErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface McpErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

interface McpErrorFallbackProps {
  error: Error;
  retry: () => void;
}

/**
 * Default error fallback component for MCP errors
 */
function DefaultMcpErrorFallback({ error, retry }: McpErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div className="border rounded-lg">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="flex items-center gap-2 text-destructive text-sm font-semibold leading-none tracking-tight">
          <AlertTriangle className="h-4 w-4" />
          {t('errors.mcpError')}
        </h3>
      </div>
      <div className="p-6 pt-0 space-y-3">
        <p className="text-sm text-muted-foreground">
          {error.message || t('errors.mcpUnknownError')}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="h-8 text-xs"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          {t('common.retry')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Error boundary specifically designed for MCP-related components
 * Provides retry functionality and detailed error logging
 */
export class McpErrorBoundary extends React.Component<
  McpErrorBoundaryProps,
  McpErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: McpErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  /**
   * Captures errors from child components and updates state
   */
  static getDerivedStateFromError(
    error: Error
  ): Partial<McpErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Logs error details and triggers error callback
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    const { retryCount } = this.state;

    // Log error with context
    logger.error({
      msg: 'MCP component error caught by error boundary',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount,
      props: this.props,
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error({
          msg: 'Error in MCP error boundary handler',
          error: handlerError,
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      logger.warn({
        msg: 'MCP error boundary max retries reached',
        retryCount,
        maxRetries,
      });
      return;
    }

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s...
    const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);

    logger.info({
      msg: 'MCP error boundary retrying after delay',
      retryCount: retryCount + 1,
      delay,
    });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1,
      });
    }, delay);
  };

  /**
   * Renders children or error fallback based on error state
   */
  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback = DefaultMcpErrorFallback } =
      this.props;

    if (hasError && error) {
      return <Fallback error={error} retry={this.handleRetry} />;
    }

    return children;
  }
}

/**
 * Higher-order component to wrap components with MCP error boundary
 */
export function withMcpErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<McpErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <McpErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </McpErrorBoundary>
  );

  WrappedComponent.displayName = `withMcpErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}
