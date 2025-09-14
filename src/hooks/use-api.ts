import { useCallback, useState } from 'react';

/**
 * Generic API call state management
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing API calls with loading, error states, and data
 * @param initialData Initial data value
 * @returns Object with data, loading, error states and fetch function
 */
export function useApi<T>(initialData: T | null = null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchData,
    setData,
    clearError,
  };
}
