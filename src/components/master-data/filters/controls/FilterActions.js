import React from 'react';
import './FilterActions.css';

const FilterActions = ({ 
  onResetFilters, 
  activeFiltersCount, 
  isLoading 
}) => {
  return (
    <div className="filter-actions">
      <div className="actions-header">
        <h4>
          <span className="section-icon">⚡</span>
          Quick Actions
        </h4>
        {activeFiltersCount > 0 && (
          <span className="active-count-badge">
            {activeFiltersCount} active
          </span>
        )}
      </div>

      <div className="actions-content">
        {/* Reset Filters */}
        <button
          type="button"
          className="action-btn reset-btn"
          onClick={onResetFilters}
          disabled={isLoading || activeFiltersCount === 0}
          title={activeFiltersCount > 0 ? 'Clear all active filters' : 'No filters to reset'}
        >
          <span className="btn-icon">🔄</span>
          Reset All Filters
        </button>

        {/* Bulk Actions */}
        <div className="bulk-actions">
          <h5>Bulk Actions</h5>
          <div className="bulk-buttons">
            <button
              type="button"
              className="action-btn secondary-btn"
              disabled={isLoading}
              title="Select all visible results"
            >
              <span className="btn-icon">✅</span>
              Select All
            </button>
            <button
              type="button"
              className="action-btn secondary-btn"
              disabled={isLoading}
              title="Clear all selections"
            >
              <span className="btn-icon">❌</span>
              Clear Selection
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="export-actions">
          <h5>Export Results</h5>
          <div className="export-buttons">
            <button
              type="button"
              className="action-btn export-btn"
              disabled={isLoading}
              title="Export filtered results as CSV"
            >
              <span className="btn-icon">📊</span>
              Export CSV
            </button>
            <button
              type="button"
              className="action-btn export-btn"
              disabled={isLoading}
              title="Export filtered results as PDF"
            >
              <span className="btn-icon">📄</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter Statistics */}
        {activeFiltersCount > 0 && (
          <div className="filter-stats">
            <h5>Filter Statistics</h5>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Active Filters:</span>
                <span className="stat-value">{activeFiltersCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Results:</span>
                <span className="stat-value">Loading...</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Updated:</span>
                <span className="stat-value">Just now</span>
              </div>
            </div>
          </div>
        )}

        {/* Help & Tips */}
        <div className="help-section">
          <h5>💡 Tips</h5>
          <div className="help-tips">
            <div className="tip-item">
              <span className="tip-icon">🔍</span>
              <span className="tip-text">Use the search inputs for quick text filtering</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">💾</span>
              <span className="tip-text">Save frequently used filter combinations as presets</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📱</span>
              <span className="tip-text">Filters work seamlessly across desktop and mobile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterActions;
