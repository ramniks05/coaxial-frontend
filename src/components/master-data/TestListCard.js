import React from 'react';
import './TestListCard.css';

const TestListCard = ({ 
  test, 
  onEdit, 
  onDelete,
  onPublishToggle,
  onManageQuestions,
  onSelect,
  isSelected
}) => {
  
  
  const {
    id,
    testName,
    description,
    instructions,
    timeLimitMinutes,
    totalMarks,
    passingMarks,
    negativeMarking,
    negativeMarkPercentage,
    maxAttempts,
    isPublished,
    status,
    startDate,
    endDate,
    masterExamId,
    masterExam,
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
    questionCount = 0
  } = test;

  const getStatusBadgeClass = (status, isPublished) => {
    if (isPublished) return 'badge badge-success';
    if (status === 'DRAFT') return 'badge badge-warning';
    return 'badge badge-secondary';
  };

  const getStatusText = (status, isPublished) => {
    if (isPublished) return 'Published';
    if (status === 'DRAFT') return 'Draft';
    return 'Inactive';
  };

  const getStatusIcon = (status, isPublished) => {
    if (isPublished) return '📢';
    if (status === 'DRAFT') return '📝';
    return '⏸️';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getExamName = () => {
    if (masterExam?.exam) return masterExam.exam;
    if (masterExam?.examName) return masterExam.examName;
    if (masterExam?.name) return masterExam.name;
    return `Exam ${masterExamId}`;
  };

  const getAvailabilityStatus = () => {
    if (!startDate && !endDate) return 'Always Available';
    
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && now < start) return 'Not Started';
    if (end && now > end) return 'Expired';
    return 'Available';
  };

  const getAvailabilityClass = () => {
    const status = getAvailabilityStatus();
    switch (status) {
      case 'Available': return 'availability-available';
      case 'Not Started': return 'availability-pending';
      case 'Expired': return 'availability-expired';
      default: return 'availability-neutral';
    }
  };

  return (
    <div className={`test-list-card ${isSelected ? 'selected' : ''}`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="selection-checkbox">
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => onSelect && onSelect(e.target.checked)}
            className="test-checkbox"
          />
        </div>
      )}
      
      {/* Card Header */}
      <div className="card-header">
        <div className="test-title-section">
          <h3 className="test-title">{testName || 'Untitled Test'}</h3>
          <div className="test-badges">
            <span className={getStatusBadgeClass(status, isPublished)}>
              {getStatusIcon(status, isPublished)} {getStatusText(status, isPublished)}
            </span>
            <span className={`availability-badge ${getAvailabilityClass()}`}>
              {getAvailabilityStatus()}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => onManageQuestions && onManageQuestions(test)}
            title="Manage Questions"
          >
            📋 ({questionCount})
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => onEdit && onEdit(test)}
            title="Edit Test"
          >
            ✏️
          </button>
          <button 
            className={`btn btn-sm ${isPublished ? 'btn-warning' : 'btn-success'}`}
            onClick={() => onPublishToggle && onPublishToggle(test)}
            title={isPublished ? 'Unpublish Test' : 'Publish Test'}
          >
            {isPublished ? '🔒' : '📢'}
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => onDelete && onDelete(id)}
            title="Delete Test"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        {/* Test Description */}
        {description && (
          <div className="test-description">
            <p>{description}</p>
          </div>
        )}

        {/* Test Configuration */}
        <div className="test-config">
          <div className="config-row">
            <div className="config-item">
              <span className="config-icon">📚</span>
              <span className="config-label">Exam:</span>
              <span className="config-value">{getExamName()}</span>
            </div>
            <div className="config-item">
              <span className="config-icon">⏱️</span>
              <span className="config-label">Duration:</span>
              <span className="config-value">{formatDuration(timeLimitMinutes)}</span>
            </div>
            <div className="config-item">
              <span className="config-icon">📊</span>
              <span className="config-label">Marks:</span>
              <span className="config-value">{totalMarks} ({passingMarks} passing)</span>
            </div>
          </div>

          <div className="config-row">
            <div className="config-item">
              <span className="config-icon">🔄</span>
              <span className="config-label">Max Attempts:</span>
              <span className="config-value">{maxAttempts}</span>
            </div>
            {negativeMarking && (
              <div className="config-item">
                <span className="config-icon">➖</span>
                <span className="config-label">Negative Marking:</span>
                <span className="config-value">{negativeMarkPercentage}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Availability Window */}
        {(startDate || endDate) && (
          <div className="test-availability">
            <h5>🕐 Availability Window</h5>
            <div className="availability-dates">
              {startDate && (
                <div className="date-item">
                  <span className="date-label">Starts:</span>
                  <span className="date-value">{new Date(startDate).toLocaleDateString()}</span>
                </div>
              )}
              {endDate && (
                <div className="date-item">
                  <span className="date-label">Ends:</span>
                  <span className="date-value">{new Date(endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-info">
          <small className="text-muted">
            Created: {new Date(createdAt).toLocaleDateString()}
            {createdBy && ` by ${createdBy.firstName || createdBy.name}`}
          </small>
          {updatedAt && updatedAt !== createdAt && (
            <small className="text-muted">
              • Updated: {new Date(updatedAt).toLocaleDateString()}
              {updatedBy && ` by ${updatedBy.firstName || updatedBy.name}`}
            </small>
          )}
        </div>
        <div className="footer-stats">
          <small className="stat-item">
            ID: {id}
          </small>
        </div>
      </div>
    </div>
  );
};

export default TestListCard;
