import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook for managing API calls with proper error handling, loading states, and request cancellation
 * Best practice for big projects - reusable, scalable, and maintainable
 */
export const useApiManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const isLoadingRef = useRef(false);

  const executeApiCall = useCallback(async (apiFunction, ...args) => {
    if (isLoadingRef.current) {
      console.warn('API call already in progress, skipping...');
      return null;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const result = await apiFunction(...args);
      return result;

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('API call failed:', error);
        setError(error);
        throw error;
      }
      return null;
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    loading,
    error,
    executeApiCall,
    cancelRequest,
    cleanup
  };
};
