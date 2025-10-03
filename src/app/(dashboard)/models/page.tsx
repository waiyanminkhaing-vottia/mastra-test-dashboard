'use client';

import type { Model } from '@prisma/client';
import { Edit, Plus } from 'lucide-react';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ModelDialog } from '@/components/dashboard/model-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { TableSortButton } from '@/components/ui/table-sort-button';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { useLanguage } from '@/contexts/language-context';
import { useTableSort } from '@/hooks/use-table-sort';
import { formatDate } from '@/lib/utils';
import { useModelDialog } from '@/stores/dialog-store';
import { useModelsStore } from '@/stores/models-store';

/**
 * Models management page component
 * Displays a table of all models with create, edit, and view functionality
 * @returns Models page with table, dialogs, and CRUD operations
 */
export default function ModelsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const { models, loading, error, fetchModels } = useModelsStore();
  const {
    isCreateOpen,
    isEditOpen,
    editingModel,
    openCreate,
    openEdit,
    close,
  } = useModelDialog();

  const {
    sortedData: sortedModels,
    sortField,
    sortDirection,
    handleSort,
  } = useTableSort<Model>(models, {
    defaultSortField: 'createdAt',
    defaultSortDirection: 'asc',
  });

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

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
            label: 'Models',
            translationKey: 'breadcrumbs.models',
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
            {t('models.addModel')}
          </Button>
        </div>

        <VirtualizedTable
          data={sortedModels}
          loading={loading}
          error={!!error}
          emptyMessage={t('models.table.noModels')}
          errorMessage={t('errors.somethingWentWrong')}
          columns={5}
          headers={
            <TableRow>
              <TableHead>
                <TableSortButton
                  field={'name' as keyof Model}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {t('models.table.name')}
                </TableSortButton>
              </TableHead>
              <TableHead>{t('models.table.provider')}</TableHead>
              <TableHead>
                <TableSortButton
                  field={'createdAt' as keyof Model}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {t('models.table.created')}
                </TableSortButton>
              </TableHead>
              <TableHead>
                <TableSortButton
                  field={'updatedAt' as keyof Model}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {t('models.table.updated')}
                </TableSortButton>
              </TableHead>
              <TableHead className="w-[100px]">
                {t('models.table.actions')}
              </TableHead>
            </TableRow>
          }
          renderRow={(model, style) => (
            <TableRow key={model.id} style={style}>
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{model.provider}</Badge>
              </TableCell>
              <TableCell>{formatDate(model.createdAt)}</TableCell>
              <TableCell>{formatDate(model.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(model)}
                  >
                    <Edit className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        />
      </div>

      <ModelDialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={open => {
          if (!open) {
            close();
          }
        }}
        model={editingModel}
        onSuccess={close}
      />
    </>
  );
}
