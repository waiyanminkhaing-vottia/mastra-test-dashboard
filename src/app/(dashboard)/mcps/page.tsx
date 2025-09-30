'use client';

import type { Mcp } from '@prisma/client';
import { Edit, Plus, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { McpDialog } from '@/components/dashboard/mcp-dialog';
import { McpToolsModal } from '@/components/dashboard/mcp-tools-modal';
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
import logger from '@/lib/logger';
import { formatDate } from '@/lib/utils';
import { useMcpDialog } from '@/stores/dialog-store';
import { useMcpsStore } from '@/stores/mcps-store';
import type { McpWithRelations } from '@/types/mcp';

/**
 * MCPs management page component
 * Displays a table of all MCPs with create, edit, and view functionality
 * @returns MCPs page with table, dialogs, and CRUD operations
 */
export default function McpsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const { mcps, loading, error, fetchMcps } = useMcpsStore();
  const { isCreateOpen, isEditOpen, editingMcp, openCreate, openEdit, close } =
    useMcpDialog();
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [selectedMcp, setSelectedMcp] = useState<Mcp | null>(null);
  const [mcpTools, setMcpTools] = useState<
    { id: string; description?: string }[] | null
  >(null);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);

  const {
    sortedData: sortedMcps,
    sortField,
    sortDirection,
    handleSort,
  } = useTableSort(mcps, {
    defaultSortField: 'createdAt' as keyof McpWithRelations,
    defaultSortDirection: 'asc',
  });

  useEffect(() => {
    fetchMcps();
  }, [fetchMcps]);

  // Fetch tools from MCP server
  const handleViewTools = async (mcp: Mcp) => {
    setSelectedMcp(mcp);
    setToolsModalOpen(true);
    setToolsLoading(true);
    setToolsError(null);
    setMcpTools(null);

    try {
      logger.debug({ msg: 'Fetching MCP tools for modal', mcpName: mcp.name });

      // Fetch tools from the MCP server using GET with MCP ID
      const response = await fetch(
        `/api/mcps/tools?id=${encodeURIComponent(mcp.id)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`);
      }

      const data = await response.json();
      setMcpTools(data.tools || []);

      logger.debug({
        msg: 'Successfully fetched MCP tools for modal',
        mcpName: mcp.name,
        toolCount: data.tools?.length || 0,
      });
    } catch (error) {
      logger.error({
        msg: 'Error fetching MCP tools for modal',
        mcpName: mcp.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      setToolsError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch tools from MCP server'
      );
    } finally {
      setToolsLoading(false);
    }
  };

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
            label: 'MCPs',
            translationKey: 'breadcrumbs.mcps',
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-end mt-4">
          <Button
            variant="outline"
            className="hover:text-primary"
            onClick={openCreate}
          >
            <Plus className="size-4 mr-2" />
            {t('mcps.addMcp')}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <TableSortButton
                    field={'name' as keyof McpWithRelations}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {t('mcps.table.name')}
                  </TableSortButton>
                </TableHead>
                <TableHead>{t('mcps.table.url')}</TableHead>
                <TableHead className="text-center">
                  {t('mcps.table.tools')}
                </TableHead>
                <TableHead>
                  <TableSortButton
                    field={'createdAt' as keyof McpWithRelations}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {t('mcps.table.created')}
                  </TableSortButton>
                </TableHead>
                <TableHead>
                  <TableSortButton
                    field={'updatedAt' as keyof McpWithRelations}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {t('mcps.table.updated')}
                  </TableSortButton>
                </TableHead>
                <TableHead className="w-[100px]">
                  {t('mcps.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={3} columns={6} />
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-destructive"
                  >
                    {t('errors.somethingWentWrong')}
                  </TableCell>
                </TableRow>
              ) : !mcps || mcps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('mcps.table.noMcps')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedMcps.map((mcp: McpWithRelations) => (
                  <TableRow key={mcp.id}>
                    <TableCell className="font-medium">{mcp.name}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm font-medium text-foreground truncate">
                        {mcp.domain}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleViewTools(mcp as Mcp);
                        }}
                        title={t('mcps.tools.viewTools')}
                      >
                        <Wrench className="size-4" />
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(mcp.createdAt)}</TableCell>
                    <TableCell>{formatDate(mcp.updatedAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(mcp as Mcp)}
                      >
                        <Edit className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <McpDialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={open => {
          if (!open) {
            close();
          }
        }}
        mcp={editingMcp}
        onSuccess={() => {
          toast.success(
            editingMcp
              ? t('mcps.form.updateSuccess')
              : t('mcps.form.createSuccess')
          );
          close();
          fetchMcps();
        }}
      />

      <McpToolsModal
        open={toolsModalOpen}
        onOpenChange={setToolsModalOpen}
        mcp={selectedMcp}
        tools={mcpTools}
        loading={toolsLoading}
        error={toolsError}
        onRefresh={() => selectedMcp && handleViewTools(selectedMcp)}
      />
    </>
  );
}
