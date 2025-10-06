import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const StudentQuestionBank = () => {
  const { token, addNotification } = useApp();
  // Using dummy data for now - will be replaced with actual API calls
  const courseTypes = [
    { id: 1, name: "Academic Course", description: "Complete school curriculum courses" },
    { id: 2, name: "Competitive Exam", description: "Preparation courses for various competitive examinations" },
    { id: 3, name: "Professional Course", description: "Skill-based professional development courses" }
  ];
  
  const courses = [
    { id: 1, name: "Academic Course Class 1-10", courseTypeId: 1 },
    { id: 2, name: "SSC", courseTypeId: 2 },
    { id: 3, name: "Photography", courseTypeId: 3 }
  ];
  
  const classes = [
    { id: 6, name: "Grade 1", courseId: 1 },
    { id: 7, name: "Grade 2", courseId: 1 },
    { id: 8, name: "Grade 12", courseId: 4 }
  ];
  
  const exams = [
    { id: 1, name: "SSC MTS", courseId: 2 },
    { id: 2, name: "SSC GD", courseId: 2 }
  ];
  
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionProgress, setQuestionProgress] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    subjectId: '',
    topicId: '',
    moduleId: '',
    chapterId: '',
    difficulty: '',
    questionType: '',
    search: ''
  });
  
  // Refs for deduplication
  const subjectsLoadingRef = useRef(false);
  const topicsLoadingRef = useRef(false);
  const modulesLoadingRef = useRef(false);
  const chaptersLoadingRef = useRef(false);
  
  // Removed apiCall - using dummy data for now

  // Load course types on mount - using dummy data for now
  useEffect(() => {
    console.log('Course types loaded:', courseTypes);
  }, [courseTypes]);

  // Load student subscriptions - using dummy data for now
  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummySubscriptions = [
        {
          id: 1,
          courseTypeId: 1,
          courseId: 1,
          classId: 6,
          examId: null,
          subscriptionType: 'class',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true
        }
      ];
      
      setSubscriptions(dummySubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Load questions when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadQuestions();
      loadQuestionProgress();
    }
  }, [selectedSubscription]);

  // Apply filters when questions or filters change
  useEffect(() => {
    applyFilters();
  }, [questions, filters]);

  const loadQuestions = async () => {
    if (!selectedSubscription) return;

    try {
      setLoading(true);
      
      // Using dummy data for now
      const dummyQuestions = [
        {
          id: 1,
          questionText: "What is 2 + 2?",
          questionType: "MULTIPLE_CHOICE",
          difficulty: "EASY",
          subjectId: 1,
          subjectName: "Mathematics",
          topicId: 1,
          topicName: "Basic Addition",
          moduleId: 1,
          moduleName: "Number Operations",
          chapterId: 1,
          chapterName: "Introduction to Numbers",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          explanation: "Basic addition: 2 + 2 = 4"
        },
        {
          id: 2,
          questionText: "What is the capital of India?",
          questionType: "MULTIPLE_CHOICE",
          difficulty: "MEDIUM",
          subjectId: 2,
          subjectName: "General Knowledge",
          topicId: 2,
          topicName: "Geography",
          moduleId: 2,
          moduleName: "Indian Geography",
          chapterId: 2,
          chapterName: "States and Capitals",
          options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
          correctAnswer: "Delhi",
          explanation: "Delhi is the capital city of India"
        },
        {
          id: 3,
          questionText: "The Earth is round.",
          questionType: "TRUE_FALSE",
          difficulty: "EASY",
          subjectId: 3,
          subjectName: "Science",
          topicId: 3,
          topicName: "Earth Science",
          moduleId: 3,
          moduleName: "Planetary Science",
          chapterId: 3,
          chapterName: "Earth and Space",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "The Earth is approximately spherical in shape"
        }
      ];
      
      setQuestions(dummyQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      addNotification('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionProgress = async () => {
    try {
      // Using dummy data for now
      const dummyProgress = {
        1: {
          questionId: 1,
          attempts: 2,
          isCorrect: true,
          isBookmarked: false,
          lastAttempted: '2024-01-15T10:30:00.000Z'
        },
        2: {
          questionId: 2,
          attempts: 1,
          isCorrect: true,
          isBookmarked: true,
          lastAttempted: '2024-01-14T14:00:00.000Z'
        },
        3: {
          questionId: 3,
          attempts: 3,
          isCorrect: false,
          isBookmarked: false,
          lastAttempted: '2024-01-13T16:20:00.000Z'
        }
      };
      
      setQuestionProgress(dummyProgress);
    } catch (error) {
      console.error('Error loading question progress:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Apply text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText.toLowerCase().includes(searchTerm) ||
        q.subjectName?.toLowerCase().includes(searchTerm) ||
        q.topicName?.toLowerCase().includes(searchTerm) ||
        q.moduleName?.toLowerCase().includes(searchTerm) ||
        q.chapterName?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply subject filter
    if (filters.subjectId) {
      filtered = filtered.filter(q => q.subjectId === parseInt(filters.subjectId));
    }

    // Apply topic filter
    if (filters.topicId) {
      filtered = filtered.filter(q => q.topicId === parseInt(filters.topicId));
    }

    // Apply module filter
    if (filters.moduleId) {
      filtered = filtered.filter(q => q.moduleId === parseInt(filters.moduleId));
    }

    // Apply chapter filter
    if (filters.chapterId) {
      filtered = filtered.filter(q => q.chapterId === parseInt(filters.chapterId));
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    // Apply question type filter
    if (filters.questionType) {
      filtered = filtered.filter(q => q.questionType === filters.questionType);
    }

    setFilteredQuestions(filtered);
  };

  const loadTopicsForSubject = async (subjectId, linkageId) => {
    if (subjectsLoadingRef.current) return;
    
    try {
      subjectsLoadingRef.current = true;
      // Using dummy data for now
      const dummyTopics = [
        { id: 1, name: 'Basic Addition', description: 'Introduction to addition' },
        { id: 2, name: 'Basic Subtraction', description: 'Introduction to subtraction' },
        { id: 3, name: 'Multiplication', description: 'Learning multiplication' }
      ];
      
      setTopics(dummyTopics);
      setFilters(prev => ({
        ...prev,
        subjectId,
        topicId: '',
        moduleId: '',
        chapterId: ''
      }));
    } catch (error) {
      console.error('Error loading topics:', error);
      addNotification('Failed to load topics', 'error');
    } finally {
      subjectsLoadingRef.current = false;
    }
  };

  const loadModulesForTopic = async (topicId) => {
    if (topicsLoadingRef.current) return;
    
    try {
      topicsLoadingRef.current = true;
      // Using dummy data for now
      const dummyModules = [
        { id: 1, name: 'Module 1: Introduction', description: 'Basic concepts' },
        { id: 2, name: 'Module 2: Practice', description: 'Practice exercises' },
        { id: 3, name: 'Module 3: Advanced', description: 'Advanced concepts' }
      ];
      
      setModules(dummyModules);
      setFilters(prev => ({
        ...prev,
        topicId,
        moduleId: '',
        chapterId: ''
      }));
    } catch (error) {
      console.error('Error loading modules:', error);
      addNotification('Failed to load modules', 'error');
    } finally {
      topicsLoadingRef.current = false;
    }
  };

  const loadChaptersForModule = async (moduleId) => {
    if (modulesLoadingRef.current) return;
    
    try {
      modulesLoadingRef.current = true;
      // Using dummy data for now
      const dummyChapters = [
        { id: 1, name: 'Chapter 1: Getting Started', description: 'Introduction' },
        { id: 2, name: 'Chapter 2: Core Concepts', description: 'Fundamentals' },
        { id: 3, name: 'Chapter 3: Examples', description: 'Real-world examples' }
      ];
      
      setChapters(dummyChapters);
      setFilters(prev => ({
        ...prev,
        moduleId,
        chapterId: ''
      }));
    } catch (error) {
      console.error('Error loading chapters:', error);
      addNotification('Failed to load chapters', 'error');
    } finally {
      modulesLoadingRef.current = false;
    }
  };

  const viewQuestion = (question) => {
    setSelectedQuestion(question);
    setUserAnswer('');
    setShowAnswer(false);
    setShowQuestionModal(true);
  };

  const submitAnswer = async () => {
    if (!selectedQuestion || !userAnswer) {
      addNotification('Please provide an answer', 'warning');
      return;
    }

    try {
      // Using dummy data for now - simulate API call
      const isCorrect = userAnswer === selectedQuestion.correctAnswer;
      console.log('Answer submitted:', { questionId: selectedQuestion.id, userAnswer, isCorrect });
      
      // Update local progress
      setQuestionProgress(prev => ({
        ...prev,
        [selectedQuestion.id]: {
          questionId: selectedQuestion.id,
          attempts: (prev[selectedQuestion.id]?.attempts || 0) + 1,
          isCorrect: isCorrect,
          isBookmarked: prev[selectedQuestion.id]?.isBookmarked || false,
          lastAttempted: new Date().toISOString()
        }
      }));
      
      setShowAnswer(true);
      addNotification('Answer submitted successfully', 'success');
    } catch (error) {
      console.error('Error submitting answer:', error);
      addNotification('Failed to submit answer', 'error');
    }
  };

  const bookmarkQuestion = async (questionId) => {
    try {
      // Using dummy data for now - simulate API call
      const currentBookmark = questionProgress[questionId]?.isBookmarked || false;
      
      // Update local progress
      setQuestionProgress(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId: questionId,
          isBookmarked: !currentBookmark,
          lastAttempted: prev[questionId]?.lastAttempted || new Date().toISOString()
        }
      }));
      
      addNotification(
        !currentBookmark ? 'Question bookmarked successfully' : 'Question removed from bookmarks',
        'success'
      );
    } catch (error) {
      console.error('Error bookmarking question:', error);
      addNotification('Failed to bookmark question', 'error');
    }
  };

  const getSubscriptionDisplayText = (subscription) => {
    const courseType = courseTypes.find(ct => ct.id === subscription.courseTypeId);
    const course = courses.find(c => c.id === subscription.courseId);
    
    let text = `${courseType?.name || 'Unknown'} - ${course?.name || 'Unknown'}`;
    
    if (subscription.classId) {
      const classItem = classes.find(c => c.id === subscription.classId);
      text += ` - ${classItem?.name || 'Unknown Class'}`;
    } else if (subscription.examId) {
      const exam = exams.find(e => e.id === subscription.examId);
      text += ` - ${exam?.name || 'Unknown Exam'}`;
    }
    
    return text;
  };

  const getSubjectDisplayText = (subject) => {
    return subject.subjectName || subject.name || 'Unknown Subject';
  };

  const getQuestionStatus = (questionId) => {
    const progress = questionProgress[questionId];
    if (!progress) return 'not-attempted';
    
    if (progress.isBookmarked) return 'bookmarked';
    if (progress.isCorrect) return 'correct';
    if (progress.isIncorrect) return 'incorrect';
    return 'attempted';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'text-success';
      case 'incorrect': return 'text-danger';
      case 'bookmarked': return 'text-warning';
      case 'attempted': return 'text-info';
      default: return 'text-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'correct': return '✓ Correct';
      case 'incorrect': return '✗ Incorrect';
      case 'bookmarked': return '★ Bookmarked';
      case 'attempted': return '○ Attempted';
      default: return '○ Not Attempted';
    }
  };

  // Get unique values for filter dropdowns
  const getUniqueSubjects = () => {
    const uniqueSubjects = questions.reduce((acc, q) => {
      if (q.subjectId && !acc.find(s => s.id === q.subjectId)) {
        acc.push({
          id: q.subjectId,
          name: q.subjectName || 'Unknown Subject',
          linkageId: q.linkageId
        });
      }
      return acc;
    }, []);
    return uniqueSubjects;
  };

  const getUniqueTopics = () => {
    const uniqueTopics = questions.reduce((acc, q) => {
      if (q.topicId && !acc.find(t => t.id === q.topicId)) {
        acc.push({
          id: q.topicId,
          name: q.topicName || 'Unknown Topic'
        });
      }
      return acc;
    }, []);
    return uniqueTopics;
  };

  const getUniqueModules = () => {
    const uniqueModules = questions.reduce((acc, q) => {
      if (q.moduleId && !acc.find(m => m.id === q.moduleId)) {
        acc.push({
          id: q.moduleId,
          name: q.moduleName || 'Unknown Module'
        });
      }
      return acc;
    }, []);
    return uniqueModules;
  };

  const getUniqueChapters = () => {
    const uniqueChapters = questions.reduce((acc, q) => {
      if (q.chapterId && !acc.find(c => c.id === q.chapterId)) {
        acc.push({
          id: q.chapterId,
          name: q.chapterName || 'Unknown Chapter'
        });
      }
      return acc;
    }, []);
    return uniqueChapters;
  };

  return (
    <div className="student-question-bank">
      <div className="page-header">
        <h2>Question Bank</h2>
        <div className="question-stats">
          <span>Total Questions: {questions.length}</span>
          <span>Filtered: {filteredQuestions.length}</span>
        </div>
      </div>

      {/* Subscription Selection */}
      <div className="subscription-section">
        <h3>Select Subscription</h3>
        {loading && subscriptions.length === 0 ? (
          <div className="loading">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No active subscriptions found. Please create a subscription first.</p>
          </div>
        ) : (
          <div className="subscription-cards">
            {subscriptions
              .filter(sub => sub.isActive)
              .map(subscription => (
                <div 
                  key={subscription.id} 
                  className={`subscription-card ${selectedSubscription?.id === subscription.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSubscription(subscription)}
                >
                  <h4>{getSubscriptionDisplayText(subscription)}</h4>
                  <p className="subscription-details">
                    <span>Type: {subscription.subscriptionType}</span>
                    <span>Questions: {questions.length}</span>
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {selectedSubscription && questions.length > 0 && (
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filter-row">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="form-input"
              />
            </div>
            
            <div className="filter-group">
              <select
                value={filters.subjectId}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, subjectId: e.target.value }));
                  if (e.target.value) {
                    const subject = getUniqueSubjects().find(s => s.id === parseInt(e.target.value));
                    if (subject) {
                      loadTopicsForSubject(subject.id, subject.linkageId);
                    }
                  }
                }}
                className="form-input"
              >
                <option value="">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.topicId}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, topicId: e.target.value }));
                  if (e.target.value) {
                    loadModulesForTopic(parseInt(e.target.value));
                  }
                }}
                className="form-input"
                disabled={!filters.subjectId}
              >
                <option value="">All Topics</option>
                {getUniqueTopics().map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.moduleId}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, moduleId: e.target.value }));
                  if (e.target.value) {
                    loadChaptersForModule(parseInt(e.target.value));
                  }
                }}
                className="form-input"
                disabled={!filters.topicId}
              >
                <option value="">All Modules</option>
                {getUniqueModules().map(module => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.chapterId}
                onChange={(e) => setFilters(prev => ({ ...prev, chapterId: e.target.value }))}
                className="form-input"
                disabled={!filters.moduleId}
              >
                <option value="">All Chapters</option>
                {getUniqueChapters().map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="form-input"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.questionType}
                onChange={(e) => setFilters(prev => ({ ...prev, questionType: e.target.value }))}
                className="form-input"
              >
                <option value="">All Types</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="ESSAY">Essay</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {selectedSubscription && (
        <div className="questions-section">
          <h3>Questions ({filteredQuestions.length})</h3>
          {loading ? (
            <div className="loading">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <p>No questions found matching your filters.</p>
            </div>
          ) : (
            <div className="questions-grid">
              {filteredQuestions.map(question => {
                const status = getQuestionStatus(question.id);
                return (
                  <div key={question.id} className="question-card">
                    <div className="question-header">
                      <h4>Question #{question.id}</h4>
                      <span className={`status ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                    
                    <div className="question-content">
                      <p className="question-text">
                        {question.questionText.length > 150 
                          ? `${question.questionText.substring(0, 150)}...` 
                          : question.questionText}
                      </p>
                      
                      <div className="question-meta">
                        <span>Subject: {question.subjectName}</span>
                        {question.topicName && <span>Topic: {question.topicName}</span>}
                        {question.difficulty && <span>Difficulty: {question.difficulty}</span>}
                        <span>Type: {question.questionType}</span>
                      </div>
                    </div>
                    
                    <div className="question-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => viewQuestion(question)}
                      >
                        View Question
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => bookmarkQuestion(question.id)}
                      >
                        {questionProgress[question.id]?.isBookmarked ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && selectedQuestion && (
        <div className="modal-overlay">
          <div className="modal-content question-modal">
            <div className="modal-header">
              <h3>Question #{selectedQuestion.id}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowQuestionModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="question-content">
              <div className="question-text">
                {selectedQuestion.questionText}
              </div>
              
              <div className="question-meta">
                <p><strong>Subject:</strong> {selectedQuestion.subjectName}</p>
                {selectedQuestion.topicName && <p><strong>Topic:</strong> {selectedQuestion.topicName}</p>}
                {selectedQuestion.moduleName && <p><strong>Module:</strong> {selectedQuestion.moduleName}</p>}
                {selectedQuestion.chapterName && <p><strong>Chapter:</strong> {selectedQuestion.chapterName}</p>}
                <p><strong>Difficulty:</strong> {selectedQuestion.difficulty}</p>
                <p><strong>Type:</strong> {selectedQuestion.questionType}</p>
              </div>

              {selectedQuestion.questionType === 'MULTIPLE_CHOICE' && (
                <div className="question-options">
                  <h4>Options:</h4>
                  {selectedQuestion.options?.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name="userAnswer"
                        value={option}
                        checked={userAnswer === option}
                        onChange={(e) => setUserAnswer(e.target.value)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedQuestion.questionType === 'TRUE_FALSE' && (
                <div className="question-options">
                  <h4>Select Answer:</h4>
                  <label className="option-label">
                    <input
                      type="radio"
                      name="userAnswer"
                      value="true"
                      checked={userAnswer === 'true'}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                    <span>True</span>
                  </label>
                  <label className="option-label">
                    <input
                      type="radio"
                      name="userAnswer"
                      value="false"
                      checked={userAnswer === 'false'}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                    <span>False</span>
                  </label>
                </div>
              )}

              {(selectedQuestion.questionType === 'SHORT_ANSWER' || selectedQuestion.questionType === 'ESSAY') && (
                <div className="question-input">
                  <label htmlFor="userAnswer">Your Answer:</label>
                  <textarea
                    id="userAnswer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="form-input"
                    rows={selectedQuestion.questionType === 'ESSAY' ? 6 : 3}
                    placeholder="Enter your answer here..."
                  />
                </div>
              )}

              {showAnswer && (
                <div className="correct-answer">
                  <h4>Correct Answer:</h4>
                  <p>{selectedQuestion.correctAnswer}</p>
                  <div className="answer-explanation">
                    {selectedQuestion.explanation && (
                      <div>
                        <h5>Explanation:</h5>
                        <p>{selectedQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="question-actions">
                {!showAnswer ? (
                  <button 
                    className="btn btn-primary"
                    onClick={submitAnswer}
                    disabled={!userAnswer}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAnswer(false);
                      setUserAnswer('');
                    }}
                  >
                    Try Again
                  </button>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowQuestionModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestionBank;
