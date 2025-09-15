'use client';

import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

interface PromptVersionLabelChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelName: string;
  isUpdating: boolean;
  onConfirm: () => void;
}

/**
 * Confirmation dialog for prompt version label changes
 * Displays the new label name and provides confirm/cancel actions
 * @param props Component properties
 * @param props.open Whether the dialog is currently open
 * @param props.onOpenChange Callback function when dialog open state changes
 * @param props.labelName Name of the label being assigned
 * @param props.isUpdating Whether the update operation is in progress
 * @param props.onConfirm Callback function when user confirms the action
 */
export function PromptVersionLabelChangeDialog({
  open,
  onOpenChange,
  labelName,
  isUpdating,
  onConfirm,
}: PromptVersionLabelChangeDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('prompts.versions.confirmLabelChange')}
          </AlertDialogTitle>
          <AlertDialogDescription className="inline-flex flex-wrap items-center gap-1">
            <span>{t('prompts.versions.confirmLabelChangeMessage')}</span>
            <Badge
              variant="outline"
              className={
                labelName !== 'None' ? 'border-primary text-primary' : ''
              }
            >
              {labelName}
            </Badge>
            <span>?</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isUpdating}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
