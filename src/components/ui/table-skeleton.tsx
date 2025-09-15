import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 3, columns = 4 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => i).map(i => (
        <TableRow key={`skeleton-row-${i}`}>
          {Array.from({ length: columns }, (_, j) => j).map(j => (
            <TableCell key={`skeleton-cell-${i}-${j}`}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
