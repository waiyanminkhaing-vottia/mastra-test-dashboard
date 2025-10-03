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
  renderRow: (item: T, style: React.CSSProperties) => ReactNode;
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>{headers}</TableHeader>
      </Table>
      <div ref={parentRef} className="overflow-auto" style={{ maxHeight }}>
        <Table>
          <TableBody
            style={{
              height: `${totalSize}px`,
              position: 'relative',
            }}
          >
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
              virtualItems.map(virtualRow => {
                const item = data[virtualRow.index];
                return renderRow(item, {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                });
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
