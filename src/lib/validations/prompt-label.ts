import { z } from 'zod';

// Default fallback messages for server-side validation
const defaultMessages = {
  nameRequired: 'Label name is required',
  nameMaxLength: 'Label name must be 50 characters or less',
};

export const promptLabelSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`labels.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(50, getMessage('nameMaxLength'))
      .trim(),
  });
};
