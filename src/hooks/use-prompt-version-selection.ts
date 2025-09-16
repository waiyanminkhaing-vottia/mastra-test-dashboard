import { useMemo } from 'react';

import type { PromptVersionWithLabel } from '@/types/prompt';

/**
 * Custom hook for managing prompt version selection logic
 * @param versions Array of prompt versions
 * @param selectedVersionId ID of the currently selected version from URL params
 * @returns Selected version object (first version if none selected, undefined if no versions)
 */
export function usePromptVersionSelection(
  versions: PromptVersionWithLabel[] | undefined,
  selectedVersionId: string | null
) {
  return useMemo(() => {
    if (!versions || versions.length === 0) return undefined;

    // Find specific version or default to first version
    return (
      versions.find(version => version.id === selectedVersionId) || versions[0]
    );
  }, [versions, selectedVersionId]);
}
