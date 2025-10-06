import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../../context/AppContext';
import './PreviouslyAskedFilters.css';

const PreviouslyAskedFilters = ({ filters, onFilterChange, isLoading }) => {
  const { token } = useApp();
  
  // State for dropdown options
  const [masterExams, setMasterExams] = useState([]);
  const [years, setYears] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    masterExams: false,
    years: false,
    sessions: false
  });

  // Multi-select dropdown state
  const [dropdownStates, setDropdownStates] = useState({
    examDropdown: false,
    yearDropdown: false,
    sessionDropdown: false
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

  // Fetch years
  const fetchYears = useCallback(async () => {
    if (!token) return;
    
    setLoadingStates(prev => ({ ...prev, years: true }));
    try {
      const response = await fetch('/api/public/years/kv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setYears(data);
      } else if (data.content) {
        setYears(data.content);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      // Fallback to generated years
      const currentYear = new Date().getFullYear();
      const yearList = [];
      for (let year = currentYear; year >= 2010; year--) {
        yearList.push({ id: year, name: year.toString() });
      }
      setYears(yearList);
    } finally {
      setLoadingStates(prev => ({ ...prev, years: false }));
    }
  }, [token]);

  // Generate sessions based on selected exams and years
  const generateSessions = useCallback(() => {
    const sessionsList = [];
    
    if (filters.examIds?.length > 0 && filters.appearedYears?.length > 0) {
      filters.examIds.forEach(examId => {
        const exam = masterExams.find(e => e.id === examId);
        if (exam) {
          filters.appearedYears.forEach(year => {
            sessionsList.push({
              id: `${examId}-${year}`,
              name: `${exam.name} ${year}`,
              examId,
              year
            });
          });
        }
      });
    }
    
    setSessions(sessionsList);
  }, [filters.examIds, filters.appearedYears, masterExams]);

  // Load data on mount
  useEffect(() => {
    fetchMasterExams();
    fetchYears();
  }, [fetchMasterExams, fetchYears]);

  // Generate sessions when exams or years change
  useEffect(() => {
    generateSessions();
  }, [generateSessions]);

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

  // Handle year selection
  const handleYearSelection = (year) => {
    const currentYears = filters.appearedYears || [];
    let newYears;
    
    if (currentYears.includes(year)) {
      newYears = currentYears.filter(y => y !== year);
    } else {
      newYears = [...currentYears, year];
    }
    
    onFilterChange({ appearedYears: newYears });
  };

  // Handle session selection
  const handleSessionSelection = (sessionId) => {
    const currentSessions = filters.sessions || [];
    let newSessions;
    
    if (currentSessions.includes(sessionId)) {
      newSessions = currentSessions.filter(id => id !== sessionId);
    } else {
      newSessions = [...currentSessions, sessionId];
    }
    
    onFilterChange({ sessions: newSessions });
  };

  // Handle marks in exam range
  const handleMarksInExamChange = (field, value) => {
    const numValue = parseInt(value) || null;
    onFilterChange({ [field]: numValue });
  };

  // Handle question number filter
  const handleQuestionNumberChange = (value) => {
    const questionNumbers = value.split(',').map(q => q.trim()).filter(q => q);
    onFilterChange({ questionNumbers });
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
          yearDropdown: false,
          sessionDropdown: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedExamNames = () => {
    return masterExams
      .filter(exam => filters.examIds?.includes(exam.id))
      .map(exam => exam.name)
      .join(', ');
  };

  const getSelectedYearNames = () => {
    return years
      .filter(year => filters.appearedYears?.includes(year.id))
      .map(year => year.name)
      .join(', ');
  };

  const getSelectedSessionNames = () => {
    return sessions
      .filter(session => filters.sessions?.includes(session.id))
      .map(session => session.name)
      .join(', ');
  };

  return (
    <div className="previously-asked-filters">
      {/* Exams Multi-Select */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📋</span>
          Exams
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

      {/* Years Multi-Select */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">📅</span>
          Years
        </label>
        <div className="multi-select-dropdown">
          <div 
            className="multi-select-trigger"
            onClick={() => toggleDropdown('yearDropdown')}
          >
            <span className="selected-text">
              {filters.appearedYears?.length > 0 
                ? `${filters.appearedYears.length} years selected`
                : 'Select years...'
              }
            </span>
            <span className={`dropdown-arrow ${dropdownStates.yearDropdown ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          
          {dropdownStates.yearDropdown && (
            <div className="multi-select-options">
              {loadingStates.years ? (
                <div className="loading-option">Loading years...</div>
              ) : (
                years.map(year => (
                  <label key={year.id} className="multi-select-option">
                    <input
                      type="checkbox"
                      checked={filters.appearedYears?.includes(year.id) || false}
                      onChange={() => handleYearSelection(year.id)}
                      disabled={isLoading}
                    />
                    <span className="option-text">{year.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Selected Years Display */}
        {filters.appearedYears?.length > 0 && (
          <div className="selected-items">
            {filters.appearedYears.map(yearId => {
              const year = years.find(y => y.id === yearId);
              return year ? (
                <span key={yearId} className="selected-tag">
                  {year.name}
                  <button
                    type="button"
                    onClick={() => handleYearSelection(yearId)}
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

      {/* Sessions Multi-Select */}
      {sessions.length > 0 && (
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">🎯</span>
            Sessions
          </label>
          <div className="multi-select-dropdown">
            <div 
              className="multi-select-trigger"
              onClick={() => toggleDropdown('sessionDropdown')}
            >
              <span className="selected-text">
                {filters.sessions?.length > 0 
                  ? `${filters.sessions.length} sessions selected`
                  : 'Select sessions...'
                }
              </span>
              <span className={`dropdown-arrow ${dropdownStates.sessionDropdown ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            
            {dropdownStates.sessionDropdown && (
              <div className="multi-select-options">
                {sessions.map(session => (
                  <label key={session.id} className="multi-select-option">
                    <input
                      type="checkbox"
                      checked={filters.sessions?.includes(session.id) || false}
                      onChange={() => handleSessionSelection(session.id)}
                      disabled={isLoading}
                    />
                    <span className="option-text">{session.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Sessions Display */}
          {filters.sessions?.length > 0 && (
            <div className="selected-items">
              {filters.sessions.map(sessionId => {
                const session = sessions.find(s => s.id === sessionId);
                return session ? (
                  <span key={sessionId} className="selected-tag">
                    {session.name}
                    <button
                      type="button"
                      onClick={() => handleSessionSelection(sessionId)}
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
      )}

      {/* Marks in Exam Range */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">⭐</span>
          Marks in Exam Range
        </label>
        <div className="range-inputs">
          <div className="range-input">
            <label>Min Marks</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minMarksInExam || ''}
              onChange={(e) => handleMarksInExamChange('minMarksInExam', e.target.value)}
              disabled={isLoading}
              className="range-number"
              placeholder="Min"
            />
          </div>
          <div className="range-separator">to</div>
          <div className="range-input">
            <label>Max Marks</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.maxMarksInExam || ''}
              onChange={(e) => handleMarksInExamChange('maxMarksInExam', e.target.value)}
              disabled={isLoading}
              className="range-number"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Question Numbers */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🔢</span>
          Question Numbers
        </label>
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., Q1, Q25, Q30 (comma separated)"
            value={filters.questionNumbers?.join(', ') || ''}
            onChange={(e) => handleQuestionNumberChange(e.target.value)}
            disabled={isLoading}
            className="filter-input"
          />
          <div className="input-help">
            Enter question numbers as they appeared in the exam (e.g., Q1, Q25, Q30)
          </div>
        </div>
      </div>

      {/* Applied Filters Summary */}
      {(filters.examIds?.length > 0 || 
        filters.appearedYears?.length > 0 || 
        filters.sessions?.length > 0 ||
        filters.minMarksInExam !== null || 
        filters.maxMarksInExam !== null ||
        filters.questionNumbers?.length > 0) && (
        <div className="applied-filters">
          <h5>Applied Previously Asked Filters:</h5>
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
            {filters.appearedYears?.length > 0 && (
              <span className="filter-tag">
                Years: {getSelectedYearNames()}
                <button
                  type="button"
                  onClick={() => onFilterChange({ appearedYears: [] })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.sessions?.length > 0 && (
              <span className="filter-tag">
                Sessions: {getSelectedSessionNames()}
                <button
                  type="button"
                  onClick={() => onFilterChange({ sessions: [] })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.minMarksInExam !== null || filters.maxMarksInExam !== null) && (
              <span className="filter-tag">
                Marks: {filters.minMarksInExam || 0}-{filters.maxMarksInExam || 100}
                <button
                  type="button"
                  onClick={() => onFilterChange({ minMarksInExam: null, maxMarksInExam: null })}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.questionNumbers?.length > 0 && (
              <span className="filter-tag">
                Q.Nos: {filters.questionNumbers.join(', ')}
                <button
                  type="button"
                  onClick={() => onFilterChange({ questionNumbers: [] })}
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

export default PreviouslyAskedFilters;
