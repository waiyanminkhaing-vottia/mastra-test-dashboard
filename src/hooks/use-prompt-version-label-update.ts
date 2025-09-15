import { useState } from 'react';
import { toast } from 'sonner';

import { useLanguage } from '@/contexts/language-context';
import { apiPut } from '@/lib/api-client';
import type {
  PromptVersionWithLabel,
  PromptWithVersions,
} from '@/types/prompt';

interface UsePromptVersionLabelUpdateProps {
  prompt: PromptWithVersions | null;
  selectedVersion?: PromptVersionWithLabel;
  onPromptUpdate: (updatedPrompt: PromptWithVersions) => void;
}

/**
 * Custom hook for managing prompt version label updates
 * Handles the confirmation dialog state and API calls for updating labels
 * @param props Configuration object containing prompt data and callbacks
 * @param props.prompt Prompt data with versions
 * @param props.selectedVersion Currently selected prompt version
 * @param props.onPromptUpdate Callback function when prompt data is updated
 * @returns Object containing state and handlers for label update operations
 */
export function usePromptVersionLabelUpdate({
  prompt,
  selectedVersion,
  onPromptUpdate,
}: UsePromptVersionLabelUpdateProps) {
  const { t } = useLanguage();
  const [pendingLabelChange, setPendingLabelChange] = useState<{
    labelId: string;
    labelName: string;
  } | null>(null);
  const [isUpdatingLabel, setIsUpdatingLabel] = useState(false);

  const handleLabelChange = (labelId: string, labelName: string) => {
    const currentLabelId = selectedVersion?.labelId || '';
    const newLabelId = labelId || '';

    if (currentLabelId === newLabelId) return;

    setPendingLabelChange({ labelId, labelName });
  };

  const handleConfirmLabelChange = async () => {
    if (!pendingLabelChange || !selectedVersion || !prompt) return;

    try {
      setIsUpdatingLabel(true);
      const updatedVersion = await apiPut<PromptVersionWithLabel>(
        `/api/prompt-versions/${selectedVersion.id}`,
        { labelId: pendingLabelChange.labelId }
      );

      const updatedPrompt = {
        ...prompt,
        versions: prompt.versions.map(version =>
          version.id === selectedVersion.id
            ? {
                ...version,
                label: updatedVersion.label,
                labelId: updatedVersion.labelId,
              }
            : version
        ),
      };
      onPromptUpdate(updatedPrompt);
      toast.success(t('prompts.versions.labelUpdatedSuccess'));
    } catch {
      toast.error(t('prompts.versions.labelUpdateFailed'));
    } finally {
      setIsUpdatingLabel(false);
      setPendingLabelChange(null);
    }
  };

  const closeLabelDialog = () => {
    setPendingLabelChange(null);
  };

  return {
    pendingLabelChange,
    isUpdatingLabel,
    handleLabelChange,
    handleConfirmLabelChange,
    closeLabelDialog,
  };
}
