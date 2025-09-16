'use client';

import { Clock } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { formatDate } from '@/lib/utils';
import type { PromptVersionWithLabel } from '@/types/prompt';

interface PromptVersionItemProps {
  version: PromptVersionWithLabel;
  isSelected: boolean;
  onSelect: (versionId: string) => void;
}

/**
 * Memoized prompt version item component for performance
 */
export const PromptVersionItem = React.memo<PromptVersionItemProps>(
  ({ version, isSelected, onSelect }) => {
    const handleClick = React.useCallback(() => {
      onSelect(version.id);
    }, [version.id, onSelect]);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleClick}
          className={`w-full h-auto p-3 flex flex-col items-start gap-2 ${
            isSelected ? 'bg-accent' : ''
          }`}
          data-active={isSelected}
        >
          <div className="flex items-center gap-2 w-full">
            <Badge variant="outline" className="text-xs">
              #{version.version}
            </Badge>
            {version.label && (
              <Badge
                variant="outline"
                className="text-xs border-primary text-primary"
              >
                {version.label.name}
              </Badge>
            )}
          </div>

          {version.changeNote && (
            <p className="text-xs text-muted-foreground text-left line-clamp-2 w-full">
              {version.changeNote}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{formatDate(version.createdAt)}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
);

PromptVersionItem.displayName = 'PromptVersionItem';
