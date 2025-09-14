import { ZodError, ZodIssue } from 'zod';

/**
 * Converts Zod validation errors to a flat object with field names as keys
 * @param error - ZodError or object with issues array
 * @returns Object mapping field names to their first error message
 * @example
 * formatZodErrors(zodError) // { "email": "Invalid email", "name": "Required" }
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
 * Creates a standardized validation error response for API routes
 * @param error - ZodError from validation failure
 * @returns Object with error message and detailed issues for API response
 * @example
 * return NextResponse.json(createValidationErrorResponse(zodError), { status: 400 });
 */
export function createValidationErrorResponse(error: ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues,
  };
}
