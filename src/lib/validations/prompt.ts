import { z } from 'zod';

/** Default fallback validation messages for server-side validation when no translation function is provided */
const defaultMessages = {
  nameRequired: 'Name is required',
  nameMaxLength: 'Name must be less than 100 characters',
  descriptionMaxLength: 'Description must be less than 500 characters',
  contentRequired: 'Content is required',
};

/**
 * Creates a Zod validation schema for prompt creation
 * @param t - Optional translation function for localized error messages
 * @returns Zod schema for validating { name, description?, content, promptLabelId? }
 * @example
 * const schema = createPromptSchema(t);
 * const result = schema.safeParse(formData);
 */
export const createPromptSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`prompts.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(100, getMessage('nameMaxLength')),
    description: z
      .string()
      .max(500, getMessage('descriptionMaxLength'))
      .optional(),
    content: z.string().min(1, getMessage('contentRequired')),
    promptLabelId: z.string().optional(),
  });
};

/**
 * Creates a Zod validation schema for prompt updates (excludes content and label)
 * @param t - Optional translation function for localized error messages
 * @returns Zod schema for validating { name, description? }
 * @example
 * const schema = updatePromptSchema(t);
 * const result = schema.safeParse(updateData);
 */
export const updatePromptSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`prompts.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(100, getMessage('nameMaxLength')),
    description: z
      .string()
      .max(500, getMessage('descriptionMaxLength'))
      .optional(),
  });
};
