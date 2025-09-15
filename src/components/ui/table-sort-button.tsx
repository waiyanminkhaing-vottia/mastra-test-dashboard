import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface TableSortButtonProps<T> {
  field: keyof T;
  children: React.ReactNode;
  sortField: keyof T | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof T) => void;
}

export function TableSortButton<T>({
  field,
  children,
  sortField,
  sortDirection,
  onSort,
}: TableSortButtonProps<T>) {
  return (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium hover:!bg-transparent hover:text-primary"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </div>
    </Button>
  );
}
