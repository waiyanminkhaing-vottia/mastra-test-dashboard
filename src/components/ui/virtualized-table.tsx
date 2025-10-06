import type { ReactNode } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useVirtualizedTable } from '@/hooks/use-virtualized-table';

interface VirtualizedTableProps<T> {
  data: T[];
  loading?: boolean;
  error?: boolean;
  emptyMessage: string;
  errorMessage: string;
  columns: number;
  headers: ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  maxHeight?: string;
}

export function VirtualizedTable<T>({
  data,
  loading,
  error,
  emptyMessage,
  errorMessage,
  columns,
  headers,
  renderRow,
  maxHeight = '600px',
}: VirtualizedTableProps<T>) {
  const { parentRef, virtualItems, totalSize } = useVirtualizedTable(data);

  return (
    <div className="rounded-md border overflow-hidden">
      <div ref={parentRef} className="overflow-auto" style={{ maxHeight }}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            {headers}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={3} columns={columns} />
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns}
                  className="h-24 text-center text-red-600"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Padding top for virtualization */}
                {virtualItems.length > 0 && virtualItems[0].index > 0 && (
                  <tr style={{ height: `${virtualItems[0].start}px` }} />
                )}
                {/* Render only visible items */}
                {virtualItems.map(virtualRow => {
                  const item = data[virtualRow.index];
                  return renderRow(item, virtualRow.index);
                })}
                {/* Padding bottom for virtualization */}
                {virtualItems.length > 0 &&
                  virtualItems[virtualItems.length - 1].index <
                    data.length - 1 && (
                    <tr
                      style={{
                        height: `${
                          totalSize - virtualItems[virtualItems.length - 1].end
                        }px`,
                      }}
                    />
                  )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
