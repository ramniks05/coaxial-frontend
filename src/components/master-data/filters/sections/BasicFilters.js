import React, { useCallback, useState } from 'react';
import './BasicFilters.css';

const BasicFilters = ({ filters, onFilterChange, isLoading }) => {
  const [localSearch, setLocalSearch] = useState('');

  // Debounced search handler
  const handleSearch = useCallback(
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

  const handleLocalSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    handleSearch(value);
  };

  const handleActiveStatusChange = (status) => {
    let newStatus;
    if (status === 'all') newStatus = null;
    else if (status === 'active') newStatus = true;
    else newStatus = false;
    
    onFilterChange({ isActive: newStatus });
  };

  const handleQuestionTypeChange = (type) => {
    onFilterChange({ questionType: type });
  };

  const handleDifficultyChange = (difficulty) => {
    const currentLevels = filters.difficultyLevels || [];
    let newLevels;
    
    if (currentLevels.includes(difficulty)) {
      newLevels = currentLevels.filter(level => level !== difficulty);
    } else {
      newLevels = [...currentLevels, difficulty];
    }
    
    onFilterChange({ difficultyLevels: newLevels });
  };

  const handleMarksChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    onFilterChange({ [field]: numValue });
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="basic-filters">
      {/* Active Status */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🔄</span>
          Status
        </label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="activeStatus"
              value="all"
              checked={filters.isActive === null}
              onChange={() => handleActiveStatusChange('all')}
              disabled={isLoading}
            />
            <span className="radio-label">All</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="activeStatus"
              value="active"
              checked={filters.isActive === true}
              onChange={() => handleActiveStatusChange('active')}
              disabled={isLoading}
            />
            <span className="radio-label active">Active</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="activeStatus"
              value="inactive"
              checked={filters.isActive === false}
              onChange={() => handleActiveStatusChange('inactive')}
              disabled={isLoading}
            />
            <span className="radio-label inactive">Inactive</span>
          </label>
        </div>
      </div>

      {/* Question Type */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📝</span>
          Question Type
        </label>
        <select
          className="filter-select"
          value={filters.questionType || ''}
          onChange={(e) => handleQuestionTypeChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Types</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="FILL_IN_BLANK">Fill in the Blank</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="ESSAY">Essay</option>
        </select>
      </div>

      {/* Difficulty Level */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📊</span>
          Difficulty Level
        </label>
        <div className="checkbox-group">
          {['EASY', 'MEDIUM', 'HARD'].map(level => (
            <label key={level} className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.difficultyLevels?.includes(level) || false}
                onChange={() => handleDifficultyChange(level)}
                disabled={isLoading}
              />
              <span 
                className="checkbox-label"
                style={{ 
                  color: getDifficultyColor(level),
                  fontWeight: filters.difficultyLevels?.includes(level) ? '600' : '400'
                }}
              >
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Marks Range */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">⭐</span>
          Marks Range
        </label>
        <div className="range-inputs">
          <div className="range-input">
            <label>Min</label>
            <input
              type="number"
              min="0"
              max="10"
              value={filters.minMarks || 1}
              onChange={(e) => handleMarksChange('minMarks', e.target.value)}
              disabled={isLoading}
              className="range-number"
            />
          </div>
          <div className="range-separator">to</div>
          <div className="range-input">
            <label>Max</label>
            <input
              type="number"
              min="0"
              max="10"
              value={filters.maxMarks || 10}
              onChange={(e) => handleMarksChange('maxMarks', e.target.value)}
              disabled={isLoading}
              className="range-number"
            />
          </div>
        </div>
        
        {/* Marks Range Slider */}
        <div className="range-slider-container">
          <input
            type="range"
            min="0"
            max="10"
            value={filters.minMarks || 1}
            onChange={(e) => handleMarksChange('minMarks', e.target.value)}
            disabled={isLoading}
            className="range-slider min"
          />
          <input
            type="range"
            min="0"
            max="10"
            value={filters.maxMarks || 10}
            onChange={(e) => handleMarksChange('maxMarks', e.target.value)}
            disabled={isLoading}
            className="range-slider max"
          />
        </div>
      </div>

      {/* Quick Search */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🔍</span>
          Quick Search
        </label>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search question text..."
            value={localSearch}
            onChange={handleLocalSearchChange}
            disabled={isLoading}
            className="search-input"
          />
          {localSearch && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setLocalSearch('');
                onFilterChange({ questionTextSearch: '' });
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Applied Filters Summary */}
      {(filters.questionType || 
        (filters.difficultyLevels && filters.difficultyLevels.length > 0) ||
        filters.minMarks !== 1 || filters.maxMarks !== 10) && (
        <div className="applied-filters">
          <h5>Applied Basic Filters:</h5>
          <div className="filter-tags">
            {filters.questionType && (
              <span className="filter-tag">
                Type: {filters.questionType.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => onFilterChange({ questionType: '' })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.difficultyLevels && filters.difficultyLevels.length > 0 && (
              <span className="filter-tag">
                Difficulty: {filters.difficultyLevels.join(', ')}
                <button
                  type="button"
                  onClick={() => onFilterChange({ difficultyLevels: [] })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.minMarks !== 1 || filters.maxMarks !== 10) && (
              <span className="filter-tag">
                Marks: {filters.minMarks}-{filters.maxMarks}
                <button
                  type="button"
                  onClick={() => onFilterChange({ minMarks: 1, maxMarks: 10 })}
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

export default BasicFilters;
