import { z } from 'zod';

/**
 * Creates a Zod validation schema for updating prompt version label assignments
 * @returns Zod schema for validating { labelId?: string | null }
 */
export const updatePromptVersionSchema = () => {
  return z.object({
    labelId: z
      .string()
      .transform(val => (val === '' ? null : val))
      .nullish(),
  });
};
