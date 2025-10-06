import { useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Custom hook for managing API calls with deduplication, caching, and abort control
 * Prevents duplicate API calls and provides consistent error handling
 */
export const useApiCall = () => {
  const { token, addNotification } = useApp();
  
  // Cache for storing API responses
  const cacheRef = useRef(new Map());
  
  // Abort controllers for canceling requests
  const abortControllersRef = useRef(new Map());
  
  // Request deduplication tracking
  const pendingRequestsRef = useRef(new Map());

  /**
   * Create a cache key from parameters
   */
  const createCacheKey = useCallback((url, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}?${sortedParams}`;
  }, []);

  /**
   * Check if a request should be skipped due to deduplication
   */
  const shouldSkipRequest = useCallback((cacheKey) => {
    const now = Date.now();
    const pendingRequest = pendingRequestsRef.current.get(cacheKey);
    
    if (pendingRequest && (now - pendingRequest.timestamp) < 1000) {
      return true; // Skip if same request was made within 1 second
    }
    
    return false;
  }, []);

  /**
   * Get cached response if available and not expired
   */
  const getCachedResponse = useCallback((cacheKey, ttl = 30000) => {
    const cached = cacheRef.current.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return cached.data;
    }
    return null;
  }, []);

  /**
   * Set response in cache
   */
  const setCachedResponse = useCallback((cacheKey, data) => {
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Abort previous request with same cache key
   */
  const abortPreviousRequest = useCallback((cacheKey) => {
    const controller = abortControllersRef.current.get(cacheKey);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(cacheKey);
    }
  }, []);

  /**
   * Execute API call with deduplication and caching
   */
  const executeApiCall = useCallback(async (
    apiFunction,
    params = {},
    options = {}
  ) => {
    const {
      useCache = true,
      cacheTTL = 30000,
      showError = true,
      errorMessage = 'API call failed'
    } = options;

    // Create cache key
    const cacheKey = createCacheKey(apiFunction.name || 'api', params);

    // Check cache first
    if (useCache) {
      const cachedResponse = getCachedResponse(cacheKey, cacheTTL);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Check for duplicate requests
    if (shouldSkipRequest(cacheKey)) {
      console.log(`Skipping duplicate API call: ${cacheKey}`);
      return null;
    }

    // Mark request as pending
    pendingRequestsRef.current.set(cacheKey, {
      timestamp: Date.now()
    });

    // Abort previous request
    abortPreviousRequest(cacheKey);

    // Create new abort controller
    const controller = new AbortController();
    abortControllersRef.current.set(cacheKey, controller);

    try {
      // Execute API call
      const response = await apiFunction(token, { ...params, signal: controller.signal });
      
      // Cache successful response
      if (useCache) {
        setCachedResponse(cacheKey, response);
      }

      // Remove from pending requests
      pendingRequestsRef.current.delete(cacheKey);
      
      // Remove abort controller
      abortControllersRef.current.delete(cacheKey);

      return response;
    } catch (error) {
      // Remove from pending requests
      pendingRequestsRef.current.delete(cacheKey);
      
      // Remove abort controller
      abortControllersRef.current.delete(cacheKey);

      // Handle abort error silently
      if (error.name === 'AbortError') {
        console.log(`API call aborted: ${cacheKey}`);
        return null;
      }

      // Handle other errors
      console.error(`API call failed: ${cacheKey}`, error);
      
      if (showError) {
        addNotification({
          type: 'error',
          message: `${errorMessage}: ${error.message || 'Unknown error'}`,
          duration: 5000
        });
      }

      throw error;
    }
  }, [
    token,
    createCacheKey,
    getCachedResponse,
    setCachedResponse,
    shouldSkipRequest,
    abortPreviousRequest,
    addNotification
  ]);

  /**
   * Execute multiple API calls in parallel with individual error handling
   */
  const executeParallelApiCalls = useCallback(async (apiCalls) => {
    const promises = apiCalls.map(({ apiFunction, params = {}, options = {} }) =>
      executeApiCall(apiFunction, params, { ...options, showError: false })
        .catch(error => {
          console.error(`Parallel API call failed: ${apiFunction.name}`, error);
          return { error: error.message };
        })
    );

    try {
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Parallel API calls failed:', error);
      addNotification({
        type: 'error',
        message: 'Some API calls failed',
        duration: 5000
      });
      return [];
    }
  }, [executeApiCall, addNotification]);

  /**
   * Clear cache for specific pattern or all cache
   */
  const clearCache = useCallback((pattern = null) => {
    if (pattern) {
      // Clear cache entries matching pattern
      for (const [key] of cacheRef.current) {
        if (key.includes(pattern)) {
          cacheRef.current.delete(key);
        }
      }
    } else {
      // Clear all cache
      cacheRef.current.clear();
    }
  }, []);

  /**
   * Abort all pending requests
   */
  const abortAllRequests = useCallback(() => {
    for (const [key, controller] of abortControllersRef.current) {
      controller.abort();
      abortControllersRef.current.delete(key);
    }
    pendingRequestsRef.current.clear();
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return {
      cacheSize: cacheRef.current.size,
      pendingRequests: pendingRequestsRef.current.size,
      activeAbortControllers: abortControllersRef.current.size
    };
  }, []);

  return {
    executeApiCall,
    executeParallelApiCalls,
    clearCache,
    abortAllRequests,
    getCacheStats,
    createCacheKey,
    getCachedResponse,
    shouldSkipRequest
  };
};
