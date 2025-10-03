'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/language-context';
import { getProviderLabel } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { AgentMcpToolWithMcp, AgentWithRelations } from '@/types/agent';
import type { LLMConfig } from '@/types/config';

interface AgentTableRowProps {
  agent: AgentWithRelations;
}

/**
 * Memoized table row component for agent display
 * Prevents unnecessary re-renders when parent updates
 */
export const AgentTableRow = memo(function AgentTableRow({
  agent,
}: AgentTableRowProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleRowClick = useCallback(() => {
    router.push(`/agents/${agent.id}/edit`);
  }, [router, agent.id]);

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">{agent.name}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {agent.model.name} ({getProviderLabel(agent.model.provider)})
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{agent.prompt.name}</Badge>
      </TableCell>
      <TableCell>
        {agent.label ? (
          <Badge variant="outline">{agent.label.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {agent.tools && agent.tools.length > 0 ? (
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger
              onMouseEnter={e => e.stopPropagation()}
              className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                align="center"
                avoidCollisions
                className="text-sm min-w-60 max-w-lg p-4 bg-popover text-popover-foreground border z-50 rounded-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                <div className="space-y-2">
                  <h4 className="font-medium mb-6">
                    {t('agents.table.tools')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.tools.map(agentTool => (
                      <Badge
                        key={agentTool.id}
                        variant="outline"
                        className="text-xs break-all max-w-full"
                      >
                        {agentTool.tool.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <TooltipPrimitive.Arrow className="fill-popover" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {agent.mcpTools && agent.mcpTools.length > 0 ? (
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger
              onMouseEnter={e => e.stopPropagation()}
              className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                align="center"
                avoidCollisions
                className="text-sm min-w-60 max-w-lg p-4 bg-popover text-popover-foreground border z-50 rounded-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                <div className="space-y-2">
                  <h4 className="font-medium mb-6">
                    {t('agents.table.mcpTools')}
                  </h4>
                  <div className="space-y-3">
                    {(() => {
                      // Group tools by MCP server
                      const groupedTools = agent.mcpTools.reduce(
                        (
                          acc: Record<string, string[]>,
                          agentMcpTool: AgentMcpToolWithMcp
                        ) => {
                          const mcpName =
                            agentMcpTool.mcp?.name || 'Unknown MCP';
                          if (!acc[mcpName]) {
                            acc[mcpName] = [];
                          }
                          acc[mcpName].push(agentMcpTool.toolName);
                          return acc;
                        },
                        {} as Record<string, string[]>
                      );

                      return Object.entries(groupedTools).map(
                        ([mcpName, tools]) => (
                          <div key={mcpName} className="space-y-1">
                            <div className="font-medium text-xs text-muted-foreground break-words">
                              {mcpName}:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {tools.map((toolName: string) => (
                                <Badge
                                  key={toolName}
                                  variant="outline"
                                  className="text-xs break-all max-w-full"
                                >
                                  {toolName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
                <TooltipPrimitive.Arrow className="fill-popover" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {agent.subAgents && agent.subAgents.length > 0 ? (
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger
              onMouseEnter={e => e.stopPropagation()}
              className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                align="center"
                avoidCollisions
                className="text-sm min-w-60 max-w-lg p-4 bg-popover text-popover-foreground border z-50 rounded-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                <div className="space-y-2">
                  <h4 className="font-medium mb-6">
                    {t('agents.table.subAgents')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.subAgents.map(subAgent => (
                      <Badge
                        key={subAgent.id}
                        variant="outline"
                        className="text-xs break-all max-w-full"
                      >
                        {subAgent.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <TooltipPrimitive.Arrow className="fill-popover" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {agent.config && Object.keys(agent.config).length > 0 ? (
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger
              onMouseEnter={e => e.stopPropagation()}
              className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                align="center"
                avoidCollisions
                className="text-sm w-60 p-4 bg-popover text-popover-foreground border z-50 rounded-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                <div className="space-y-2">
                  <h4 className="font-medium mb-6">
                    {t('agents.form.llmConfigTitle')}
                  </h4>
                  <div className="space-y-1">
                    {(() => {
                      const config = agent.config as LLMConfig;
                      return (
                        <>
                          {config.temperature !== undefined && (
                            <div className="flex justify-between">
                              <span>{t('agents.form.temperatureField')}:</span>
                              <span>{config.temperature}</span>
                            </div>
                          )}
                          {config.maxTokens !== undefined && (
                            <div className="flex justify-between">
                              <span>{t('agents.form.maxTokensField')}:</span>
                              <span>{config.maxTokens}</span>
                            </div>
                          )}
                          {config.topP !== undefined && (
                            <div className="flex justify-between">
                              <span>{t('agents.form.topPField')}:</span>
                              <span>{config.topP}</span>
                            </div>
                          )}
                          {config.frequencyPenalty !== undefined && (
                            <div className="flex justify-between">
                              <span>
                                {t('agents.form.frequencyPenaltyField')}:
                              </span>
                              <span>{config.frequencyPenalty}</span>
                            </div>
                          )}
                          {config.presencePenalty !== undefined && (
                            <div className="flex justify-between">
                              <span>
                                {t('agents.form.presencePenaltyField')}:
                              </span>
                              <span>{config.presencePenalty}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <TooltipPrimitive.Arrow className="fill-popover" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>{formatDate(agent.createdAt)}</TableCell>
      <TableCell>{formatDate(agent.updatedAt)}</TableCell>
    </TableRow>
  );
});
