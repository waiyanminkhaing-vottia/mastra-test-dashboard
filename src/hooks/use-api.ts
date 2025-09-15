import { useCallback, useState } from 'react';

/**
 * Generic API call state management
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  errorStatus: number | null;
  errorMessage: string | null;
}

/**
 * Hook for managing API calls with loading, error states, and data
 * @param initialData Initial data value
 * @returns Object with data, loading, errorStatus, errorMessage states and fetch function
 */
export function useApi<T>(initialData: T | null = null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    errorStatus: null,
    errorMessage: null,
  });

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    setState(prev => ({
      ...prev,
      loading: true,
      errorStatus: null,
      errorMessage: null,
    }));

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        const data = await response.json();
        setState({
          data,
          loading: false,
          errorStatus: null,
          errorMessage: null,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const statusCode = response.status;
        const errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;

        setState(prev => ({
          ...prev,
          loading: false,
          errorStatus: statusCode,
          errorMessage: errorMessage,
        }));
      }
    } catch (error) {
      const statusCode = (error as { status?: number }).status || 500;
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      setState(prev => ({
        ...prev,
        loading: false,
        errorStatus: statusCode,
        errorMessage: errorMessage,
      }));
    }
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, errorStatus: null, errorMessage: null }));
  }, []);

  return {
    ...state,
    fetchData,
    setData,
    clearError,
  };
}
