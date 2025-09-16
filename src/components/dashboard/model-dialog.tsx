'use client';

import type { Model } from '@prisma/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { PROVIDERS } from '@/lib/constants';
import { validateClientSide } from '@/lib/validation-utils';
import { modelSchema, type Provider } from '@/lib/validations/model';
import { useModelsStore } from '@/stores/models-store';

interface ModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  model?: Model | null; // For edit mode
}

/**
 * Dialog component for creating and editing AI model configurations
 * @param props Component properties
 * @param props.open Whether the dialog is currently open
 * @param props.onOpenChange Callback function called when dialog open state changes
 * @param props.onSuccess Callback function called when model is successfully created or updated
 * @param props.model Optional model object for editing existing models
 * @returns JSX element containing the model creation/editing dialog
 */
export function ModelDialog({
  open,
  onOpenChange,
  onSuccess,
  model,
}: ModelDialogProps) {
  const { t } = useLanguage();
  const { createModel, updateModel, isCreating, isUpdating } = useModelsStore();
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<Provider | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const handleFormError = useFormErrorHandler(t, setErrors, setGeneralError);
  const isEditing = !!model;
  const loading = isCreating || isUpdating;

  // Reset form when model changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (model) {
        // Edit mode: populate with existing data
        setName(model.name);
        setProvider(model.provider);
      } else {
        // Add mode: clear form
        setName('');
        setProvider('');
      }
      setErrors({});
      setGeneralError(null);
    }
  }, [model, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Client-side validation with common utility
    const validation = validateClientSide(modelSchema(t), {
      name: name.trim(),
      provider,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (isEditing && model) {
        await updateModel(model.id, validation.data);
      } else {
        await createModel(validation.data);
      }

      // If we reach here, the operation was successful
      setName('');
      setProvider('');
      setErrors({});
      setGeneralError(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      handleFormError(error, {
        conflictErrorKey: 'models.errors.modelAlreadyExists',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('models.form.editTitle') : t('models.form.title')}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t('models.form.editDescription')
                : t('models.form.description')}
            </DialogDescription>
          </DialogHeader>

          {generalError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {t(generalError)}
            </div>
          )}

          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="provider">{t('models.form.providerField')}</Label>
              <Select
                value={provider}
                onValueChange={value => setProvider(value as Provider)}
                required
              >
                <SelectTrigger
                  className={errors.provider ? 'border-red-500' : ''}
                >
                  <SelectValue
                    placeholder={t('models.form.providerPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provider && (
                <p className="text-sm text-red-500">{errors.provider}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="name">{t('models.form.nameField')}</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('models.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
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
              {t('models.form.cancelButton')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || !provider}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? isEditing
                  ? t('models.form.updatingButton')
                  : t('models.form.creatingButton')
                : isEditing
                  ? t('models.form.updateButton')
                  : t('models.form.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
