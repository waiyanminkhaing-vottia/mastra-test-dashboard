/**
 * Type definitions for agent-related entities
 * Extends Prisma types with additional computed properties
 */
import type {
  Agent,
  AgentMcpTool,
  AgentTool,
  Mcp,
  Model,
  Prompt,
  PromptLabel,
  Tool,
} from '@prisma/client';

// Re-export Prisma types for convenient access
export type { Agent, AgentMcpTool, AgentTool };

/** Agent MCP Tool with MCP details */
export type AgentMcpToolWithMcp = AgentMcpTool & {
  mcp?: Mcp | null;
};

/** Agent Tool with Tool details */
export type AgentToolWithTool = AgentTool & {
  tool: Tool;
};

/** Agent with all related data embedded */
export type AgentWithRelations = Agent & {
  model: Model;
  prompt: Prompt;
  label?: PromptLabel | null;
  mcpTools?: AgentMcpToolWithMcp[];
  tools?: AgentToolWithTool[];
  subAgents?: Agent[];
  parent?: Agent | null;
};
