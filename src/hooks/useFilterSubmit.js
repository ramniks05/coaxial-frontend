import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook for managing filter state and submission
 * Provides consistent filter behavior across all master data components
 * 
 * @param {Object} initialFilters - Initial filter state
 * @param {Function} fetchDataFn - Function to fetch data with filters
 * @param {Object} options - Configuration options
 * @returns {Object} Filter state and handlers
 */
export const useFilterSubmit = (initialFilters = {}, fetchDataFn, options = {}) => {
  const {
    autoFetchOnMount = false,
    debounceMs = 0,
    onError = null,
    onSuccess = null
  } = options;

  // Filter state management
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  // Refs for debouncing and preventing duplicate calls
  const debounceTimeoutRef = useRef(null);
  const isApplyingRef = useRef(false);

  // Check if filters have changed
  const checkForChanges = useCallback((newFilters) => {
    const hasChanges = JSON.stringify(newFilters) !== JSON.stringify(appliedFilters);
    setHasChanges(hasChanges);
    return hasChanges;
  }, [appliedFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    checkForChanges(newFilters);
    setError(null);
  }, [filters, checkForChanges]);

  // Apply filters with loading state and error handling
  const applyFilters = useCallback(async (filtersToApply = filters) => {
    if (isApplyingRef.current) {
      console.log('Filter application already in progress, skipping...');
      return;
    }

    isApplyingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchDataFn(filtersToApply);
      
      // Update applied filters only on success
      setAppliedFilters(filtersToApply);
      setHasChanges(false);
      
      if (onSuccess) {
        onSuccess(result, filtersToApply);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err?.message || 'Failed to apply filters';
      setError(errorMessage);
      
      if (onError) {
        onError(err, filtersToApply);
      }
      
      throw err;
    } finally {
      setLoading(false);
      isApplyingRef.current = false;
    }
  }, [filters, fetchDataFn, onSuccess, onError]);

  // Debounced apply filters
  const debouncedApplyFilters = useCallback((filtersToApply = filters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      applyFilters(filtersToApply);
    }, debounceMs);
  }, [applyFilters, filters, debounceMs]);

  // Clear all filters
  const clearFilters = useCallback((newFilters = {}) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setHasChanges(false);
    setError(null);
  }, []);

  // Reset to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setHasChanges(false);
    setError(null);
  }, [initialFilters]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'boolean') return value;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });

    return {
      count: activeFilters.length,
      filters: activeFilters.map(([key, value]) => ({ key, value })),
      hasChanges,
      loading,
      error
    };
  }, [filters, hasChanges, loading, error]);

  // Auto-fetch on mount if enabled
  const autoFetch = useCallback(async () => {
    if (autoFetchOnMount && fetchDataFn) {
      try {
        await applyFilters(initialFilters);
      } catch (err) {
        console.warn('Auto-fetch on mount failed:', err);
      }
    }
  }, [autoFetchOnMount, fetchDataFn, applyFilters, initialFilters]);

  // Cleanup debounce timeout on unmount
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  return {
    // State
    filters,
    appliedFilters,
    loading,
    hasChanges,
    error,
    
    // Actions
    handleFilterChange,
    applyFilters,
    debouncedApplyFilters,
    clearFilters,
    resetFilters,
    autoFetch,
    cleanup,
    
    // Utilities
    getFilterSummary,
    checkForChanges
  };
};

export default useFilterSubmit;
