'use client';

import type { Mcp } from '@prisma/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { McpErrorBoundary } from '@/components/dashboard/mcp-error-boundary';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useLanguage } from '@/contexts/language-context';

interface McpTool {
  id: string;
  description?: string;
}

interface McpToolsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mcp: Mcp | null;
  tools: McpTool[] | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

/**
 * Modal component for displaying MCP tools list
 * Shows all tools available for a specific MCP
 * @param props Component properties
 * @param props.open Whether the modal is currently open
 * @param props.onOpenChange Callback function called when modal open state changes
 * @param props.mcp The MCP object to display tools for
 * @param props.tools Array of tools for the MCP
 * @param props.loading Whether tools are currently being fetched
 * @returns JSX element containing the MCP tools list modal
 */

/**
 * Modal component for displaying MCP tools with loading and error states
 */
export function McpToolsModal({
  open,
  onOpenChange,
  mcp,
  tools,
  loading,
  error,
  onRefresh,
}: McpToolsModalProps) {
  const { t } = useLanguage();

  return (
    <McpErrorBoundary>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[85vh] overflow-hidden flex flex-col"
          style={{ maxWidth: '70vw', width: '70vw' }}
        >
          <DialogHeader>
            <DialogTitle>
              {t('mcps.tools.title')} - {mcp?.name || ''}
            </DialogTitle>
          </DialogHeader>

          {onRefresh && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="h-8"
              >
                <RefreshCw
                  className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`}
                />
                {t('common.refresh')}
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">
                      {t('mcps.tools.table.name')}
                    </TableHead>
                    <TableHead className="w-2/3">
                      {t('mcps.tools.table.description')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeleton rows={3} columns={2} />
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !tools || tools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        {t('mcps.tools.table.noTools')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    tools.map(tool => (
                      <TableRow key={tool.id}>
                        <TableCell className="font-medium align-top">
                          <span className="break-words">{tool.id}</span>
                        </TableCell>
                        <TableCell className="align-top">
                          {tool.description ? (
                            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {tool.description}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              {t('mcps.tools.table.noDescription')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {tools && tools.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t('mcps.tools.totalCount')}: {tools.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </McpErrorBoundary>
  );
}
