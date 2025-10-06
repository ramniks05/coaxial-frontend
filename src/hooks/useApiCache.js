import { useCallback, useRef, useState, useEffect } from 'react';
import { CACHE_CONFIG, DEBOUNCE_DELAYS } from '../constants';

/**
 * Enhanced API Cache Hook with Request Deduplication
 * Prevents multiple identical API calls and provides intelligent caching
 */
export const useApiCache = () => {
  const cache = useRef(new Map());
  const pendingRequests = useRef(new Map());
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0, size: 0 });

  const generateCacheKey = useCallback((endpoint, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }, []);

  const isCacheValid = useCallback((cacheEntry) => {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }, []);

  const getCachedData = useCallback((key) => {
    const cacheEntry = cache.current.get(key);
    if (isCacheValid(cacheEntry)) {
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return cacheEntry.data;
    }
    
    if (cacheEntry) {
      cache.current.delete(key);
      setCacheStats(prev => ({ ...prev, size: cache.current.size }));
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [isCacheValid]);

  const setCachedData = useCallback((key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
    // Clean up old entries if cache is too large
    if (cache.current.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = cache.current.keys().next().value;
      cache.current.delete(oldestKey);
    }

    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    setCacheStats(prev => ({ ...prev, size: cache.current.size }));
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
    setCacheStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  const invalidateCache = useCallback((pattern) => {
    const keysToDelete = [];
    for (const key of cache.current.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cache.current.delete(key));
    setCacheStats(prev => ({ ...prev, size: cache.current.size }));
  }, []);

  return {
    generateCacheKey,
    getCachedData,
    setCachedData,
    clearCache,
    invalidateCache,
    cacheStats
  };
};

/**
 * Debounced API Call Hook
 * Prevents excessive API calls during rapid user input
 */
export const useDebouncedApiCall = (apiFunction, delay = DEBOUNCE_DELAYS.API_CALL) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const debouncedCall = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [apiFunction, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { data, loading, error, debouncedCall };
};

/**
 * Optimized API Hook with Caching and Error Handling
 */
export const useOptimizedApi = (apiFunction, options = {}) => {
  const {
    cacheKey,
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    enabled = true,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { generateCacheKey, getCachedData, setCachedData } = useApiCache();

  const executeApiCall = useCallback(async (params = {}) => {
    if (!enabled) return;

    const key = cacheKey || generateCacheKey(apiFunction.name, params);
    
    // Check cache first
    const cachedData = getCachedData(key);
    if (cachedData) {
      setData(cachedData);
      return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(params);
      setData(result);
      setCachedData(key, result, ttl);
      setRetryCount(0);
      return result;
    } catch (err) {
      setError(err);
      
      // Retry logic
      if (retryCount < retryAttempts) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          executeApiCall(params);
        }, retryDelay * Math.pow(2, retryCount));
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey, ttl, enabled, retryAttempts, retryDelay, retryCount, generateCacheKey, getCachedData, setCachedData]);

  const refetch = useCallback((params = {}) => {
    setRetryCount(0);
    return executeApiCall(params);
  }, [executeApiCall]);

  return {
    data,
    loading,
    error,
    refetch,
    retryCount
  };
};

/**
 * Batch API Calls Hook
 * Optimizes multiple API calls by batching them
 */
export const useBatchApi = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const executeBatch = useCallback(async (apiCalls) => {
    setLoading(true);
    setErrors({});

    try {
      const promises = Object.entries(apiCalls).map(async ([key, apiCall]) => {
        try {
          const result = await apiCall();
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
  }, []);

  return {
    loading,
    results,
    errors,
    executeBatch
  };
};

/**
 * Infinite Scroll API Hook
 * Handles pagination and infinite scrolling
 */
export const useInfiniteApi = (apiFunction, options = {}) => {
  const {
    pageSize = 10,
    initialPage = 1,
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const loadData = useCallback(async (page = initialPage, append = false) => {
    if (!enabled) return;

    const isLoadingMore = page > initialPage;
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      const result = await apiFunction({
        page,
        limit: pageSize
      });

      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }

      setHasMore(result.hasMore || result.data.length === pageSize);
      setCurrentPage(page);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiFunction, pageSize, initialPage, enabled]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadData(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, currentPage, loadData]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  useEffect(() => {
    if (enabled) {
      loadData();
    }
  }, [enabled, loadData]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    refetch: () => loadData(initialPage, false)
  };
};
