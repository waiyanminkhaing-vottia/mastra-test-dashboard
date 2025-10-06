import type { Provider } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';

import { useLanguage } from '@/contexts/language-context';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useAgentsStore } from '@/stores/agents-store';
import { useModelsStore } from '@/stores/models-store';
import { usePromptLabelsStore } from '@/stores/prompt-labels-store';
import { usePromptsStore } from '@/stores/prompts-store';
import type { AgentWithRelations } from '@/types/agent';
import type { LLMConfig } from '@/types/config';

const DEFAULT_CONFIG: LLMConfig = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

/**
 * Custom hook for managing agent form state and logic
 * Uses selective Zustand subscriptions to prevent unnecessary re-renders
 */
export function useAgentForm(agent?: AgentWithRelations | null) {
  const { t } = useLanguage();

  // Selective store subscriptions to avoid unnecessary re-renders
  const createAgent = useAgentsStore(state => state.createAgent);
  const updateAgent = useAgentsStore(state => state.updateAgent);
  const isCreating = useAgentsStore(state => state.isCreating);
  const isUpdating = useAgentsStore(state => state.isUpdating);

  const models = useModelsStore(state => state.models);
  const fetchModels = useModelsStore(state => state.fetchModels);

  const prompts = usePromptsStore(state => state.prompts);
  const fetchPrompts = usePromptsStore(state => state.fetchPrompts);

  const fetchPromptLabels = usePromptLabelsStore(state => state.fetchLabels);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState<Provider | ''>('');
  const [modelId, setModelId] = useState('');
  const [promptId, setPromptId] = useState('');
  const [labelId, setLabelId] = useState('');
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [selectedMcpTools, setSelectedMcpTools] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedSubAgents, setSelectedSubAgents] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleFormError = useFormErrorHandler(t, setErrors, setGeneralError);
  const loading = isCreating || isUpdating;

  // Derived state
  const filteredModels = useMemo(() => {
    return provider
      ? models?.filter(
          (model: { provider: Provider }) => model.provider === provider
        )
      : [];
  }, [provider, models]);

  const filteredLabels = useMemo(() => {
    if (!promptId) return [];

    const selectedPrompt = prompts?.find(prompt => prompt.id === promptId);
    if (!selectedPrompt?.versions) return [];

    // Get unique labels from all versions of the selected prompt
    const uniqueLabels = new Map();
    selectedPrompt.versions.forEach(version => {
      if (version.label) {
        uniqueLabels.set(version.label.id, version.label);
      }
    });

    return Array.from(uniqueLabels.values());
  }, [promptId, prompts]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchModels();
    fetchPrompts();
    fetchPromptLabels();
    // Zustand functions are stable, don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form initialization
  useEffect(() => {
    if (agent && models && prompts) {
      // Edit mode: populate with existing data
      setName(agent.name);
      setDescription(agent.description || '');
      setProvider(agent.model.provider);
      setModelId(agent.modelId);
      setPromptId(agent.promptId);
      setLabelId(agent.labelId || 'none');
      const hasConfig = agent.config && Object.keys(agent.config).length > 0;
      setUseCustomConfig(Boolean(hasConfig));
      setConfig((agent.config as LLMConfig) || DEFAULT_CONFIG);

      // Parse and set selected MCP tools from agent data
      const mcpToolIds =
        agent.mcpTools?.map(
          agentMcpTool => `${agentMcpTool.mcpId}:${agentMcpTool.toolName}`
        ) || [];
      setSelectedMcpTools(mcpToolIds);

      // Parse and set selected tools from agent data
      const toolIds = agent.tools?.map(agentTool => agentTool.toolId) || [];
      setSelectedTools(toolIds);

      // Parse and set selected sub-agents from agent data
      const subAgentIds = agent.subAgents?.map(subAgent => subAgent.id) || [];
      setSelectedSubAgents(subAgentIds);
    } else if (!agent) {
      // Add mode: clear form
      setName('');
      setDescription('');
      setProvider('');
      setModelId('');
      setPromptId('');
      setLabelId('none');
      setUseCustomConfig(false);
      setSelectedMcpTools([]);
      setSelectedTools([]);
      setSelectedSubAgents([]);
      setConfig(DEFAULT_CONFIG);
    }
    setErrors({});
    setGeneralError(null);
  }, [agent, models, prompts]);

  // Reset model selection when provider changes
  useEffect(() => {
    if (modelId && provider) {
      const selectedModel = models?.find(
        (model: { id: string; provider: Provider }) => model.id === modelId
      );
      if (selectedModel && selectedModel.provider !== provider) {
        setModelId('');
      }
    }
  }, [provider, models, modelId]);

  // Reset label selection when prompt changes
  useEffect(() => {
    if (labelId && labelId !== 'none' && promptId) {
      const isLabelAvailable = filteredLabels.some(
        label => label.id === labelId
      );
      if (!isLabelAvailable) {
        setLabelId('none');
      }
    }
  }, [promptId, labelId, filteredLabels]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setProvider('');
    setModelId('');
    setPromptId('');
    setLabelId('none');
    setUseCustomConfig(false);
    setSelectedMcpTools([]);
    setSelectedTools([]);
    setSelectedSubAgents([]);
    setConfig(DEFAULT_CONFIG);
    setErrors({});
    setGeneralError(null);
  };

  return {
    // State
    name,
    setName,
    description,
    setDescription,
    provider,
    setProvider,
    modelId,
    setModelId,
    promptId,
    setPromptId,
    labelId,
    setLabelId,
    config,
    setConfig,
    useCustomConfig,
    setUseCustomConfig,
    selectedMcpTools,
    setSelectedMcpTools,
    selectedTools,
    setSelectedTools,
    selectedSubAgents,
    setSelectedSubAgents,
    errors,
    setErrors,
    generalError,
    setGeneralError,
    loading,

    // Derived state
    filteredModels,
    filteredLabels,

    // Store data
    models,
    prompts,

    // Actions
    createAgent,
    updateAgent,
    handleFormError,
    resetForm,
  };
}
