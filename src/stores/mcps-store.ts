import { create } from 'zustand';

import { apiGet } from '@/lib/api-client';
import { createNamedCrudStore } from '@/lib/store-factory';
import type { McpWithRelations } from '@/types/mcp';

interface McpCreateData {
  name: string;
  url: string;
}

interface McpUpdateData {
  name: string;
  url: string;
}

interface McpState {
  mcps: McpWithRelations[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  fetchMcps: () => Promise<void>;
  createMcp: (data: McpCreateData) => Promise<McpWithRelations>;
  updateMcp: (id: string, data: McpUpdateData) => Promise<McpWithRelations>;
  fetchMcp: (id: string) => Promise<McpWithRelations>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

// Create base CRUD store
const baseMcpsStore = createNamedCrudStore<
  McpWithRelations,
  McpCreateData,
  McpUpdateData
>({
  apiPath: '/api/mcps',
  itemsKey: 'mcps',
  fetchActionName: 'fetchMcps',
  createActionName: 'createMcp',
  updateActionName: 'updateMcp',
});

/**
 * Zustand store for managing MCPs state
 * Extended with custom fetchMcp method for individual item fetching
 */
export const useMcpsStore = create<McpState>((set, _get) => {
  const baseStore = baseMcpsStore.getState();

  // Subscribe to base store changes
  baseMcpsStore.subscribe(state => {
    set({
      mcps: state.mcps as McpWithRelations[],
      loading: state.loading as boolean,
      error: state.error as boolean,
      isCreating: state.isCreating as boolean,
      isUpdating: state.isUpdating as boolean,
    });
  });

  return {
    mcps: [],
    loading: false,
    error: false,
    isCreating: false,
    isUpdating: false,
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: boolean) => set({ error }),
    fetchMcps: baseStore.fetchMcps as () => Promise<void>,
    createMcp: baseStore.createMcp as (
      data: McpCreateData
    ) => Promise<McpWithRelations>,
    updateMcp: baseStore.updateMcp as (
      id: string,
      data: McpUpdateData
    ) => Promise<McpWithRelations>,

    // Custom method for fetching individual MCP
    fetchMcp: async (id: string) => {
      set({ loading: true, error: false });
      try {
        const mcp = await apiGet<McpWithRelations>(`/api/mcps/${id}`);
        set({ loading: false });
        return mcp;
      } catch (error) {
        set({ error: true, loading: false });
        throw error;
      }
    },
  };
});
