import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Enhanced API Hook with Authentication Management
 * Prevents API calls before authentication is ready
 */
export const useAuthenticatedApi = (apiFunction, options = {}) => {
  const {
    cacheKey,
    enabled = true,
    retryAttempts = 3,
    retryDelay = 1000,
    waitForAuth = true
  } = options;

  const { token, isAuthenticated } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const pendingRequests = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Execute API call with proper authentication handling
  const executeApiCall = useCallback(async (params = {}) => {
    // Don't make calls if not authenticated and waitForAuth is true
    if (waitForAuth && !isAuthenticated) {
      console.log('⏳ Waiting for authentication before making API call');
      return null;
    }

    // Don't make calls if no token and waitForAuth is true
    if (waitForAuth && !token) {
      console.log('⏳ Waiting for token before making API call');
      return null;
    }

    if (!enabled) return null;

    const key = cacheKey || `${apiFunction.name}_${JSON.stringify(params)}`;
    
    // Check if request is already pending
    if (pendingRequests.current.has(key)) {
      console.log('🔄 Request already pending, waiting for result');
      return pendingRequests.current.get(key);
    }

    setLoading(true);
    setError(null);

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const requestPromise = (async () => {
      try {
        console.log('🚀 Making authenticated API call:', apiFunction.name);
        const result = await apiFunction(token, params, {
          signal: abortControllerRef.current.signal
        });
        
        setData(result);
        setRetryCount(0);
        setIsInitialized(true);
        
        return result;
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('❌ Request was aborted');
          return null;
        }

        setError(err);
        
        // Don't retry for authentication errors
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          console.log('🔒 Authentication error, will retry after token refresh');
          return null;
        }
        
        // Retry logic for other errors
        if (retryCount < retryAttempts) {
          console.log(`🔄 Retrying API call (${retryCount + 1}/${retryAttempts})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            executeApiCall(params);
          }, retryDelay * Math.pow(2, retryCount));
        }
        
        throw err;
      } finally {
        setLoading(false);
        pendingRequests.current.delete(key);
      }
    })();

    // Store pending request
    pendingRequests.current.set(key, requestPromise);

    return requestPromise;
  }, [
    apiFunction, 
    cacheKey, 
    enabled, 
    retryAttempts, 
    retryDelay, 
    retryCount,
    waitForAuth,
    isAuthenticated,
    token
  ]);

  // Auto-execute when authentication is ready
  useEffect(() => {
    if (waitForAuth && isAuthenticated && token && !isInitialized) {
      console.log('✅ Authentication ready, executing API call');
      executeApiCall();
    }
  }, [isAuthenticated, token, waitForAuth, isInitialized, executeApiCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const controller = abortControllerRef.current;
      const pending = pendingRequests.current;
      if (controller) {
        controller.abort();
      }
      if (pending) {
        pending.clear();
      }
    };
  }, []);

  const refetch = useCallback((params = {}) => {
    setRetryCount(0);
    setIsInitialized(false);
    return executeApiCall(params);
  }, [executeApiCall]);

  return {
    data,
    loading,
    error,
    refetch,
    retryCount,
    isInitialized,
    isAuthenticated,
    hasToken: !!token
  };
};

/**
 * Hook for managing multiple authenticated API calls
 */
export const useAuthenticatedBatchApi = () => {
  const { token, isAuthenticated } = useApp();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const executeBatch = useCallback(async (apiCalls) => {
    if (!isAuthenticated || !token) {
      console.log('⏳ Waiting for authentication before executing batch API calls');
      return {};
    }

    setLoading(true);
    setErrors({});

    try {
      const promises = Object.entries(apiCalls).map(async ([key, apiCall]) => {
        try {
          const result = await apiCall(token);
          return [key, { data: result, error: null }];
        } catch (error) {
          return [key, { data: null, error }];
        }
      });

      const results = await Promise.all(promises);
      const resultsMap = Object.fromEntries(results);
      
      setResults(resultsMap);
      
      // Set errors for failed calls
      const errorMap = {};
      Object.entries(resultsMap).forEach(([key, result]) => {
        if (result.error) {
          errorMap[key] = result.error;
        }
      });
      setErrors(errorMap);
      
      return resultsMap;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  return {
    loading,
    results,
    errors,
    executeBatch
  };
};
