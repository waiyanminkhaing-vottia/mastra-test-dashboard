import type { Model } from '@prisma/client';
import { create } from 'zustand';

import { apiGet, apiPost, apiPut } from '@/lib/api-client';

interface ModelsState {
  models: Model[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
}

interface ModelsActions {
  fetchModels: () => Promise<void>;
  createModel: (data: { name: string; provider: string }) => Promise<Model>;
  updateModel: (
    id: string,
    data: { name: string; provider: string }
  ) => Promise<Model>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

type ModelsStore = ModelsState & ModelsActions;

/**
 * Zustand store for managing models state
 */
export const useModelsStore = create<ModelsStore>(set => ({
  models: [],
  loading: false,
  error: false,
  isCreating: false,
  isUpdating: false,

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: boolean) => set({ error }),

  fetchModels: async () => {
    set({ loading: true, error: false });
    try {
      const models = await apiGet<Model[]>('/api/models');
      set({ models, loading: false });
    } catch {
      set({ error: true, loading: false });
    }
  },

  createModel: async (data: { name: string; provider: string }) => {
    set({ isCreating: true });
    try {
      const newModel = await apiPost<Model>('/api/models', data);
      set(state => ({
        models: [newModel, ...state.models],
        isCreating: false,
      }));
      return newModel;
    } catch (error) {
      set({ isCreating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },

  updateModel: async (id: string, data: { name: string; provider: string }) => {
    set({ isUpdating: true });
    try {
      const updatedModel = await apiPut<Model>(`/api/models/${id}`, data);
      set(state => ({
        models: state.models.map(model =>
          model.id === id ? updatedModel : model
        ),
        isUpdating: false,
      }));
      return updatedModel;
    } catch (error) {
      set({ isUpdating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },
}));
