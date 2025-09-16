'use client';

import type { Provider } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AgentBasicInfo } from '@/components/dashboard/agents/agent-basic-info';
import { AgentConfigEditor } from '@/components/dashboard/agents/agent-config-editor';
import { AgentPromptSection } from '@/components/dashboard/agents/agent-prompt-section';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { validateClientSide } from '@/lib/validation-utils';
import { agentSchema } from '@/lib/validations/agent';
import { useAgentsStore } from '@/stores/agents-store';
import { useModelsStore } from '@/stores/models-store';
import { usePromptLabelsStore } from '@/stores/prompt-labels-store';
import { usePromptsStore } from '@/stores/prompts-store';
import type { AgentWithRelations } from '@/types/agent';
import type { LLMConfig } from '@/types/config';

interface AgentFormProps {
  agent?: AgentWithRelations | null;
  onSuccess: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

/**
 * Shared agent form component for creating and editing agents
 * @param props Component properties
 * @param props.agent Optional agent object for editing existing agents
 * @param props.onSuccess Callback function called when agent is successfully created or updated
 * @param props.onCancel Callback function called when form is cancelled
 * @param props.isEditing Whether the form is in editing mode
 * @returns JSX element containing the agent form
 */
export function AgentForm({
  agent,
  onSuccess,
  onCancel,
  isEditing = false,
}: AgentFormProps) {
  const { t } = useLanguage();
  const { createAgent, updateAgent, isCreating, isUpdating } = useAgentsStore();
  const { models, fetchModels } = useModelsStore();
  const { prompts, fetchPrompts } = usePromptsStore();
  const { fetchLabels: fetchPromptLabels } = usePromptLabelsStore();

  const [name, setName] = useState('');
  const [provider, setProvider] = useState<Provider | ''>('');
  const [modelId, setModelId] = useState('');
  const [promptId, setPromptId] = useState('');
  const [labelId, setLabelId] = useState('');
  const [config, setConfig] = useState<LLMConfig>({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  });
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const handleFormError = useFormErrorHandler(t, setErrors, setGeneralError);
  const loading = isCreating || isUpdating;

  // Filter models based on selected provider
  const filteredModels = provider
    ? models?.filter(model => model.provider === provider)
    : [];

  // Filter labels based on selected prompt
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

  // Fetch required data when component mounts
  useEffect(() => {
    fetchModels();
    fetchPrompts();
    fetchPromptLabels();
  }, [fetchModels, fetchPrompts, fetchPromptLabels]);

  // Reset form when agent changes
  useEffect(() => {
    if (agent && models && prompts) {
      // Edit mode: populate with existing data
      setName(agent.name);
      setProvider(agent.model.provider);
      setModelId(agent.modelId);
      setPromptId(agent.promptId);
      setLabelId(agent.labelId || 'none');
      const hasConfig = agent.config && Object.keys(agent.config).length > 0;
      setUseCustomConfig(Boolean(hasConfig));
      setConfig(
        (agent.config as LLMConfig) || {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        }
      );
    } else if (!agent) {
      // Add mode: clear form
      setName('');
      setProvider('');
      setModelId('');
      setPromptId('');
      setLabelId('none');
      setUseCustomConfig(false);
      setConfig({
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [agent, models, prompts]);

  // Reset model selection when provider changes
  useEffect(() => {
    if (modelId && provider) {
      const selectedModel = models?.find(model => model.id === modelId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Client-side validation with common utility
    const validation = validateClientSide(agentSchema(t), {
      name: name.trim(),
      modelId,
      promptId,
      labelId: labelId && labelId !== 'none' ? labelId : undefined,
      config: useCustomConfig ? config : isEditing ? null : undefined,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (isEditing && agent) {
        await updateAgent(agent.id, validation.data);
      } else {
        await createAgent(validation.data);
      }

      onSuccess();
    } catch (error: unknown) {
      handleFormError(error, {
        conflictErrorKey: 'agents.errors.agentAlreadyExists',
      });
    }
  };

  return (
    <>
      {generalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {t(generalError)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-8">
        <AgentBasicInfo
          name={name}
          onNameChange={setName}
          provider={provider}
          onProviderChange={setProvider}
          modelId={modelId}
          onModelChange={setModelId}
          filteredModels={filteredModels}
          errors={errors}
        />

        <AgentPromptSection
          promptId={promptId}
          onPromptChange={setPromptId}
          labelId={labelId}
          onLabelChange={setLabelId}
          prompts={prompts}
          filteredLabels={filteredLabels}
          errors={errors}
        />

        <AgentConfigEditor
          useCustomConfig={useCustomConfig}
          onUseCustomConfigChange={setUseCustomConfig}
          config={config}
          onConfigChange={setConfig}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            {t('agents.form.cancelButton')}
          </Button>
          <Button
            type="submit"
            disabled={
              loading || !name.trim() || !provider || !modelId || !promptId
            }
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? isEditing
                ? t('agents.form.updatingButton')
                : t('agents.form.creatingButton')
              : isEditing
                ? t('agents.form.updateButton')
                : t('agents.form.createButton')}
          </Button>
        </div>
      </form>
    </>
  );
}
