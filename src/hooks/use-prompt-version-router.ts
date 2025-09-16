import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Custom hook for managing prompt version selection via URL parameters
 * @param promptId The prompt ID from route parameters
 * @param searchParams Current URL search parameters
 * @returns Object with handleVersionSelect function for navigation
 */
export function usePromptVersionRouter(
  promptId: string,
  searchParams: ReadonlyURLSearchParams
) {
  const router = useRouter();

  const handleVersionSelect = useCallback(
    (versionId: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('version', versionId);
      router.push(
        `/prompts/${promptId}/versions?${newSearchParams.toString()}`
      );
    },
    [promptId, searchParams, router]
  );

  return { handleVersionSelect };
}
