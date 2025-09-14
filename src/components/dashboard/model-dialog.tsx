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
import { formatZodErrors } from '@/lib/validation-utils';
import { modelSchema, type Provider } from '@/lib/validations/model';

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'AZURE_OPENAI', label: 'Azure OpenAI' },
  { value: 'COHERE', label: 'Cohere' },
  { value: 'HUGGING_FACE', label: 'Hugging Face' },
  { value: 'OLLAMA', label: 'Ollama' },
  { value: 'MISTRAL', label: 'Mistral' },
];

interface ModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (model: Model) => void;
  model?: Model | null; // For edit mode
}

/**
 * Dialog component for creating and editing AI model configurations
 * @param open Whether the dialog is currently open
 * @param onOpenChange Callback function called when dialog open state changes
 * @param onSuccess Callback function called when model is successfully created or updated
 * @param model Optional model object for editing existing models
 * @returns JSX element containing the model creation/editing dialog
 */
export function ModelDialog({
  open,
  onOpenChange,
  onSuccess,
  model,
}: ModelDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<Provider | ''>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const isEditing = !!model;

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

    // Client-side validation with Zod
    const schema = modelSchema(t);
    const validationResult = schema.safeParse({
      name: name.trim(),
      provider,
    });

    if (!validationResult.success) {
      setErrors(formatZodErrors(validationResult.error));
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/models/${model!.id}` : '/api/models';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      if (response.ok) {
        const savedModel = await response.json();
        setName('');
        setProvider('');
        setErrors({});
        onOpenChange(false);
        onSuccess(savedModel);
      } else if (response.status === 409) {
        // Handle 409 Conflict - model already exists
        setGeneralError('models.errors.modelAlreadyExists');
      } else {
        const error = await response.json();
        if (error.details) {
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
