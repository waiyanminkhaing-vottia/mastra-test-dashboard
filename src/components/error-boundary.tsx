'use client';

import React from 'react';

import { useLanguage } from '@/contexts/language-context';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Default error fallback component with language support
 * Displays a user-friendly error message with retry option
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <div className="mb-4 text-red-600">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-red-800">
        {t('errors.somethingWentWrong')}
      </h2>
      <p className="mb-4 max-w-md text-sm text-red-700">
        {t('errors.unexpectedError')}
      </p>
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-4 max-w-2xl text-left">
          <summary className="cursor-pointer text-sm font-medium text-red-800">
            {t('errors.errorDetails')}
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <button
        onClick={resetError}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {t('errors.tryAgain')}
      </button>
    </div>
  );
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 * Logs error details and displays a fallback UI instead of the component tree that crashed
 * Supports internationalization through the language context
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Derives error state from caught error
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Handles caught errors and logs them
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;

    // Log error details
    logger.error({
      msg: 'React Error Boundary caught an error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    });

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Renders error boundary content
   */
  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props;

    if (hasError && error) {
      return <Fallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}

/**
 * Hook for creating error boundaries with custom error handling
 * Useful for functional components that need to handle errors
 *
 * @param onError Optional error handler function
 * @returns Error boundary wrapper component
 */
export function useErrorBoundary(
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  return function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>
  ) {
    const WrappedComponent = (props: P) => (
      <ErrorBoundary onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${
      Component.displayName || Component.name || 'Component'
    })`;

    return WrappedComponent;
  };
}

export default ErrorBoundary;
