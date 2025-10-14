import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useApiManager } from '../../hooks/useApiManager';
import { getTestQuestions, updateTestQuestion, removeQuestionFromTest, addQuestionToTest } from '../../services/masterDataService';
import QuestionSelectionModal from './QuestionSelectionModal';
import './MasterDataComponent.css';

const TestQuestionManager = ({ test, onClose }) => {
  const { token, addNotification } = useApp();
  const { executeApiCall } = useApiManager();
  
  // State for test questions
  const [testQuestions, setTestQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  
  // Load test questions on mount
  useEffect(() => {
    if (test?.id) {
      fetchTestQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id]);
  
  // Fetch test questions
  const fetchTestQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeApiCall(getTestQuestions, token, test.id);
      
      if (result) {
        const questions = Array.isArray(result) ? result : result.data || [];
        // Sort by question order
        const sortedQuestions = questions.sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0));
        setTestQuestions(sortedQuestions);
      }
    } catch (error) {
      console.error('Error fetching test questions:', error);
      addNotification('Failed to fetch test questions', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id, token]);
  
  // Handle question order change
  const handleOrderChange = async (questionId, newOrder) => {
    try {
      const question = testQuestions.find(q => q.id === questionId);
      if (!question) return;
      
      const updatedData = {
        ...question,
        questionOrder: parseInt(newOrder)
      };
      
      const result = await executeApiCall(updateTestQuestion, token, test.id, questionId, updatedData);
      
      if (result) {
        addNotification('Question order updated successfully', 'success');
        fetchTestQuestions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating question order:', error);
      addNotification('Failed to update question order', 'error');
    }
  };
  
  // Handle marks change
  const handleMarksChange = async (questionId, newMarks) => {
    try {
      const question = testQuestions.find(q => q.id === questionId);
      if (!question) return;
      
      const updatedData = {
        ...question,
        marks: parseInt(newMarks)
      };
      
      const result = await executeApiCall(updateTestQuestion, token, test.id, questionId, updatedData);
      
      if (result) {
        addNotification('Question marks updated successfully', 'success');
        fetchTestQuestions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating question marks:', error);
      addNotification('Failed to update question marks', 'error');
    }
  };
  
  // Handle negative marks change
  const handleNegativeMarksChange = async (questionId, newNegativeMarks) => {
    try {
      const question = testQuestions.find(q => q.id === questionId);
      if (!question) return;
      
      const updatedData = {
        ...question,
        negativeMarks: parseFloat(newNegativeMarks)
      };
      
      const result = await executeApiCall(updateTestQuestion, token, test.id, questionId, updatedData);
      
      if (result) {
        addNotification('Negative marks updated successfully', 'success');
        fetchTestQuestions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating negative marks:', error);
      addNotification('Failed to update negative marks', 'error');
    }
  };
  
  // Handle remove question
  const handleRemoveQuestion = async (questionId) => {
    const question = testQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const confirmMessage = `Are you sure you want to remove this question from the test?\n\n"${question.questionText?.substring(0, 50)}..."`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      const result = await executeApiCall(removeQuestionFromTest, token, test.id, questionId);
      
      if (result) {
        addNotification('Question removed from test successfully', 'success');
        fetchTestQuestions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error removing question from test:', error);
      addNotification('Failed to remove question from test', 'error');
    }
  };

  // Handle adding questions to test
  const handleAddQuestionsToTest = async (selectedQuestions) => {
    try {
      setLoading(true);
      
      // Add each selected question to the test
      for (const question of selectedQuestions) {
        const testQuestionData = {
          questionId: question.id,
          questionOrder: testQuestions.length + 1, // Add at the end
          marks: question.marks || 1, // Default marks
          negativeMarks: question.negativeMarks || 0
        };
        
        await executeApiCall(addQuestionToTest, token, test.id, testQuestionData);
      }
      
      addNotification(`${selectedQuestions.length} question(s) added to test successfully`, 'success');
      setShowAddQuestion(false); // Close the modal
      fetchTestQuestions(); // Refresh the list
      
    } catch (error) {
      console.error('Error adding questions to test:', error);
      addNotification('Failed to add questions to test', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  
  // Calculate total marks
  const totalMarks = testQuestions.reduce((sum, question) => sum + (question.marks || 0), 0);
  
  // Get question preview text
  const getQuestionPreview = (questionText) => {
    if (!questionText) return 'No question text';
    return questionText.length > 80 
      ? questionText.substring(0, 80) + '...' 
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
      <div className="modal-content test-question-manager" style={{ maxWidth: '1200px', width: '95%' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '24px' }}>
          <div className="modal-title">
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
              📋 Test Questions Manager
            </h3>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              {test?.testName} | Organize questions, set marks, and configure test structure
            </p>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '20px' }}
          >
            ✕
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Test Summary Cards */}
          <div className="test-summary" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            <div className="summary-card" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{testQuestions.length}</div>
              <div style={{ opacity: 0.9, fontSize: '14px' }}>Total Questions</div>
            </div>
            
            <div className="summary-card" style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {totalMarks} / {test?.totalMarks}
              </div>
              <div style={{ opacity: 0.9, fontSize: '14px' }}>
                Total Marks {totalMarks !== test?.totalMarks && '⚠️'}
              </div>
            </div>
            
            <div className="summary-card" style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{test?.timeLimitMinutes}</div>
              <div style={{ opacity: 0.9, fontSize: '14px' }}>Minutes Duration</div>
            </div>
            
            <div className="summary-card" style={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                {testQuestions.length > 0 ? Math.round(test?.timeLimitMinutes / testQuestions.length) : 0}
              </div>
              <div style={{ opacity: 0.9, fontSize: '14px' }}>Min/Question</div>
            </div>
          </div>
          
          {/* Action Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                📝 Questions List ({testQuestions.length})
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Click on a question to edit marks, order, or remove it from the test
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-outline btn-sm"
                onClick={fetchTestQuestions}
                disabled={loading}
                style={{ borderRadius: '6px', padding: '8px 16px' }}
              >
                🔄 Refresh
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddQuestion(true)}
                style={{ borderRadius: '6px', padding: '8px 16px' }}
              >
                ➕ Add Questions
              </button>
            </div>
          </div>
          
          {/* Questions List */}
          <div className="questions-section">
            {loading && testQuestions.length === 0 ? (
              <div className="loading-state" style={{ 
                padding: '60px', 
                textAlign: 'center', 
                background: '#f8fafc', 
                borderRadius: '12px' 
              }}>
                <div className="loading-spinner" style={{ fontSize: '18px', color: '#667eea' }}>
                  ⏳ Loading questions...
                </div>
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="empty-state" style={{ 
                padding: '80px 40px', 
                textAlign: 'center', 
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', 
                borderRadius: '12px',
                border: '2px dashed #667eea50'
              }}>
                <div className="empty-icon" style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1e293b' }}>No Questions Added Yet</h4>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>
                  Get started by adding questions to build your test
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddQuestion(true)}
                  style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '8px' }}
                >
                  ➕ Add Your First Questions
                </button>
              </div>
            ) : (
              <div className="questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {testQuestions.map((question, index) => (
                  <div 
                    key={question.id} 
                    className="test-question-card"
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.2s ease',
                      boxShadow: editingQuestion === question.id ? '0 8px 16px rgba(102,126,234,0.15)' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="question-header" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="question-number" style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {index + 1}
                        </div>
                        <div className="question-meta" style={{ display: 'flex', gap: '8px' }}>
                          <span 
                            className="difficulty-badge"
                            style={{ 
                              backgroundColor: getDifficultyColor(question.difficultyLevel),
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            {question.difficultyLevel || 'UNKNOWN'}
                          </span>
                          <span className="type-badge" style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {question.questionType || 'MCQ'}
                          </span>
                        </div>
                      </div>
                      <div className="question-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-link btn-sm"
                          onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
                          style={{
                            background: editingQuestion === question.id ? '#667eea' : '#e0e7ff',
                            color: editingQuestion === question.id ? 'white' : '#667eea',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          {editingQuestion === question.id ? '✕ Cancel' : '✏️ Edit'}
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="question-content" style={{ marginBottom: editingQuestion === question.id ? '20px' : '16px' }}>
                      <div className="question-text" style={{ 
                        fontSize: '15px', 
                        lineHeight: '1.6', 
                        color: '#1e293b',
                        marginBottom: '12px',
                        fontWeight: '500'
                      }}>
                        {getQuestionPreview(question.questionText)}
                      </div>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="question-options" style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '8px',
                          marginTop: '12px'
                        }}>
                          {question.options.slice(0, 4).map((option, optIndex) => (
                            <div key={optIndex} className="option-preview" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              background: option.isCorrect ? '#dcfce7' : '#f8fafc',
                              border: `1px solid ${option.isCorrect ? '#86efac' : '#e2e8f0'}`,
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}>
                              <span className="option-letter" style={{
                                background: option.isCorrect ? '#22c55e' : '#94a3b8',
                                color: 'white',
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {option.optionLetter || String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="option-text" style={{ color: '#475569', flex: 1 }}>
                                {option.optionText?.substring(0, 35) || 'No text'}
                                {option.optionText?.length > 35 ? '...' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Editable Fields */}
                    {editingQuestion === question.id && (
                      <div className="question-editor" style={{
                        background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        <div className="editor-header" style={{ marginBottom: '16px' }}>
                          <h5 style={{ margin: 0, fontSize: '14px', color: '#667eea', fontWeight: '600' }}>
                            ⚙️ Configure Question Settings
                          </h5>
                        </div>
                        <div className="editor-row" style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '16px'
                        }}>
                          <div className="form-group">
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '6px', 
                              fontSize: '13px', 
                              fontWeight: '600',
                              color: '#475569'
                            }}>
                              🎯 Question Order
                            </label>
                            <input
                              type="number"
                              value={question.questionOrder || index + 1}
                              onChange={(e) => handleOrderChange(question.id, e.target.value)}
                              className="form-control"
                              min="1"
                              style={{
                                padding: '10px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '100%'
                              }}
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '6px', 
                              fontSize: '13px', 
                              fontWeight: '600',
                              color: '#475569'
                            }}>
                              📝 Marks
                            </label>
                            <input
                              type="number"
                              value={question.marks || 0}
                              onChange={(e) => handleMarksChange(question.id, e.target.value)}
                              className="form-control"
                              min="1"
                              style={{
                                padding: '10px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '100%'
                              }}
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '6px', 
                              fontSize: '13px', 
                              fontWeight: '600',
                              color: '#475569'
                            }}>
                              ⚠️ Negative Marks
                            </label>
                            <input
                              type="number"
                              value={question.negativeMarks || 0}
                              onChange={(e) => handleNegativeMarksChange(question.id, e.target.value)}
                              className="form-control"
                              min="0"
                              step="0.1"
                              style={{
                                padding: '10px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '100%'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Question Footer */}
                    <div className="question-footer" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '16px',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <div className="question-stats" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span className="stat" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontSize: '13px',
                          color: '#475569',
                          fontWeight: '500'
                        }}>
                          📝 <strong style={{ color: '#1e293b' }}>{question.marks || 0}</strong> marks
                        </span>
                        {question.negativeMarks > 0 && (
                          <span className="stat" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '13px',
                            color: '#dc2626',
                            fontWeight: '500'
                          }}>
                            ⚠️ <strong>-{question.negativeMarks}</strong> for wrong answer
                          </span>
                        )}
                        <span className="stat" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontSize: '13px',
                          color: '#64748b',
                          fontWeight: '500'
                        }}>
                          🎯 Position: <strong style={{ color: '#1e293b' }}>#{question.questionOrder || index + 1}</strong>
                        </span>
                      </div>
                      <div className="question-date" style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Added: {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer" style={{ 
          background: '#f8fafc', 
          padding: '20px 24px', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="footer-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
              {testQuestions.length} Question{testQuestions.length !== 1 ? 's' : ''} | {totalMarks} Total Marks
            </span>
            {totalMarks !== test?.totalMarks && (
              <span className="marks-warning" style={{ 
                fontSize: '13px', 
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚠️ Marks mismatch: Current {totalMarks} vs Target {test?.totalMarks}
              </span>
            )}
            {totalMarks === test?.totalMarks && testQuestions.length > 0 && (
              <span style={{ 
                fontSize: '13px', 
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ✓ Test configuration is complete
              </span>
            )}
          </div>
          <div className="footer-actions" style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
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
              onClick={() => setShowAddQuestion(true)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              ➕ Add More Questions
            </button>
          </div>
        </div>
      </div>

      {/* Question Selection Modal */}
      {showAddQuestion && (
        <QuestionSelectionModal
          test={test}
          onClose={() => setShowAddQuestion(false)}
          onComplete={handleAddQuestionsToTest}
        />
      )}
    </div>
  );
};

export default TestQuestionManager;
