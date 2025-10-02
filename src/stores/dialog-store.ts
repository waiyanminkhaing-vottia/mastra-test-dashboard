import type { Mcp, Model, Prompt, Tool } from '@prisma/client';
import { create } from 'zustand';

/**
 * Dialog type constants to avoid string duplication
 * Used throughout the application to maintain consistent dialog type references
 */
export const DIALOG_TYPES = {
  MODEL_CREATE: 'model-create',
  MODEL_EDIT: 'model-edit',
  PROMPT_CREATE: 'prompt-create',
  PROMPT_EDIT: 'prompt-edit',
  PROMPT_LABEL_CHANGE: 'prompt-label-change',
  MCP_CREATE: 'mcp-create',
  MCP_EDIT: 'mcp-edit',
  TOOL_CREATE: 'tool-create',
  TOOL_EDIT: 'tool-edit',
} as const;

type DialogType =
  | typeof DIALOG_TYPES.MODEL_CREATE
  | typeof DIALOG_TYPES.MODEL_EDIT
  | typeof DIALOG_TYPES.PROMPT_CREATE
  | typeof DIALOG_TYPES.PROMPT_EDIT
  | typeof DIALOG_TYPES.PROMPT_LABEL_CHANGE
  | typeof DIALOG_TYPES.MCP_CREATE
  | typeof DIALOG_TYPES.MCP_EDIT
  | typeof DIALOG_TYPES.TOOL_CREATE
  | typeof DIALOG_TYPES.TOOL_EDIT
  | null;

interface DialogData {
  [DIALOG_TYPES.MODEL_CREATE]: undefined;
  [DIALOG_TYPES.MODEL_EDIT]: Model;
  [DIALOG_TYPES.PROMPT_CREATE]: undefined;
  [DIALOG_TYPES.PROMPT_EDIT]: Prompt;
  [DIALOG_TYPES.PROMPT_LABEL_CHANGE]: {
    versionId: string;
    currentLabelId?: string;
    currentLabelName?: string;
  };
  [DIALOG_TYPES.MCP_CREATE]: undefined;
  [DIALOG_TYPES.MCP_EDIT]: Mcp;
  [DIALOG_TYPES.TOOL_CREATE]: undefined;
  [DIALOG_TYPES.TOOL_EDIT]: Tool;
  null: undefined;
}

interface DialogState {
  activeDialog: DialogType;
  dialogData: Record<string, unknown> | undefined; // Use generic object to avoid index type issues
  isOpen: boolean;
}

interface DialogActions {
  openDialog: <T extends Exclude<DialogType, null>>(
    type: T,
    data?: DialogData[T]
  ) => void;
  closeDialog: () => void;
  closeAll: () => void;
  setDialogData: <T extends Exclude<DialogType, null>>(
    type: T,
    data: DialogData[T]
  ) => void;
}

type DialogStore = DialogState & DialogActions;

/**
 * Zustand store for managing dialog states across the application
 * Prevents multiple dialogs from being open simultaneously
 */
export const useDialogStore = create<DialogStore>(set => ({
  activeDialog: null,
  dialogData: undefined,
  isOpen: false,

  openDialog: (type, data) => {
    set({
      activeDialog: type,
      dialogData: data,
      isOpen: true,
    });
  },

  closeDialog: () => {
    set({
      activeDialog: null,
      dialogData: undefined,
      isOpen: false,
    });
  },

  closeAll: () => {
    set({
      activeDialog: null,
      dialogData: undefined,
      isOpen: false,
    });
  },

  setDialogData: (type, data) => {
    set(state => ({
      ...state,
      dialogData: state.activeDialog === type ? data : state.dialogData,
    }));
  },
}));

// Convenience hooks for specific dialog types
/**
 * Hook for managing model-specific dialogs
 */
export const useModelDialog = () => {
  const { activeDialog, dialogData, openDialog, closeDialog } =
    useDialogStore();

  return {
    isCreateOpen: activeDialog === DIALOG_TYPES.MODEL_CREATE,
    isEditOpen: activeDialog === DIALOG_TYPES.MODEL_EDIT,
    editingModel:
      activeDialog === DIALOG_TYPES.MODEL_EDIT ? (dialogData as Model) : null,
    openCreate: () => openDialog(DIALOG_TYPES.MODEL_CREATE),
    openEdit: (model: Model) => openDialog(DIALOG_TYPES.MODEL_EDIT, model),
    close: closeDialog,
  };
};

/**
 * Hook for managing prompt-specific dialogs
 */
export const usePromptDialog = () => {
  const { activeDialog, dialogData, openDialog, closeDialog } =
    useDialogStore();

  return {
    isCreateOpen: activeDialog === DIALOG_TYPES.PROMPT_CREATE,
    isEditOpen: activeDialog === DIALOG_TYPES.PROMPT_EDIT,
    editingPrompt:
      activeDialog === DIALOG_TYPES.PROMPT_EDIT ? (dialogData as Prompt) : null,
    openCreate: () => openDialog(DIALOG_TYPES.PROMPT_CREATE),
    openEdit: (prompt: Prompt) => openDialog(DIALOG_TYPES.PROMPT_EDIT, prompt),
    close: closeDialog,
  };
};

/**
 * Hook for managing prompt label change dialogs
 */
export const usePromptLabelChangeDialog = () => {
  const { activeDialog, dialogData, openDialog, closeDialog } =
    useDialogStore();

  return {
    isOpen: activeDialog === DIALOG_TYPES.PROMPT_LABEL_CHANGE,
    data:
      activeDialog === DIALOG_TYPES.PROMPT_LABEL_CHANGE
        ? (dialogData as DialogData[typeof DIALOG_TYPES.PROMPT_LABEL_CHANGE])
        : null,
    open: (data: DialogData[typeof DIALOG_TYPES.PROMPT_LABEL_CHANGE]) =>
      openDialog(DIALOG_TYPES.PROMPT_LABEL_CHANGE, data),
    close: closeDialog,
  };
};

/**
 * Hook for managing MCP-specific dialogs
 */
export const useMcpDialog = () => {
  const { activeDialog, dialogData, openDialog, closeDialog } =
    useDialogStore();

  return {
    isCreateOpen: activeDialog === DIALOG_TYPES.MCP_CREATE,
    isEditOpen: activeDialog === DIALOG_TYPES.MCP_EDIT,
    editingMcp:
      activeDialog === DIALOG_TYPES.MCP_EDIT ? (dialogData as Mcp) : null,
    openCreate: () => openDialog(DIALOG_TYPES.MCP_CREATE),
    openEdit: (mcp: Mcp) => openDialog(DIALOG_TYPES.MCP_EDIT, mcp),
    close: closeDialog,
  };
};

/**
 * Hook for managing Tool-specific dialogs
 */
export const useToolDialog = () => {
  const { activeDialog, dialogData, openDialog, closeDialog } =
    useDialogStore();

  return {
    isCreateOpen: activeDialog === DIALOG_TYPES.TOOL_CREATE,
    isEditOpen: activeDialog === DIALOG_TYPES.TOOL_EDIT,
    editingTool:
      activeDialog === DIALOG_TYPES.TOOL_EDIT ? (dialogData as Tool) : null,
    openCreate: () => openDialog(DIALOG_TYPES.TOOL_CREATE),
    openEdit: (tool: Tool) => openDialog(DIALOG_TYPES.TOOL_EDIT, tool),
    close: closeDialog,
  };
};
