import { useCallback } from 'react';

import { formatZodErrors } from '@/lib/validation-utils';

interface ApiError {
  status?: number;
  data?: {
    details?: unknown;
  };
}

interface FormErrorHandlerOptions {
  conflictErrorKey?: string;
  fallbackErrorKey?: string;
}

/**
 * Custom hook for handling form API errors in a consistent way
 * @param t Translation function
 * @param setErrors Function to set field-specific errors
 * @param setGeneralError Function to set general error messages
 * @returns Error handler function
 */
export function useFormErrorHandler(
  t: (key: string) => string,
  setErrors: (errors: Record<string, string>) => void,
  setGeneralError: (error: string | null) => void
) {
  return useCallback(
    (error: unknown, options: FormErrorHandlerOptions = {}) => {
      const {
        conflictErrorKey = 'errors.alreadyExists',
        fallbackErrorKey = 'errors.somethingWentWrong',
      } = options;

      const apiError = error as ApiError;

      if (apiError.status === 409) {
        // Handle 409 Conflict - resource already exists
        setErrors({ name: t(conflictErrorKey) });
      } else if (
        apiError.data?.details &&
        Array.isArray(apiError.data.details)
      ) {
        // Handle validation errors from server
        const formattedErrors = formatZodErrors({
          issues: apiError.data.details,
        });
        setErrors(formattedErrors);
      } else {
        // Handle other API errors
        setGeneralError(fallbackErrorKey);
      }
    },
    [t, setErrors, setGeneralError]
  );
}
