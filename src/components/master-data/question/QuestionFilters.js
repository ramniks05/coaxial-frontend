import React, { memo, useCallback } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../../../constants';

/**
 * Question Filters Component
 * Handles all filtering logic with debounced search
 */
const QuestionFilters = memo(({ 
  filters, 
  onFilterChange, 
  masterData = {} 
}) => {
  const debouncedSearch = useDebounce(filters.search, 300);

  const handleSearchChange = useCallback((e) => {
    onFilterChange('search', e.target.value);
  }, [onFilterChange]);

  const handleFilterChange = useCallback((filterName, value) => {
    onFilterChange(filterName, value);
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange('clear', null);
  }, [onFilterChange]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="form-group">
            <label className="form-label">Search Questions</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by question text..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Subject Filter */}
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={filters.subjectId || ''}
              onChange={(e) => handleFilterChange('subjectId', e.target.value || null)}
            >
              <option value="">All Subjects</option>
              {masterData.subjects?.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div className="form-group">
            <label className="form-label">Topic</label>
            <select
              className="form-select"
              value={filters.topicId || ''}
              onChange={(e) => handleFilterChange('topicId', e.target.value || null)}
              disabled={!filters.subjectId}
            >
              <option value="">All Topics</option>
              {masterData.topics
                ?.filter(topic => topic.subjectId === filters.subjectId)
                ?.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Question Type Filter */}
          <div className="form-group">
            <label className="form-label">Question Type</label>
            <select
              className="form-select"
              value={filters.questionType || ''}
              onChange={(e) => handleFilterChange('questionType', e.target.value || null)}
            >
              <option value="">All Types</option>
              {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level Filter */}
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select
              className="form-select"
              value={filters.difficultyLevel || ''}
              onChange={(e) => handleFilterChange('difficultyLevel', e.target.value || null)}
            >
              <option value="">All Levels</option>
              {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="form-group">
            <label className="form-label">Created From</label>
            <input
              type="date"
              className="form-input"
              value={filters.createdFrom || ''}
              onChange={(e) => handleFilterChange('createdFrom', e.target.value || null)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Created To</label>
            <input
              type="date"
              className="form-input"
              value={filters.createdTo || ''}
              onChange={(e) => handleFilterChange('createdTo', e.target.value || null)}
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            {debouncedSearch && (
              <span>Searching for: "{debouncedSearch}"</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
});

QuestionFilters.displayName = 'QuestionFilters';

export default QuestionFilters;
