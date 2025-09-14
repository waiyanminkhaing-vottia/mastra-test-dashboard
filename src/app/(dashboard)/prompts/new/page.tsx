'use client';

import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptLabelSelect } from '@/components/dashboard/prompt-label-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextEditor } from '@/components/ui/text-editor';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { formatZodErrors } from '@/lib/validation-utils';
import { createPromptSchema } from '@/lib/validations/prompt';

/**
 * Page component for creating a new prompt with content, description, and label assignment
 * @returns JSX element containing the new prompt creation form
 */
export default function NewPromptPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [promptContent, setPromptContent] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      content: promptContent,
      promptLabelId: selectedLabel || undefined,
    };

    try {
      setLoading(true);
      setErrors({});
      setGeneralError(null);

      // Client-side validation with Zod
      const schema = createPromptSchema(t);
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        setErrors(formatZodErrors(validationResult.error));
        setLoading(false);
        return;
      }

      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      if (response.ok) {
        router.push('/prompts');
      } else if (response.status === 409) {
        // Handle 409 Conflict - prompt already exists
        setGeneralError('prompts.errors.promptAlreadyExists');
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          // Handle validation errors from server
          setErrors(formatZodErrors({ issues: error.details }));
        } else {
          setGeneralError('errors.somethingWentWrong');
        }
      }
    } catch {
      setGeneralError('errors.somethingWentWrong');
    } finally {
      setLoading(false);
    }
  };

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
            href: '/prompts',
          },
          {
            label: 'New Prompt',
            translationKey: 'prompts.form.title',
            isCurrentPage: true,
          },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full">
          <div className="mb-6 mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/prompts">
                <ChevronLeft className="size-4 mr-2" />
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
              <Label htmlFor="name">{t('prompts.form.nameField')}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t('prompts.form.namePlaceholder')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('prompts.form.descriptionField')}
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('prompts.form.descriptionPlaceholder')}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">{t('prompts.form.contentField')}</Label>
              <TextEditor
                value={promptContent}
                onChange={setPromptContent}
                minHeight={200}
                maxHeight={500}
                language="plaintext"
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
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
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading
                  ? t('prompts.form.creatingButton')
                  : t('prompts.form.createButton')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
