import { z } from 'zod';

// Default fallback messages for server-side validation
const defaultMessages = {
  nameRequired: 'Name is required',
  nameMaxLength: 'Name must be less than 100 characters',
  descriptionMaxLength: 'Description must be less than 500 characters',
  contentRequired: 'Content is required',
};

// Prompt creation validation schema factory
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

// Prompt update validation schema factory (only name and description)
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
