import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../../context/AppContext';
import './ExamSuitabilityFilters.css';

const ExamSuitabilityFilters = ({ filters, onFilterChange, isLoading }) => {
  const { token } = useApp();
  
  // State for dropdown options
  const [masterExams, setMasterExams] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [conductingBodies, setConductingBodies] = useState([]);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    masterExams: false,
    examTypes: false,
    conductingBodies: false
  });

  // Multi-select dropdown state
  const [dropdownStates, setDropdownStates] = useState({
    examDropdown: false,
    examTypeDropdown: false,
    conductingBodyDropdown: false
  });

  // Fetch master exams
  const fetchMasterExams = useCallback(async () => {
    if (!token) return;
    
    setLoadingStates(prev => ({ ...prev, masterExams: true }));
    try {
      const response = await fetch('/api/public/master-exams/kv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMasterExams(data);
      } else if (data.content) {
        setMasterExams(data.content);
      }
    } catch (error) {
      console.error('Error fetching master exams:', error);
      // Fallback to hardcoded data
      setMasterExams([
        { id: 1, name: 'JEE Main', conductingBody: 'NTA' },
        { id: 2, name: 'NEET', conductingBody: 'NTA' },
        { id: 3, name: 'GATE', conductingBody: 'IIT' },
        { id: 4, name: 'UPSC', conductingBody: 'UPSC' },
        { id: 5, name: 'SSC CGL', conductingBody: 'SSC' },
        { id: 6, name: 'IBPS PO', conductingBody: 'IBPS' },
        { id: 7, name: 'CAT', conductingBody: 'IIM' },
        { id: 8, name: 'XAT', conductingBody: 'XLRI' }
      ]);
    } finally {
      setLoadingStates(prev => ({ ...prev, masterExams: false }));
    }
  }, [token]);

  // Fetch exam types (hardcoded for now)
  const fetchExamTypes = useCallback(async () => {
    setExamTypes([
      { id: 'ENTRANCE', name: 'Entrance Exam' },
      { id: 'BOARD', name: 'Board Exam' },
      { id: 'COMPETITIVE', name: 'Competitive Exam' },
      { id: 'PROFESSIONAL', name: 'Professional Exam' }
    ]);
  }, []);

  // Fetch conducting bodies
  const fetchConductingBodies = useCallback(async () => {
    const uniqueBodies = [...new Set(masterExams.map(exam => exam.conductingBody))];
    setConductingBodies(uniqueBodies.map((body, index) => ({
      id: index + 1,
      name: body
    })));
  }, [masterExams]);

  // Load data on mount
  useEffect(() => {
    fetchMasterExams();
    fetchExamTypes();
  }, [fetchMasterExams, fetchExamTypes]);

  // Update conducting bodies when master exams change
  useEffect(() => {
    fetchConductingBodies();
  }, [fetchConductingBodies]);

  // Handle exam selection
  const handleExamSelection = (examId) => {
    const currentExams = filters.examIds || [];
    let newExams;
    
    if (currentExams.includes(examId)) {
      newExams = currentExams.filter(id => id !== examId);
    } else {
      newExams = [...currentExams, examId];
    }
    
    onFilterChange({ examIds: newExams });
  };

  // Handle exam type selection
  const handleExamTypeSelection = (examTypeId) => {
    const currentTypes = filters.examTypes || [];
    let newTypes;
    
    if (currentTypes.includes(examTypeId)) {
      newTypes = currentTypes.filter(type => type !== examTypeId);
    } else {
      newTypes = [...currentTypes, examTypeId];
    }
    
    onFilterChange({ examTypes: newTypes });
  };

  // Handle conducting body selection
  const handleConductingBodySelection = (bodyId) => {
    const currentBodies = filters.conductingBodies || [];
    let newBodies;
    
    if (currentBodies.includes(bodyId)) {
      newBodies = currentBodies.filter(id => id !== bodyId);
    } else {
      newBodies = [...currentBodies, bodyId];
    }
    
    onFilterChange({ conductingBodies: newBodies });
  };

  // Handle suitability level selection
  const handleSuitabilityLevelSelection = (level) => {
    const currentLevels = filters.suitabilityLevels || [];
    let newLevels;
    
    if (currentLevels.includes(level)) {
      newLevels = currentLevels.filter(l => l !== level);
    } else {
      newLevels = [...currentLevels, level];
    }
    
    onFilterChange({ suitabilityLevels: newLevels });
  };

  // Toggle dropdown
  const toggleDropdown = (dropdown) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.multi-select-dropdown')) {
        setDropdownStates({
          examDropdown: false,
          examTypeDropdown: false,
          conductingBodyDropdown: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuitabilityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSelectedExamNames = () => {
    return masterExams
      .filter(exam => filters.examIds?.includes(exam.id))
      .map(exam => exam.name)
      .join(', ');
  };

  const getSelectedExamTypeNames = () => {
    return examTypes
      .filter(type => filters.examTypes?.includes(type.id))
      .map(type => type.name)
      .join(', ');
  };

  const getSelectedConductingBodyNames = () => {
    return conductingBodies
      .filter(body => filters.conductingBodies?.includes(body.id))
      .map(body => body.name)
      .join(', ');
  };

  return (
    <div className="exam-suitability-filters">
      {/* Master Exams Multi-Select */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📋</span>
          Master Exams
        </label>
        <div className="multi-select-dropdown">
          <div 
            className="multi-select-trigger"
            onClick={() => toggleDropdown('examDropdown')}
          >
            <span className="selected-text">
              {filters.examIds?.length > 0 
                ? `${filters.examIds.length} exams selected`
                : 'Select exams...'
              }
            </span>
            <span className={`dropdown-arrow ${dropdownStates.examDropdown ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          
          {dropdownStates.examDropdown && (
            <div className="multi-select-options">
              {loadingStates.masterExams ? (
                <div className="loading-option">Loading exams...</div>
              ) : (
                masterExams.map(exam => (
                  <label key={exam.id} className="multi-select-option">
                    <input
                      type="checkbox"
                      checked={filters.examIds?.includes(exam.id) || false}
                      onChange={() => handleExamSelection(exam.id)}
                      disabled={isLoading}
                    />
                    <span className="option-text">{exam.name}</span>
                    <span className="option-meta">({exam.conductingBody})</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Selected Exams Display */}
        {filters.examIds?.length > 0 && (
          <div className="selected-items">
            {filters.examIds.map(examId => {
              const exam = masterExams.find(e => e.id === examId);
              return exam ? (
                <span key={examId} className="selected-tag">
                  {exam.name}
                  <button
                    type="button"
                    onClick={() => handleExamSelection(examId)}
                    className="remove-tag"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Suitability Levels */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📊</span>
          Suitability Levels
        </label>
        <div className="checkbox-group">
          {['HIGH', 'MEDIUM', 'LOW'].map(level => (
            <label key={level} className="checkbox-option">
              <input
                type="checkbox"
                checked={filters.suitabilityLevels?.includes(level) || false}
                onChange={() => handleSuitabilityLevelSelection(level)}
                disabled={isLoading}
              />
              <span 
                className="checkbox-label"
                style={{ 
                  color: getSuitabilityColor(level),
                  fontWeight: filters.suitabilityLevels?.includes(level) ? '600' : '400'
                }}
              >
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Exam Types */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🏷️</span>
          Exam Types
        </label>
        <div className="multi-select-dropdown">
          <div 
            className="multi-select-trigger"
            onClick={() => toggleDropdown('examTypeDropdown')}
          >
            <span className="selected-text">
              {filters.examTypes?.length > 0 
                ? `${filters.examTypes.length} types selected`
                : 'Select types...'
              }
            </span>
            <span className={`dropdown-arrow ${dropdownStates.examTypeDropdown ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          
          {dropdownStates.examTypeDropdown && (
            <div className="multi-select-options">
              {examTypes.map(type => (
                <label key={type.id} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={filters.examTypes?.includes(type.id) || false}
                    onChange={() => handleExamTypeSelection(type.id)}
                    disabled={isLoading}
                  />
                  <span className="option-text">{type.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Types Display */}
        {filters.examTypes?.length > 0 && (
          <div className="selected-items">
            {filters.examTypes.map(typeId => {
              const type = examTypes.find(t => t.id === typeId);
              return type ? (
                <span key={typeId} className="selected-tag">
                  {type.name}
                  <button
                    type="button"
                    onClick={() => handleExamTypeSelection(typeId)}
                    className="remove-tag"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Conducting Bodies */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🏛️</span>
          Conducting Bodies
        </label>
        <div className="multi-select-dropdown">
          <div 
            className="multi-select-trigger"
            onClick={() => toggleDropdown('conductingBodyDropdown')}
          >
            <span className="selected-text">
              {filters.conductingBodies?.length > 0 
                ? `${filters.conductingBodies.length} bodies selected`
                : 'Select bodies...'
              }
            </span>
            <span className={`dropdown-arrow ${dropdownStates.conductingBodyDropdown ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          
          {dropdownStates.conductingBodyDropdown && (
            <div className="multi-select-options">
              {conductingBodies.map(body => (
                <label key={body.id} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={filters.conductingBodies?.includes(body.id) || false}
                    onChange={() => handleConductingBodySelection(body.id)}
                    disabled={isLoading}
                  />
                  <span className="option-text">{body.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Bodies Display */}
        {filters.conductingBodies?.length > 0 && (
          <div className="selected-items">
            {filters.conductingBodies.map(bodyId => {
              const body = conductingBodies.find(b => b.id === bodyId);
              return body ? (
                <span key={bodyId} className="selected-tag">
                  {body.name}
                  <button
                    type="button"
                    onClick={() => handleConductingBodySelection(bodyId)}
                    className="remove-tag"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Applied Filters Summary */}
      {(filters.examIds?.length > 0 || 
        filters.suitabilityLevels?.length > 0 || 
        filters.examTypes?.length > 0 || 
        filters.conductingBodies?.length > 0) && (
        <div className="applied-filters">
          <h5>Applied Exam Suitability Filters:</h5>
          <div className="filter-tags">
            {filters.examIds?.length > 0 && (
              <span className="filter-tag">
                Exams: {getSelectedExamNames()}
                <button
                  type="button"
                  onClick={() => onFilterChange({ examIds: [] })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.suitabilityLevels?.length > 0 && (
              <span className="filter-tag">
                Levels: {filters.suitabilityLevels.join(', ')}
                <button
                  type="button"
                  onClick={() => onFilterChange({ suitabilityLevels: [] })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.examTypes?.length > 0 && (
              <span className="filter-tag">
                Types: {getSelectedExamTypeNames()}
                <button
                  type="button"
                  onClick={() => onFilterChange({ examTypes: [] })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.conductingBodies?.length > 0 && (
              <span className="filter-tag">
                Bodies: {getSelectedConductingBodyNames()}
                <button
                  type="button"
                  onClick={() => onFilterChange({ conductingBodies: [] })}
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

export default ExamSuitabilityFilters;
