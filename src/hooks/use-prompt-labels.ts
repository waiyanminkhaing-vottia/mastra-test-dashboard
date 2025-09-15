/**
 * Custom hook for managing prompt labels data and operations
 * Handles fetching, creating, updating, and deleting prompt labels
 */
import type { PromptLabel } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

import { apiGet, apiPost, apiPut } from '@/lib/api-client';

export interface UsePromptLabelsReturn {
  /** Array of prompt labels */
  promptLabels: PromptLabel[];
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error state for fetch operations */
  fetchError: boolean;
  /** Loading state for create operations */
  isCreating: boolean;
  /** Loading state for update operations */
  isUpdating: boolean;
  /** Refetch prompt labels from API */
  refetch: () => Promise<void>;
  /** Create a new prompt label */
  createLabel: (name: string) => Promise<PromptLabel | null>;
  /** Update an existing prompt label */
  updateLabel: (id: string, name: string) => Promise<PromptLabel | null>;
}

/**
 * Hook for managing prompt labels with CRUD operations
 * @returns Object with labels data and management functions
 */
export function usePromptLabels(): UsePromptLabelsReturn {
  const [promptLabels, setPromptLabels] = useState<PromptLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPromptLabels = useCallback(async () => {
    try {
      setFetchError(false);
      const data = await apiGet<PromptLabel[]>('/api/prompt-labels');
      setPromptLabels(data);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchPromptLabels();
  }, [fetchPromptLabels]);

  const createLabel = useCallback(
    async (name: string): Promise<PromptLabel | null> => {
      setIsCreating(true);
      try {
        const newLabel = await apiPost<PromptLabel>('/api/prompt-labels', {
          name,
        });
        setPromptLabels(prev => [...prev, newLabel]);
        return newLabel;
      } catch {
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateLabel = useCallback(
    async (id: string, name: string): Promise<PromptLabel | null> => {
      setIsUpdating(true);
      try {
        const updatedLabel = await apiPut<PromptLabel>(
          `/api/prompt-labels/${id}`,
          { name }
        );
        setPromptLabels(prev =>
          prev.map(label => (label.id === id ? updatedLabel : label))
        );
        return updatedLabel;
      } catch {
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPromptLabels();
  }, [fetchPromptLabels]);

  return {
    promptLabels,
    loading,
    fetchError,
    isCreating,
    isUpdating,
    refetch,
    createLabel,
    updateLabel,
  };
}
