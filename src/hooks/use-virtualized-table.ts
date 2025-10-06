import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

/**
 * Custom hook for virtualizing large tables
 * Only renders visible rows for better performance
 *
 * @param items - Array of items to virtualize
 * @param estimateSize - Estimated row height in pixels
 * @param overscan - Number of items to render outside visible area
 * @returns Virtualizer instance
 */
export function useVirtualizedTable<T>(
  items: T[],
  estimateSize: number = 73,
  overscan: number = 5
) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
