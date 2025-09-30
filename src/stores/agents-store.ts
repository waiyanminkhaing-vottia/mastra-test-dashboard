import { create } from 'zustand';

import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import type { AgentWithRelations } from '@/types/agent';

interface AgentsState {
  agents: AgentWithRelations[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
}

interface AgentsActions {
  fetchAgents: () => Promise<void>;
  fetchAgent: (id: string) => Promise<AgentWithRelations>;
  createAgent: (data: {
    name: string;
    description?: string;
    modelId: string;
    promptId: string;
    labelId?: string;
    config?: Record<string, unknown> | null;
    mcpTools?: string[];
  }) => Promise<AgentWithRelations>;
  updateAgent: (
    id: string,
    data: {
      name: string;
      description?: string;
      modelId: string;
      promptId: string;
      labelId?: string;
      config?: Record<string, unknown> | null;
      mcpTools?: string[];
    }
  ) => Promise<AgentWithRelations>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

type AgentsStore = AgentsState & AgentsActions;

/**
 * Zustand store for managing agents state
 */
export const useAgentsStore = create<AgentsStore>(set => ({
  agents: [],
  loading: false,
  error: false,
  isCreating: false,
  isUpdating: false,

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: boolean) => set({ error }),

  fetchAgents: async () => {
    set({ loading: true, error: false });
    try {
      const agents = await apiGet<AgentWithRelations[]>('/api/agents');
      set({ agents, loading: false });
    } catch {
      set({ error: true, loading: false });
    }
  },

  fetchAgent: async (id: string) => {
    set({ loading: true, error: false });
    try {
      const agent = await apiGet<AgentWithRelations>(`/api/agents/${id}`);
      set({ loading: false });
      return agent;
    } catch (error) {
      set({ error: true, loading: false });
      throw error;
    }
  },

  createAgent: async data => {
    set({ isCreating: true });
    try {
      const newAgent = await apiPost<AgentWithRelations>('/api/agents', data);
      set(state => ({
        agents: [newAgent, ...state.agents],
        isCreating: false,
      }));
      return newAgent;
    } catch (error) {
      set({ isCreating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },

  updateAgent: async (id: string, data) => {
    set({ isUpdating: true });
    try {
      const updatedAgent = await apiPut<AgentWithRelations>(
        `/api/agents/${id}`,
        data
      );
      set(state => ({
        agents: state.agents.map(agent =>
          agent.id === id ? updatedAgent : agent
        ),
        isUpdating: false,
      }));
      return updatedAgent;
    } catch (error) {
      set({ isUpdating: false });
      throw error; // Re-throw to allow dialog to handle specific errors
    }
  },
}));
