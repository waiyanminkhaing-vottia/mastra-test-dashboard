/**
 * Type definitions for agent-related entities
 * Extends Prisma types with additional computed properties
 */
import type {
  Agent,
  AgentMcpTool,
  Mcp,
  Model,
  Prompt,
  PromptLabel,
} from '@prisma/client';

// Re-export Prisma types for convenient access
export type { Agent, AgentMcpTool };

/** Agent MCP Tool with MCP details */
export type AgentMcpToolWithMcp = AgentMcpTool & {
  mcp?: Mcp | null;
};

/** Agent with all related data embedded */
export type AgentWithRelations = Agent & {
  model: Model;
  prompt: Prompt;
  label?: PromptLabel | null;
  mcpTools?: AgentMcpToolWithMcp[];
  subAgents?: Agent[];
  parent?: Agent | null;
};
