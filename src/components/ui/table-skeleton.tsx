import { Skeleton } from '@/components/ui/skeleton';

/**
 * Reusable table skeleton loader component
 * @param rows Number of skeleton rows to display
 * @param columns Number of columns in each row
 * @returns JSX element with table skeleton structure
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }, (_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
