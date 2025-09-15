import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import type { PromptWithVersions } from '@/types/prompt';

interface UsePromptVersionSelectionProps {
  prompt: PromptWithVersions | null;
  promptId: string;
}

/**
 * Custom hook for managing prompt version selection and URL state
 * Handles version selection from URL parameters and provides navigation helpers
 * @param props Configuration object containing prompt data and prompt ID
 * @param props.prompt Prompt data with versions, or null if not loaded
 * @param props.promptId ID of the current prompt
 * @returns Object containing selected version and navigation handlers
 */
export function usePromptVersionSelection({
  prompt,
  promptId,
}: UsePromptVersionSelectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedVersionId = searchParams.get('version');

  const selectedVersion = useMemo(() => {
    if (!prompt?.versions) return undefined;
    return (
      prompt.versions.find(v => v.id === selectedVersionId) ||
      prompt.versions[0]
    );
  }, [prompt?.versions, selectedVersionId]);

  const handleVersionSelect = (versionId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('version', versionId);
    router.push(`/prompts/${promptId}/versions?${newSearchParams.toString()}`);
  };

  return {
    selectedVersion,
    selectedVersionId,
    handleVersionSelect,
  };
}
