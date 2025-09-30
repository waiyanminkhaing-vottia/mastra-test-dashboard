import { create, StoreApi, UseBoundStore } from 'zustand';

import { apiGet, apiPost, apiPut } from '@/lib/api-client';

/**
 * Base state interface for CRUD stores
 */
interface BaseCrudState<T> {
  items: T[];
  loading: boolean;
  error: boolean;
  isCreating: boolean;
  isUpdating: boolean;
}

/**
 * Base actions interface for CRUD stores
 */
interface BaseCrudActions<T, CreateData, UpdateData> {
  fetch: () => Promise<void>;
  create: (data: CreateData) => Promise<T>;
  update: (id: string, data: UpdateData) => Promise<T>;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

type CrudStore<T, CreateData, UpdateData> = BaseCrudState<T> &
  BaseCrudActions<T, CreateData, UpdateData>;

/**
 * Configuration for creating a CRUD store
 */
interface CrudStoreConfig {
  /** API endpoint path (e.g., '/api/models') */
  apiPath: string;
  /** Name for the items array (e.g., 'models', 'prompts') */
  itemsKey: string;
}

/**
 * Creates a generic CRUD store with standard operations
 * Reduces duplication across different entity stores
 *
 * @param config Configuration for the store
 * @returns Zustand store hook with CRUD operations
 */
export function createCrudStore<
  T extends { id: string },
  CreateData = Partial<T>,
  UpdateData = Partial<T>,
>(
  config: CrudStoreConfig
): UseBoundStore<StoreApi<CrudStore<T, CreateData, UpdateData>>> {
  const { apiPath } = config;

  return create<CrudStore<T, CreateData, UpdateData>>(set => ({
    // Initial state
    items: [],
    loading: false,
    error: false,
    isCreating: false,
    isUpdating: false,

    // Basic setters
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: boolean) => set({ error }),

    // Fetch items
    fetch: async () => {
      set({ loading: true, error: false });
      try {
        const items = await apiGet<T[]>(apiPath);
        set({ items, loading: false });
      } catch {
        set({ error: true, loading: false });
      }
    },

    // Create item
    create: async (data: CreateData) => {
      set({ isCreating: true });
      try {
        const newItem = await apiPost<T>(apiPath, data);
        set(state => ({
          items: [newItem, ...state.items],
          isCreating: false,
        }));
        return newItem;
      } catch (error) {
        set({ isCreating: false });
        throw error; // Re-throw to allow component to handle specific errors
      }
    },

    // Update item
    update: async (id: string, data: UpdateData) => {
      set({ isUpdating: true });
      try {
        const updatedItem = await apiPut<T>(`${apiPath}/${id}`, data);
        set(state => ({
          items: state.items.map(item => (item.id === id ? updatedItem : item)),
          isUpdating: false,
        }));
        return updatedItem;
      } catch (error) {
        set({ isUpdating: false });
        throw error; // Re-throw to allow component to handle specific errors
      }
    },
  }));
}

/**
 * Extended store config for stores that need custom item names and actions
 */
interface ExtendedCrudStoreConfig extends CrudStoreConfig {
  /** Custom fetch function name (e.g., 'fetchModels') */
  fetchActionName?: string;
  /** Custom create function name (e.g., 'createModel') */
  createActionName?: string;
  /** Custom update function name (e.g., 'updateModel') */
  updateActionName?: string;
}

/**
 * Creates a CRUD store with custom action names for backward compatibility
 * Allows existing components to continue using specific function names
 */
export function createNamedCrudStore<
  T extends { id: string },
  CreateData = Partial<T>,
  UpdateData = Partial<T>,
>(
  config: ExtendedCrudStoreConfig
): UseBoundStore<StoreApi<Record<string, unknown>>> {
  // Create the base store first
  const baseStoreHook = createCrudStore<T, CreateData, UpdateData>(config);

  // If no custom names provided, return base store
  if (
    !config.fetchActionName &&
    !config.createActionName &&
    !config.updateActionName
  ) {
    return baseStoreHook as unknown as UseBoundStore<
      StoreApi<Record<string, unknown>>
    >;
  }

  // Create wrapper that renames actions for backward compatibility
  return create(set => {
    // Subscribe to base store changes
    let currentState = baseStoreHook.getState();

    baseStoreHook.subscribe(newState => {
      currentState = newState;
      set(() => createRenamedState(newState, config));
    });

    return createRenamedState(currentState, config);
  });
}

function createRenamedState<T, CreateData, UpdateData>(
  state: CrudStore<T, CreateData, UpdateData>,
  config: ExtendedCrudStoreConfig
) {
  const { fetch, create: createFn, update: updateFn, items, ...rest } = state;
  const renamedStore: Record<string, unknown> = { ...rest };

  // Rename actions if custom names provided
  if (config.fetchActionName) {
    renamedStore[config.fetchActionName] = fetch;
  } else {
    renamedStore.fetch = fetch;
  }

  if (config.createActionName) {
    renamedStore[config.createActionName] = createFn;
  } else {
    renamedStore.create = createFn;
  }

  if (config.updateActionName) {
    renamedStore[config.updateActionName] = updateFn;
  } else {
    renamedStore.update = updateFn;
  }

  // Rename items array if custom name provided
  if (config.itemsKey && config.itemsKey !== 'items') {
    renamedStore[config.itemsKey] = items;
  } else {
    renamedStore.items = items;
  }

  return renamedStore;
}
