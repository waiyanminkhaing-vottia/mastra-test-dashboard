'use client';

import type { Prompt } from '@prisma/client';
import { Loader2 } from 'lucide-react';
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
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { validateClientSide } from '@/lib/validation-utils';
import { updatePromptSchema } from '@/lib/validations/prompt';
import { usePromptsStore } from '@/stores/prompts-store';

interface PromptDialogProps {
  prompt: Prompt; // Required for edit mode only
  onSuccess?: (prompt: Prompt) => void;
  trigger?: React.ReactNode;
}

/**
 * Dialog component for editing existing prompt information
 * @param props Component properties
 * @param props.onSuccess Optional callback function called when prompt is successfully updated
 * @param props.prompt The prompt object to be edited
 * @param props.trigger Optional React node to use as dialog trigger element
 * @returns JSX element containing the prompt editing dialog
 */
export function PromptDialog({
  onSuccess,
  prompt,
  trigger,
}: PromptDialogProps) {
  const { t } = useLanguage();
  const { updatePrompt, isUpdating } = usePromptsStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const handleFormError = useFormErrorHandler(t, setErrors, setGeneralError);

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

    // Client-side validation with common utility
    const validation = validateClientSide(updatePromptSchema(t), {
      name: name.trim(),
      description: description.trim() || undefined,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      const updatedPrompt = await updatePrompt(prompt.id, {
        name: validation.data.name,
        description: validation.data.description,
      });

      // If we reach here, the operation was successful
      setName('');
      setDescription('');
      setErrors({});
      setGeneralError(null);
      setOpen(false);
      onSuccess?.(updatedPrompt);
    } catch (error: unknown) {
      handleFormError(error, {
        conflictErrorKey: 'prompts.errors.promptAlreadyExists',
      });
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
              disabled={isUpdating}
            >
              {t('prompts.form.cancelButton')}
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating
                ? t('prompts.form.updatingButton')
                : t('prompts.form.updateButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
