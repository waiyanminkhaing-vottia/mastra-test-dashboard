import type { ZodError } from 'zod';

/**
 * Converts Zod validation errors to a flat object with field names as keys
 * @param error - ZodError object or API response with issues array
 * @returns Object mapping field names to their first error message
 * @example
 * formatZodErrors(zodError) // { "email": "Invalid email", "name": "Required" }
 */
export function formatZodErrors(
  error:
    | ZodError
    | { issues: Array<{ path: (string | number)[]; message: string }> }
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

/**
 * Client-side validation utility with standardized error handling
 * @param schema - Schema object with safeParse method
 * @param schema.safeParse - Function to validate data
 * @param data - Data to validate
 * @returns Object with either validated data or formatted errors
 * @example
 * const result = validateClientSide(schema, formData);
 * if (result.success) {
 *   // use result.data
 * } else {
 *   setErrors(result.errors);
 * }
 */
export function validateClientSide<T>(
  schema: {
    safeParse: (
      data: unknown
    ) => { success: true; data: T } | { success: false; error: ZodError };
  },
  data: unknown
):
  | { success: true; data: T; errors?: never }
  | { success: false; data?: never; errors: Record<string, string> } {
  const validationResult = schema.safeParse(data);

  if (validationResult.success) {
    return {
      success: true,
      data: validationResult.data,
    };
  }

  return {
    success: false,
    errors: formatZodErrors(validationResult.error),
  };
}
