'use client';

import type { Tool } from '@prisma/client';
import React, { useCallback, useEffect } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { useToolsStore } from '@/stores/tools-store';

interface AgentToolsSectionProps {
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
}

/**
 * Component for selecting tools in agent forms
 * Optimized with React.memo and selective Zustand subscriptions
 */
function AgentToolsSectionComponent({
  selectedTools,
  onSelectedToolsChange,
}: AgentToolsSectionProps) {
  const { t } = useLanguage();

  // Selective store subscriptions to avoid unnecessary re-renders
  const tools = useToolsStore(state => state.tools);
  const loading = useToolsStore(state => state.loading);
  const fetchTools = useToolsStore(state => state.fetchTools);

  // Fetch tools on mount
  useEffect(() => {
    fetchTools();
    // Zustand functions are stable, don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToolSelection = useCallback(
    (toolId: string, checked: boolean) => {
      if (checked) {
        onSelectedToolsChange([...selectedTools, toolId]);
      } else {
        onSelectedToolsChange(selectedTools.filter(id => id !== toolId));
      }
    },
    [selectedTools, onSelectedToolsChange]
  );

  if (loading) {
    return (
      <div className="w-full rounded-lg border p-6">
        <div>
          <h4 className="text-sm font-medium text-gray">
            {t('agents.tools.title')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t('agents.tools.description')}
          </p>
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-4 w-4 mt-1" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="h-4 w-4 mt-1" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border p-6">
      <div>
        <h4 className="text-sm font-medium text-gray" id="tools-section-title">
          {t('agents.tools.title')}
        </h4>
        <p
          className="text-sm text-muted-foreground"
          id="tools-section-description"
        >
          {t('agents.tools.description')}
        </p>
      </div>
      <Separator className="my-6" />
      <div className="space-y-4">
        {!tools || tools.length === 0 ? (
          <p className="text-center py-4 text-sm text-muted-foreground">
            {t('agents.tools.noTools')}
          </p>
        ) : (
          <div
            className="space-y-3"
            role="group"
            aria-labelledby="tools-section-title"
            aria-describedby="tools-section-description"
          >
            {tools.map((tool: Tool) => {
              const isSelected = selectedTools.includes(tool.id);

              return (
                <div key={tool.id} className="flex items-start gap-3">
                  <Checkbox
                    id={`tool-${tool.id}`}
                    checked={isSelected}
                    onCheckedChange={checked =>
                      handleToolSelection(tool.id, checked === true)
                    }
                    className="mt-1"
                    aria-describedby={
                      tool.description
                        ? `tool-description-${tool.id}`
                        : undefined
                    }
                    aria-label={
                      tool.description ? undefined : `Select ${tool.name} tool`
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`tool-${tool.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {tool.name}
                    </Label>
                    {tool.description && (
                      <div
                        id={`tool-description-${tool.id}`}
                        className="text-xs text-muted-foreground mt-1 break-words"
                      >
                        {tool.description}
                      </div>
                    )}
                    {!tool.description && (
                      <div
                        className="sr-only"
                        id={`tool-description-${tool.id}`}
                      >
                        No description available for {tool.name}
                      </div>
                    )}
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
export const AgentToolsSection = React.memo(
  AgentToolsSectionComponent,
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.selectedTools.length === nextProps.selectedTools.length &&
      prevProps.selectedTools.every(
        (tool, index) => tool === nextProps.selectedTools[index]
      ) &&
      prevProps.onSelectedToolsChange === nextProps.onSelectedToolsChange
    );
  }
);

AgentToolsSection.displayName = 'AgentToolsSection';
