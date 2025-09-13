'use client';

import type { Prompt, PromptVersion } from '@prisma/client';
import { Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptDialog } from '@/components/dashboard/prompt-dialog';
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

type PromptWithVersions = Prompt & {
  versions: PromptVersion[];
};

export default function PromptsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const router = useRouter();
  const [prompts, setPrompts] = useState<PromptWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      } else {
        setError('errors.somethingWentWrong');
      }
    } catch (_error) {
      setError('errors.somethingWentWrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
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
                <TableHead>{t('prompts.table.name')}</TableHead>
                <TableHead>{t('prompts.table.description')}</TableHead>
                <TableHead>{t('prompts.table.versions')}</TableHead>
                <TableHead>{t('prompts.table.created')}</TableHead>
                <TableHead>{t('prompts.table.updated')}</TableHead>
                <TableHead className="w-[150px]">
                  {t('prompts.table.actions')}
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
                        <Skeleton className="h-4 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[50px]" />
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
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-red-600"
                  >
                    {t(error)}
                  </TableCell>
                </TableRow>
              ) : prompts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('prompts.table.noPrompts')}
                  </TableCell>
                </TableRow>
              ) : (
                prompts.map((prompt: PromptWithVersions) => (
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
                    <TableCell>{prompt.versions?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(prompt.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <PromptDialog
                          prompt={prompt}
                          onSuccess={() => fetchPrompts()}
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
