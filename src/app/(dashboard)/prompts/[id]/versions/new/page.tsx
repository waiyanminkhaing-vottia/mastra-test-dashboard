'use client';

import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptLabelSelect } from '@/components/dashboard/prompt-label-select';
import { PromptVersionsErrorState } from '@/components/dashboard/prompts/prompt-versions-error-state';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextEditor } from '@/components/ui/text-editor';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { formatZodErrors, validateClientSide } from '@/lib/validation-utils';
import { createPromptVersionSchema } from '@/lib/validations/prompt-version';
import { usePromptsStore } from '@/stores/prompts-store';

/**
 * Page component for creating a new version of an existing prompt
 * @returns JSX element containing the new version creation form
 */
export default function NewVersionPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const promptId = params.id as string;
  const duplicateVersionId = searchParams.get('duplicate');

  const {
    currentPrompt: prompt,
    fetchPromptById,
    createPromptVersion,
    currentPromptLoading: loading,
    currentPromptError: error,
    currentPromptErrorStatus: errorStatus,
    isCreating,
  } = usePromptsStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [promptContent, setPromptContent] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  // Fetch the prompt on mount
  useEffect(() => {
    if (promptId) {
      fetchPromptById(promptId);
    }
  }, [promptId, fetchPromptById]);

  // Pre-populate with version content when prompt is loaded
  useEffect(() => {
    if (prompt?.versions && prompt.versions.length > 0 && !promptContent) {
      let versionToUse;

      if (duplicateVersionId) {
        // If duplicating a specific version, find that version
        versionToUse = prompt.versions.find(v => v.id === duplicateVersionId);
      }

      if (!versionToUse) {
        // Fall back to latest version if no duplicate specified or version not found
        versionToUse = [...prompt.versions].sort(
          (a, b) => b.version - a.version
        )[0];
      }

      if (versionToUse) {
        setPromptContent(versionToUse.content);
        // Also set the label if duplicating
        if (duplicateVersionId && versionToUse.labelId) {
          setSelectedLabel(versionToUse.labelId);
        }
      }
    }
  }, [prompt, promptContent, duplicateVersionId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const data = {
      promptId,
      content: promptContent,
      changeNote: (formData.get('changeNote') as string) || undefined,
      labelId: selectedLabel || undefined,
    };

    setErrors({});
    setGeneralError(null);

    // Client-side validation with common utility
    const validation = validateClientSide(createPromptVersionSchema(), data);

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      await createPromptVersion(validation.data);
      // If we reach here, the operation was successful
      router.push(`/prompts/${promptId}/versions`);
    } catch (error: unknown) {
      const apiError = error as {
        status?: number;
        data?: { details?: unknown };
      };
      if (apiError.data?.details && Array.isArray(apiError.data.details)) {
        // Handle validation errors from server
        setErrors(formatZodErrors({ issues: apiError.data.details }));
      } else {
        // Handle other API errors
        setGeneralError('errors.somethingWentWrong');
      }
    }
  };

  if (languageLoading || loading) {
    return null;
  }

  if (error || !prompt) {
    return <PromptVersionsErrorState errorStatus={errorStatus || 404} />;
  }

  // Calculate next version number
  const nextVersionNumber =
    prompt?.versions && prompt.versions.length > 0
      ? Math.max(...prompt.versions.map(v => v.version)) + 1
      : 1;

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
            href: `/prompts/${promptId}/versions`,
          },
          {
            label: `${nextVersionNumber}`,
            isCurrentPage: true,
          },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full">
          <div className="mb-6 mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/prompts/${promptId}/versions`}>
                <ChevronLeft className="size-4" />
                {t('common.back')}
              </Link>
            </Button>
          </div>

          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {t(generalError)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content">{t('prompts.form.contentField')}</Label>
              <TextEditor
                value={promptContent}
                onChange={setPromptContent}
                minHeight={300}
                maxHeight={500}
                language="plaintext"
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeNote">
                {t('prompts.versions.changeNote')}
              </Label>
              <Textarea
                id="changeNote"
                name="changeNote"
                placeholder={t('prompts.versions.changeNotePlaceholder')}
                rows={3}
              />
              {errors.changeNote && (
                <p className="text-sm text-red-600">{errors.changeNote}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('labels.title')}</Label>
              <PromptLabelSelect
                selectedLabel={selectedLabel}
                onLabelChange={setSelectedLabel}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isCreating
                  ? t('prompts.versions.creatingVersion')
                  : t('prompts.versions.createVersion')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
