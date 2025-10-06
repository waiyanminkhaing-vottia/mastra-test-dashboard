'use client';

import React, { useCallback, useEffect, useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { useAgentsStore } from '@/stores/agents-store';

interface AgentSubAgentsSectionProps {
  selectedSubAgents: string[];
  onSelectedSubAgentsChange: (subAgents: string[]) => void;
  currentAgentId?: string;
}

/**
 * Component for selecting sub-agents in agent forms
 * Allows agents to have other agents as sub-agents
 * Uses selective Zustand subscriptions to prevent unnecessary re-renders
 */
function AgentSubAgentsSectionComponent({
  selectedSubAgents,
  onSelectedSubAgentsChange,
  currentAgentId,
}: AgentSubAgentsSectionProps) {
  const { t } = useLanguage();

  // Selective store subscriptions to avoid unnecessary re-renders
  const agents = useAgentsStore(state => state.agents);
  const loading = useAgentsStore(state => state.loading);
  const fetchAgents = useAgentsStore(state => state.fetchAgents);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
    // Zustand functions are stable, don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter out the current agent to prevent self-reference
  // Note: We don't filter out existing sub-agents because users need to see them to uncheck them
  const availableAgents = useMemo(() => {
    if (!agents) return [];

    return agents.filter(agent => {
      // Exclude current agent (can't add itself as sub-agent)
      return !(currentAgentId && agent.id === currentAgentId);
    });
  }, [agents, currentAgentId]);

  const handleSubAgentSelection = useCallback(
    (agentId: string, checked: boolean) => {
      if (checked) {
        onSelectedSubAgentsChange([...selectedSubAgents, agentId]);
      } else {
        onSelectedSubAgentsChange(
          selectedSubAgents.filter(id => id !== agentId)
        );
      }
    },
    [selectedSubAgents, onSelectedSubAgentsChange]
  );

  if (loading) {
    return (
      <div className="w-full rounded-lg border p-6">
        <div>
          <h4 className="text-sm font-medium text-gray">
            {t('agents.subAgents.title')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t('agents.subAgents.description')}
          </p>
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex items-center gap-3 py-2"
            >
              <Skeleton className="h-4 w-4" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border p-6">
      <div>
        <h4
          className="text-sm font-medium text-gray"
          id="sub-agents-section-title"
        >
          {t('agents.subAgents.title')}
        </h4>
        <p
          className="text-sm text-muted-foreground"
          id="sub-agents-section-description"
        >
          {t('agents.subAgents.description')}
        </p>
      </div>
      <Separator className="my-6" />
      <div className="space-y-4">
        {!availableAgents || availableAgents.length === 0 ? (
          <p className="text-center text-sm py-4 text-muted-foreground">
            {t('agents.subAgents.noAgents')}
          </p>
        ) : (
          <div
            className="space-y-2 w-full"
            role="group"
            aria-labelledby="sub-agents-section-title"
            aria-describedby="sub-agents-section-description"
          >
            {availableAgents.map(agent => {
              const isSelected = selectedSubAgents.includes(agent.id);

              return (
                <div key={agent.id} className="w-full">
                  <div className="flex items-center gap-3 py-4 w-full">
                    <Checkbox
                      id={`subagent-${agent.id}`}
                      checked={isSelected}
                      onCheckedChange={checked =>
                        handleSubAgentSelection(agent.id, checked === true)
                      }
                      aria-label={`Select ${agent.name} as sub-agent`}
                    />
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <Label
                          htmlFor={`subagent-${agent.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {agent.name}
                        </Label>
                        {agent.description && (
                          <div className="text-xs text-muted-foreground">
                            {agent.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main export with React.memo for performance optimization
 */
export const AgentSubAgentsSection = React.memo(
  AgentSubAgentsSectionComponent,
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.selectedSubAgents.length ===
        nextProps.selectedSubAgents.length &&
      prevProps.selectedSubAgents.every(
        (id, index) => id === nextProps.selectedSubAgents[index]
      ) &&
      prevProps.onSelectedSubAgentsChange ===
        nextProps.onSelectedSubAgentsChange &&
      prevProps.currentAgentId === nextProps.currentAgentId
    );
  }
);

AgentSubAgentsSection.displayName = 'AgentSubAgentsSection';
