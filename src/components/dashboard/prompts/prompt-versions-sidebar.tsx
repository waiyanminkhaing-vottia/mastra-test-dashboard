'use client';

import { Clock, Plus, Search } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/language-context';
import { formatDate } from '@/lib/utils';
import type { PromptVersionWithLabel } from '@/types/prompt';

interface PromptVersionsSidebarProps {
  versions: PromptVersionWithLabel[];
  selectedVersionId?: string;
  onVersionSelect: (versionId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

/**
 * Sidebar component displaying a list of prompt versions with search functionality
 * Features include version filtering, selection highlighting, and creation button
 * @param props Component properties
 * @param props.versions Array of prompt versions to display
 * @param props.selectedVersionId ID of the currently selected version
 * @param props.onVersionSelect Callback function when a version is selected
 * @param props.searchQuery Current search query string
 * @param props.onSearchQueryChange Callback function when search query changes
 */
export function PromptVersionsSidebar({
  versions,
  selectedVersionId,
  onVersionSelect,
  searchQuery,
  onSearchQueryChange,
}: PromptVersionsSidebarProps) {
  const { t } = useLanguage();

  // Filter versions based on search query
  const filteredVersions = useMemo(() => {
    if (!versions || !searchQuery) return versions || [];

    const query = searchQuery.toLowerCase();
    return versions.filter(
      version =>
        version.version.toString().includes(query) ||
        version.label?.name?.toLowerCase().includes(query) ||
        version.changeNote?.toLowerCase().includes(query)
    );
  }, [versions, searchQuery]);

  return (
    <Sidebar
      collapsible="none"
      className="relative border rounded-lg shadow-sm w-full bg-background"
    >
      <SidebarHeader className="border-b p-3 pb-2">
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
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredVersions.map(version => (
                <SidebarMenuItem key={version.id}>
                  <SidebarMenuButton
                    isActive={selectedVersionId === version.id}
                    onClick={() => onVersionSelect(version.id)}
                    className="h-auto p-3 flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5 min-w-[3rem] text-center"
                      >
                        #{version.version}
                      </Badge>
                      {version.label && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5 border-primary text-primary"
                        >
                          {version.label.name}
                        </Badge>
                      )}
                    </div>
                    {version.changeNote && (
                      <p className="text-xs text-muted-foreground text-left line-clamp-1 w-full">
                        {version.changeNote}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground w-full">
                      <Clock className="size-3" />
                      {formatDate(version.createdAt)}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
