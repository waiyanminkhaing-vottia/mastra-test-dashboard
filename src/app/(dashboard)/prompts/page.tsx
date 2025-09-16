'use client';

import { Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptDialog } from '@/components/dashboard/prompts/prompt-dialog';
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
import { usePromptsStore } from '@/stores/prompts-store';
import type { PromptWithVersions } from '@/types/prompt';

/**
 * Main prompts page component that displays a table of all prompts with their versions and metadata
 * @returns JSX element containing the prompts listing page
 */
export default function PromptsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const router = useRouter();
  const { prompts, loading, error, fetchPrompts } = usePromptsStore();

  const {
    sortedData: sortedPrompts,
    sortField,
    sortDirection,
    handleSort,
  } = useTableSort(prompts, {
    defaultSortField: 'createdAt',
    defaultSortDirection: 'desc',
  });

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

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
            label: 'Prompts',
            translationKey: 'breadcrumbs.prompts',
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-end mt-4">
          <Button variant="outline" className="hover:text-primary" asChild>
            <Link href="/prompts/new">
              <Plus className="size-4 mr-2" />
              {t('prompts.addPrompt')}
            </Link>
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
                    {t('prompts.table.name')}
                  </TableSortButton>
                </TableHead>
                <TableHead>{t('prompts.table.description')}</TableHead>
                <TableHead>{t('prompts.table.versions')}</TableHead>
                <TableHead>
                  <TableSortButton
                    field="createdAt"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {t('prompts.table.created')}
                  </TableSortButton>
                </TableHead>
                <TableHead>
                  <TableSortButton
                    field="updatedAt"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {t('prompts.table.updated')}
                  </TableSortButton>
                </TableHead>
                <TableHead className="w-[150px]">
                  {t('prompts.table.actions')}
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
                    className="h-24 text-center text-red-600"
                  >
                    {t('errors.somethingWentWrong')}
                  </TableCell>
                </TableRow>
              ) : !prompts || prompts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('prompts.table.noPrompts')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedPrompts.map((prompt: PromptWithVersions) => (
                  <TableRow
                    key={prompt.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(`/prompts/${prompt.id}/versions`)
                    }
                  >
                    <TableCell className="font-medium">{prompt.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {prompt.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prompt.versions?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(prompt.createdAt)}</TableCell>
                    <TableCell>{formatDate(prompt.updatedAt)}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <PromptDialog
                          prompt={prompt}
                          onSuccess={() => {
                            // Store will automatically update via refetch
                          }}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
