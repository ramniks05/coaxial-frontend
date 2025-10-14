import React, { useState } from 'react';

const StudentQuestionCard = ({ question, isBookmarked, onToggleBookmark }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFullQuestion, setShowFullQuestion] = useState(false);

  const getDifficultyColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'EASY': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'MEDIUM': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'HARD': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      default: return { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' };
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'MULTIPLE_CHOICE': return '📝';
      case 'TRUE_FALSE': return '✅';
      case 'FILL_BLANK': return '✍️';
      case 'ESSAY': return '📄';
      default: return '❓';
    }
  };

  const difficultyColors = getDifficultyColor(question.difficultyLevel);
  const correctOption = question.options?.find(opt => opt.isCorrect);
  const questionText = question.questionText || '';
  const isLongQuestion = questionText.length > 150;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      border: '1px solid #e5e7eb',
      position: 'relative'
    }}
    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'}
    onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
    >
      {/* Header with badges and bookmark */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            background: difficultyColors.bg,
            color: difficultyColors.text,
            border: `1px solid ${difficultyColors.border}`
          }}>
            {question.difficultyLevel}
          </span>
          
          <span style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            background: '#e0e7ff',
            color: '#3730a3',
            border: '1px solid #a5b4fc',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getQuestionTypeIcon(question.questionType)}
            {question.questionType?.replace('_', ' ')}
          </span>
          
          <span style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
        </div>

        {/* Bookmark button */}
        <button
          onClick={() => onToggleBookmark(question.id)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
        >
          {isBookmarked ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1f2937',
          lineHeight: '1.6'
        }}>
          {showFullQuestion || !isLongQuestion 
            ? questionText 
            : `${questionText.substring(0, 150)}...`
          }
        </h3>
        
        {isLongQuestion && (
          <button
            onClick={() => setShowFullQuestion(!showFullQuestion)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            {showFullQuestion ? '← Show less' : 'Read more →'}
          </button>
        )}
      </div>

      {/* Hierarchy Info */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '16px',
        fontSize: '13px',
        color: '#6b7280'
      }}>
        {question.subjectName && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📚 {question.subjectName}
          </span>
        )}
        {question.topicName && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📖 {question.topicName}
          </span>
        )}
        {question.chapterName && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📑 {question.chapterName}
          </span>
        )}
      </div>

      {/* Options Section with Toggle/Minimize */}
      {showAnswer && question.options && question.options.length > 0 && (
        <div style={{ 
          marginBottom: '16px',
          border: '2px solid #86efac',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Header with Minimize Button */}
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setShowAnswer(false)}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✓</span>
              <span>Answer Options</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAnswer(false);
              }}
              style={{
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                color: '#166534',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            >
              ▼ Hide
            </button>
          </div>
          
          {/* Options Content */}
          <div style={{ 
            padding: '16px',
            background: 'white'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {question.options.map((option, index) => (
                <div
                  key={option.optionId || index}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: option.isCorrect ? '#dcfce7' : '#f9fafb',
                    border: `2px solid ${option.isCorrect ? '#86efac' : '#e5e7eb'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    color: option.isCorrect ? '#166534' : '#374151',
                    fontWeight: option.isCorrect ? '600' : '400'
                  }}>
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option.optionText}
                  </span>
                  {option.isCorrect && (
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ✓ Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Explanation Section with Toggle/Minimize */}
      {showExplanation && question.explanation && (
        <div style={{
          marginBottom: '16px',
          border: '2px solid #ff9800',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Header with Minimize Button */}
          <div style={{
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setShowExplanation(false)}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#e65100',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>💡</span>
              <span>Explanation</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExplanation(false);
              }}
              style={{
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                color: '#e65100',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            >
              ▼ Hide
            </button>
          </div>
          
          {/* Explanation Content */}
          <div style={{
            padding: '16px',
            background: 'white'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6d4c41',
              lineHeight: '1.6'
            }}>
              {question.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '2px solid #667eea',
            background: showAnswer ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            color: showAnswer ? 'white' : '#667eea',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => {
            if (!showAnswer) {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            } else {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseOut={(e) => {
            if (!showAnswer) {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#667eea';
            } else {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {showAnswer ? '▼ Hide Answer' : '👁️ Show Answer'}
        </button>

        {question.explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '2px solid #ff9800',
              background: showExplanation ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : 'white',
              color: showExplanation ? 'white' : '#ff9800',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              if (!showExplanation) {
                e.currentTarget.style.background = '#ff9800';
                e.currentTarget.style.color = 'white';
              } else {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseOut={(e) => {
              if (!showExplanation) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#ff9800';
              } else {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {showExplanation ? '▼ Hide Explanation' : '💡 Show Explanation'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentQuestionCard;

