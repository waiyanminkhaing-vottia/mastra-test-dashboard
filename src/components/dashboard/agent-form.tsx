'use client';

import { Loader2 } from 'lucide-react';

import { AgentBasicInfo } from '@/components/dashboard/agents/agent-basic-info';
import { AgentConfigEditor } from '@/components/dashboard/agents/agent-config-editor';
import { AgentMcpToolsSection } from '@/components/dashboard/agents/agent-mcp-tools-section';
import { AgentPromptSection } from '@/components/dashboard/agents/agent-prompt-section';
import { AgentSubAgentsSection } from '@/components/dashboard/agents/agent-subagents-section';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useAgentForm } from '@/hooks/use-agent-form';
import { useAgentFormSubmission } from '@/hooks/use-agent-form-submission';
import type { AgentWithRelations } from '@/types/agent';

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

  // Use custom hooks for form state and logic
  const {
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
    selectedSubAgents,
    setSelectedSubAgents,
    errors,
    setErrors,
    generalError,
    loading,
    filteredModels,
    filteredLabels,
    prompts,
    createAgent,
    updateAgent,
    handleFormError,
  } = useAgentForm(agent);

  const { handleSubmit } = useAgentFormSubmission({
    agent,
    isEditing,
    name,
    description,
    modelId,
    promptId,
    labelId,
    config,
    useCustomConfig,
    selectedMcpTools,
    selectedSubAgents,
    createAgent,
    updateAgent,
    handleFormError,
    setErrors,
    onSuccess,
  });

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
          description={description}
          onDescriptionChange={setDescription}
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

        <AgentSubAgentsSection
          selectedSubAgents={selectedSubAgents}
          onSelectedSubAgentsChange={setSelectedSubAgents}
          currentAgentId={agent?.id}
        />

        <AgentMcpToolsSection
          selectedTools={selectedMcpTools}
          onSelectedToolsChange={setSelectedMcpTools}
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
