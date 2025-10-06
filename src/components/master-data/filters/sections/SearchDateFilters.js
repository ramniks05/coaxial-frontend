import React, { useCallback, useState } from 'react';
import './SearchDateFilters.css';

const SearchDateFilters = ({ filters, onFilterChange, isLoading }) => {
  const [localQuestionSearch, setLocalQuestionSearch] = useState(filters.questionTextSearch || '');
  const [localExplanationSearch, setLocalExplanationSearch] = useState(filters.explanationSearch || '');

  // Debounced search handlers
  const debouncedQuestionSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onFilterChange({ questionTextSearch: searchTerm });
        }, 300);
      };
    })(),
    [onFilterChange]
  );

  const debouncedExplanationSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onFilterChange({ explanationSearch: searchTerm });
        }, 300);
      };
    })(),
    [onFilterChange]
  );

  // Handle question text search
  const handleQuestionSearchChange = (e) => {
    const value = e.target.value;
    setLocalQuestionSearch(value);
    debouncedQuestionSearch(value);
  };

  // Handle explanation search
  const handleExplanationSearchChange = (e) => {
    const value = e.target.value;
    setLocalExplanationSearch(value);
    debouncedExplanationSearch(value);
  };

  // Handle date range changes
  const handleDateChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    onFilterChange({ 
      size: parseInt(size), 
      page: 0 // Reset to first page when changing page size
    });
  };

  // Clear search inputs
  const clearQuestionSearch = () => {
    setLocalQuestionSearch('');
    onFilterChange({ questionTextSearch: '' });
  };

  const clearExplanationSearch = () => {
    setLocalExplanationSearch('');
    onFilterChange({ explanationSearch: '' });
  };

  // Clear date filters
  const clearDateFilters = () => {
    onFilterChange({ 
      dateFrom: null, 
      dateTo: null 
    });
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get date one year ago
  const getOneYearAgoDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="search-date-filters">
      {/* Question Text Search */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🔍</span>
          Question Text Search
        </label>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search in question text..."
            value={localQuestionSearch}
            onChange={handleQuestionSearchChange}
            disabled={isLoading}
            className="search-input"
          />
          {localQuestionSearch && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={clearQuestionSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="search-help">
          Search for specific words or phrases in question content
        </div>
      </div>

      {/* Explanation Search */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📝</span>
          Explanation Search
        </label>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search in explanations..."
            value={localExplanationSearch}
            onChange={handleExplanationSearchChange}
            disabled={isLoading}
            className="search-input"
          />
          {localExplanationSearch && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={clearExplanationSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="search-help">
          Search for specific content in question explanations
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📅</span>
          Date Range
        </label>
        <div className="date-range-container">
          <div className="date-input-group">
            <label className="date-label">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              disabled={isLoading}
              className="date-input"
              max={getTodayDate()}
            />
          </div>
          <div className="date-separator">to</div>
          <div className="date-input-group">
            <label className="date-label">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              disabled={isLoading}
              className="date-input"
              max={getTodayDate()}
            />
          </div>
        </div>
        
        {/* Quick Date Presets */}
        <div className="date-presets">
          <button
            type="button"
            className="preset-btn"
            onClick={() => {
              const today = getTodayDate();
              handleDateChange('dateTo', today);
              handleDateChange('dateFrom', today);
            }}
            disabled={isLoading}
          >
            Today
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => {
              const today = getTodayDate();
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              handleDateChange('dateFrom', weekAgo.toISOString().split('T')[0]);
              handleDateChange('dateTo', today);
            }}
            disabled={isLoading}
          >
            Last 7 days
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => {
              const today = getTodayDate();
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              handleDateChange('dateFrom', monthAgo.toISOString().split('T')[0]);
              handleDateChange('dateTo', today);
            }}
            disabled={isLoading}
          >
            Last month
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => {
              const today = getTodayDate();
              const yearAgo = getOneYearAgoDate();
              handleDateChange('dateFrom', yearAgo);
              handleDateChange('dateTo', today);
            }}
            disabled={isLoading}
          >
            Last year
          </button>
          <button
            type="button"
            className="preset-btn clear"
            onClick={clearDateFilters}
            disabled={isLoading}
          >
            Clear dates
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📄</span>
          Results per Page
        </label>
        <div className="pagination-controls">
          <select
            className="page-size-select"
            value={filters.size || 20}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            disabled={isLoading}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          
          <div className="pagination-info">
            Page {filters.page + 1 || 1} • {filters.size || 20} results per page
          </div>
        </div>
      </div>

      {/* Advanced Search Options */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">⚙️</span>
          Advanced Options
        </label>
        <div className="advanced-options">
          <div className="option-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.exactMatch || false}
                onChange={(e) => onFilterChange({ exactMatch: e.target.checked })}
                disabled={isLoading}
              />
              <span className="checkbox-label">Exact phrase match</span>
            </label>
          </div>
          
          <div className="option-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.caseSensitive || false}
                onChange={(e) => onFilterChange({ caseSensitive: e.target.checked })}
                disabled={isLoading}
              />
              <span className="checkbox-label">Case sensitive search</span>
            </label>
          </div>
          
          <div className="option-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.includeTags || false}
                onChange={(e) => onFilterChange({ includeTags: e.target.checked })}
                disabled={isLoading}
              />
              <span className="checkbox-label">Include tags in search</span>
            </label>
          </div>
        </div>
      </div>

      {/* Applied Filters Summary */}
      {(filters.questionTextSearch || 
        filters.explanationSearch || 
        filters.dateFrom || 
        filters.dateTo ||
        filters.exactMatch ||
        filters.caseSensitive ||
        filters.includeTags) && (
        <div className="applied-filters">
          <h5>Applied Search & Date Filters:</h5>
          <div className="filter-tags">
            {filters.questionTextSearch && (
              <span className="filter-tag">
                Question: "{filters.questionTextSearch}"
                <button
                  type="button"
                  onClick={clearQuestionSearch}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.explanationSearch && (
              <span className="filter-tag">
                Explanation: "{filters.explanationSearch}"
                <button
                  type="button"
                  onClick={clearExplanationSearch}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="filter-tag">
                Date: {filters.dateFrom || 'Start'} to {filters.dateTo || 'End'}
                <button
                  type="button"
                  onClick={clearDateFilters}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.exactMatch && (
              <span className="filter-tag">
                Exact Match
                <button
                  type="button"
                  onClick={() => onFilterChange({ exactMatch: false })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.caseSensitive && (
              <span className="filter-tag">
                Case Sensitive
                <button
                  type="button"
                  onClick={() => onFilterChange({ caseSensitive: false })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.includeTags && (
              <span className="filter-tag">
                Include Tags
                <button
                  type="button"
                  onClick={() => onFilterChange({ includeTags: false })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDateFilters;
