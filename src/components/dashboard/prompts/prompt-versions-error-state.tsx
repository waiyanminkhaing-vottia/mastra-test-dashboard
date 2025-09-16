'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

// Breadcrumb constants to avoid duplication
const BREADCRUMB_KEYS = {
  MANAGEMENT: 'breadcrumbs.management',
  PROMPTS: 'breadcrumbs.prompts',
  ERROR: 'common.error',
} as const;

// Translation keys for consistency
const ERROR_KEYS = {
  PROMPT_NOT_FOUND: 'prompts.errors.promptNotFound',
  PROMPT_NOT_FOUND_DESCRIPTION: 'prompts.errors.promptNotFoundDescription',
  SOMETHING_WENT_WRONG: 'errors.somethingWentWrong',
  BACK: 'common.back',
} as const;

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
              translationKey: BREADCRUMB_KEYS.MANAGEMENT,
              href: '/',
            },
            {
              label: 'Prompts',
              translationKey: BREADCRUMB_KEYS.PROMPTS,
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
                {t(ERROR_KEYS.BACK)}
              </Link>
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {t(ERROR_KEYS.PROMPT_NOT_FOUND)}
            </h2>
            <p className="text-muted-foreground mt-4">
              {t(ERROR_KEYS.PROMPT_NOT_FOUND_DESCRIPTION)}
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
            translationKey: BREADCRUMB_KEYS.MANAGEMENT,
            href: '/',
          },
          {
            label: 'Prompts',
            translationKey: BREADCRUMB_KEYS.PROMPTS,
            href: '/prompts',
          },
          {
            label: 'Error',
            translationKey: BREADCRUMB_KEYS.ERROR,
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">
            {errorStatus === 404
              ? t(ERROR_KEYS.PROMPT_NOT_FOUND)
              : errorStatus === 500
                ? t(ERROR_KEYS.SOMETHING_WENT_WRONG)
                : errorStatus
                  ? `${t(ERROR_KEYS.SOMETHING_WENT_WRONG)} (${errorStatus})`
                  : t(ERROR_KEYS.SOMETHING_WENT_WRONG)}
          </p>
        </div>
      </div>
    </>
  );
}
