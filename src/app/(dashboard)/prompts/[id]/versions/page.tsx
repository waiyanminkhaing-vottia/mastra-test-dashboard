'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptVersionContent } from '@/components/dashboard/prompts/prompt-version-content';
import { PromptVersionLabelChangeDialog } from '@/components/dashboard/prompts/prompt-version-label-change-dialog';
import { PromptVersionsErrorState } from '@/components/dashboard/prompts/prompt-versions-error-state';
import { PromptVersionsLoadingSkeleton } from '@/components/dashboard/prompts/prompt-versions-loading-skeleton';
import { PromptVersionsSidebar } from '@/components/dashboard/prompts/prompt-versions-sidebar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { usePromptVersionLabelChange } from '@/hooks/use-prompt-version-label-change';
import { usePromptVersionRouter } from '@/hooks/use-prompt-version-router';
import { usePromptVersionSelection } from '@/hooks/use-prompt-version-selection';
import { usePromptsStore } from '@/stores/prompts-store';

// Memoized components for performance optimization
const MemoizedPromptVersionsSidebar = memo(PromptVersionsSidebar);
const MemoizedPromptVersionContent = memo(PromptVersionContent);

/**
 * Page component that displays different versions of a prompt with their content and labels
 * @returns JSX element containing the prompt versions management interface
 */
export default function PromptVersionsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const {
    currentPrompt: prompt,
    currentPromptLoading: loading,
    currentPromptError: error,
    currentPromptErrorStatus: errorStatus,
    fetchPromptById,
    updatePromptVersionLabel,
  } = usePromptsStore();
  const {
    pendingLabelChange,
    isUpdatingLabel,
    handleLabelChange: handleLabelChangeHook,
    handleConfirmLabelChange: handleConfirmLabelChangeHook,
    closeLabelDialog,
  } = usePromptVersionLabelChange(updatePromptVersionLabel);
  const [searchQuery, setSearchQuery] = useState('');

  const promptId = params.id as string;
  const selectedVersionId = searchParams.get('version');

  // Use custom hooks for version management
  const selectedVersion = usePromptVersionSelection(
    prompt?.versions,
    selectedVersionId
  );
  const { handleVersionSelect } = usePromptVersionRouter(
    promptId,
    searchParams
  );

  // Create wrapper functions for the hook handlers
  const handleLabelChange = (labelId: string, labelName: string) => {
    handleLabelChangeHook(selectedVersion, labelId, labelName);
  };

  const handleConfirmLabelChange = () => {
    handleConfirmLabelChangeHook(selectedVersion);
  };

  useEffect(() => {
    if (promptId) {
      fetchPromptById(promptId);
    }
  }, [promptId, fetchPromptById]);

  if (languageLoading) {
    return null;
  }

  // Consolidated loading and error states
  if (loading) {
    return <PromptVersionsLoadingSkeleton />;
  }

  if (error || !prompt) {
    return <PromptVersionsErrorState errorStatus={errorStatus || 404} />;
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
              <ChevronLeft className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-[320px_1fr] gap-4 h-[calc(100vh-200px)]">
          <MemoizedPromptVersionsSidebar
            promptId={promptId}
            versions={prompt.versions || []}
            selectedVersionId={selectedVersion?.id}
            onVersionSelect={handleVersionSelect}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          {selectedVersion ? (
            <MemoizedPromptVersionContent
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
