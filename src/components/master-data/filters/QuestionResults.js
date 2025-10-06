import React, { useState } from 'react';
import QuestionListCard from '../QuestionListCard';
import BulkActions from './BulkActions';
import './QuestionResults.css';

const QuestionResults = ({ 
  questions, 
  totalCount, 
  isLoading, 
  filters, 
  onPageChange, 
  onPageSizeChange,
  onViewDetails,
  displayMode = 'grid' // 'grid' | 'list' | 'table'
}) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [viewMode, setViewMode] = useState(displayMode === 'table' ? 'table' : 'grid'); // 'grid' | 'list' | 'table'
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'name', 'marks'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Handle question selection
  const handleQuestionSelect = (questionId, isSelected) => {
    if (isSelected) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action}`, selectedQuestions);
    // Implementation would depend on the specific action
  };

  // Sort questions
  const sortedQuestions = React.useMemo(() => {
    if (!questions || questions.length === 0) return questions;
    
    return [...questions].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.questionText || '';
          bValue = b.questionText || '';
          break;
        case 'marks':
          aValue = a.marks || 0;
          bValue = b.marks || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [questions, sortBy, sortOrder]);

  // Calculate pagination info
  const currentPage = filters.page || 0;
  const pageSize = filters.size || 20;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    onPageSizeChange(newSize);
  };

  if (isLoading) {
    return (
      <div className="question-results">
        <div className="results-header">
          <h3>Question Results</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-results">
      {/* Results Header */}
      <div className="results-header">
        <div className="header-info">
          <h3>Question Results</h3>
          <p className="results-count">
            Showing {startItem}-{endItem} of {totalCount} questions
          </p>
        </div>
        
        <div className="header-controls">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              ≡
            </button>
          </div>

          {/* Sort Controls */}
          <div className="sort-controls">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Question Text</option>
              <option value="marks">Marks</option>
            </select>
            <button
              type="button"
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <BulkActions
          selectedCount={selectedQuestions.length}
          totalCount={questions.length}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedQuestions([])}
        />
      )}

      {/* Results Content */}
      <div className="results-content">
        {questions.length === 0 ? (
          <div className="empty-state">
            <h4>No questions found</h4>
            <p>Try adjusting your filters or search criteria to find more questions.</p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  // Reset all filters
                  console.log('Reset filters');
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          viewMode === 'table' ? (
            <div className="questions-table-wrapper">
              <table className="questions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Marks</th>
                    <th>Subject</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQuestions.map(q => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td title={q.questionText}>{(q.questionText || '').slice(0, 80)}{(q.questionText || '').length > 80 ? '…' : ''}</td>
                      <td>{q.questionType}</td>
                      <td>{q.difficultyLevel}</td>
                      <td>{q.marks}</td>
                      <td>{q.subjectName || '-'}</td>
                      <td>{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => onViewDetails && onViewDetails(q)}
                          title="View Details"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`questions-container ${viewMode}`}>
              {sortedQuestions.map(question => (
                <div key={question.id} className="question-item">
                  {selectedQuestions.length > 0 && (
                    <div className="selection-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={(e) => handleQuestionSelect(question.id, e.target.checked)}
                      />
                    </div>
                  )}
                  <QuestionListCard
                    question={question}
                    onSelect={handleQuestionSelect}
                    isSelected={selectedQuestions.includes(question.id)}
                    viewMode={viewMode}
                    onViewDetails={onViewDetails}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            <span>Page {currentPage + 1} of {totalPages}</span>
          </div>
          
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
            >
              ⏮️ First
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              ◀️ Previous
            </button>
            
            {/* Page Numbers */}
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage <= 2) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-btn page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next ▶️
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Last ⏭️
            </button>
          </div>
          
          <div className="pagination-size">
            <select
              className="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Results:</span>
            <span className="stat-value">{totalCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Selected:</span>
            <span className="stat-value">{selectedQuestions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">View Mode:</span>
            <span className="stat-value">{viewMode === 'grid' ? 'Grid' : 'List'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sorted By:</span>
            <span className="stat-value">
              {sortBy === 'createdAt' ? 'Date Created' : 
               sortBy === 'name' ? 'Question Text' : 'Marks'} 
              ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionResults;
