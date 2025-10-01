'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Eye, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { TableSortButton } from '@/components/ui/table-sort-button';
import { useLanguage } from '@/contexts/language-context';
import { useTableSort } from '@/hooks/use-table-sort';
import { getProviderLabel } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { useAgentsStore } from '@/stores/agents-store';
import type { AgentMcpToolWithMcp, AgentWithRelations } from '@/types/agent';
import type { LLMConfig } from '@/types/config';

/**
 * Agents management page component
 * Displays a table of all agents with create, edit, and view functionality
 * @returns Agents page with table, dialogs, and CRUD operations
 */
export default function AgentsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const { agents, loading, error, fetchAgents } = useAgentsStore();
  const router = useRouter();

  const {
    sortedData: sortedAgents,
    sortField,
    sortDirection,
    handleSort,
  } = useTableSort(agents, {
    defaultSortField: 'createdAt',
    defaultSortDirection: 'asc',
  });

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  if (languageLoading) {
    return null;
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          {
            label: 'Management',
            translationKey: 'breadcrumbs.management',
            href: '/',
          },
          {
            label: 'Agents',
            translationKey: 'breadcrumbs.agents',
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-end mt-4">
          <Button variant="outline" className="hover:text-primary" asChild>
            <Link href="/agents/new">
              <Plus className="size-4 mr-2" />
              {t('agents.addAgent')}
            </Link>
          </Button>
        </div>

        <div className="rounded-md border">
          <TooltipPrimitive.Provider delayDuration={100}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <TableSortButton
                      field="name"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      {t('agents.table.name')}
                    </TableSortButton>
                  </TableHead>
                  <TableHead>{t('agents.table.model')}</TableHead>
                  <TableHead>{t('agents.table.prompt')}</TableHead>
                  <TableHead>{t('agents.table.label')}</TableHead>
                  <TableHead className="text-center">
                    {t('agents.table.mcpTools')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('agents.table.subAgents')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('agents.table.config')}
                  </TableHead>
                  <TableHead>
                    <TableSortButton
                      field="createdAt"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      {t('agents.table.created')}
                    </TableSortButton>
                  </TableHead>
                  <TableHead>
                    <TableSortButton
                      field="updatedAt"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    >
                      {t('agents.table.updated')}
                    </TableSortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton rows={3} columns={9} />
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-red-600"
                    >
                      {t('errors.somethingWentWrong')}
                    </TableCell>
                  </TableRow>
                ) : !agents || agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      {t('agents.table.noAgents')}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAgents.map((agent: AgentWithRelations) => (
                    <TableRow
                      key={agent.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/agents/${agent.id}/edit`)}
                    >
                      <TableCell className="font-medium">
                        {agent.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {agent.model.name} (
                          {getProviderLabel(agent.model.provider)})
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
                                      const groupedTools =
                                        agent.mcpTools.reduce(
                                          (
                                            acc: Record<string, string[]>,
                                            agentMcpTool: AgentMcpToolWithMcp
                                          ) => {
                                            const mcpName =
                                              agentMcpTool.mcp?.name ||
                                              'Unknown MCP';
                                            if (!acc[mcpName]) {
                                              acc[mcpName] = [];
                                            }
                                            acc[mcpName].push(
                                              agentMcpTool.toolName
                                            );
                                            return acc;
                                          },
                                          {} as Record<string, string[]>
                                        );

                                      return Object.entries(groupedTools).map(
                                        ([mcpName, tools]) => (
                                          <div
                                            key={mcpName}
                                            className="space-y-1"
                                          >
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
                        {agent.config &&
                        Object.keys(agent.config).length > 0 ? (
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
                                              <span>
                                                {t(
                                                  'agents.form.temperatureField'
                                                )}
                                                :
                                              </span>
                                              <span>{config.temperature}</span>
                                            </div>
                                          )}
                                          {config.maxTokens !== undefined && (
                                            <div className="flex justify-between">
                                              <span>
                                                {t(
                                                  'agents.form.maxTokensField'
                                                )}
                                                :
                                              </span>
                                              <span>{config.maxTokens}</span>
                                            </div>
                                          )}
                                          {config.topP !== undefined && (
                                            <div className="flex justify-between">
                                              <span>
                                                {t('agents.form.topPField')}:
                                              </span>
                                              <span>{config.topP}</span>
                                            </div>
                                          )}
                                          {config.frequencyPenalty !==
                                            undefined && (
                                            <div className="flex justify-between">
                                              <span>
                                                {t(
                                                  'agents.form.frequencyPenaltyField'
                                                )}
                                                :
                                              </span>
                                              <span>
                                                {config.frequencyPenalty}
                                              </span>
                                            </div>
                                          )}
                                          {config.presencePenalty !==
                                            undefined && (
                                            <div className="flex justify-between">
                                              <span>
                                                {t(
                                                  'agents.form.presencePenaltyField'
                                                )}
                                                :
                                              </span>
                                              <span>
                                                {config.presencePenalty}
                                              </span>
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
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipPrimitive.Provider>
        </div>
      </div>
    </>
  );
}
