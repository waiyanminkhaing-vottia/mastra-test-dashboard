'use client';

import type { Model } from '@prisma/client';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ModelDialog } from '@/components/dashboard/model-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/language-context';

export default function ModelsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

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
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px] rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[90px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[90px]" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : models.length === 0 ? (
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
                    <TableCell>
                      {new Date(model.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(model.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingModel(model)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
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
        onSuccess={() => {
          // Refetch models after successful creation/update
          fetchModels();
          setEditingModel(null);
        }}
      />
    </>
  );
}
