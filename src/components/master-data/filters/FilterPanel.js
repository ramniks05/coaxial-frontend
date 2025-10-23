import React, { useEffect, useState } from 'react';
import './FilterPanel.css';

/**
 * Reusable Filter Panel Component
 * Provides consistent filter UI across all master data components
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {Function} props.onApplyFilters - Handler for applying filters
 * @param {Function} props.onClearFilters - Handler for clearing filters
 * @param {boolean} props.loading - Loading state
 * @param {Array} props.filterConfig - Configuration for filter fields
 * @param {Object} props.masterData - Master data for dropdowns
 * @param {boolean} props.hasChanges - Whether filters have been changed
 */
const FilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
  filterConfig = [],
  masterData = {},
  hasChanges = false
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(field, value);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {};
    filterConfig.forEach(config => {
      if (config.defaultValue !== undefined) {
        clearedFilters[config.field] = config.defaultValue;
      }
    });
    setLocalFilters(clearedFilters);
    onClearFilters(clearedFilters);
  };

  const renderFilterField = (config) => {
    const { field, type, label, options, placeholder, disabled, condition } = config;
    const value = localFilters[field] || '';

    // Check if field should be displayed based on condition
    if (condition && !condition(localFilters)) {
      return null;
    }

    switch (type) {
      case 'select':
        return (
          <div key={field} className="filter-field">
            <label htmlFor={field}>{label}</label>
            <select
              id={field}
              value={value}
              onChange={(e) => handleFilterChange(field, e.target.value)}
              disabled={disabled || loading}
              className="filter-input"
            >
              <option value="">{placeholder || `Select ${label}`}</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'toggle':
        return (
          <div key={field} className="filter-field filter-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleFilterChange(field, e.target.checked)}
                disabled={disabled || loading}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              {label}
            </label>
          </div>
        );

      case 'search':
        return (
          <div key={field} className="filter-field">
            <label htmlFor={field}>{label}</label>
            <input
              type="text"
              id={field}
              value={value}
              onChange={(e) => handleFilterChange(field, e.target.value)}
              placeholder={placeholder || `Search ${label.toLowerCase()}`}
              disabled={disabled || loading}
              className="filter-input"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== '' && value !== null && value !== undefined && value !== false
    ).length;
  };

  const activeFilterCount = getActiveFilterCount();

  console.log('🔄 FilterPanel Debug:', {
    filters: filters,
    filterConfig: filterConfig,
    filterConfigLength: filterConfig?.length,
    masterData: masterData,
    hasChanges: hasChanges,
    loading: loading
  });

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
      </div>

      <div className="filter-fields">
        {filterConfig.map(renderFilterField)}
      </div>

      <div className="filter-actions">
        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className={`btn btn-primary ${hasChanges ? 'btn-highlight' : ''}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Applying...
            </>
          ) : (
            'Apply Filters'
          )}
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          disabled={loading || activeFilterCount === 0}
          className="btn btn-outline"
        >
          Clear All
        </button>
      </div>

    </div>
  );
};

export default FilterPanel;