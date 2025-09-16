import { create } from 'zustand';

// UI state management - simplified to only used features
interface UIState {
  // Prompt version label change dialog state
  pendingLabelChange: {
    labelId: string;
    labelName: string;
  } | null;
  isUpdatingLabel: boolean;
}

interface UIActions {
  // Prompt version label change dialog
  setPendingLabelChange: (
    change: { labelId: string; labelName: string } | null
  ) => void;
  setIsUpdatingLabel: (updating: boolean) => void;
}

type UIStore = UIState & UIActions;

/**
 * Zustand store for managing UI state - simplified to only used features
 */
export const useUIStore = create<UIStore>(set => ({
  // State
  pendingLabelChange: null,
  isUpdatingLabel: false,

  // Prompt version label change dialog actions
  setPendingLabelChange: (
    change: { labelId: string; labelName: string } | null
  ) => {
    set({ pendingLabelChange: change });
  },

  setIsUpdatingLabel: (updating: boolean) => {
    set({ isUpdatingLabel: updating });
  },
}));
