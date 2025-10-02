import type { Tool } from '@prisma/client';
import type { StoreApi, UseBoundStore } from 'zustand';

import { createNamedCrudStore } from '@/lib/store-factory';

interface ToolCreateData {
  name: string;
  description?: string;
  config?: Record<string, unknown>;
}

interface ToolUpdateData {
  name: string;
  description?: string;
  config?: Record<string, unknown>;
}

interface ToolsState {
  tools: Tool[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  fetchTools: () => Promise<void>;
  createTool: (data: ToolCreateData) => Promise<Tool>;
  updateTool: (id: string, data: ToolUpdateData) => Promise<Tool>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

/**
 * Zustand store for managing tools state
 * Uses generic CRUD store factory to reduce boilerplate
 */
export const useToolsStore = createNamedCrudStore<
  Tool,
  ToolCreateData,
  ToolUpdateData
>({
  apiPath: '/api/tools',
  itemsKey: 'tools',
  fetchActionName: 'fetchTools',
  createActionName: 'createTool',
  updateActionName: 'updateTool',
}) as unknown as UseBoundStore<StoreApi<ToolsState>>;
