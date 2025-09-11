import { Provider } from '@prisma/client';
import { z } from 'zod';

// Use Prisma's generated enum with Zod
export const providerSchema = z.enum(Object.values(Provider));

export type { Provider };

// Default fallback messages for server-side validation
const defaultMessages = {
  nameRequired: 'Name is required',
  nameMaxLength: 'Name must be less than 100 characters',
  nameInvalidChars:
    'Name can only contain letters, numbers, hyphens, underscores, and dots',
  providerRequired: 'Provider is required',
};

// Model creation validation schema factory
export const createModelSchema = (t?: (key: string) => string) => {
  const getMessage = (key: string) => {
    if (t) {
      return t(`models.validation.${key}`);
    }
    return defaultMessages[key as keyof typeof defaultMessages];
  };

  return z.object({
    name: z
      .string()
      .min(1, getMessage('nameRequired'))
      .max(100, getMessage('nameMaxLength'))
      .regex(/^[a-zA-Z0-9\-_\.]+$/, getMessage('nameInvalidChars')),
    provider: providerSchema.refine(val => val, {
      message: getMessage('providerRequired'),
    }),
  });
};

export type CreateModelInput = z.infer<ReturnType<typeof createModelSchema>>;
