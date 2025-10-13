import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getUserSubscriptions } from '../../services/subscriptionService';
import { 
  getStudentAvailableTests, 
  startStudentTest,
  getStudentTestQuestions,
  submitStudentAnswer,
  submitStudentTest,
  getStudentTestAttempts 
} from '../../services/studentService';

const StudentTestCenter = () => {
  const { token, addNotification } = useApp();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);
  const [testAttempts, setTestAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testTimeRemaining, setTestTimeRemaining] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [sessionId, setSessionId] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  const testTimerRef = useRef(null);

  // Load student subscriptions with real API
  const loadSubscriptions = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await getUserSubscriptions(token);
      
      // Filter only active subscriptions
      const activeSubscriptions = data.filter(sub => sub.isActive);
      setSubscriptions(activeSubscriptions);
      
      if (activeSubscriptions.length > 0) {
        setSelectedSubscription(activeSubscriptions[0]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load available tests when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadAvailableTests();
      loadTestAttempts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubscription]);

  // Timer effect for test
  useEffect(() => {
    if (testTimeRemaining > 0 && testStartTime) {
      testTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
        const remaining = Math.max(0, selectedTest?.duration * 60 - elapsed);
        setTestTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleSubmitTest();
        }
      }, 1000);
    }

    return () => {
      if (testTimerRef.current) {
        clearInterval(testTimerRef.current);
      }
    };
  }, [testTimeRemaining, testStartTime, selectedTest]);

  const loadAvailableTests = async () => {
    if (!selectedSubscription || !token) return;

    try {
      setLoading(true);
      
      // Build filter based on subscription
      const filters = {};
      
      console.log('Selected subscription:', selectedSubscription);
      console.log('Subscription level:', selectedSubscription.subscriptionLevel);
      console.log('Entity ID:', selectedSubscription.entityId);
      
      // Add filters based on subscription level (priority: classId > examId > courseId)
      if (selectedSubscription.subscriptionLevel === 'CLASS' && selectedSubscription.entityId) {
        filters.classId = selectedSubscription.entityId;
        console.log('Using classId filter:', filters.classId);
      } else if (selectedSubscription.subscriptionLevel === 'EXAM' && selectedSubscription.entityId) {
        filters.examId = selectedSubscription.entityId;
        console.log('Using examId filter:', filters.examId);
      } else if (selectedSubscription.subscriptionLevel === 'COURSE' && selectedSubscription.entityId) {
        filters.courseId = selectedSubscription.entityId;
        console.log('Using courseId filter:', filters.courseId);
      }
      
      if (!filters.classId && !filters.examId && !filters.courseId) {
        console.warn('No classId, examId, or courseId found in subscription');
        addNotification('Invalid subscription data', 'warning');
        setAvailableTests([]);
        return;
      }
      
      console.log('Loading tests with filters:', filters);
      console.log('API will call: GET /api/student/dashboard/tests?' + new URLSearchParams(filters).toString());
      
      const data = await getStudentAvailableTests(token, filters);
      
      // Handle different response formats - API returns array directly
      const testsArray = Array.isArray(data) ? data : data.content || data.data || [];
      console.log('Loaded tests:', testsArray.length, 'tests');
      setAvailableTests(testsArray);
      
      if (testsArray.length > 0) {
        addNotification(`✅ ${testsArray.length} test(s) available`, 'success');
      } else {
        addNotification('No tests available for this subscription', 'info');
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      addNotification('Failed to load available tests', 'error');
      setAvailableTests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTestAttempts = async () => {
    if (!token) return;

    try {
      const data = await getStudentTestAttempts(token);
      const attemptsArray = Array.isArray(data) ? data : data.content || data.data || [];
      setTestAttempts(attemptsArray);
    } catch (error) {
      console.error('Error loading test attempts:', error);
      // Don't show error notification for optional data
    }
  };

  const startTest = async (test) => {
    try {
      setLoading(true);
      
      // Step 1: Start test and get session
      console.log('Step 1: Starting test and getting session...');
      const sessionData = await startStudentTest(token, test.id);
      
      if (!sessionData.sessionId) {
        throw new Error('Failed to get session ID');
      }
      
      console.log('Session created:', sessionData);
      setSessionId(sessionData.sessionId);
      setAttemptId(sessionData.attemptId);
      
      // Step 2: Fetch test questions with session
      console.log('Step 2: Fetching questions with sessionId...');
      const questionsData = await getStudentTestQuestions(token, test.id, sessionData.sessionId);
      const questions = Array.isArray(questionsData) ? questionsData : questionsData.content || questionsData.data || [];
      
      if (questions.length === 0) {
        addNotification('This test has no questions', 'warning');
        return;
      }
      
      console.log('Loaded questions:', questions.length);
      
      // Set test state
      setSelectedTest({
        ...test,
        startedAt: sessionData.startedAt,
        expiresAt: sessionData.expiresAt
      });
      setTestQuestions(questions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setMarkedForReview(new Set());
      setTestStartTime(new Date(sessionData.startedAt).getTime());
      setTestTimeRemaining(test.timeLimitMinutes * 60); // Convert minutes to seconds
      setShowTestModal(true);
      
      addNotification('✅ Test started! Good luck!', 'success');
      
    } catch (error) {
      console.error('Error starting test:', error);
      
      // Handle specific error for active session
      if (error.message && error.message.includes('already have an active session')) {
        const continueTest = window.confirm(
          '⚠️ You have an existing test session in progress.\n\n' +
          'You can:\n' +
          '• Click OK to continue your existing attempt\n' +
          '• Click Cancel to abandon the current attempt\n\n' +
          'Note: Abandoning will count as one attempt.'
        );
        
        if (continueTest) {
          addNotification('Please contact support to resume your test session', 'info');
        } else {
          addNotification('Please submit or abandon your current test attempt first', 'warning');
        }
      } else {
        addNotification(`Failed to start test: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    // Update local state immediately for better UX
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Find the option ID from the selected answer
    const currentQuestion = testQuestions[currentQuestionIndex];
    const selectedOption = currentQuestion?.options?.find(opt => 
      (opt.optionText || opt) === answer
    );
    
    if (!selectedOption || !sessionId) {
      console.warn('Cannot submit answer: missing option or session');
      return;
    }

    // Submit answer to backend
    try {
      const answerData = {
        sessionId: sessionId,
        questionId: questionId,
        selectedOptionId: selectedOption.id
      };
      
      console.log('Submitting answer:', answerData);
      await submitStudentAnswer(token, selectedTest.id, answerData);
      console.log('Answer saved to backend');
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Don't show error to user, keep local state
    }
  };

  const clearAnswer = (questionId) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleExitTest = () => {
    const confirmExit = window.confirm(
      '⚠️ Are you sure you want to exit the test?\n\n' +
      'Your answers have been saved. You can continue later if attempts are remaining.\n' +
      'However, the timer will continue running.'
    );
    
    if (confirmExit) {
      setShowTestModal(false);
      setSelectedTest(null);
      setTestQuestions([]);
      setAnswers({});
      setTestStartTime(null);
      setMarkedForReview(new Set());
      setSessionId(null);
      setAttemptId(null);
      
      if (testTimerRef.current) {
        clearInterval(testTimerRef.current);
      }
      
      addNotification('Test exited - Your answers have been saved', 'info');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showTestModal) return;
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft') {
        previousQuestion();
      } else if (e.key === 'ArrowRight') {
        nextQuestion();
      }
      // Number keys for options (1-4)
      else if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQuestion = testQuestions[currentQuestionIndex];
        if (currentQuestion?.options?.[optionIndex]) {
          const option = currentQuestion.options[optionIndex];
          handleAnswerChange(currentQuestion.id, option.optionText || option);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showTestModal, currentQuestionIndex, testQuestions]);

  const handleSubmitTest = async () => {
    if (!selectedTest || !testQuestions.length || !testStartTime || !sessionId) return;

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = testQuestions.length - answeredCount;
    const markedCount = markedForReview.size;
    
    let confirmMessage = `⚠️ Are you sure you want to submit the test?\n\n`;
    confirmMessage += `📊 Summary:\n`;
    confirmMessage += `✅ Answered: ${answeredCount} questions\n`;
    confirmMessage += `❌ Not Answered: ${unansweredCount} questions\n`;
    if (markedCount > 0) {
      confirmMessage += `🚩 Marked for Review: ${markedCount} questions\n`;
    }
    confirmMessage += `\n⏱️ Time Used: ${formatTime(Math.floor((Date.now() - testStartTime) / 1000))}\n`;
    confirmMessage += `\n⚠️ You cannot change your answers after submission!`;

    const confirmSubmit = window.confirm(confirmMessage);
    
    if (!confirmSubmit) return;

    try {
      setLoading(true);
      
      console.log('Submitting test with sessionId:', sessionId);
      
      // Submit test to backend
      const result = await submitStudentTest(token, selectedTest.id, sessionId);
      
      console.log('Test submission result:', result);
      
      // Store result and show result modal
      setTestResult(result);
        setShowTestModal(false);
      setShowResultModal(true);
      
      // Clear timer
      if (testTimerRef.current) {
        clearInterval(testTimerRef.current);
      }
      
      // Reload test attempts
      loadTestAttempts();
      
      addNotification('✅ Test submitted successfully!', 'success');
      
    } catch (error) {
      console.error('Error submitting test:', error);
      addNotification(`❌ Failed to submit test: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubscriptionDisplayText = (subscription) => {
    let text = subscription.subscriptionLevel || 'Unknown';
    
    if (subscription.className) {
      text += ` - ${subscription.className}`;
    } else if (subscription.examName) {
      text += ` - ${subscription.examName}`;
    } else if (subscription.courseName) {
      text += ` - ${subscription.courseName}`;
    }
    
    return text;
  };

  const getAttemptStatus = (attempt) => {
    if (attempt.completedAt) {
      return 'Completed';
    }
    return 'In Progress';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="student-test-center">
      <div className="page-header">
        <h2>📝 Test Center</h2>
        <p>Take tests and track your performance</p>
      </div>

      {/* Subscription Selection */}
      <div className="subscription-section">
        <h3>Your Active Subscriptions</h3>
        {loading && subscriptions.length === 0 ? (
          <div className="loading">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>📚 No active subscriptions found. Subscribe to a course to access tests.</p>
          </div>
        ) : (
          <div className="subscription-cards">
            {subscriptions.map(subscription => (
                <div 
                  key={subscription.id} 
                  className={`subscription-card ${selectedSubscription?.id === subscription.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSubscription(subscription)}
                >
                  <h4>{getSubscriptionDisplayText(subscription)}</h4>
                  <p className="subscription-details">
                  <span>📅 Valid until: {new Date(subscription.endDate).toLocaleDateString()}</span>
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Available Tests */}
      {selectedSubscription && (
        <div className="tests-section">
          <h3>Available Tests ({availableTests.length})</h3>
          {loading ? (
            <div className="loading">Loading tests...</div>
          ) : availableTests.length === 0 ? (
            <div className="empty-state">
              <p>📝 No tests available for this subscription yet.</p>
            </div>
          ) : (
            <div className="test-cards">
              {availableTests.map(test => (
                <div key={test.id} className="test-card">
                  <div className="test-info">
                    <h4>{test.testName}</h4>
                    <p className="test-description">{test.description || 'No description available'}</p>
                    <div className="test-details">
                      <span>⏱️ {test.timeLimitMinutes} minutes</span>
                      <span>📝 {test.totalMarks} marks</span>
                      <span>✅ Passing: {test.passingMarks}</span>
                      <span>🔄 Max Attempts: {test.maxAttempts || 'Unlimited'}</span>
                    </div>
                  </div>
                  <div className="test-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => startTest(test)}
                      disabled={loading}
                    >
                      🚀 Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Attempts History */}
      {selectedSubscription && testAttempts.length > 0 && (
        <div className="attempts-section">
          <h3>📊 Test Attempts History</h3>
          <div className="attempts-table">
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Score</th>
                  <th>Time Spent</th>
                  <th>Status</th>
                  <th>Attempted At</th>
                </tr>
              </thead>
              <tbody>
                {testAttempts.map(attempt => (
                  <tr key={attempt.id}>
                    <td>{attempt.testName || 'Unknown Test'}</td>
                    <td className={getScoreColor(attempt.score)}>
                      {attempt.score ? `${attempt.score}%` : 'N/A'}
                    </td>
                    <td>{formatTime(attempt.timeSpent || 0)}</td>
                    <td>{getAttemptStatus(attempt)}</td>
                    <td>{new Date(attempt.attemptedAt || attempt.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Modal - Full Screen */}
      {showTestModal && selectedTest && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Test Header - Fixed */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                📝 {selectedTest.testName}
              </h2>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                background: testTimeRemaining < 300 ? '#dc2626' : 'rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>⏱️</span>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Time Remaining</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {formatTime(testTimeRemaining)}
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '12px 24px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Answered</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {Object.keys(answers).length} / {testQuestions.length}
                </div>
              </div>
              <button
                onClick={handleExitTest}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ❌ Exit Test
              </button>
              </div>
            </div>
            
          {/* Test Content Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Left Sidebar - Question Palette */}
            <div style={{
              width: '280px',
              background: '#1e293b',
              color: 'white',
              padding: '24px',
              overflowY: 'auto',
              flexShrink: 0
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                📋 Question Palette
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px'
              }}>
                {testQuestions.map((q, index) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = index === currentQuestionIndex;
                  const isMarked = markedForReview.has(q.id);
                  
                  let bgColor = '#475569'; // Not answered
                  if (isAnswered && isMarked) {
                    bgColor = '#f59e0b'; // Answered + marked for review
                  } else if (isAnswered) {
                    bgColor = '#22c55e'; // Answered
                  } else if (isMarked) {
                    bgColor = '#8b5cf6'; // Not answered but marked
                  }
                  
                  return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: isCurrent ? '2px solid white' : 'none',
                        background: bgColor,
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => {
                        if (!isCurrent) e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title={
                        isAnswered && isMarked ? 'Answered & Marked for Review' :
                        isAnswered ? 'Answered' :
                        isMarked ? 'Marked for Review' :
                        'Not Answered'
                      }
                      >
                        {index + 1}
                      {isMarked && (
                        <span style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          fontSize: '10px'
                        }}>
                          🚩
                        </span>
                      )}
                      </button>
                  );
                })}
                  </div>

              {/* Legend */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#334155', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Legend:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#22c55e', borderRadius: '4px' }}></div>
                    <span>Answered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '4px', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '8px' }}>🚩</span>
                    </div>
                    <span>Marked for Review</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#8b5cf6', borderRadius: '4px', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '8px' }}>🚩</span>
                    </div>
                    <span>Not Ans. + Marked</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#475569', borderRadius: '4px' }}></div>
                    <span>Not Answered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid white', borderRadius: '4px' }}></div>
                    <span>Current Question</span>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div style={{ marginTop: '16px', padding: '16px', background: '#334155', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>⌨️ Shortcuts:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div>← → Navigate</div>
                  <div>1-4: Select Option</div>
                </div>
              </div>

              {/* Statistics Summary */}
              <div style={{ marginTop: '16px', padding: '16px', background: '#334155', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>📊 Progress:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Answered:</span>
                    <strong style={{ color: '#22c55e' }}>{Object.keys(answers).length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Not Answered:</span>
                    <strong style={{ color: '#ef4444' }}>{testQuestions.length - Object.keys(answers).length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Marked:</span>
                    <strong style={{ color: '#f59e0b' }}>{markedForReview.size}</strong>
                  </div>
                </div>
              </div>

              {/* Test Info */}
              <div style={{ marginTop: '16px', padding: '16px', background: '#334155', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>📝 Test Info:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div>📊 Total Marks: {selectedTest.totalMarks}</div>
                  <div>✅ Passing: {selectedTest.passingMarks}</div>
                  {selectedTest.negativeMarking && (
                    <div>⚠️ Negative: -{(selectedTest.negativeMarkPercentage * 100).toFixed(0)}%</div>
                  )}
                  <div>🔄 Max Attempts: {selectedTest.maxAttempts || '∞'}</div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area - Question */}
            <div style={{
              flex: 1,
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {testQuestions.length > 0 && (
                <>
                  {/* Question Content */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '32px'
                  }}>
                    <div style={{
                      maxWidth: '900px',
                      margin: '0 auto',
                      background: 'white',
                      borderRadius: '16px',
                      padding: '32px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {/* Question Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid #e2e8f0'
                      }}>
                        <div>
                          <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: '700',
                            marginBottom: '8px'
                          }}>
                            Question {currentQuestionIndex + 1}
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                            Marks: {testQuestions[currentQuestionIndex]?.marks || 1} 
                            {selectedTest.negativeMarking && testQuestions[currentQuestionIndex]?.negativeMarks > 0 && 
                              ` | Negative: -${testQuestions[currentQuestionIndex]?.negativeMarks}`
                            }
                          </div>
                        </div>
                        <div style={{
                          background: answers[testQuestions[currentQuestionIndex]?.id] ? '#dcfce7' : '#fee2e2',
                          color: answers[testQuestions[currentQuestionIndex]?.id] ? '#166534' : '#991b1b',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {answers[testQuestions[currentQuestionIndex]?.id] ? '✓ Answered' : '○ Not Answered'}
                        </div>
                  </div>

                      {/* Question Text */}
                      <div style={{
                        fontSize: '18px',
                        lineHeight: '1.8',
                        color: '#1e293b',
                        marginBottom: '24px',
                        fontWeight: '500'
                      }}>
                      {testQuestions[currentQuestionIndex]?.questionText}
                    </div>
                    
                      {/* Quick Actions */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '24px'
                      }}>
                        <button
                          onClick={() => clearAnswer(testQuestions[currentQuestionIndex]?.id)}
                          disabled={!answers[testQuestions[currentQuestionIndex]?.id]}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: answers[testQuestions[currentQuestionIndex]?.id] ? 'pointer' : 'not-allowed',
                            opacity: answers[testQuestions[currentQuestionIndex]?.id] ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          🗑️ Clear Answer
                        </button>
                        <button
                          onClick={() => toggleMarkForReview(testQuestions[currentQuestionIndex]?.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: markedForReview.has(testQuestions[currentQuestionIndex]?.id) ? '#fef3c7' : 'white',
                            color: markedForReview.has(testQuestions[currentQuestionIndex]?.id) ? '#92400e' : '#64748b',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          🚩 {markedForReview.has(testQuestions[currentQuestionIndex]?.id) ? 'Unmark' : 'Mark for Review'}
                        </button>
                    </div>
                    
                      {/* Options */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        {testQuestions[currentQuestionIndex]?.options?.map((option, index) => {
                          const optionValue = option.optionText || option;
                          const isSelected = answers[testQuestions[currentQuestionIndex].id] === optionValue;
                          
                          return (
                            <label 
                              key={index} 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px',
                                background: isSelected ? '#e0e7ff' : 'white',
                                border: `2px solid ${isSelected ? '#667eea' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                              }}
                              onMouseOver={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = '#f8fafc';
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                }
                              }}
                            >
                          <input
                            type="radio"
                            name={`question_${testQuestions[currentQuestionIndex].id}`}
                                value={optionValue}
                                checked={isSelected}
                            onChange={(e) => handleAnswerChange(testQuestions[currentQuestionIndex].id, e.target.value)}
                                style={{ display: 'none' }}
                              />
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: isSelected ? '#667eea' : '#f1f5f9',
                                color: isSelected ? 'white' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {option.optionLetter || String.fromCharCode(65 + index)}
                              </div>
                              <span style={{
                                flex: 1,
                                fontSize: '16px',
                                color: '#1e293b',
                                lineHeight: '1.6'
                              }}>
                                {option.optionText || option}
                              </span>
                              {isSelected && (
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: '#22c55e',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}>
                                  ✓
                                </div>
                              )}
                        </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Footer - Fixed */}
                  <div style={{
                    background: 'white',
                    padding: '20px 32px',
                    borderTop: '2px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    flexShrink: 0
                  }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: '2px solid #cbd5e1',
                        background: currentQuestionIndex === 0 ? '#e2e8f0' : 'white',
                        color: currentQuestionIndex === 0 ? '#94a3b8' : '#475569',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      ⬅️ Previous
                    </button>

                    <div style={{ 
                      flex: 1, 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        Progress: {Object.keys(answers).length} answered, {testQuestions.length - Object.keys(answers).length} remaining
                      </div>
                      <div style={{
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        maxWidth: '400px',
                        margin: '0 auto',
                        width: '100%'
                      }}>
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                          width: `${(Object.keys(answers).length / testQuestions.length) * 100}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>

                    {currentQuestionIndex < testQuestions.length - 1 ? (
                    <button 
                      className="btn btn-secondary"
                      onClick={nextQuestion}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '8px',
                          border: '2px solid #667eea',
                          background: 'white',
                          color: '#667eea',
                          fontSize: '16px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        Next ➡️
                    </button>
                    ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={handleSubmitTest}
                      disabled={loading}
                        style={{
                          padding: '12px 32px',
                          borderRadius: '8px',
                          background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          color: 'white',
                          border: 'none',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {loading ? '⏳ Submitting...' : '✅ Submit Test'}
                    </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {showResultModal && testResult && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Result Header */}
            <div style={{
              background: testResult.isPassed 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '32px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {testResult.isPassed ? '🎉' : '📚'}
              </div>
              <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                {testResult.isPassed ? 'Congratulations!' : 'Keep Practicing!'}
              </h2>
              <p style={{ margin: 0, fontSize: '18px', opacity: 0.95 }}>
                {testResult.isPassed ? 'You have passed the test!' : 'You can try again to improve your score'}
              </p>
            </div>

            {/* Result Body */}
            <div style={{ padding: '32px' }}>
              {/* Score Card */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
                  Your Score
                </div>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: 'bold', 
                  color: testResult.isPassed ? '#22c55e' : '#ef4444',
                  marginBottom: '8px'
                }}>
                  {testResult.percentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: '18px', color: '#475569' }}>
                  {testResult.totalMarksObtained} / {testResult.totalMarks} marks
                </div>
              </div>

              {/* Detailed Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: '#dcfce7',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>
                    {testResult.correctAnswers}
                  </div>
                  <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                    ✓ Correct
                  </div>
                </div>
                
                <div style={{
                  background: '#fee2e2',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#991b1b' }}>
                    {testResult.wrongAnswers}
                  </div>
                  <div style={{ fontSize: '13px', color: '#991b1b', marginTop: '4px' }}>
                    ✗ Wrong
                  </div>
                </div>
                
                <div style={{
                  background: '#e0e7ff',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3730a3' }}>
                    {testResult.unanswered}
                  </div>
                  <div style={{ fontSize: '13px', color: '#3730a3', marginTop: '4px' }}>
                    ○ Skipped
                  </div>
                </div>
              </div>

              {/* Time Taken */}
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  ⏱️ Time Taken:
                </span>
                <span style={{ fontSize: '16px', color: '#1e293b', fontWeight: '600' }}>
                  {formatTime(testResult.timeTakenSeconds)}
                </span>
              </div>
            </div>

            {/* Result Footer */}
            <div style={{
              background: '#f8fafc',
              padding: '20px 32px',
              borderTop: '1px solid #e2e8f0',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setTestResult(null);
                  setSelectedTest(null);
                  setTestQuestions([]);
                  setAnswers({});
                  setSessionId(null);
                  setAttemptId(null);
                  setMarkedForReview(new Set());
                }}
                style={{
                  padding: '12px 48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTestCenter;
