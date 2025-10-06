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
  }, [test?.id]);
  
  // Fetch test questions
  const fetchTestQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeApiCall(
        () => getTestQuestions(token, test.id),
        'Failed to fetch test questions'
      );
      
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
  }, [test?.id, token, executeApiCall, addNotification]);
  
  // Handle question order change
  const handleOrderChange = async (questionId, newOrder) => {
    try {
      const question = testQuestions.find(q => q.id === questionId);
      if (!question) return;
      
      const updatedData = {
        ...question,
        questionOrder: parseInt(newOrder)
      };
      
      const result = await executeApiCall(
        () => updateTestQuestion(token, test.id, questionId, updatedData),
        'Failed to update question order'
      );
      
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
      
      const result = await executeApiCall(
        () => updateTestQuestion(token, test.id, questionId, updatedData),
        'Failed to update question marks'
      );
      
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
      
      const result = await executeApiCall(
        () => updateTestQuestion(token, test.id, questionId, updatedData),
        'Failed to update negative marks'
      );
      
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
      const result = await executeApiCall(
        () => removeQuestionFromTest(token, test.id, questionId),
        'Failed to remove question from test'
      );
      
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
        
        await executeApiCall(
          () => addQuestionToTest(token, test.id, testQuestionData),
          'Failed to add question to test'
        );
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
      <div className="modal-content test-question-manager">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>📋 Manage Questions - "{test?.testName}"</h3>
            <p>Configure question order, marks, and settings</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          {/* Test Summary */}
          <div className="test-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Questions:</span>
                <span className="stat-value">{testQuestions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Marks:</span>
                <span className="stat-value">{totalMarks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Test Time:</span>
                <span className="stat-value">{test?.timeLimitMinutes} min</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Time/Question:</span>
                <span className="stat-value">
                  {testQuestions.length > 0 ? Math.round(test?.timeLimitMinutes / testQuestions.length) : 0} min
                </span>
              </div>
            </div>
            <div className="summary-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddQuestion(true)}
              >
                ➕ Add Questions
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={fetchTestQuestions}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          {/* Questions List */}
          <div className="questions-section">
            <div className="section-header">
              <h4>📝 Test Questions ({testQuestions.length})</h4>
              <div className="section-actions">
                <span className="marks-info">
                  Total: {totalMarks} marks | Target: {test?.totalMarks} marks
                  {totalMarks !== test?.totalMarks && (
                    <span className="marks-warning">
                      ⚠️ Marks mismatch
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            {loading && testQuestions.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner">Loading questions...</div>
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h4>No questions in this test</h4>
                <p>Add questions to start building your test</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddQuestion(true)}
                >
                  ➕ Add Questions
                </button>
              </div>
            ) : (
              <div className="questions-list">
                {testQuestions.map((question, index) => (
                  <div key={question.id} className="test-question-card">
                    <div className="question-header">
                      <div className="question-number">
                        #{index + 1}
                      </div>
                      <div className="question-meta">
                        <span 
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(question.difficultyLevel) }}
                        >
                          {question.difficultyLevel || 'UNKNOWN'}
                        </span>
                        <span className="type-badge">
                          {question.questionType || 'MCQ'}
                        </span>
                      </div>
                      <div className="question-actions">
                        <button 
                          className="btn btn-link btn-sm"
                          onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
                        >
                          {editingQuestion === question.id ? '✕ Cancel' : '✏️ Edit'}
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="question-content">
                      <div className="question-text">
                        {getQuestionPreview(question.questionText)}
                      </div>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="question-options">
                          {question.options.slice(0, 2).map((option, optIndex) => (
                            <div key={optIndex} className="option-preview">
                              <span className="option-letter">{option.optionLetter || String.fromCharCode(65 + optIndex)}</span>
                              <span className="option-text">
                                {option.optionText?.substring(0, 40) || 'No text'}
                                {option.optionText?.length > 40 ? '...' : ''}
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
                    </div>
                    
                    {/* Editable Fields */}
                    {editingQuestion === question.id && (
                      <div className="question-editor">
                        <div className="editor-row">
                          <div className="form-group">
                            <label>Question Order</label>
                            <input
                              type="number"
                              value={question.questionOrder || index + 1}
                              onChange={(e) => handleOrderChange(question.id, e.target.value)}
                              className="form-control"
                              min="1"
                            />
                          </div>
                          <div className="form-group">
                            <label>Marks</label>
                            <input
                              type="number"
                              value={question.marks || 0}
                              onChange={(e) => handleMarksChange(question.id, e.target.value)}
                              className="form-control"
                              min="1"
                            />
                          </div>
                          <div className="form-group">
                            <label>Negative Marks</label>
                            <input
                              type="number"
                              value={question.negativeMarks || 0}
                              onChange={(e) => handleNegativeMarksChange(question.id, e.target.value)}
                              className="form-control"
                              min="0"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Question Footer */}
                    <div className="question-footer">
                      <div className="question-stats">
                        <span className="stat">
                          📝 {question.marks || 0} marks
                        </span>
                        {question.negativeMarks > 0 && (
                          <span className="stat">
                            ⚠️ -{question.negativeMarks} negative
                          </span>
                        )}
                        <span className="stat">
                          🎯 Order: {question.questionOrder || index + 1}
                        </span>
                      </div>
                      <div className="question-date">
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
        <div className="modal-footer">
          <div className="footer-info">
            <span>
              {testQuestions.length} questions | {totalMarks} total marks
            </span>
            {totalMarks !== test?.totalMarks && (
              <span className="marks-warning">
                ⚠️ Marks mismatch with test configuration
              </span>
            )}
          </div>
          <div className="footer-actions">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddQuestion(true)}
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
