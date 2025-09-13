'use client';

import type { Prompt } from '@prisma/client';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { formatZodErrors } from '@/lib/validation-utils';
import { updatePromptSchema } from '@/lib/validations/prompt';

interface PromptDialogProps {
  prompt: Prompt; // Required for edit mode only
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function PromptDialog({
  onSuccess,
  prompt,
  trigger,
}: PromptDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Populate with existing prompt data
      setName(prompt.name);
      setDescription(prompt.description || '');
      setErrors({});
      setGeneralError(null);
    }
  }, [prompt, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Client-side validation with Zod
    const schema = updatePromptSchema(t);
    const validationResult = schema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    if (!validationResult.success) {
      setErrors(formatZodErrors(validationResult.error));
      return;
    }

    try {
      setLoading(true);

      const url = `/api/prompts/${prompt.id}`;
      const method = 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setErrors({});
        setGeneralError(null);
        setOpen(false);
        onSuccess?.();
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
    } catch (_error) {
      setGeneralError('errors.somethingWentWrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('prompts.form.editTitle')}</DialogTitle>
          </DialogHeader>

          {generalError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {t(generalError)}
            </div>
          )}

          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="name">{t('prompts.form.nameField')}</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('prompts.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">
                {t('prompts.form.descriptionField')}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('prompts.form.descriptionPlaceholder')}
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t('prompts.form.cancelButton')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t('prompts.form.updatingButton')
                : t('prompts.form.updateButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
