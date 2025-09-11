'use client';

import type { Model } from '@prisma/client';
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
import { createModelSchema, type Provider } from '@/lib/validations/model';

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
  onSuccess: () => void;
  model?: Model | null; // For edit mode
}

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
    }
  }, [model, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation with Zod
    const schema = createModelSchema(t);
    const validationResult = schema.safeParse({
      name: name.trim(),
      provider,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        if (issue.path.length > 0) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
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
        setName('');
        setProvider('');
        setErrors({});
        onOpenChange(false);
        onSuccess();
      } else {
        const error = await response.json();
        if (error.details) {
          const fieldErrors: Record<string, string> = {};
          error.details.forEach(
            (issue: { path: string[]; message: string }) => {
              if (issue.path.length > 0) {
                fieldErrors[issue.path[0]] = issue.message;
              }
            }
          );
          setErrors(fieldErrors);
        } else {
          alert(error.error || 'Failed to create model');
        }
      }
    } catch (error) {
      console.error('Failed to create model:', error);
      alert('Failed to create model');
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

          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="provider">{t('models.form.provider')}</Label>
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
              <Label htmlFor="name">{t('models.form.name')}</Label>
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
              {t('models.form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || !provider}
            >
              {loading
                ? isEditing
                  ? t('models.form.updating')
                  : t('models.form.creating')
                : isEditing
                  ? t('models.form.update')
                  : t('models.form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
