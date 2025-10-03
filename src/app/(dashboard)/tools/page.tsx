'use client';

import type { Tool } from '@prisma/client';
import { Edit, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ToolDialog } from '@/components/dashboard/tool-dialog';
import { Button } from '@/components/ui/button';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { TableSortButton } from '@/components/ui/table-sort-button';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { useLanguage } from '@/contexts/language-context';
import { useTableSort } from '@/hooks/use-table-sort';
import { formatDate } from '@/lib/utils';
import { useToolDialog } from '@/stores/dialog-store';
import { useToolsStore } from '@/stores/tools-store';

/**
 * Tools management page component
 * Displays a table of all tools with create and edit functionality
 * @returns Tools page with table, dialogs, and CRUD operations
 */
export default function ToolsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const { tools, loading, error, fetchTools } = useToolsStore();
  const { isCreateOpen, isEditOpen, editingTool, openCreate, openEdit, close } =
    useToolDialog();

  const {
    sortedData: sortedTools,
    sortField,
    sortDirection,
    handleSort,
  } = useTableSort<Tool>(tools, {
    defaultSortField: 'createdAt',
    defaultSortDirection: 'desc',
  });

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

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
            label: 'Tools',
            translationKey: 'breadcrumbs.tools',
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
            {t('tools.addTool')}
          </Button>
        </div>

        <VirtualizedTable
          data={sortedTools}
          loading={loading}
          error={!!error}
          emptyMessage={t('tools.table.noTools')}
          errorMessage={t('errors.somethingWentWrong')}
          columns={5}
          headers={
            <TableRow>
              <TableHead>
                <TableSortButton
                  field={'name' as keyof Tool}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {t('tools.table.name')}
                </TableSortButton>
              </TableHead>
              <TableHead>{t('tools.table.description')}</TableHead>
              <TableHead>
                <TableSortButton
                  field={'createdAt' as keyof Tool}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {t('tools.table.created')}
                </TableSortButton>
              </TableHead>
              <TableHead>
                <TableSortButton
                  field={'updatedAt' as keyof Tool}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {t('tools.table.updated')}
                </TableSortButton>
              </TableHead>
              <TableHead className="w-[100px]">
                {t('tools.table.actions')}
              </TableHead>
            </TableRow>
          }
          renderRow={(tool, style) => (
            <TableRow key={tool.id} style={style}>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell className="max-w-md">
                <div className="text-sm text-muted-foreground truncate">
                  {tool.description || '-'}
                </div>
              </TableCell>
              <TableCell>{formatDate(tool.createdAt)}</TableCell>
              <TableCell>{formatDate(tool.updatedAt)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(tool)}
                >
                  <Edit className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          )}
        />
      </div>

      <ToolDialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={open => {
          if (!open) {
            close();
          }
        }}
        tool={editingTool}
        onSuccess={() => {
          toast.success(
            editingTool
              ? t('tools.form.updateSuccess')
              : t('tools.form.createSuccess')
          );
          close();
          fetchTools();
        }}
      />
    </>
  );
}
