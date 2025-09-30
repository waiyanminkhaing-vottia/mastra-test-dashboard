'use client';

import type { Mcp } from '@prisma/client';
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
import { useLanguage } from '@/contexts/language-context';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { validateClientSide } from '@/lib/validation-utils';
import { mcpSchema } from '@/lib/validations/mcp';
import { useMcpsStore } from '@/stores/mcps-store';

interface McpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mcp?: Mcp | null; // For edit mode
}

/**
 * Dialog component for creating and editing MCP configurations
 * @param props Component properties
 * @param props.open Whether the dialog is currently open
 * @param props.onOpenChange Callback function called when dialog open state changes
 * @param props.onSuccess Callback function called when MCP is successfully created or updated
 * @param props.mcp Optional MCP object for editing existing MCPs
 * @returns JSX element containing the MCP creation/editing dialog
 */
export function McpDialog({
  open,
  onOpenChange,
  onSuccess,
  mcp,
}: McpDialogProps) {
  const { t } = useLanguage();
  const { createMcp, updateMcp, isCreating, isUpdating } = useMcpsStore();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const handleFormError = useFormErrorHandler(t, setErrors, setGeneralError);
  const isEditing = !!mcp;
  const loading = isCreating || isUpdating;

  // Reset form when mcp changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (mcp) {
        // Edit mode: populate with existing data
        setName(mcp.name);
        setUrl(mcp.url);
      } else {
        // Add mode: clear form
        setName('');
        setUrl('');
      }
      setErrors({});
      setGeneralError(null);
    }
  }, [mcp, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Client-side validation with common utility
    const validation = validateClientSide(mcpSchema(t), {
      name: name.trim(),
      url: url.trim(),
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (isEditing && mcp) {
        await updateMcp(
          mcp.id,
          validation.data as { name: string; url: string }
        );
      } else {
        await createMcp(validation.data as { name: string; url: string });
      }

      // If we reach here, the operation was successful
      setName('');
      setUrl('');
      setErrors({});
      setGeneralError(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      handleFormError(error, {
        conflictErrorKey: 'mcps.errors.mcpAlreadyExists',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('mcps.form.editTitle') : t('mcps.form.title')}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t('mcps.form.editDescription')
                : t('mcps.form.description')}
            </DialogDescription>
          </DialogHeader>

          {generalError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {t(generalError)}
            </div>
          )}

          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="name">{t('mcps.form.nameField')} *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('mcps.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="url">{t('mcps.form.urlField')} *</Label>
              <Input
                id="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('mcps.form.urlPlaceholder')}
                className={errors.url ? 'border-red-500' : ''}
              />
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url}</p>
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
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || !url.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? isEditing
                  ? t('common.updating')
                  : t('common.creating')
                : isEditing
                  ? t('mcps.form.updateMcp')
                  : t('mcps.form.createMcp')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
