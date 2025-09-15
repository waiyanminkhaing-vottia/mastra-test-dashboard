'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface PromptVersionsErrorStateProps {
  errorStatus?: number | null;
}

/**
 * Error state component for prompt versions page
 * Displays different error messages based on HTTP status codes
 * @param props Component properties
 * @param props.errorStatus HTTP error status code or null
 */
export function PromptVersionsErrorState({
  errorStatus,
}: PromptVersionsErrorStateProps) {
  const { t } = useLanguage();

  if (errorStatus === 404) {
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
              href: '/prompts',
            },
            {
              label: '',
              isCurrentPage: true,
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/prompts">
                <ChevronLeft className="size-4 mr-2" />
                {t('common.back')}
              </Link>
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {t('prompts.errors.promptNotFound')}
            </h2>
            <p className="text-muted-foreground mt-4">
              {t('prompts.errors.promptNotFoundDescription')}
            </p>
          </div>
        </div>
      </>
    );
  }

  // General error state
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
            href: '/prompts',
          },
          {
            label: 'Error',
            translationKey: 'common.error',
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">
            {errorStatus === 404
              ? t('prompts.errors.promptNotFound')
              : errorStatus === 500
                ? t('errors.somethingWentWrong')
                : errorStatus
                  ? `${t('errors.somethingWentWrong')} (${errorStatus})`
                  : t('errors.somethingWentWrong')}
          </p>
        </div>
      </div>
    </>
  );
}
