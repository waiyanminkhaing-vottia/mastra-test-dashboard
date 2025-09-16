'use client';

import { ArrowDown, ArrowUp, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PromptVersionItem } from '@/components/dashboard/prompts/prompt-version-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/language-context';
import { usePromptLabelsStore } from '@/stores/prompt-labels-store';
import type { PromptVersionWithLabel } from '@/types/prompt';

interface PromptVersionsSidebarProps {
  versions: PromptVersionWithLabel[];
  selectedVersionId?: string;
  onVersionSelect: (versionId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

/**
 * Sidebar component displaying a list of prompt versions with search and filtering
 */
export function PromptVersionsSidebar({
  versions,
  selectedVersionId,
  onVersionSelect,
  searchQuery,
  onSearchQueryChange,
}: PromptVersionsSidebarProps) {
  const { t } = useLanguage();
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { labels, fetchLabels } = usePromptLabelsStore();

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  useEffect(() => {
    if (filterBy !== 'all' && filterBy !== 'unlabeled') {
      const labelExists = labels.some(label => label.name === filterBy);
      if (!labelExists) {
        setFilterBy('all');
      }
    }
  }, [labels, filterBy]);

  const availableLabels = useMemo(() => {
    return labels.map(label => label.name);
  }, [labels]);
  const filteredVersions = useMemo(() => {
    if (!versions) return [];

    let filtered = [...versions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(version => {
        // Get current label name from labels store
        const currentLabelName = version.labelId
          ? labels.find(label => label.id === version.labelId)?.name ||
            version.label?.name
          : undefined;

        return (
          version.version.toString().includes(query) ||
          currentLabelName?.toLowerCase().includes(query) ||
          version.changeNote?.toLowerCase().includes(query)
        );
      });
    }

    if (filterBy !== 'all') {
      if (filterBy === 'unlabeled') {
        filtered = filtered.filter(version => !version.labelId);
      } else {
        filtered = filtered.filter(version => {
          // Get current label name from labels store for filtering
          const currentLabelName = version.labelId
            ? labels.find(label => label.id === version.labelId)?.name ||
              version.label?.name
            : undefined;
          return currentLabelName === filterBy;
        });
      }
    }

    if (sortDirection === 'desc') {
      filtered.sort((a, b) => b.version - a.version);
    } else {
      filtered.sort((a, b) => a.version - b.version);
    }

    return filtered;
  }, [versions, searchQuery, filterBy, sortDirection, labels]);

  return (
    <Sidebar
      collapsible="none"
      className="relative border rounded-lg shadow-sm w-full bg-background"
    >
      <SidebarHeader className="border-b p-3 pb-2 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t('prompts.versions.searchPlaceholder')}
              value={searchQuery}
              onChange={e => onSearchQueryChange(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <Button variant="outline" size="sm" className="hover:text-primary">
            <Plus className="size-4" />
            {t('common.new')}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="size-3" />
            <span>{t('prompts.versions.filter.label')}</span>
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="flex-1 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('prompts.versions.filter.all')}
              </SelectItem>
              <SelectItem value="unlabeled">
                {t('prompts.versions.filter.unlabeled')}
              </SelectItem>
              {availableLabels.map(label => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
            }
            className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            {sortDirection === 'desc' ? (
              <ArrowDown className="size-3" />
            ) : (
              <ArrowUp className="size-3" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredVersions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {t('prompts.versions.noMatchingVersions')}
                </div>
              ) : (
                filteredVersions.map(version => (
                  <PromptVersionItem
                    key={version.id}
                    version={version}
                    isSelected={selectedVersionId === version.id}
                    onSelect={onVersionSelect}
                  />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
