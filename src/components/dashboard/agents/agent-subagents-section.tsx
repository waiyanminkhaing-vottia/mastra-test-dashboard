'use client';

import { ChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
 */
function AgentSubAgentsSectionComponent({
  selectedSubAgents,
  onSelectedSubAgentsChange,
  currentAgentId,
}: AgentSubAgentsSectionProps) {
  const { t } = useLanguage();
  const { agents, loading, fetchAgents } = useAgentsStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filter out the current agent to prevent self-reference and circular dependencies
  const availableAgents = useMemo(() => {
    if (!agents) return [];
    return agents.filter(agent => {
      // Exclude current agent
      if (currentAgentId && agent.id === currentAgentId) return false;
      // Exclude agents that already have this agent as parent (prevent circular)
      // TypeScript may not have picked up the regenerated Prisma types yet
      const parentId = (agent as unknown as { parentId?: string | null })
        .parentId;
      if (currentAgentId && parentId === currentAgentId) return false;
      return true;
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

  const handleSelectAll = useCallback(
    (selectAll: boolean) => {
      if (selectAll) {
        const allIds = availableAgents.map(agent => agent.id);
        onSelectedSubAgentsChange(allIds);
      } else {
        onSelectedSubAgentsChange([]);
      }
    },
    [availableAgents, onSelectedSubAgentsChange]
  );

  const allSelected =
    availableAgents.length > 0 &&
    selectedSubAgents.length === availableAgents.length;
  const someSelected = selectedSubAgents.length > 0 && !allSelected;

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
          <Collapsible className="w-full">
            <div className="flex items-center gap-3 py-2 border-b">
              <Checkbox
                checked={allSelected || someSelected}
                onCheckedChange={checked => handleSelectAll(checked === true)}
                aria-label={
                  allSelected ? 'Deselect all agents' : 'Select all agents'
                }
                id="sub-agents-select-all"
              />
              <CollapsibleTrigger className="group flex items-center justify-between w-full">
                <Label
                  htmlFor="sub-agents-select-all"
                  className="font-medium cursor-pointer"
                >
                  {t('agents.subAgents.selectAll')}
                </Label>
                <div className="flex items-center gap-2">
                  {selectedSubAgents.length > 0 && (
                    <span className="text-xs border px-2 py-1 rounded-full bg-transparent">
                      {selectedSubAgents.length}{' '}
                      {t('agents.subAgents.selected')}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div
                className="space-y-3 mt-4"
                role="group"
                aria-labelledby="sub-agents-section-title"
                aria-describedby="sub-agents-section-description"
              >
                {availableAgents.map(agent => {
                  const isSelected = selectedSubAgents.includes(agent.id);

                  return (
                    <div key={agent.id} className="flex items-start gap-3 py-2">
                      <Checkbox
                        id={`subagent-${agent.id}`}
                        checked={isSelected}
                        onCheckedChange={checked =>
                          handleSubAgentSelection(agent.id, checked === true)
                        }
                        className="mt-1"
                        aria-describedby={
                          agent.description
                            ? `agent-description-${agent.id}`
                            : undefined
                        }
                        aria-label={
                          agent.description
                            ? undefined
                            : `Select ${agent.name} as sub-agent`
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`subagent-${agent.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {agent.name}
                        </Label>
                        {agent.description && (
                          <div
                            id={`agent-description-${agent.id}`}
                            className="text-xs text-muted-foreground mt-1 break-words"
                          >
                            {agent.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
