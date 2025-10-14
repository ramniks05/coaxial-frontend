import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getStudentQuestions, getStudentQuestionById } from '../../services/studentService';
import StudentQuestionCard from './StudentQuestionCard';
import StudentQuestionFilters from './StudentQuestionFilters';
import './StudentQuestionBank.css';

const StudentQuestionBank = ({ onBackToDashboard = null }) => {
  const { token, addNotification } = useApp();
  
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Bookmarks stored in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('questionBookmarks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    sortBy: 'id',
    sortDir: 'asc'
  });

  // Load questions when component mounts or filters change
  useEffect(() => {
    if (token) {
      loadQuestions();
    }
  }, [token, filters.page, filters.size]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // If bookmarkedOnly filter is active, filter locally
      if (filters.bookmarkedOnly && bookmarks.size > 0) {
        // Fetch all questions then filter by bookmarks
        const allFilters = { ...filters, bookmarkedOnly: undefined };
        const data = await getStudentQuestions(token, allFilters);
        
        // Filter by bookmarks
        const bookmarkedQuestions = data.content.filter(q => bookmarks.has(q.id));
        setQuestions({
          ...data,
          content: bookmarkedQuestions,
          totalElements: bookmarkedQuestions.length,
          numberOfElements: bookmarkedQuestions.length
        });
      } else {
        // Remove bookmarkedOnly before API call (it's client-side only)
        const apiFilters = { ...filters };
        delete apiFilters.bookmarkedOnly;
        delete apiFilters.searchText; // searchText not supported by API yet
        
        const data = await getStudentQuestions(token, apiFilters);
        
        // Apply client-side search if searchText exists
        if (filters.searchText && filters.searchText.trim()) {
          const searchLower = filters.searchText.toLowerCase();
          const filtered = data.content.filter(q => 
            q.questionText?.toLowerCase().includes(searchLower)
          );
          setQuestions({
            ...data,
            content: filtered,
            totalElements: filtered.length,
            numberOfElements: filtered.length
          });
        } else {
          setQuestions(data);
        }
      }
      
      if (questions?.totalElements === 0) {
        if (hasActiveFilters()) {
          addNotification('ℹ️ No questions found with the selected filters', 'info');
        } else {
          addNotification('ℹ️ No questions available. Please check your subscriptions.', 'info');
        }
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      addNotification(`❌ Failed to load questions: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadQuestions();
  };

  const handleClearFilters = () => {
    setFilters({
      page: 0,
      size: 20,
      sortBy: 'id',
      sortDir: 'asc'
    });
    // Load questions will be triggered by useEffect
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setFilters(prev => ({ ...prev, size: parseInt(newSize), page: 0 }));
  };

  const hasActiveFilters = () => {
    return filters.linkageId || filters.topicId || filters.moduleId || 
           filters.chapterId || filters.questionType || filters.difficultyLevel ||
           filters.searchText || filters.bookmarkedOnly;
  };

  const toggleBookmark = (questionId) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(questionId)) {
        newBookmarks.delete(questionId);
        addNotification('🤍 Bookmark removed', 'info');
      } else {
        newBookmarks.add(questionId);
        addNotification('❤️ Question bookmarked', 'success');
      }
      localStorage.setItem('questionBookmarks', JSON.stringify([...newBookmarks]));
      return newBookmarks;
    });
  };

  const viewQuestionDetails = async (questionId) => {
    try {
      const question = await getStudentQuestionById(token, questionId);
      setSelectedQuestion(question);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading question details:', error);
      addNotification(`❌ Failed to load question details: ${error.message}`, 'error');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuestion(null);
  };

  if (!token) {
    return (
      <div className="student-question-bank">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in to access the question bank.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-question-bank">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="back-button"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className="page-title">📚 Question Bank</h1>
            <p className="page-subtitle">Browse and practice questions from your subscribed courses</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <StudentQuestionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            questionCount={questions?.totalElements}
            bookmarks={Array.from(bookmarks)}
          />
        </aside>

        {/* Questions Grid */}
        <main className="questions-main">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading questions...</p>
            </div>
          ) : !questions ? (
          <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h2>Select a Subscription</h2>
              <p>Choose a subscription from the filters to view questions.</p>
          </div>
          ) : questions && questions.content.length > 0 ? (
            <>
              {/* Results Info */}
              <div className="results-info">
                <p>
                  Showing <strong>{questions.content.length}</strong> of <strong>{questions.totalElements}</strong> questions
                  {questions.totalPages > 1 && (
                    <> (Page <strong>{questions.number + 1}</strong> of <strong>{questions.totalPages}</strong>)</>
                  )}
                </p>
      </div>

              {/* Questions Grid */}
              <div className="questions-grid">
                {questions.content.map(question => (
                  <StudentQuestionCard
                    key={question.id}
                    question={question}
                    isBookmarked={bookmarks.has(question.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
            </div>

              {/* Pagination */}
              {questions.totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={questions.first}
                    onClick={() => handlePageChange(filters.page - 1)}
                    className="pagination-button"
                  >
                    ← Previous
                  </button>

                  <div className="pagination-info">
                    <span>Page {questions.number + 1} of {questions.totalPages}</span>
            </div>

                  <button
                    disabled={questions.last}
                    onClick={() => handlePageChange(filters.page + 1)}
                    className="pagination-button"
                  >
                    Next →
                  </button>

              <select
                    value={filters.size}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="page-size-select"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
              </select>
        </div>
      )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                {hasActiveFilters() ? '🔍' : '📚'}
            </div>
              <h2>
                {hasActiveFilters() ? 'No Questions Found' : 'No Questions Available'}
              </h2>
              <p>
                {hasActiveFilters() 
                  ? 'Try adjusting your filters to find more questions.'
                  : 'You don\'t have any active subscriptions or there are no questions available for your subscribed courses.'
                }
              </p>
              {hasActiveFilters() ? (
                <button onClick={handleClearFilters} className="clear-filters-button">
                  Clear All Filters
                      </button>
              ) : onBackToDashboard ? (
                <button onClick={onBackToDashboard} className="clear-filters-button">
                  Browse Courses
                      </button>
              ) : null}
            </div>
          )}
        </main>
            </div>
            
      {/* Question Detail Modal */}
      {showDetailModal && selectedQuestion && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetailModal}>
              ✕
            </button>
            
            <div className="modal-header">
              <h2>Question Details</h2>
              </div>

            <div className="modal-body">
              <StudentQuestionCard
                question={selectedQuestion}
                isBookmarked={bookmarks.has(selectedQuestion.id)}
                onToggleBookmark={toggleBookmark}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestionBank;
