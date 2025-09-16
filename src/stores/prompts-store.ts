import { create } from 'zustand';

import { ApiError, apiGet, apiPost, apiPut } from '@/lib/api-client';
import type {
  PromptVersionWithLabel,
  PromptWithVersions,
} from '@/types/prompt';

// API endpoints to avoid duplication
const API_ENDPOINTS = {
  PROMPTS: '/api/prompts',
  PROMPT_VERSIONS: '/api/prompt-versions',
} as const;

interface PromptsState {
  prompts: PromptWithVersions[];
  currentPrompt: PromptWithVersions | null;
  loading: boolean;
  currentPromptLoading: boolean;
  error: boolean;
  currentPromptError: boolean;
  currentPromptErrorStatus: number | null;
  isCreating: boolean;
  isUpdating: boolean;
}

interface PromptsActions {
  fetchPrompts: () => Promise<void>;
  fetchPromptById: (id: string) => Promise<void>;
  createPrompt: (data: {
    name: string;
    description?: string;
    content: string;
    promptLabelId?: string;
  }) => Promise<PromptWithVersions>;
  updatePrompt: (
    id: string,
    data: { name: string; description?: string }
  ) => Promise<PromptWithVersions>;
  updatePromptVersionLabel: (
    versionId: string,
    labelId: string
  ) => Promise<boolean>;
  updateCurrentPrompt: (prompt: PromptWithVersions) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

type PromptsStore = PromptsState & PromptsActions;

/**
 * Zustand store for managing prompts state
 */
export const usePromptsStore = create<PromptsStore>(set => ({
  prompts: [],
  currentPrompt: null,
  loading: false,
  currentPromptLoading: false,
  error: false,
  currentPromptError: false,
  currentPromptErrorStatus: null,
  isCreating: false,
  isUpdating: false,

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: boolean) => set({ error }),
  updateCurrentPrompt: (prompt: PromptWithVersions) =>
    set({ currentPrompt: prompt }),

  fetchPrompts: async () => {
    set({ loading: true, error: false });
    try {
      const prompts = await apiGet<PromptWithVersions[]>(API_ENDPOINTS.PROMPTS);
      set({ prompts, loading: false });
    } catch {
      set({ error: true, loading: false });
    }
  },

  fetchPromptById: async (id: string) => {
    set({
      currentPromptLoading: true,
      currentPromptError: false,
      currentPromptErrorStatus: null,
    });
    try {
      const prompt = await apiGet<PromptWithVersions>(
        `${API_ENDPOINTS.PROMPTS}/${id}`
      );
      set({
        currentPrompt: prompt,
        currentPromptLoading: false,
      });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      set({
        currentPromptError: true,
        currentPromptLoading: false,
        currentPromptErrorStatus: status,
      });
    }
  },

  createPrompt: async (data: {
    name: string;
    description?: string;
    content: string;
    promptLabelId?: string;
  }) => {
    set({ isCreating: true });
    try {
      const newPrompt = await apiPost<PromptWithVersions>(
        API_ENDPOINTS.PROMPTS,
        data
      );
      // Add the new prompt to the existing prompts list
      set(state => ({
        prompts: [newPrompt, ...state.prompts],
        isCreating: false,
      }));
      return newPrompt;
    } catch (error) {
      set({ isCreating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },

  updatePrompt: async (
    id: string,
    data: { name: string; description?: string }
  ) => {
    set({ isUpdating: true });
    try {
      const updatedPrompt = await apiPut<PromptWithVersions>(
        `${API_ENDPOINTS.PROMPTS}/${id}`,
        data
      );
      // Update the prompt in the existing prompts list
      set(state => ({
        prompts: state.prompts.map(prompt =>
          prompt.id === id ? updatedPrompt : prompt
        ),
        isUpdating: false,
      }));
      return updatedPrompt;
    } catch (error) {
      set({ isUpdating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },

  updatePromptVersionLabel: async (versionId: string, labelId: string) => {
    try {
      const updatedVersion = await apiPut<PromptVersionWithLabel>(
        `${API_ENDPOINTS.PROMPT_VERSIONS}/${versionId}`,
        { labelId }
      );

      // Update the current prompt in store if it contains this version
      set(state => {
        if (state.currentPrompt) {
          const updatedPrompt = {
            ...state.currentPrompt,
            versions: state.currentPrompt.versions.map(version =>
              version.id === versionId
                ? {
                    ...version,
                    label: updatedVersion.label,
                    labelId: updatedVersion.labelId,
                  }
                : version
            ),
          };
          return { currentPrompt: updatedPrompt };
        }
        return state;
      });

      return true;
    } catch {
      return false;
    }
  },
}));
