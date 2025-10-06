import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useFilterPresets } from '../../../hooks/useFilterPresets';
import { useFilterURLSync } from '../../../hooks/useFilterURLSync';
import FilterPanel from './FilterPanel';
import './QuestionFilters.css';
import QuestionResults from './QuestionResults';

// Initial filter state
const initialFilterState = {
  basic: {
    isActive: null, // true/false/null for all
    questionType: '',
    difficultyLevels: [],
    minMarks: 1,
    maxMarks: 10
  },
  academic: {
    courseTypeId: null,
    relationshipId: null,
    subjectId: null,
    topicId: null,
    moduleId: null,
    chapterId: null
  },
  examSuitability: {
    examIds: [],
    suitabilityLevels: [],
    examTypes: [],
    conductingBodies: []
  },
  previouslyAsked: {
    examIds: [],
    appearedYears: [],
    sessions: [],
    minMarksInExam: null,
    maxMarksInExam: null,
    questionNumbers: []
  },
  searchDate: {
    questionTextSearch: '',
    explanationSearch: '',
    dateFrom: null,
    dateTo: null,
    page: 0,
    size: 20
  },
  presets: {
    saved: [],
    active: null
  }
};

// Filter reducer for state management
const filterReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_BASIC':
      return {
        ...state,
        basic: { ...state.basic, ...action.payload }
      };
    case 'UPDATE_ACADEMIC':
      return {
        ...state,
        academic: { ...state.academic, ...action.payload }
      };
    case 'UPDATE_EXAM_SUITABILITY':
      return {
        ...state,
        examSuitability: { ...state.examSuitability, ...action.payload }
      };
    case 'UPDATE_PREVIOUSLY_ASKED':
      return {
        ...state,
        previouslyAsked: { ...state.previouslyAsked, ...action.payload }
      };
    case 'UPDATE_SEARCH_DATE':
      return {
        ...state,
        searchDate: { ...state.searchDate, ...action.payload }
      };
    case 'RESET_FILTERS':
      return {
        ...initialFilterState,
        presets: state.presets // Keep saved presets
      };
    case 'LOAD_PRESET':
      return {
        ...action.payload,
        presets: state.presets
      };
    case 'UPDATE_PRESETS':
      return {
        ...state,
        presets: { ...state.presets, ...action.payload }
      };
    default:
      return state;
  }
};

const QuestionFilters = ({ onBackToDashboard }) => {
  const { addNotification, token } = useApp();
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Custom hooks for URL sync and presets
  const { syncFiltersToURL, loadFiltersFromURL } = useFilterURLSync();
  const { savedPresets, savePreset, loadPreset, deletePreset } = useFilterPresets();

  // Update presets in state
  useEffect(() => {
    dispatch({
      type: 'UPDATE_PRESETS',
      payload: {
        saved: savedPresets,
        active: filters.presets.active
      }
    });
  }, [savedPresets]);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = loadFiltersFromURL();
    if (urlFilters) {
      Object.keys(urlFilters).forEach(section => {
        if (urlFilters[section]) {
          dispatch({
            type: `UPDATE_${section.toUpperCase()}`,
            payload: urlFilters[section]
          });
        }
      });
    }
  }, [loadFiltersFromURL]);

  // Sync filters to URL when they change
  useEffect(() => {
    syncFiltersToURL(filters);
  }, [filters, syncFiltersToURL]);

  // Filter change handler
  const handleFilterChange = useCallback((section, updates) => {
    dispatch({
      type: `UPDATE_${section.toUpperCase()}`,
      payload: updates
    });
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Load preset
  const handleLoadPreset = useCallback((presetId) => {
    const preset = loadPreset(presetId);
    if (preset) {
      dispatch({
        type: 'LOAD_PRESET',
        payload: preset
      });
    }
  }, [loadPreset]);

  // Save current filters as preset
  const handleSavePreset = useCallback((presetName) => {
    const success = savePreset(presetName, filters);
    if (success) {
      addNotification({
        type: 'success',
        message: `Filter preset "${presetName}" saved successfully`,
        duration: 3000
      });
    } else {
      addNotification({
        type: 'error',
        message: 'Failed to save filter preset',
        duration: 3000
      });
    }
  }, [filters, savePreset, addNotification]);

  // Apply filters and fetch questions
  const handleApplyFilters = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      // Prepare API request payload
      const requestPayload = {
        ...filters.basic,
        ...filters.academic,
        ...filters.examSuitability,
        ...filters.previouslyAsked,
        ...filters.searchDate
      };

      // Remove null/empty values
      Object.keys(requestPayload).forEach(key => {
        if (requestPayload[key] === null || 
            requestPayload[key] === '' || 
            (Array.isArray(requestPayload[key]) && requestPayload[key].length === 0)) {
          delete requestPayload[key];
        }
      });

      console.log('Applying filters:', requestPayload);

      // Make API call (using existing getQuestions for now, will enhance later)
      const response = await fetch('/api/admin/master-data/questions/filter', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        setQuestions(data);
        setTotalCount(data.length);
      } else if (data.content && Array.isArray(data.content)) {
        setQuestions(data.content);
        setTotalCount(data.totalElements || data.content.length);
      } else if (data.data && Array.isArray(data.data)) {
        setQuestions(data.data);
        setTotalCount(data.total || data.data.length);
      } else {
        setQuestions([]);
        setTotalCount(0);
      }

    } catch (error) {
      console.error('Error applying filters:', error);
      addNotification({
        type: 'error',
        message: 'Failed to apply filters. Using fallback method.',
        duration: 5000
      });
      
      // Fallback to existing method
      try {
        const response = await fetch('/api/admin/master-data/questions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setQuestions(Array.isArray(data) ? data : (data.content || data.data || []));
        setTotalCount(Array.isArray(data) ? data.length : (data.totalElements || data.total || 0));
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setQuestions([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, token, addNotification]);

  // Auto-apply filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleApplyFilters();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [handleApplyFilters]);

  // Responsive behavior
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024;

  return (
    <div className="question-filters-container">
      {/* Header */}
      <div className="filters-header">
        <div className="header-info">
          <h2>Enhanced Question Management</h2>
          <p>Advanced filtering and search capabilities</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={onBackToDashboard}
            disabled={isLoading}
          >
            ← Back to Dashboard
          </button>
          <button 
            className="btn btn-outline"
            onClick={handleResetFilters}
            disabled={isLoading}
          >
            Reset Filters
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          >
            {isFilterPanelOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      <div className="filters-layout">
        {/* Filter Panel */}
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onLoadPreset={handleLoadPreset}
          onSavePreset={handleSavePreset}
          savedPresets={savedPresets}
          isLoading={isLoading}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Results Area */}
        <div className="results-area">
          <QuestionResults
            questions={questions}
            totalCount={totalCount}
            isLoading={isLoading}
            filters={filters}
            onPageChange={(page) => {
              handleFilterChange('searchDate', { page });
            }}
            onPageSizeChange={(size) => {
              handleFilterChange('searchDate', { size, page: 0 });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionFilters;
