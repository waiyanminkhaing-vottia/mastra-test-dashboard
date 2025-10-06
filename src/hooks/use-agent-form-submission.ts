import { useCallback } from 'react';

import { useLanguage } from '@/contexts/language-context';
import { validateClientSide } from '@/lib/validation-utils';
import { agentSchema } from '@/lib/validations/agent';
import type { AgentWithRelations } from '@/types/agent';
import type { LLMConfig } from '@/types/config';

interface UseAgentFormSubmissionProps {
  agent?: AgentWithRelations | null;
  isEditing: boolean;
  name: string;
  description: string;
  modelId: string;
  promptId: string;
  labelId: string;
  config: LLMConfig;
  useCustomConfig: boolean;
  selectedMcpTools: string[];
  selectedTools: string[];
  selectedSubAgents: string[];
  createAgent: (data: {
    name: string;
    description?: string;
    modelId: string;
    promptId: string;
    labelId?: string;
    config?: Record<string, unknown> | null;
    mcpTools?: string[];
    tools?: string[];
    subAgents?: string[];
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
      tools?: string[];
      subAgents?: string[];
    }
  ) => Promise<AgentWithRelations>;
  handleFormError: (error: unknown, options?: Record<string, unknown>) => void;
  setErrors: (errors: Record<string, string>) => void;
  onSuccess: () => void;
}

/**
 * Custom hook for handling agent form submission logic
 */
export function useAgentFormSubmission({
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
  selectedTools,
  selectedSubAgents,
  createAgent,
  updateAgent,
  handleFormError,
  setErrors,
  onSuccess,
}: UseAgentFormSubmissionProps) {
  const { t } = useLanguage();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      // Client-side validation with common utility
      const validation = validateClientSide(agentSchema(t), {
        name: name.trim(),
        description: description.trim(),
        modelId,
        promptId,
        labelId: labelId && labelId !== 'none' ? labelId : undefined,
        config: useCustomConfig ? config : isEditing ? null : undefined,
        mcpTools: selectedMcpTools.length > 0 ? selectedMcpTools : undefined,
        tools: selectedTools.length > 0 ? selectedTools : undefined,
        subAgents: selectedSubAgents.length > 0 ? selectedSubAgents : undefined,
      });

      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      try {
        if (isEditing && agent) {
          await updateAgent(
            agent.id,
            validation.data as {
              name: string;
              description?: string;
              modelId: string;
              promptId: string;
              labelId?: string;
              config?: Record<string, unknown> | null;
              mcpTools?: string[];
              tools?: string[];
              subAgents?: string[];
            }
          );
        } else {
          await createAgent(
            validation.data as {
              name: string;
              description?: string;
              modelId: string;
              promptId: string;
              labelId?: string;
              config?: Record<string, unknown> | null;
              mcpTools?: string[];
              tools?: string[];
              subAgents?: string[];
            }
          );
        }

        onSuccess();
      } catch (error: unknown) {
        handleFormError(error, {
          conflictErrorKey: 'agents.errors.agentAlreadyExists',
        });
      }
    },
    [
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
      selectedTools,
      selectedSubAgents,
      createAgent,
      updateAgent,
      handleFormError,
      setErrors,
      onSuccess,
      t,
    ]
  );

  return { handleSubmit };
}
