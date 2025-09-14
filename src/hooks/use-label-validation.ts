/**
 * Custom hook for prompt label validation and form state management
 * Handles validation, error states, and form submission logic
 */
import { useState } from 'react';

import { formatZodErrors } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

export interface UseLabelValidationReturn {
  /** Current validation error message */
  error: string;
  /** Clear the current error */
  clearError: () => void;
  /** Validate a label name and return validation result */
  validateLabel: (name: string, t: (key: string) => string) => boolean;
  /** Set a custom error message */
  setError: (error: string) => void;
}

/**
 * Hook for managing label validation state and logic
 * @returns Object with validation state and functions
 */
export function useLabelValidation(): UseLabelValidationReturn {
  const [error, setError] = useState<string>('');

  const clearError = () => setError('');

  const validateLabel = (name: string, t: (key: string) => string): boolean => {
    const validationResult = promptLabelSchema(t).safeParse({ name });

    if (!validationResult.success) {
      const errors = formatZodErrors(validationResult.error);
      setError(errors.name || t('validation.error'));
      return false;
    }

    setError('');
    return true;
  };

  return {
    error,
    clearError,
    validateLabel,
    setError,
  };
}
