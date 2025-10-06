'use client';

import type { Tool } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { validateClientSide } from '@/lib/validation-utils';
import { toolSchema } from '@/lib/validations/tool';
import { useToolsStore } from '@/stores/tools-store';

const ERROR_BORDER_CLASS = 'border-red-500';

interface ToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tool?: Tool | null; // For edit mode
}

/**
 * Dialog component for creating and editing tools
 * @param props Component properties
 * @param props.open Whether the dialog is currently open
 * @param props.onOpenChange Callback function called when dialog open state changes
 * @param props.onSuccess Callback function called when tool is successfully created or updated
 * @param props.tool Optional tool object for editing existing tools
 * @returns JSX element containing the tool creation/editing dialog
 */
export function ToolDialog({
  open,
  onOpenChange,
  onSuccess,
  tool,
}: ToolDialogProps) {
  const { t } = useLanguage();
  const { createTool, updateTool, isCreating, isUpdating } = useToolsStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const handleFormError = useFormErrorHandler(t, setErrors, setGeneralError);
  const isEditing = !!tool;
  const loading = isCreating || isUpdating;

  // Reset form when tool changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (tool) {
        // Edit mode: populate with existing data
        setName(tool.name);
        setDescription(tool.description || '');
      } else {
        // Add mode: clear form
        setName('');
        setDescription('');
      }
      setErrors({});
      setGeneralError(null);
    }
  }, [tool, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Client-side validation with common utility
    const validation = validateClientSide(toolSchema(t), {
      name: name.trim(),
      description: description.trim() || undefined,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (isEditing && tool) {
        await updateTool(
          tool.id,
          validation.data as {
            name: string;
            description?: string;
          }
        );
      } else {
        await createTool(
          validation.data as {
            name: string;
            description?: string;
          }
        );
      }

      // If we reach here, the operation was successful
      setName('');
      setDescription('');
      setErrors({});
      setGeneralError(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      handleFormError(error, {
        conflictErrorKey: 'tools.errors.toolAlreadyExists',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('tools.form.editTitle') : t('tools.form.title')}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t('tools.form.editDescription')
                : t('tools.form.description')}
            </DialogDescription>
          </DialogHeader>

          {generalError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {t(generalError)}
            </div>
          )}

          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="name">{t('tools.form.nameField')}</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('tools.form.namePlaceholder')}
                className={errors.name ? ERROR_BORDER_CLASS : ''}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">
                {t('tools.form.descriptionField')}{' '}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('tools.form.descriptionPlaceholder')}
                className={errors.description ? ERROR_BORDER_CLASS : ''}
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
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('tools.form.cancelButton')}
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? isEditing
                  ? t('tools.form.updatingButton')
                  : t('tools.form.creatingButton')
                : isEditing
                  ? t('tools.form.updateButton')
                  : t('tools.form.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
