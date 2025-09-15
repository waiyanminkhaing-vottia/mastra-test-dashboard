'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptVersionContent } from '@/components/dashboard/prompts/prompt-version-content';
import { PromptVersionLabelChangeDialog } from '@/components/dashboard/prompts/prompt-version-label-change-dialog';
import { PromptVersionsErrorState } from '@/components/dashboard/prompts/prompt-versions-error-state';
import { PromptVersionsLoadingSkeleton } from '@/components/dashboard/prompts/prompt-versions-loading-skeleton';
import { PromptVersionsSidebar } from '@/components/dashboard/prompts/prompt-versions-sidebar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useApi } from '@/hooks/use-api';
import { usePromptVersionLabelUpdate } from '@/hooks/use-prompt-version-label-update';
import { usePromptVersionSelection } from '@/hooks/use-prompt-version-selection';
import type { PromptWithVersions } from '@/types/prompt';

/**
 * Page component that displays different versions of a prompt with their content and labels
 * @returns JSX element containing the prompt versions management interface
 */
export default function PromptVersionsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const params = useParams();
  const {
    data: prompt,
    loading,
    errorStatus,
    fetchData: fetchPrompt,
    setData: setPrompt,
  } = useApi<PromptWithVersions>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const promptId = params.id as string;

  const { selectedVersion, handleVersionSelect } = usePromptVersionSelection({
    prompt,
    promptId,
  });

  const {
    pendingLabelChange,
    isUpdatingLabel,
    handleLabelChange,
    handleConfirmLabelChange,
    closeLabelDialog,
  } = usePromptVersionLabelUpdate({
    prompt: prompt || null,
    selectedVersion,
    onPromptUpdate: setPrompt,
  });

  const loadPrompt = useCallback(async () => {
    await fetchPrompt(`/api/prompts/${promptId}`);
  }, [promptId, fetchPrompt]);

  useEffect(() => {
    if (promptId) {
      loadPrompt();
    }
  }, [promptId, loadPrompt]);

  if (languageLoading) {
    return null;
  }

  if (loading) {
    return <PromptVersionsLoadingSkeleton />;
  }

  if (errorStatus || !prompt) {
    return <PromptVersionsErrorState errorStatus={errorStatus} />;
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
            href: '/prompts',
          },
          {
            label: prompt.name,
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

        <div className="grid grid-cols-[320px_1fr] gap-4 h-[calc(100vh-200px)]">
          <PromptVersionsSidebar
            versions={prompt?.versions || []}
            selectedVersionId={selectedVersion?.id}
            onVersionSelect={handleVersionSelect}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          {selectedVersion ? (
            <PromptVersionContent
              prompt={prompt}
              selectedVersion={selectedVersion}
              onLabelChange={handleLabelChange}
            />
          ) : (
            <div className="rounded-lg border bg-background text-card-foreground shadow-sm">
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="text-muted-foreground text-lg">
                  {t('prompts.versions.noVersionSelected')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('prompts.versions.selectVersionMessage')}
                </p>
              </div>
            </div>
          )}
        </div>

        <PromptVersionLabelChangeDialog
          open={!!pendingLabelChange}
          onOpenChange={open => !open && closeLabelDialog()}
          labelName={pendingLabelChange?.labelName || 'None'}
          isUpdating={isUpdatingLabel}
          onConfirm={handleConfirmLabelChange}
        />
      </div>
    </>
  );
}
