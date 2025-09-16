'use client';

import type { Model } from '@prisma/client';
import { Edit, Plus } from 'lucide-react';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ModelDialog } from '@/components/dashboard/model-dialog';
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
  } = useTableSort(models, {
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

        <div className="rounded-md border">
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
                    {t('models.table.name')}
                  </TableSortButton>
                </TableHead>
                <TableHead>{t('models.table.provider')}</TableHead>
                <TableHead>
                  <TableSortButton
                    field="createdAt"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {t('models.table.created')}
                  </TableSortButton>
                </TableHead>
                <TableHead>
                  <TableSortButton
                    field="updatedAt"
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
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={3} columns={5} />
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-red-600"
                  >
                    {t('errors.somethingWentWrong')}
                  </TableCell>
                </TableRow>
              ) : !models || models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {t('models.table.noModels')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedModels.map((model: Model) => (
                  <TableRow key={model.id}>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
