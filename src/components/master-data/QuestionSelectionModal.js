import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    moduleId: '',
    chapterId: '',
    examSuitability: '',
    hasExplanation: '',
    marksRange: { min: '', max: '' }
  });
  
  // Master data for filters (placeholder for future implementation)
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [masterExams, setMasterExams] = useState([]);
  
  // State for question preview modal
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [preFilterApplied, setPreFilterApplied] = useState(false);
  
  // NEW: Initialize filters based on test content linkage
  useEffect(() => {
    if (test && test.testCreationMode === 'CONTENT_BASED' && !preFilterApplied) {
      const newFilters = { ...filters };
      
      // Apply filters based on test level
      if (test.chapterId) {
        newFilters.chapterId = test.chapterId;
      } else if (test.moduleId) {
        newFilters.moduleId = test.moduleId;
      } else if (test.topicId) {
        newFilters.topicId = test.topicId;
      } else if (test.subjectLinkageId) {
        newFilters.subjectId = test.subjectLinkageId;
      } else if (test.courseTypeId) {
        newFilters.courseTypeId = test.courseTypeId;
      }
      
      setFilters(newFilters);
      setPreFilterApplied(true);
      setShowFilters(true); // Show filters so user can see what's applied
      
      addNotification(
        `Filtering questions for ${test.testLevel} level test`, 
        'info'
      );
    } else if (test && test.testCreationMode === 'EXAM_BASED' && !preFilterApplied) {
      // For exam-based tests, filter by examSuitability
      if (test.masterExamId) {
        setFilters(prev => ({ ...prev, examSuitability: test.masterExamId }));
        setPreFilterApplied(true);
        setShowFilters(true);
        
        addNotification(
          'Filtering questions by exam suitability', 
          'info'
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, preFilterApplied]);
  
  // Load initial data
  useEffect(() => {
    fetchQuestions();
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      const result = await executeApiCall(getQuestions, token, queryParams);
      
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
      addNotification({ 
        message: 'Failed to fetch questions', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, sortBy, sortOrder, token]);
  
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
  
  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = React.useRef(null);
  
  const handleSearchChange = (value) => {
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: value }));
      setPage(0);
    }, 500);
  };
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filters change
  };
  
  // Apply filter preset
  const applyPreset = (presetType) => {
    let newFilters = { ...filters };
    
    switch (presetType) {
      case 'easy':
        newFilters.difficultyLevel = 'EASY';
        newFilters.marksRange = { min: '1', max: '2' };
        break;
      case 'medium':
        newFilters.difficultyLevel = 'MEDIUM';
        newFilters.marksRange = { min: '3', max: '4' };
        break;
      case 'hard':
        newFilters.difficultyLevel = 'HARD';
        newFilters.marksRange = { min: '5', max: '' };
        break;
      case 'withExplanation':
        newFilters.hasExplanation = 'true';
        break;
      case 'mcq':
        newFilters.questionType = 'MULTIPLE_CHOICE';
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
    setPage(0);
    addNotification({ 
      message: `Filter preset applied: ${presetType}`, 
      type: 'success' 
    });
  };
  
  // Bulk selection functions
  const selectByDifficulty = (difficulty) => {
    const questionsToSelect = questions.filter(q => q.difficultyLevel === difficulty);
    const newSelections = questionsToSelect.filter(q => 
      !selectedQuestions.some(selected => selected.id === q.id)
    );
    setSelectedQuestions(prev => [...prev, ...newSelections]);
    addNotification({ 
      message: `Selected ${newSelections.length} ${difficulty} questions`, 
      type: 'success' 
    });
  };
  
  const selectByMarks = (marks) => {
    const questionsToSelect = questions.filter(q => q.marks === parseInt(marks));
    const newSelections = questionsToSelect.filter(q => 
      !selectedQuestions.some(selected => selected.id === q.id)
    );
    setSelectedQuestions(prev => [...prev, ...newSelections]);
    addNotification({ 
      message: `Selected ${newSelections.length} questions with ${marks} marks`, 
      type: 'success' 
    });
  };
  
  const selectRandom = (count) => {
    const availableQuestions = questions.filter(q => 
      !selectedQuestions.some(selected => selected.id === q.id)
    );
    
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const randomSelections = shuffled.slice(0, count);
    
    setSelectedQuestions(prev => [...prev, ...randomSelections]);
    addNotification({ 
      message: `Randomly selected ${randomSelections.length} questions`, 
      type: 'success' 
    });
  };
  
  const selectFirst = (count) => {
    const questionsToSelect = questions.slice(0, count).filter(q => 
      !selectedQuestions.some(selected => selected.id === q.id)
    );
    setSelectedQuestions(prev => [...prev, ...questionsToSelect]);
    addNotification({ 
      message: `Selected first ${questionsToSelect.length} questions`, 
      type: 'success' 
    });
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
  
  // Calculate difficulty breakdown
  const difficultyBreakdown = useMemo(() => {
    const breakdown = {
      EASY: { count: 0, marks: 0 },
      MEDIUM: { count: 0, marks: 0 },
      HARD: { count: 0, marks: 0 }
    };
    
    selectedQuestions.forEach(q => {
      const difficulty = q.difficultyLevel?.toUpperCase() || 'MEDIUM';
      if (breakdown[difficulty]) {
        breakdown[difficulty].count++;
        breakdown[difficulty].marks += q.marks || 0;
      }
    });
    
    return breakdown;
  }, [selectedQuestions]);
  
  // Get active filters for chips display
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (filters.difficultyLevel) {
      active.push({ key: 'difficultyLevel', label: `Difficulty: ${filters.difficultyLevel}`, value: filters.difficultyLevel });
    }
    if (filters.questionType) {
      active.push({ key: 'questionType', label: `Type: ${filters.questionType}`, value: filters.questionType });
    }
    if (filters.courseTypeId) {
      const courseType = courseTypes.find(ct => ct.id === parseInt(filters.courseTypeId));
      active.push({ key: 'courseTypeId', label: `Course Type: ${courseType?.name || filters.courseTypeId}`, value: filters.courseTypeId });
    }
    if (filters.subjectId) {
      const subject = subjects.find(s => s.id === parseInt(filters.subjectId));
      active.push({ key: 'subjectId', label: `Subject: ${subject?.name || filters.subjectId}`, value: filters.subjectId });
    }
    if (filters.topicId) {
      const topic = topics.find(t => t.id === parseInt(filters.topicId));
      active.push({ key: 'topicId', label: `Topic: ${topic?.name || filters.topicId}`, value: filters.topicId });
    }
    if (filters.moduleId) {
      const module = modules.find(m => m.id === parseInt(filters.moduleId));
      active.push({ key: 'moduleId', label: `Module: ${module?.name || filters.moduleId}`, value: filters.moduleId });
    }
    if (filters.chapterId) {
      const chapter = chapters.find(ch => ch.id === parseInt(filters.chapterId));
      active.push({ key: 'chapterId', label: `Chapter: ${chapter?.name || filters.chapterId}`, value: filters.chapterId });
    }
    if (filters.hasExplanation) {
      active.push({ key: 'hasExplanation', label: `Has Explanation: ${filters.hasExplanation === 'true' ? 'Yes' : 'No'}`, value: filters.hasExplanation });
    }
    if (filters.marksRange.min || filters.marksRange.max) {
      active.push({ 
        key: 'marksRange', 
        label: `Marks: ${filters.marksRange.min || '0'}-${filters.marksRange.max || '∞'}`, 
        value: filters.marksRange 
      });
    }
    
    return active;
  }, [filters, courseTypes, subjects, topics, modules, chapters]);
  
  // Remove specific filter
  const removeFilter = (filterKey) => {
    if (filterKey === 'marksRange') {
      setFilters(prev => ({ ...prev, marksRange: { min: '', max: '' } }));
    } else {
      setFilters(prev => ({ ...prev, [filterKey]: '' }));
    }
    setPage(0);
  };
  
  // Handle complete selection
  const handleComplete = () => {
    if (selectedQuestions.length === 0) {
      addNotification({ 
        message: 'Please select at least one question', 
        type: 'warning' 
      });
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
    <div className="modal-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content question-selection-modal" style={{ 
        width: '100vw', 
        height: '100vh', 
        maxWidth: '100vw',
        maxHeight: '100vh',
        margin: 0,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc'
      }}>
        {/* Full-Screen Modal Header */}
        <div className="modal-header" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '24px 32px',
          flexShrink: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="modal-title" style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                📋 Select Questions for Test
              </h2>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '16px', fontWeight: '500' }}>
                {test?.testName}
              </p>
              {/* NEW: Show test content linkage info */}
              {test && test.testCreationMode === 'CONTENT_BASED' && (
                <div className="info-alert" style={{ 
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  <div>
                    <strong style={{ fontSize: '14px' }}>Pre-filtered for {test.testLevel} level:</strong>
                    {' '}
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>
                      {test.chapterName && `Chapter: ${test.chapterName}`}
                      {test.moduleName && !test.chapterName && `Module: ${test.moduleName}`}
                      {test.topicName && !test.moduleName && !test.chapterName && `Topic: ${test.topicName}`}
                      {test.subjectName && !test.topicName && !test.moduleName && !test.chapterName && `Subject: ${test.subjectName}`}
                      {test.courseTypeName && !test.subjectName && !test.topicName && !test.moduleName && !test.chapterName && `Course Type: ${test.courseTypeName}`}
                    </span>
                  </div>
                </div>
              )}
              {test && test.testCreationMode === 'EXAM_BASED' && (
                <div className="info-alert" style={{ 
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  <div>
                    <strong style={{ fontSize: '14px' }}>Exam-Based Test:</strong>
                    {' '}
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>Questions filtered by exam suitability tags</span>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="modal-close" 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '24px',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Modal Body - Full Height with Scroll */}
        <div className="modal-body" style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Selection Summary - Modern Design */}
          <div className="selection-summary" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: selectedQuestions.length > 0 ? '16px' : '0' }}>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {selectedQuestions.length}
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                      Questions Selected
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {filteredCount} available to choose from
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '10px',
                  color: 'white'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Marks</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '4px' }}>
                    {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleSelectAll}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '2px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {questions.every(q => selectedQuestions.some(sq => sq.id === q.id)) ? '❌ Deselect All' : '✓ Select All Visible'}
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedQuestions([])}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '2px solid #fecaca',
                    background: 'white',
                    color: '#dc2626',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Clear Selection
                </button>
              </div>
            </div>
            
            {/* Difficulty Breakdown */}
            {selectedQuestions.length > 0 && (
              <div style={{ 
                paddingTop: '16px', 
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Difficulty Breakdown:</span>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: '#22c55e',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      🟢 Easy
                    </div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      <strong>{difficultyBreakdown.EASY.count}</strong> ({difficultyBreakdown.EASY.marks}m)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: '#f59e0b',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      🟡 Medium
                    </div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      <strong>{difficultyBreakdown.MEDIUM.count}</strong> ({difficultyBreakdown.MEDIUM.marks}m)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      🔴 Hard
                    </div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      <strong>{difficultyBreakdown.HARD.count}</strong> ({difficultyBreakdown.HARD.marks}m)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Filter Presets - Modern Pills */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '16px', fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>
              ⚡ Quick Filters
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                className="preset-btn easy" 
                onClick={() => applyPreset('easy')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dcfce7',
                  color: '#166534',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🟢</span> Easy (1-2m)
              </button>
              <button 
                className="preset-btn medium" 
                onClick={() => applyPreset('medium')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🟡</span> Medium (3-4m)
              </button>
              <button 
                className="preset-btn hard" 
                onClick={() => applyPreset('hard')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🔴</span> Hard (5+m)
              </button>
              <button 
                className="preset-btn explanation" 
                onClick={() => applyPreset('withExplanation')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📝</span> With Explanation
              </button>
              <button 
                className="preset-btn mcq" 
                onClick={() => applyPreset('mcq')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#e0e7ff',
                  color: '#3730a3',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🎯</span> MCQ Only
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="active-filters-bar">
              <div className="active-filters-label">
                <strong>Active Filters ({activeFilters.length}):</strong>
              </div>
              <div className="filter-chips">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="filter-chip">
                    <span>{filter.label}</span>
                    <button 
                      className="chip-remove"
                      onClick={() => removeFilter(filter.key)}
                      title="Remove filter"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button className="clear-all-filters-btn" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Quick Selection Toolbar */}
          <div className="quick-selection-toolbar">
            <div className="toolbar-label">Quick Select:</div>
            <button className="quick-btn" onClick={() => selectByDifficulty('EASY')}>
              All Easy
            </button>
            <button className="quick-btn" onClick={() => selectByDifficulty('MEDIUM')}>
              All Medium
            </button>
            <button className="quick-btn" onClick={() => selectByDifficulty('HARD')}>
              All Hard
            </button>
            <button className="quick-btn" onClick={() => selectRandom(10)}>
              Random 10
            </button>
            <button className="quick-btn" onClick={() => selectFirst(20)}>
              First 20
            </button>
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
                {/* Hierarchy Filters Row */}
                <div className="filter-row hierarchy-filters">
                  <div className="filter-group">
                    <label>Chapter</label>
                    <select
                      value={filters.chapterId}
                      onChange={(e) => handleFilterChange('chapterId', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Chapters</option>
                      {chapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name || ch.chapterName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Module</label>
                    <select
                      value={filters.moduleId}
                      onChange={(e) => handleFilterChange('moduleId', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Modules</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.name || m.moduleName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Topic</label>
                    <select
                      value={filters.topicId}
                      onChange={(e) => handleFilterChange('topicId', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Topics</option>
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name || t.topicName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Subject</label>
                    <select
                      value={filters.subjectId}
                      onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name || s.subjectName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Search</label>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search questions... (debounced)"
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
                  const difficultyColor = getDifficultyColor(question.difficultyLevel);
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`question-card enhanced ${isSelected ? 'selected' : ''}`}
                      style={{ 
                        borderLeftColor: difficultyColor,
                        position: 'relative',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: `1px solid ${isSelected ? '#667eea' : '#e2e8f0'}`,
                        boxShadow: isSelected ? '0 4px 12px rgba(102,126,234,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        gap: '16px'
                      }}
                    >
                      {/* Selection Checkbox */}
                      <div className="card-selection" style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        paddingTop: '4px'
                      }}>
                        <input
                          type="checkbox"
                          className="question-checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuestionSelect(question);
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#667eea'
                          }}
                        />
                      </div>
                      
                      {/* Card Content - Clickable */}
                      <div className="card-main" onClick={() => handleQuestionSelect(question)} style={{
                        flex: 1,
                        cursor: 'pointer',
                        paddingRight: '100px'
                      }}>
                        {/* Breadcrumb */}
                        {(question.chapterName || question.moduleName || question.topicName || question.subjectName) && (
                          <div className="question-breadcrumb">
                            {question.className && <span>{question.className}</span>}
                            {question.className && question.subjectName && <span className="separator">›</span>}
                            {question.subjectName && <span>{question.subjectName}</span>}
                            {question.subjectName && question.topicName && <span className="separator">›</span>}
                            {question.topicName && <span>{question.topicName}</span>}
                            {question.topicName && question.moduleName && <span className="separator">›</span>}
                            {question.moduleName && <span>{question.moduleName}</span>}
                            {question.moduleName && question.chapterName && <span className="separator">›</span>}
                            {question.chapterName && <span>{question.chapterName}</span>}
                          </div>
                        )}
                        
                        {/* Question Text */}
                        <div className="question-text">
                          {getQuestionPreview(question.questionText)}
                        </div>
                        
                        {/* Options Preview */}
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
                        
                        {/* Question Meta Badges */}
                        <div className="question-badges">
                          <span 
                            className="difficulty-badge"
                            style={{ backgroundColor: difficultyColor }}
                          >
                            {question.difficultyLevel || 'UNKNOWN'}
                          </span>
                          <span className="marks-badge">
                            {question.marks || 0} marks
                          </span>
                          <span className="type-badge">
                            {question.questionType || 'MCQ'}
                          </span>
                          {question.explanation && (
                            <span className="has-explanation-badge">📝</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="card-actions" style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button 
                          className="action-btn preview-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewQuestion(question);
                            setShowPreview(true);
                          }}
                          title="Preview Question"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <span style={{ fontSize: '18px' }}>👁️</span>
                          <span style={{ fontSize: '13px' }}>View</span>
                        </button>
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
        
        {/* Modal Footer - Sticky Full Width */}
        <div className="modal-footer" style={{
          background: 'white',
          padding: '20px 32px',
          borderTop: '2px solid #e2e8f0',
          boxShadow: '0 -4px 6px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
              {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? 's' : ''} Selected
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Total marks: <strong style={{ color: '#667eea' }}>
                {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
              </strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="btn btn-secondary"
              onClick={onClose}
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                border: '2px solid #cbd5e1',
                background: 'white',
                color: '#475569',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={selectedQuestions.length === 0}
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                background: selectedQuestions.length === 0 
                  ? '#cbd5e1' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedQuestions.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedQuestions.length === 0 ? 0.6 : 1
              }}
            >
              ➕ Add {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? 's' : ''} to Test
            </button>
          </div>
        </div>
      </div>
      
      {/* Question Preview Modal */}
      {showPreview && previewQuestion && (
        <div 
          className="modal-overlay preview-overlay" 
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="modal-content preview-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="preview-modal-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>📋 Question Preview</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowPreview(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="preview-modal-body" style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Question Metadata */}
              <div className="preview-metadata" style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div className="metadata-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Difficulty:</span>
                  <span 
                    className="meta-value difficulty-badge"
                    style={{ 
                      backgroundColor: getDifficultyColor(previewQuestion.difficultyLevel),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {previewQuestion.difficultyLevel || 'UNKNOWN'}
                  </span>
                </div>
                <div className="metadata-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Marks:</span>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {previewQuestion.marks || 0}
                  </span>
                </div>
                <div className="metadata-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Type:</span>
                  <span style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {previewQuestion.questionType || 'MCQ'}
                  </span>
                </div>
              </div>
              
              {/* Hierarchy Info */}
              {(previewQuestion.chapterName || previewQuestion.moduleName || previewQuestion.topicName) && (
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <strong style={{ fontSize: '14px', color: '#475569', marginBottom: '8px', display: 'block' }}>📍 Content Path:</strong>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#667eea',
                    flexWrap: 'wrap'
                  }}>
                    {previewQuestion.className && <span style={{ fontWeight: '500' }}>{previewQuestion.className}</span>}
                    {previewQuestion.className && previewQuestion.subjectName && <span style={{ color: '#94a3b8' }}>›</span>}
                    {previewQuestion.subjectName && <span style={{ fontWeight: '500' }}>{previewQuestion.subjectName}</span>}
                    {previewQuestion.subjectName && previewQuestion.topicName && <span style={{ color: '#94a3b8' }}>›</span>}
                    {previewQuestion.topicName && <span style={{ fontWeight: '500' }}>{previewQuestion.topicName}</span>}
                    {previewQuestion.topicName && previewQuestion.moduleName && <span style={{ color: '#94a3b8' }}>›</span>}
                    {previewQuestion.moduleName && <span style={{ fontWeight: '500' }}>{previewQuestion.moduleName}</span>}
                    {previewQuestion.moduleName && previewQuestion.chapterName && <span style={{ color: '#94a3b8' }}>›</span>}
                    {previewQuestion.chapterName && <span style={{ fontWeight: '500' }}>{previewQuestion.chapterName}</span>}
                  </div>
                </div>
              )}
              
              {/* Full Question Text */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#1e293b' 
                }}>
                  ❓ Question:
                </h4>
                <div style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.7', 
                  color: '#334155',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea'
                }}>
                  {previewQuestion.questionText}
                </div>
              </div>
              
              {/* All Options */}
              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1e293b' 
                  }}>
                    📝 Options:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {previewQuestion.options.map((option, index) => {
                      const isCorrect = option.isCorrect || option.optionLetter === previewQuestion.correctAnswer;
                      return (
                        <div 
                          key={index} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: isCorrect ? '#dcfce7' : 'white',
                            border: `2px solid ${isCorrect ? '#86efac' : '#e2e8f0'}`,
                            borderRadius: '8px'
                          }}
                        >
                          <span style={{
                            background: isCorrect ? '#22c55e' : '#94a3b8',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {option.optionLetter || String.fromCharCode(65 + index)}
                          </span>
                          <span style={{ 
                            flex: 1, 
                            color: '#334155',
                            fontSize: '15px',
                            lineHeight: '1.5'
                          }}>
                            {option.optionText}
                          </span>
                          {isCorrect && (
                            <span style={{
                              background: '#22c55e',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Explanation */}
              {previewQuestion.explanation && (
                <div style={{ 
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    💡 Explanation:
                  </h4>
                  <div style={{ 
                    fontSize: '15px', 
                    lineHeight: '1.7', 
                    color: '#1e3a8a'
                  }}>
                    {previewQuestion.explanation}
                  </div>
                </div>
              )}
              
              {/* Exam Suitabilities */}
              {previewQuestion.examSuitabilities && previewQuestion.examSuitabilities.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1e293b' 
                  }}>
                    🎯 Suitable for Exams:
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {previewQuestion.examSuitabilities.map((exam, index) => (
                      <span 
                        key={index} 
                        style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        {exam.examName || exam.name || exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="preview-modal-footer" style={{
              background: '#f8fafc',
              padding: '20px 24px',
              borderTop: '1px solid #e2e8f0',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexShrink: 0
            }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '2px solid #cbd5e1',
                  background: 'white',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleQuestionSelect(previewQuestion);
                  setShowPreview(false);
                }}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: selectedQuestions.some(q => q.id === previewQuestion.id) 
                    ? '#dc2626' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {selectedQuestions.some(q => q.id === previewQuestion.id) ? '❌ Remove from Selection' : '✓ Add to Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionSelectionModal;
