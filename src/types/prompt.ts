/**
 * Type definitions for prompt-related entities
 * Extends Prisma types with additional computed properties
 */
import type { Prompt, PromptLabel, PromptVersion } from '@prisma/client';

/** Prompt version with embedded label data */
export type PromptVersionWithLabel = PromptVersion & {
  label: PromptLabel | null;
};

/** Prompt with embedded versions array */
export type PromptWithVersions = Prompt & {
  versions: PromptVersionWithLabel[];
};
