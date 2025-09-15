import { useMemo, useState } from 'react';

interface UseTableSortOptions<T> {
  defaultSortField?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
}

/**
 * Custom hook for managing table sorting functionality
 * @param data Array of data to sort
 * @param options Optional configuration for default sort field and direction
 * @returns Object with sortedData, sortField, sortDirection, and handleSort function
 */
export function useTableSort<T>(
  data: T[] | null,
  options: UseTableSortOptions<T> = {}
) {
  const { defaultSortField = null, defaultSortDirection = 'asc' } = options;

  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    defaultSortDirection
  );

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!data || !sortField) return data || [];

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortField, sortDirection]);

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
  };
}
