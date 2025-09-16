import { useCallback } from 'react';
import { toast } from 'sonner';

import { useLanguage } from '@/contexts/language-context';
import { useUIStore } from '@/stores/ui-store';
import type { PromptVersionWithLabel } from '@/types/prompt';

/**
 * Comprehensive hook for managing prompt version label changes
 * Combines dialog state management with business logic for label updates
 * @param updatePromptVersionLabel Function to update version label from prompts store
 * @returns Object with label change handlers and state
 */
export function usePromptVersionLabelChange(
  updatePromptVersionLabel: (
    versionId: string,
    labelId: string
  ) => Promise<boolean>
) {
  const { t } = useLanguage();

  // Access UI store directly instead of using separate dialog hook
  const pendingLabelChange = useUIStore(state => state.pendingLabelChange);
  const isUpdatingLabel = useUIStore(state => state.isUpdatingLabel);
  const setPendingLabelChange = useUIStore(
    state => state.setPendingLabelChange
  );
  const setIsUpdatingLabel = useUIStore(state => state.setIsUpdatingLabel);

  /**
   * Initiates a label change if the new label is different from current
   * @param selectedVersion Current selected version
   * @param labelId New label ID (empty string for no label)
   * @param labelName New label name for display
   */
  const handleLabelChange = useCallback(
    (
      selectedVersion: PromptVersionWithLabel | undefined,
      labelId: string,
      labelName: string
    ) => {
      if (!selectedVersion) return;

      const currentLabelId = selectedVersion.labelId || '';
      const newLabelId = labelId || '';

      // No change needed
      if (currentLabelId === newLabelId) return;

      setPendingLabelChange({ labelId, labelName });
    },
    [setPendingLabelChange]
  );

  /**
   * Confirms and executes the pending label change
   * @param selectedVersion Current selected version
   */
  const handleConfirmLabelChange = useCallback(
    async (selectedVersion: PromptVersionWithLabel | undefined) => {
      if (!pendingLabelChange || !selectedVersion) return;

      try {
        setIsUpdatingLabel(true);
        const success = await updatePromptVersionLabel(
          selectedVersion.id,
          pendingLabelChange.labelId
        );

        if (success) {
          toast.success(t('prompts.versions.labelUpdatedSuccess'));
          setPendingLabelChange(null);
        } else {
          toast.error(t('prompts.versions.labelUpdateFailed'));
        }
      } catch {
        toast.error(t('prompts.versions.labelUpdateFailed'));
      } finally {
        setIsUpdatingLabel(false);
      }
    },
    [
      pendingLabelChange,
      setIsUpdatingLabel,
      updatePromptVersionLabel,
      setPendingLabelChange,
      t,
    ]
  );

  /**
   * Cancels the pending label change
   */
  const closeLabelDialog = useCallback(() => {
    setPendingLabelChange(null);
  }, [setPendingLabelChange]);

  return {
    // State
    pendingLabelChange,
    isUpdatingLabel,

    // Actions
    handleLabelChange,
    handleConfirmLabelChange,
    closeLabelDialog,
  };
}
