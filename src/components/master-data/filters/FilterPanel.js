import React, { useState } from 'react';
import FilterPresets from './controls/FilterPresets';
import './FilterPanel.css';
import AcademicLevelFilters from './sections/AcademicLevelFilters';
import BasicFilters from './sections/BasicFilters';
import ExamSuitabilityFilters from './sections/ExamSuitabilityFilters';
import PreviouslyAskedFilters from './sections/PreviouslyAskedFilters';

const FilterPanel = ({
  filters,
  onFilterChange,
  onResetFilters,
  onLoadPreset,
  onSavePreset,
  savedPresets,
  isLoading,
  isMobile,
  isTablet
}) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    academic: false,
    examSuitability: false,
    previouslyAsked: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const expandAllSections = () => {
    setExpandedSections({
      basic: true,
      academic: true,
      examSuitability: true,
      previouslyAsked: true
    });
  };

  const collapseAllSections = () => {
    setExpandedSections({
      basic: false,
      academic: false,
      examSuitability: false,
      previouslyAsked: false
    });
  };


  return (
    <div className={`filter-panel ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {/* Panel Header */}
      <div className="filter-panel-header">
        <div className="header-content">
          <h3>Question Filters</h3>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={expandAllSections}
            title="Expand all sections"
          >
            Expand All
          </button>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={collapseAllSections}
            title="Collapse all sections"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="filter-panel-content">
        {/* Filter Presets */}
        <FilterPresets
          savedPresets={savedPresets}
          onLoadPreset={onLoadPreset}
          onSavePreset={onSavePreset}
          currentFilters={filters}
          isLoading={isLoading}
        />

        {/* Basic Filters Section */}
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('basic')}
          >
            <h4>Basic Filters</h4>
            <span className={`expand-icon ${expandedSections.basic ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.basic && (
            <div className="filter-section-content">
              <BasicFilters
                filters={filters.basic}
                onFilterChange={(updates) => onFilterChange('basic', updates)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Academic Level Section */}
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('academic')}
          >
            <h4>Academic Level</h4>
            <span className={`expand-icon ${expandedSections.academic ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.academic && (
            <div className="filter-section-content">
              <AcademicLevelFilters
                filters={filters.academic}
                onFilterChange={(updates) => onFilterChange('academic', updates)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Exam Suitability Section */}
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('examSuitability')}
          >
            <h4>Exam Suitability</h4>
            <span className={`expand-icon ${expandedSections.examSuitability ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.examSuitability && (
            <div className="filter-section-content">
              <ExamSuitabilityFilters
                filters={filters.examSuitability}
                onFilterChange={(updates) => onFilterChange('examSuitability', updates)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Previously Asked Section */}
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('previouslyAsked')}
          >
            <h4>Previously Asked</h4>
            <span className={`expand-icon ${expandedSections.previouslyAsked ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.previouslyAsked && (
            <div className="filter-section-content">
              <PreviouslyAskedFilters
                filters={filters.previouslyAsked}
                onFilterChange={(updates) => onFilterChange('previouslyAsked', updates)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default FilterPanel;
