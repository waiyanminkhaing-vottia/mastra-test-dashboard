'use client';

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
import { buttonVariants } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface PromptVersionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirm: () => void;
}

/**
 * Dialog component for confirming prompt version deletion
 * @param props Component properties
 * @param props.open Whether the dialog is open
 * @param props.onOpenChange Callback when dialog open state changes
 * @param props.isDeleting Whether the deletion is in progress
 * @param props.onConfirm Callback when deletion is confirmed
 */
export function PromptVersionDeleteDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
}: PromptVersionDeleteDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('prompts.versions.confirmDeleteVersion')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('prompts.versions.confirmDeleteVersionMessage')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={e => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className={cn(buttonVariants({ variant: 'destructive' }))}
          >
            {isDeleting ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
