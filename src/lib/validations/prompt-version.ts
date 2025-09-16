import { z } from 'zod';

/**
 * Creates a Zod validation schema for creating new prompt versions
 * @returns Zod schema for validating prompt version creation data
 */
export const createPromptVersionSchema = () => {
  return z.object({
    promptId: z.string().min(1, 'Prompt ID is required'),
    content: z.string().min(1, 'Prompt is required'),
    changeNote: z.string().optional(),
    labelId: z
      .string()
      .transform(val => (val === '' ? null : val))
      .nullish(),
  });
};

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
