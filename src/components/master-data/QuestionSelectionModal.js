import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useApiManager } from '../../hooks/useApiManager';
import { getQuestions } from '../../services/masterDataService';
import './MasterDataComponent.css';

const QuestionSelectionModal = ({ test, onClose, onComplete }) => {
  const { token, addNotification } = useApp();
  const { executeApiCall } = useApiManager();
  
  // State for questions and filters
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Advanced filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    difficultyLevel: '',
    questionType: '',
    topicId: '',
    subjectId: '',
    courseTypeId: '',
    examSuitability: '',
    hasExplanation: '',
    marksRange: { min: '', max: '' }
  });
  
  // Master data for filters (placeholder for future implementation)
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [masterExams, setMasterExams] = useState([]);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Load initial data
  useEffect(() => {
    fetchQuestions();
    fetchMasterData();
  }, [page, filters, sortBy, sortOrder]);
  
  // Fetch questions with advanced filtering
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        size: 20,
        sortBy,
        sortDir: sortOrder,
        ...filters
      };
      
      // Clean up empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || (typeof queryParams[key] === 'object' && Object.values(queryParams[key]).every(v => v === ''))) {
          delete queryParams[key];
        }
      });
      
      const result = await executeApiCall(
        () => getQuestions(token, queryParams),
        'Failed to fetch questions'
      );
      
      if (result) {
        const questionsData = Array.isArray(result) ? result : result.content || result.data || [];
        
        if (page === 0) {
          setQuestions(questionsData);
        } else {
          setQuestions(prev => [...prev, ...questionsData]);
        }
        
        setHasMore(questionsData.length === 20);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      addNotification('Failed to fetch questions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters, sortBy, sortOrder, token, executeApiCall, addNotification]);
  
  // Fetch master data for filters
  const fetchMasterData = useCallback(async () => {
    try {
      // You would implement these API calls based on your existing services
      // For now, using placeholder data
      setTopics([]);
      setSubjects([]);
      setCourseTypes([]);
      setMasterExams([]);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filters change
  };
  
  // Handle question selection
  const handleQuestionSelect = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id);
      if (isSelected) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };
  
  // Handle select all visible questions
  const handleSelectAll = () => {
    const visibleQuestionIds = questions.map(q => q.id);
    const allSelected = visibleQuestionIds.every(id => 
      selectedQuestions.some(q => q.id === id)
    );
    
    if (allSelected) {
      // Deselect all visible questions
      setSelectedQuestions(prev => 
        prev.filter(q => !visibleQuestionIds.includes(q.id))
      );
    } else {
      // Select all visible questions
      const newSelections = questions.filter(q => 
        !selectedQuestions.some(selected => selected.id === q.id)
      );
      setSelectedQuestions(prev => [...prev, ...newSelections]);
    }
  };
  
  // Load more questions
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      difficultyLevel: '',
      questionType: '',
      topicId: '',
      subjectId: '',
      courseTypeId: '',
      examSuitability: '',
      hasExplanation: '',
      marksRange: { min: '', max: '' }
    });
    setPage(0);
  };
  
  // Get filtered questions count
  const filteredCount = useMemo(() => {
    return questions.length;
  }, [questions]);
  
  // Handle complete selection
  const handleComplete = () => {
    if (selectedQuestions.length === 0) {
      addNotification('Please select at least one question', 'warning');
      return;
    }
    
    onComplete(selectedQuestions);
  };
  
  // Get question preview text
  const getQuestionPreview = (questionText) => {
    if (!questionText) return 'No question text';
    return questionText.length > 100 
      ? questionText.substring(0, 100) + '...' 
      : questionText;
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY': return '#22c55e';
      case 'MEDIUM': return '#f59e0b';
      case 'HARD': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content question-selection-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>📝 Select Questions for "{test?.testName}"</h3>
            <p>Choose questions to add to your test</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          {/* Selection Summary */}
          <div className="selection-summary">
            <div className="summary-stats">
              <span className="stat">
                <strong>{selectedQuestions.length}</strong> selected
              </span>
              <span className="stat">
                <strong>{filteredCount}</strong> available
              </span>
              <span className="stat">
                <strong>{selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}</strong> total marks
              </span>
            </div>
            <div className="summary-actions">
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleSelectAll}
              >
                {questions.every(q => selectedQuestions.some(sq => sq.id === q.id)) ? 'Deselect All' : 'Select All'}
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedQuestions([])}
              >
                Clear Selection
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="filters-section">
            <div className="filters-header">
              <h4>Advanced Filters</h4>
              <button 
                className="btn btn-link btn-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            {showFilters && (
              <div className="filters-content">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Search</label>
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="Search questions..."
                      className="form-control"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>Difficulty</label>
                    <select
                      value={filters.difficultyLevel}
                      onChange={(e) => handleFilterChange('difficultyLevel', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Difficulties</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Question Type</label>
                    <select
                      value={filters.questionType}
                      onChange={(e) => handleFilterChange('questionType', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Types</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                  </div>
                </div>
                
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Marks Range</label>
                    <div className="marks-range">
                      <input
                        type="number"
                        value={filters.marksRange.min}
                        onChange={(e) => handleFilterChange('marksRange', { ...filters.marksRange, min: e.target.value })}
                        placeholder="Min"
                        className="form-control"
                        min="1"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        value={filters.marksRange.max}
                        onChange={(e) => handleFilterChange('marksRange', { ...filters.marksRange, max: e.target.value })}
                        placeholder="Max"
                        className="form-control"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <label>Has Explanation</label>
                    <select
                      value={filters.hasExplanation}
                      onChange={(e) => handleFilterChange('hasExplanation', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-control"
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="marks">Marks</option>
                      <option value="difficultyLevel">Difficulty</option>
                      <option value="questionText">Question Text</option>
                    </select>
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={clearFilters}
                  >
                    🔄 Clear Filters
                  </button>
                  <div className="view-controls">
                    <button 
                      className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      ⊞ Grid
                    </button>
                    <button 
                      className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setViewMode('list')}
                    >
                      ☰ List
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Questions List */}
          <div className="questions-section">
            <div className="section-header">
              <h4>📋 Available Questions</h4>
              <div className="view-controls">
                <span className="sort-indicator">
                  Sorted by: {sortBy} ({sortOrder === 'asc' ? '↑' : '↓'})
                </span>
              </div>
            </div>
            
            {loading && questions.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner">Loading questions...</div>
              </div>
            ) : questions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">No Questions</div>
                <h4>No questions found</h4>
                <p>Try adjusting your filters or create new questions</p>
              </div>
            ) : (
              <div className={`questions-container ${viewMode}`}>
                {questions.map(question => {
                  const isSelected = selectedQuestions.some(q => q.id === question.id);
                  return (
                    <div 
                      key={question.id} 
                      className={`question-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleQuestionSelect(question)}
                    >
                      <div className="question-header">
                        <div className="question-meta">
                          <span 
                            className="difficulty-badge"
                            style={{ backgroundColor: getDifficultyColor(question.difficultyLevel) }}
                          >
                            {question.difficultyLevel || 'UNKNOWN'}
                          </span>
                          <span className="marks-badge">
                            {question.marks || 0} marks
                          </span>
                          <span className="type-badge">
                            {question.questionType || 'MCQ'}
                          </span>
                        </div>
                        <div className="selection-indicator">
                          {isSelected ? '✓' : '○'}
                        </div>
                      </div>
                      
                      <div className="question-content">
                        <div className="question-text">
                          {getQuestionPreview(question.questionText)}
                        </div>
                        
                        {question.options && question.options.length > 0 && (
                          <div className="question-options">
                            {question.options.slice(0, 2).map((option, index) => (
                              <div key={index} className="option-preview">
                                <span className="option-letter">{option.optionLetter || String.fromCharCode(65 + index)}</span>
                                <span className="option-text">
                                  {option.optionText?.substring(0, 50) || 'No text'}
                                  {option.optionText?.length > 50 ? '...' : ''}
                                </span>
                              </div>
                            ))}
                            {question.options.length > 2 && (
                              <div className="more-options">
                                +{question.options.length - 2} more options
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="question-footer">
                          <div className="question-stats">
                            {question.explanation && (
                              <span className="stat">📝 Has explanation</span>
                            )}
                            {question.examSuitabilities && question.examSuitabilities.length > 0 && (
                              <span className="stat">
                                🎯 {question.examSuitabilities.length} exam(s)
                              </span>
                            )}
                          </div>
                          <div className="question-date">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="load-more-section">
                <button 
                  className="btn btn-outline"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Questions'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <span>
              {selectedQuestions.length} question(s) selected
            </span>
            <span>
              Total marks: {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
            </span>
          </div>
          <div className="footer-actions">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={selectedQuestions.length === 0}
            >
              Add {selectedQuestions.length} Question(s) to Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionModal;
