'use client';

import type { Mcp } from '@prisma/client';
import { ChevronDown, RefreshCw } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { McpErrorBoundary } from '@/components/dashboard/mcp-error-boundary';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import logger from '@/lib/logger';
import { useMcpsStore } from '@/stores/mcps-store';

interface McpTool {
  id: string;
  description?: string;
}

interface McpWithTools extends Mcp {
  tools?: McpTool[];
  toolsLoading?: boolean;
  toolsError?: string | null;
}

interface ResourceManager {
  controllers: Map<string, AbortController>;
  timeouts: Map<string, NodeJS.Timeout>;
  cache: Map<string, { tools: McpTool[]; timestamp: number }>;
}

class LRUCache<K, V> {
  private maxSize: number;
  private cache = new Map<
    K,
    { value: V; timestamp: number; accessTime: number }
  >();

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  set(key: K, value: V): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.accessTime - b.accessTime
      )[0][0];
      this.cache.delete(oldestKey);
    }

    const now = Date.now();
    this.cache.set(key, { value, timestamp: now, accessTime: now });
  }

  get(key: K, ttl = 5 * 60 * 1000): V | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;

    const now = Date.now();
    if (now - cached.timestamp > ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time for LRU
    cached.accessTime = now;
    return cached.value;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

interface AgentMcpToolsSectionProps {
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
}

/**
 * Component for selecting MCP tools in agent forms
 * Optimized with React.memo and comprehensive caching
 */
function AgentMcpToolsSectionComponent({
  selectedTools,
  onSelectedToolsChange,
}: AgentMcpToolsSectionProps) {
  const { t } = useLanguage();
  const { mcps, loading, fetchMcps } = useMcpsStore();
  const [mcpsWithTools, setMcpsWithTools] = useState<McpWithTools[]>([]);
  const resourcesRef = useRef<ResourceManager>({
    controllers: new Map(),
    timeouts: new Map(),
    cache: new Map(),
  });
  const lruCacheRef = useRef<LRUCache<string, McpTool[]>>(new LRUCache(50));

  // Cache TTL in milliseconds (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;

  useEffect(() => {
    fetchMcps();
  }, [fetchMcps]);

  // Centralized cleanup effect with error handling
  useEffect(() => {
    const resources = resourcesRef.current;
    const lruCache = lruCacheRef.current;

    return () => {
      const { controllers, timeouts, cache } = resources;

      // Cleanup controllers with error handling
      controllers.forEach((controller, id) => {
        try {
          if (!controller.signal.aborted) {
            controller.abort();
          }
        } catch (error) {
          logger.debug({ msg: 'Failed to abort controller', mcpId: id, error });
        }
      });

      // Cleanup timeouts with error handling
      timeouts.forEach((timeout, id) => {
        try {
          clearTimeout(timeout);
        } catch (error) {
          logger.debug({ msg: 'Failed to clear timeout', mcpId: id, error });
        }
      });

      // Clear all maps and LRU cache
      controllers.clear();
      timeouts.clear();
      cache.clear();
      lruCache.clear();
    };
  }, []);

  useEffect(() => {
    if (mcps) {
      setMcpsWithTools(
        mcps.map(mcp => ({
          ...mcp,
          tools: [],
          toolsLoading: false,
          toolsError: null,
        }))
      );
    }
  }, [mcps]);

  const fetchMcpToolsImmediate = useCallback(
    async (mcp: Mcp) => {
      const { controllers } = resourcesRef.current;
      const lruCache = lruCacheRef.current;

      // Check LRU cache first
      const cached = lruCache.get(mcp.id, CACHE_TTL);
      if (cached) {
        logger.debug({
          msg: 'Using LRU cached MCP tools',
          mcpName: mcp.name,
          toolCount: cached.length,
          cacheSize: lruCache.size(),
        });
        setMcpsWithTools(prev =>
          prev.map(m =>
            m.id === mcp.id
              ? {
                  ...m,
                  tools: cached,
                  toolsLoading: false,
                  toolsError: null,
                }
              : m
          )
        );
        return;
      }

      // Cancel existing request for this MCP
      const existingController = controllers.get(mcp.id);
      if (existingController && !existingController.signal.aborted) {
        existingController.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      controllers.set(mcp.id, controller);

      setMcpsWithTools(prev =>
        prev.map(m =>
          m.id === mcp.id ? { ...m, toolsLoading: true, toolsError: null } : m
        )
      );

      try {
        logger.debug({ msg: 'Fetching MCP tools from API', mcpName: mcp.name });

        const response = await fetch(
          `/api/mcps/tools?id=${encodeURIComponent(mcp.id)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch tools: ${response.statusText}`);
        }

        const data = await response.json();
        const tools = data.tools || [];

        // Check if request was not aborted before updating state and cache
        if (!controller.signal.aborted) {
          logger.debug({
            msg: 'Successfully fetched MCP tools',
            mcpName: mcp.name,
            toolCount: tools.length,
            cacheSize: lruCacheRef.current.size(),
          });

          // Cache the result in LRU cache
          lruCacheRef.current.set(mcp.id, tools);

          setMcpsWithTools(prev =>
            prev.map(m =>
              m.id === mcp.id ? { ...m, tools, toolsLoading: false } : m
            )
          );
        }
      } catch (error) {
        // Don't update state if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          logger.debug({ msg: 'MCP tools request aborted', mcpName: mcp.name });
          return;
        }

        logger.error({
          msg: 'Error fetching MCP tools',
          mcpName: mcp.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        if (!controller.signal.aborted) {
          setMcpsWithTools(prev =>
            prev.map(m =>
              m.id === mcp.id
                ? {
                    ...m,
                    toolsLoading: false,
                    toolsError:
                      error instanceof Error
                        ? error.message
                        : 'Failed to fetch tools',
                  }
                : m
            )
          );
        }
      } finally {
        // Clean up controller
        resourcesRef.current.controllers.delete(mcp.id);
      }
    },
    [CACHE_TTL]
  );

  // Debounced version of fetchMcpTools with improved timeout management
  const fetchMcpTools = useMemo(
    () => (mcp: Mcp) => {
      const { timeouts } = resourcesRef.current;

      // Clear existing timeout for this MCP
      const existingTimeout = timeouts.get(mcp.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout with error handling
      const timeout = setTimeout(() => {
        try {
          fetchMcpToolsImmediate(mcp);
        } catch (error) {
          logger.error({
            msg: 'Error in debounced MCP tools fetch',
            mcpName: mcp.name,
            error,
          });
        } finally {
          timeouts.delete(mcp.id);
        }
      }, 300);

      timeouts.set(mcp.id, timeout);
    },
    [fetchMcpToolsImmediate]
  );

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

  const handleSelectAllTools = useCallback(
    (mcp: McpWithTools, selectAll: boolean) => {
      if (selectAll) {
        // If tools are loaded, select all loaded tools
        if (mcp.tools && mcp.tools.length > 0) {
          const mcpToolIds = mcp.tools.map(tool => `${mcp.id}:${tool.id}`);
          const currentSelected = new Set(selectedTools);
          const newToolIds = mcpToolIds.filter(id => !currentSelected.has(id));

          if (newToolIds.length > 0) {
            onSelectedToolsChange([...selectedTools, ...newToolIds]);
          }
        }
        // If tools aren't loaded yet, we can't select them, so do nothing
      } else {
        // Deselect all tools for this MCP (both loaded and unloaded)
        const prefix = `${mcp.id}:`;
        const filtered = selectedTools.filter(id => !id.startsWith(prefix));
        if (filtered.length !== selectedTools.length) {
          onSelectedToolsChange(filtered);
        }
      }
    },
    [selectedTools, onSelectedToolsChange]
  );

  const handleRefreshSingleMcp = useCallback(
    (mcp: McpWithTools) => {
      // Clear cache and refetch tools for this specific MCP
      const lruCache = lruCacheRef.current;
      lruCache.delete(mcp.id);
      fetchMcpToolsImmediate(mcp);
    },
    [fetchMcpToolsImmediate]
  );

  if (loading) {
    return (
      <div className="w-full rounded-lg border p-6">
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray">
            {t('agents.mcpTools.title')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t('agents.mcpTools.description')}
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-4">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-3 py-4">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <McpErrorBoundary
      onError={(error, errorInfo) => {
        logger.error({
          msg: 'MCP tools section error',
          error: error.message,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <div className="w-full rounded-lg border p-6">
        <div className="mb-6">
          <h4
            className="text-sm font-medium text-gray"
            id="mcp-tools-section-title"
          >
            {t('agents.mcpTools.title')}
          </h4>
          <p
            className="text-sm text-muted-foreground"
            id="mcp-tools-section-description"
          >
            {t('agents.mcpTools.description')}
          </p>
        </div>
        <div className="space-y-4">
          {!mcpsWithTools || mcpsWithTools.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {t('agents.mcpTools.noMcps')}
            </div>
          ) : (
            <div
              className="space-y-2 w-full"
              role="group"
              aria-labelledby="mcp-tools-section-title"
              aria-describedby="mcp-tools-section-description"
            >
              {mcpsWithTools.map(mcp => {
                const mcpToolIds =
                  mcp.tools?.map(tool => `${mcp.id}:${tool.id}`) || [];
                const selectedForThisMcp = selectedTools.filter(id =>
                  id.startsWith(`${mcp.id}:`)
                );
                const selectedCount = selectedForThisMcp.length;

                let allSelected = false;
                if (mcp.tools) {
                  const totalCount = mcpToolIds.length;
                  allSelected = totalCount > 0 && selectedCount === totalCount;
                } else {
                  allSelected = selectedCount > 0;
                }

                return (
                  <Collapsible
                    key={mcp.id}
                    className="w-full border-b last:border-b-0"
                    onOpenChange={open => {
                      if (
                        open &&
                        (!mcp.tools || mcp.tools.length === 0) &&
                        !mcp.toolsLoading
                      ) {
                        // Immediately set loading state
                        setMcpsWithTools(prev =>
                          prev.map(prevMcp =>
                            prevMcp.id === mcp.id
                              ? {
                                  ...prevMcp,
                                  toolsLoading: true,
                                  toolsError: null,
                                }
                              : prevMcp
                          )
                        );
                        fetchMcpTools(mcp);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 py-4 w-full">
                      <Checkbox
                        checked={allSelected || selectedCount > 0}
                        onCheckedChange={checked =>
                          handleSelectAllTools(mcp, checked === true)
                        }
                        aria-label={`${allSelected ? 'Deselect all' : 'Select all'} tools from ${mcp.name}`}
                        id={`mcp-select-all-${mcp.id}`}
                      />
                      <CollapsibleTrigger className="group flex items-center justify-between w-full mr-2">
                        <div className="text-left">
                          <div className="font-medium">{mcp.name}</div>
                          {mcp.url && (
                            <div className="text-xs text-muted-foreground">
                              {new URL(mcp.url).hostname}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCount > 0 && (
                            <span className="text-xs border px-2 py-1 rounded-full bg-transparent">
                              {selectedCount} {t('agents.mcpTools.selected')}
                            </span>
                          )}
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                      </CollapsibleTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshSingleMcp(mcp)}
                        disabled={mcp.toolsLoading}
                        className="h-6 w-6 p-0 shrink-0"
                        title={`${t('common.refresh')} ${mcp.name}`}
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${mcp.toolsLoading ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </div>
                    <CollapsibleContent>
                      {mcp.toolsLoading ? (
                        <div className="space-y-3 ml-8 py-2">
                          {Array.from({ length: 3 }, (_, index) => (
                            <div
                              key={`skeleton-${mcp.id}-${index}`}
                              className="flex items-start gap-3"
                            >
                              <Skeleton className="h-4 w-4 mt-1" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-40" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : mcp.toolsError ? (
                        <div className="text-sm text-red-600 py-2 ml-8">
                          {t('agents.mcpTools.error')}: {mcp.toolsError}
                        </div>
                      ) : !mcp.tools || mcp.tools.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-2 ml-8">
                          {t('agents.mcpTools.noToolsAvailable')}
                        </div>
                      ) : (
                        <div className="space-y-3 ml-8">
                          {mcp.tools.map(tool => {
                            const toolId = `${mcp.id}:${tool.id}`;
                            const isSelected = selectedTools.includes(toolId);

                            return (
                              <div
                                key={tool.id}
                                className="flex items-start gap-3"
                              >
                                <Checkbox
                                  id={toolId}
                                  checked={isSelected}
                                  onCheckedChange={checked =>
                                    handleToolSelection(
                                      toolId,
                                      checked === true
                                    )
                                  }
                                  className="mt-1"
                                  aria-describedby={
                                    tool.description
                                      ? `tool-description-${toolId}`
                                      : undefined
                                  }
                                  aria-label={
                                    tool.description
                                      ? undefined
                                      : `Select ${tool.id} tool`
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={toolId}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {tool.id}
                                  </Label>
                                  {tool.description && (
                                    <div
                                      id={`tool-description-${toolId}`}
                                      className="text-xs text-muted-foreground mt-1 break-words"
                                    >
                                      {tool.description}
                                    </div>
                                  )}
                                  {!tool.description && (
                                    <div
                                      className="sr-only"
                                      id={`tool-description-${toolId}`}
                                    >
                                      No description available for {tool.id}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </McpErrorBoundary>
  );
}

/**
 * Main export with React.memo for performance optimization
 */
export const AgentMcpToolsSection = React.memo(
  AgentMcpToolsSectionComponent,
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

AgentMcpToolsSection.displayName = 'AgentMcpToolsSection';
