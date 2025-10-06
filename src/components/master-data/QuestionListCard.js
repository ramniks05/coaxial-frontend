import React from 'react';
import './QuestionListCard.css';

const QuestionListCard = ({ 
  question, 
  onEdit, 
  onDelete,
  onViewDetails 
}) => {
  
  const {
    id,
    questionText,
    questionType,
    difficultyLevel,
    marks,
    negativeMarks,
    timeLimitSeconds,
    explanation,
    isActive,
    createdAt,
    updatedAt,
    createdByName,
    updatedByName,
    subjectName,
    topicName,
    moduleName,
    chapterName,
    options = [],
    examSuitabilities = [],
    examHistories = []
  } = question;

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mcq':
      case 'multiple_choice': return '📝';
      case 'true_false': return '✅';
      case 'fill_blank': return '📝';
      case 'short_answer': return '✍️';
      default: return '❓';
    }
  };

  return (
    <div className="question-list-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title">
          <h4 className="question-title">
            {questionText?.length > 100 ? `${questionText.substring(0, 100)}...` : questionText}
          </h4>
          <div className="card-badges">
            <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(difficultyLevel) }}
            >
              {difficultyLevel}
            </span>
            <span className="type-badge">
              {getTypeIcon(questionType)} {questionType}
            </span>
            <span className="marks-badge">
              {marks} marks
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button 
            className="btn btn-primary btn-xs"
            onClick={() => onViewDetails(question)}
            title="View Details"
          >
            👁️ View
          </button>
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => onEdit(question)}
            title="Edit Question"
          >
            ✏️ Edit
          </button>
          <button 
            className="btn btn-danger btn-xs"
            onClick={() => onDelete(id)}
            title="Delete Question"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Card Content - Simplified */}
      <div className="card-content">
        {/* Basic Question Info */}
        <div className="question-preview">
          <p className="question-text-preview">
            {questionText?.length > 150 ? `${questionText.substring(0, 150)}...` : questionText}
          </p>
          
          {/* Additional Question Details */}
          <div className="question-details">
            <div className="detail-row">
              <span className="detail-label">Subject:</span>
              <span className="detail-value">{subjectName || 'N/A'}</span>
            </div>
            {topicName && (
              <div className="detail-row">
                <span className="detail-label">Topic:</span>
                <span className="detail-value">{topicName}</span>
              </div>
            )}
            {moduleName && (
              <div className="detail-row">
                <span className="detail-label">Module:</span>
                <span className="detail-value">{moduleName}</span>
              </div>
            )}
            {chapterName && (
              <div className="detail-row">
                <span className="detail-label">Chapter:</span>
                <span className="detail-value">{chapterName}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Time Limit:</span>
              <span className="detail-value">{timeLimitSeconds || 60} seconds</span>
            </div>
            {negativeMarks > 0 && (
              <div className="detail-row">
                <span className="detail-label">Negative Marks:</span>
                <span className="detail-value">{negativeMarks}</span>
              </div>
            )}
          </div>

          {/* Options Preview for MCQ */}
          {questionType === 'MCQ' && options && options.length > 0 && (
            <div className="options-preview">
              <h5>Options:</h5>
              <div className="options-list">
                {options.slice(0, 2).map((option, index) => (
                  <div key={index} className={`option-item ${option.isCorrect ? 'correct' : ''}`}>
                    <span className="option-label">{option.optionLetter}.</span>
                    <span className="option-text">
                      {option.optionText?.length > 40 ? `${option.optionText.substring(0, 40)}...` : option.optionText}
                    </span>
                    {option.isCorrect && <span className="correct-indicator">✓</span>}
                  </div>
                ))}
                {options.length > 2 && (
                  <div className="more-options">
                    +{options.length - 2} more options
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exam Tags Preview */}
          {(examSuitabilities?.length > 0 || examHistories?.length > 0) && (
            <div className="exam-tags-preview">
              {examSuitabilities?.length > 0 && (
                <div className="tags-group">
                  <span className="tags-label">Suitable for:</span>
                  <div className="tags-list">
                    {examSuitabilities.slice(0, 2).map((item, index) => {
                      const examName = typeof item === 'object' 
                        ? (item.masterExamName || `Exam ${item.masterExamId}`)
                        : `Exam ${item}`;
                      return (
                        <span key={index} className="tag suitability-tag">
                          {examName}
                        </span>
                      );
                    })}
                    {examSuitabilities.length > 2 && (
                      <span className="tag-more">+{examSuitabilities.length - 2}</span>
                    )}
                  </div>
                </div>
              )}
              {examHistories?.length > 0 && (
                <div className="tags-group">
                  <span className="tags-label">Previously asked:</span>
                  <div className="tags-list">
                    {examHistories.slice(0, 1).map((item, index) => {
                      const examName = typeof item === 'object' 
                        ? (item.masterExamName || `Exam ${item.masterExamId}`)
                        : `Exam ${item}`;
                      const year = typeof item === 'object' 
                        ? (item.appearedYear || new Date().getFullYear())
                        : new Date().getFullYear();
                      return (
                        <span key={index} className="tag history-tag">
                          {examName} - {year}
                        </span>
                      );
                    })}
                    {examHistories.length > 1 && (
                      <span className="tag-more">+{examHistories.length - 1}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer - Simplified */}
      <div className="card-footer">
        <div className="footer-info">
          <small className="text-muted">
            Created: {new Date(createdAt).toLocaleDateString()}
          </small>
        </div>
        <div className="footer-meta">
          {topicName && (
            <small className="meta-item">
              🎯 {topicName}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionListCard;
