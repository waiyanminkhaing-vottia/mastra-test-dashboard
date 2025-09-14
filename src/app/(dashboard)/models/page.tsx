'use client';

import type { Model } from '@prisma/client';
import { Edit, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { useLanguage } from '@/contexts/language-context';
import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

/**
 * Models management page component
 * Displays a table of all models with create, edit, and view functionality
 * @returns Models page with table, dialogs, and CRUD operations
 */
export default function ModelsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const {
    data: models,
    loading,
    error,
    fetchData,
    setData,
  } = useApi<Model[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  useEffect(() => {
    fetchData('/api/models');
  }, [fetchData]);

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
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="size-4 mr-2" />
            {t('models.addModel')}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('models.table.name')}</TableHead>
                <TableHead>{t('models.table.provider')}</TableHead>
                <TableHead>{t('models.table.created')}</TableHead>
                <TableHead>{t('models.table.updated')}</TableHead>
                <TableHead className="w-[100px]">
                  {t('models.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <TableSkeleton rows={3} columns={5} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-red-600"
                  >
                    {t(error)}
                  </TableCell>
                </TableRow>
              ) : !models || models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {t('models.table.noModels')}
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model: Model) => (
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
                          onClick={() => setEditingModel(model)}
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
        open={showAddDialog || !!editingModel}
        onOpenChange={open => {
          if (!open) {
            setShowAddDialog(false);
            setEditingModel(null);
          }
        }}
        model={editingModel}
        onSuccess={(savedModel: Model) => {
          // Update local state without refetching
          if (editingModel) {
            // Update existing model
            setData(
              models?.map(m => (m.id === savedModel.id ? savedModel : m)) || []
            );
          } else {
            // Add new model
            setData([savedModel, ...(models || [])]);
          }
          setEditingModel(null);
        }}
      />
    </>
  );
}
