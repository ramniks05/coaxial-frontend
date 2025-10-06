import React, { useState } from 'react';
import FilterActions from './controls/FilterActions';
import FilterPresets from './controls/FilterPresets';
import './FilterPanel.css';
import AcademicLevelFilters from './sections/AcademicLevelFilters';
import BasicFilters from './sections/BasicFilters';
import ExamSuitabilityFilters from './sections/ExamSuitabilityFilters';
import PreviouslyAskedFilters from './sections/PreviouslyAskedFilters';
import SearchDateFilters from './sections/SearchDateFilters';

const FilterPanel = ({
  isOpen,
  onClose,
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
    previouslyAsked: false,
    searchDate: true
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
      previouslyAsked: true,
      searchDate: true
    });
  };

  const collapseAllSections = () => {
    setExpandedSections({
      basic: false,
      academic: false,
      examSuitability: false,
      previouslyAsked: false,
      searchDate: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Basic filters
    if (filters.basic.isActive !== null) count++;
    if (filters.basic.questionType) count++;
    if (filters.basic.difficultyLevels.length > 0) count++;
    if (filters.basic.minMarks !== 1 || filters.basic.maxMarks !== 10) count++;
    
    // Academic filters
    if (filters.academic.courseTypeId) count++;
    if (filters.academic.relationshipId) count++;
    if (filters.academic.subjectId) count++;
    if (filters.academic.topicId) count++;
    if (filters.academic.moduleId) count++;
    if (filters.academic.chapterId) count++;
    
    // Exam suitability
    if (filters.examSuitability.examIds.length > 0) count++;
    if (filters.examSuitability.suitabilityLevels.length > 0) count++;
    if (filters.examSuitability.examTypes.length > 0) count++;
    if (filters.examSuitability.conductingBodies.length > 0) count++;
    
    // Previously asked
    if (filters.previouslyAsked.examIds.length > 0) count++;
    if (filters.previouslyAsked.appearedYears.length > 0) count++;
    if (filters.previouslyAsked.sessions.length > 0) count++;
    if (filters.previouslyAsked.minMarksInExam !== null) count++;
    if (filters.previouslyAsked.maxMarksInExam !== null) count++;
    if (filters.previouslyAsked.questionNumbers.length > 0) count++;
    
    // Search & date
    if (filters.searchDate.questionTextSearch) count++;
    if (filters.searchDate.explanationSearch) count++;
    if (filters.searchDate.dateFrom || filters.searchDate.dateTo) count++;
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (!isOpen) return null;

  return (
    <div className={`filter-panel ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {/* Panel Header */}
      <div className="filter-panel-header">
        <div className="header-content">
          <h3>Question Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="active-filters-badge">
              {activeFiltersCount} active
            </span>
          )}
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
          {isMobile && (
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={onClose}
              title="Close filters"
            >
              ✕
            </button>
          )}
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
            <h4>
              <span className="section-icon">⚙️</span>
              Basic Filters
            </h4>
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
            <h4>
              <span className="section-icon">🎓</span>
              Academic Level
            </h4>
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
            <h4>
              <span className="section-icon">📋</span>
              Exam Suitability
            </h4>
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
            <h4>
              <span className="section-icon">📚</span>
              Previously Asked
            </h4>
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

        {/* Search & Date Section */}
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('searchDate')}
          >
            <h4>
              <span className="section-icon">🔍</span>
              Search & Date
            </h4>
            <span className={`expand-icon ${expandedSections.searchDate ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.searchDate && (
            <div className="filter-section-content">
              <SearchDateFilters
                filters={filters.searchDate}
                onFilterChange={(updates) => onFilterChange('searchDate', updates)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Filter Actions */}
        <FilterActions
          onResetFilters={onResetFilters}
          activeFiltersCount={activeFiltersCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default FilterPanel;
