import type { Model } from '@prisma/client';
import type { StoreApi, UseBoundStore } from 'zustand';

import { createNamedCrudStore } from '@/lib/store-factory';

interface ModelCreateData {
  name: string;
  provider: string;
}

interface ModelUpdateData {
  name: string;
  provider: string;
}

interface ModelsState {
  models: Model[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  fetchModels: () => Promise<void>;
  createModel: (data: ModelCreateData) => Promise<Model>;
  updateModel: (id: string, data: ModelUpdateData) => Promise<Model>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

/**
 * Zustand store for managing models state
 * Uses generic CRUD store factory to reduce boilerplate
 */
export const useModelsStore = createNamedCrudStore<
  Model,
  ModelCreateData,
  ModelUpdateData
>({
  apiPath: '/api/models',
  itemsKey: 'models',
  fetchActionName: 'fetchModels',
  createActionName: 'createModel',
  updateActionName: 'updateModel',
}) as unknown as UseBoundStore<StoreApi<ModelsState>>;
