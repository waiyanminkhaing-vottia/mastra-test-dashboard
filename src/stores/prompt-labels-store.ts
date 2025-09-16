import type { PromptLabel } from '@prisma/client';
import { create } from 'zustand';

import { apiGet, apiPost, apiPut } from '@/lib/api-client';

interface PromptLabelsState {
  labels: PromptLabel[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
}

interface PromptLabelsActions {
  fetchLabels: () => Promise<void>;
  createLabel: (name: string) => Promise<PromptLabel>;
  updateLabel: (id: string, name: string) => Promise<PromptLabel>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

type PromptLabelsStore = PromptLabelsState & PromptLabelsActions;

/**
 * Zustand store for managing prompt labels state
 */
export const usePromptLabelsStore = create<PromptLabelsStore>(set => ({
  labels: [],
  loading: false,
  error: false,
  isCreating: false,
  isUpdating: false,

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: boolean) => set({ error }),

  fetchLabels: async () => {
    set({ loading: true, error: false });
    try {
      const labels = await apiGet<PromptLabel[]>('/api/prompt-labels');
      const sortedLabels = labels.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      set({ labels: sortedLabels, loading: false });
    } catch {
      set({ error: true, loading: false });
    }
  },

  createLabel: async (name: string) => {
    set({ isCreating: true });
    try {
      const newLabel = await apiPost<PromptLabel>('/api/prompt-labels', {
        name,
      });
      set(state => ({
        labels: [...state.labels, newLabel].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
        isCreating: false,
      }));
      return newLabel;
    } catch (error) {
      set({ isCreating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },

  updateLabel: async (id: string, name: string) => {
    set({ isUpdating: true });
    try {
      const updatedLabel = await apiPut<PromptLabel>(
        `/api/prompt-labels/${id}`,
        { name }
      );
      set(state => ({
        labels: state.labels
          .map(label => (label.id === id ? updatedLabel : label))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        isUpdating: false,
      }));
      return updatedLabel;
    } catch (error) {
      set({ isUpdating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },
}));
