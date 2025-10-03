'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { AgentTableRow } from '@/components/dashboard/agents/agent-table-row';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { TableHead, TableRow } from '@/components/ui/table';
import { TableSortButton } from '@/components/ui/table-sort-button';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { useLanguage } from '@/contexts/language-context';
import { useTableSort } from '@/hooks/use-table-sort';
import { useAgentsStore } from '@/stores/agents-store';

/**
 * Agents management page component
 * Displays a table of all agents with create, edit, and view functionality
 * @returns Agents page with table, dialogs, and CRUD operations
 */
export default function AgentsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const { agents, loading, error, fetchAgents } = useAgentsStore();

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

        <TooltipPrimitive.Provider delayDuration={100}>
          <VirtualizedTable
            data={sortedAgents}
            loading={loading}
            error={!!error}
            emptyMessage={t('agents.table.noAgents')}
            errorMessage={t('errors.somethingWentWrong')}
            columns={10}
            headers={
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
                  {t('agents.table.tools')}
                </TableHead>
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
            }
            renderRow={(agent, _index) => (
              <AgentTableRow key={agent.id} agent={agent} />
            )}
          />
        </TooltipPrimitive.Provider>
      </div>
    </>
  );
}
