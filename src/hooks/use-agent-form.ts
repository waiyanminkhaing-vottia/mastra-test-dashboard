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
 */
export function useAgentForm(agent?: AgentWithRelations | null) {
  const { t } = useLanguage();
  const { createAgent, updateAgent, isCreating, isUpdating } = useAgentsStore();
  const { models, fetchModels } = useModelsStore();
  const { prompts, fetchPrompts } = usePromptsStore();
  const { fetchLabels: fetchPromptLabels } = usePromptLabelsStore();

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

  // Data fetching
  useEffect(() => {
    fetchModels();
    fetchPrompts();
    fetchPromptLabels();
  }, [fetchModels, fetchPrompts, fetchPromptLabels]);

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
