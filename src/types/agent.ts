/**
 * Type definitions for agent-related entities
 * Extends Prisma types with additional computed properties
 */
import type { Agent, Model, Prompt, PromptLabel } from '@prisma/client';

// Re-export Prisma types for convenient access
export type { Agent };

/** Agent with all related data embedded */
export type AgentWithRelations = Agent & {
  model: Model;
  prompt: Prompt;
  label?: PromptLabel | null;
};
