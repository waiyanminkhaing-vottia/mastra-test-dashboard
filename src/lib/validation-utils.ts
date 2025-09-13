import { ZodError, ZodIssue } from 'zod';

/**
 * Utility function to convert Zod validation errors to field-specific error messages
 */
export function formatZodErrors(
  error: ZodError | { issues: ZodIssue[] }
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach(issue => {
    if (issue.path.length > 0) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
  });
  return fieldErrors;
}

/**
 * Utility function for consistent API validation error response
 */
export function createValidationErrorResponse(error: ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues,
  };
}
