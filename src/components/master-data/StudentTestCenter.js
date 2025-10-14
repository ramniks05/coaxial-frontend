import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getUserSubscriptions } from '../../services/subscriptionService';
import { 
  getStudentAvailableTests, 
  startStudentTest,
  getStudentTestQuestions,
  submitStudentAnswer,
  submitStudentTest,
  getStudentTestAttempts,
  checkActiveSession,
  abandonTestSession
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
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showAttemptDetailsModal, setShowAttemptDetailsModal] = useState(false);
  
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
    if (testTimeRemaining > 0 && testStartTime && selectedTest) {
      testTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
        const remaining = Math.max(0, selectedTest.timeLimitMinutes * 60 - elapsed);
        setTestTimeRemaining(remaining);
        
        if (remaining === 0) {
          addNotification('⏰ Time is up! Auto-submitting test...', 'warning');
          handleSubmitTest();
        }
      }, 1000);
    }

    return () => {
      if (testTimerRef.current) {
        clearInterval(testTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testStartTime, selectedTest]);

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
      
      // Step 1: Check for active session first
      console.log('Step 1: Checking for active session...');
      const activeSessionCheck = await checkActiveSession(token, test.id);
      
      console.log('Active session check result:', activeSessionCheck);
      
      let sessionData = null;
      
      // If active session exists, ask user what to do
      if (activeSessionCheck.hasActiveSession !== false && activeSessionCheck.sessionId) {
        console.log('Active session found:', activeSessionCheck.sessionId);
        
        const continueSession = window.confirm(
          '⚠️ You have an active test session in progress.\n\n' +
          `Started at: ${new Date(activeSessionCheck.startedAt).toLocaleString()}\n` +
          `Expires at: ${new Date(activeSessionCheck.expiresAt).toLocaleString()}\n\n` +
          '• Click OK to CONTINUE your existing session\n' +
          '• Click Cancel to ABANDON and start fresh\n\n' +
          'Note: Abandoning will count as one attempt.'
        );
        
        if (continueSession) {
          // Continue with existing session
          console.log('Continuing with existing session');
          sessionData = activeSessionCheck;
        } else {
          // Abandon and create new session
          console.log('User chose to abandon session');
          await abandonTestSession(token, test.id);
          addNotification('✅ Previous session abandoned. Starting fresh...', 'success');
          
          // Start new session
          sessionData = await startStudentTest(token, test.id);
        }
      } else {
        // No active session, start new one
        console.log('No active session, starting new test...');
        sessionData = await startStudentTest(token, test.id);
      }
      
      console.log('Session data:', sessionData);
      console.log('SessionId:', sessionData.sessionId);
      console.log('AttemptId:', sessionData.attemptId);
      
      if (!sessionData || !sessionData.sessionId) {
        console.error('Invalid session data:', sessionData);
        throw new Error('Failed to get session ID from response');
      }
      
      console.log('✅ Session ready:', sessionData.sessionId);
      setSessionId(sessionData.sessionId);
      setAttemptId(sessionData.attemptId);
      
      // Step 2: Fetch test questions with session
      console.log('Step 2: Fetching questions with sessionId:', sessionData.sessionId);
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
      addNotification(`Failed to start test: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    console.log('handleAnswerChange called with:', { questionId, answer });
    
    // Validate questionId
    if (!questionId) {
      console.error('QuestionId is missing!');
      return;
    }
    
    // Update local state immediately for better UX
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Validate sessionId exists
    if (!sessionId) {
      console.warn('SessionId not available, skipping backend submission');
      return;
    }

    // Find the option ID from the selected answer
    const currentQuestion = testQuestions[currentQuestionIndex];
    console.log('Current question:', currentQuestion);
    console.log('Current question ID:', currentQuestion?.questionId || currentQuestion?.id);
    
    const selectedOption = currentQuestion?.options?.find(opt => 
      (opt.optionText || opt) === answer
    );
    
    console.log('Selected option:', selectedOption);
    console.log('Selected option optionId:', selectedOption?.optionId);
    console.log('Selected option id (fallback):', selectedOption?.id);
    
    if (!selectedOption) {
      console.error('Could not find selected option');
      return;
    }

    // Get the correct option ID (try optionId first, fallback to id)
    const optionId = selectedOption.optionId || selectedOption.id;
    
    if (!optionId) {
      console.error('Selected option has no ID:', selectedOption);
      return;
    }

    // Submit answer to backend
    try {
      const answerData = {
        sessionId: sessionId,
        questionId: Number(questionId), // Ensure it's a number
        selectedOptionId: Number(optionId) // Use optionId from API
      };
      
      console.log('=== Submitting Answer ===');
      console.log('Answer data:', JSON.stringify(answerData, null, 2));
      console.log('Data types:', {
        sessionId: typeof answerData.sessionId,
        questionId: typeof answerData.questionId,
        selectedOptionId: typeof answerData.selectedOptionId
      });
      
      const result = await submitStudentAnswer(token, selectedTest.id, answerData);
      console.log('✅ Answer saved to backend successfully:', result);
      
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      console.error('Error message:', error.message);
      // Don't show error to user, keep local state for better UX
    }
  };

  const clearAnswer = async (questionId) => {
    // Update local state
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });

    // Submit null to backend to mark as skipped
    if (sessionId) {
      try {
        const answerData = {
          sessionId: sessionId,
          questionId: Number(questionId),
          selectedOptionId: null // Mark as skipped
        };
        
        console.log('Clearing answer (marking as skipped):', answerData);
        await submitStudentAnswer(token, selectedTest.id, answerData);
        console.log('✅ Answer cleared in backend');
        
      } catch (error) {
        console.error('Error clearing answer:', error);
        // Don't show error to user
      }
    }
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

  // Handler to close attempt details modal
  const handleCloseAttemptDetails = (e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Closing attempt details modal');
    setShowAttemptDetailsModal(false);
    setSelectedAttempt(null);
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
        <div className="attempts-section" style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
            📊 Test Attempts History
          </h3>
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>
                    Attempt #
                  </th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>
                    Test Name
                  </th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>
                    Score
                  </th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>
                    Result
                  </th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>
                    Date
                  </th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {testAttempts.map((attempt, index) => (
                  <tr 
                    key={attempt.attemptId || index}
                    style={{ 
                      borderBottom: index < testAttempts.length - 1 ? '1px solid #e2e8f0' : 'none',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '20px 24px', fontSize: '15px', fontWeight: '600', color: '#667eea' }}>
                      #{attempt.attemptNumber}
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>
                      {attempt.testName || 'Unknown Test'}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '700',
                        background: attempt.percentage >= 80 ? '#dcfce7' : attempt.percentage >= 60 ? '#fef3c7' : '#fee2e2',
                        color: attempt.percentage >= 80 ? '#166534' : attempt.percentage >= 60 ? '#92400e' : '#991b1b'
                      }}>
                        {attempt.percentage ? `${attempt.percentage.toFixed(1)}%` : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: attempt.isPassed ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white'
                      }}>
                        {attempt.isPassed ? '✓ PASSED' : '✗ FAILED'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                      {new Date(attempt.submittedAt || attempt.attemptedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedAttempt(attempt);
                          setShowAttemptDetailsModal(true);
                        }}
                        style={{
                          padding: '8px 20px',
                          borderRadius: '8px',
                          border: '2px solid #667eea',
                          background: 'white',
                          color: '#667eea',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        <span>👁️</span>
                        View Details
                      </button>
                    </td>
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
          {/* Test Header - Fixed - Full Width */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0',
            display: 'flex',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            flexShrink: 0,
            minHeight: '90px',
            width: '100%'
          }}>
            {/* Sidebar space placeholder */}
            <div style={{ 
              width: '280px', 
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              padding: '20px 24px'
            }}>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                Question {currentQuestionIndex + 1} / {testQuestions.length}
              </div>
            </div>
            
            {/* Main header content */}
            <div style={{ 
              flex: 1,
              padding: '20px 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: '0 0 auto' }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '26px', 
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  📝 {selectedTest.testName}
                </h2>
                <p style={{ 
                  margin: '8px 0 0 0', 
                  opacity: 0.95, 
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  {selectedTest.description || 'Test in progress'}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                flex: '0 0 auto'
              }}>
                <div style={{
                  background: testTimeRemaining < 300 ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'rgba(255,255,255,0.15)',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: testTimeRemaining < 300 ? '0 4px 12px rgba(220, 38, 38, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                  minWidth: '180px'
                }}>
                  <span style={{ fontSize: '28px' }}>⏱️</span>
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.9, fontWeight: '500' }}>Time Remaining</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', lineHeight: '1.2' }}>
                      {formatTime(testTimeRemaining)}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  minWidth: '140px'
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.9, fontWeight: '500' }}>Answered</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', lineHeight: '1.2' }}>
                    {Object.keys(answers).length} / {testQuestions.length}
                  </div>
                </div>
                <button
                  onClick={handleExitTest}
                  style={{
                    background: 'rgba(239, 68, 68, 0.3)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>❌</span>
                  Exit Test
                </button>
              </div>
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
                gap: '10px'
              }}>
                {testQuestions.map((q, index) => {
                  const qId = q.questionId || q.id;
                  const isAnswered = !!answers[qId];
                  const isCurrent = index === currentQuestionIndex;
                  const isMarked = markedForReview.has(qId);
                  
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
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        border: isCurrent ? '3px solid #fbbf24' : 'none',
                        background: bgColor,
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isCurrent ? '0 0 0 3px rgba(251, 191, 36, 0.3)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = isCurrent ? '0 0 0 3px rgba(251, 191, 36, 0.3)' : 'none';
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
                          top: '-6px',
                          right: '-6px',
                          fontSize: '12px',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
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
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'white',
                      borderRadius: '20px',
                      padding: '48px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Question Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '32px',
                        paddingBottom: '24px',
                        borderBottom: '3px solid #e2e8f0'
                      }}>
                        <div>
                          <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            fontSize: '22px',
                            fontWeight: '700',
                            marginBottom: '12px',
                            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
                          }}>
                            Question {currentQuestionIndex + 1} of {testQuestions.length}
                          </div>
                          <div style={{ fontSize: '16px', color: '#64748b', marginTop: '8px', display: 'flex', gap: '16px' }}>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                              📊 Marks: <span style={{ color: '#667eea' }}>{testQuestions[currentQuestionIndex]?.marks || 1}</span>
                            </span>
                            {selectedTest.negativeMarking && testQuestions[currentQuestionIndex]?.negativeMarks > 0 && (
                              <span style={{ fontWeight: '600', color: '#dc2626' }}>
                                ⚠️ Negative: -{testQuestions[currentQuestionIndex]?.negativeMarks}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          background: answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id] ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: '700',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id] ? '✓' : '○'}
                          </span>
                          {answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id] ? 'Answered' : 'Not Answered'}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        padding: '40px',
                        borderRadius: '20px',
                        marginBottom: '36px',
                        borderLeft: '8px solid #667eea',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#667eea',
                          marginBottom: '16px',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px'
                        }}>
                          Question
                        </div>
                        <div style={{
                          fontSize: '22px',
                          lineHeight: '2',
                          color: '#1e293b',
                          fontWeight: '500'
                        }}>
                      {testQuestions[currentQuestionIndex]?.questionText}
                        </div>
                    </div>
                    
                      {/* Quick Actions */}
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        marginBottom: '36px',
                        justifyContent: 'center'
                      }}>
                        <button
                          onClick={() => {
                            const qId = testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id;
                            clearAnswer(qId);
                          }}
                          disabled={!answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id]}
                          style={{
                            padding: '14px 32px',
                            borderRadius: '12px',
                            border: '2px solid #fecaca',
                            background: 'white',
                            color: '#dc2626',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id] ? 'pointer' : 'not-allowed',
                            opacity: answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id] ? 1 : 0.4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: answers[testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id] ? '0 2px 6px rgba(220, 38, 38, 0.25)' : 'none',
                            minWidth: '180px',
                            justifyContent: 'center'
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>🗑️</span>
                          Clear Answer
                        </button>
                        <button
                          onClick={() => {
                            const qId = testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id;
                            toggleMarkForReview(qId);
                          }}
                          style={{
                            padding: '14px 32px',
                            borderRadius: '12px',
                            border: '2px solid ' + (markedForReview.has(testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id) ? '#fde047' : '#e2e8f0'),
                            background: markedForReview.has(testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id) ? 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)' : 'white',
                            color: markedForReview.has(testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id) ? '#92400e' : '#64748b',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: markedForReview.has(testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id) ? '0 2px 6px rgba(245, 158, 11, 0.35)' : 'none',
                            minWidth: '220px',
                            justifyContent: 'center'
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>🚩</span>
                          {markedForReview.has(testQuestions[currentQuestionIndex]?.questionId || testQuestions[currentQuestionIndex]?.id) ? 'Unmark Review' : 'Mark for Review'}
                        </button>
                    </div>
                    
                      {/* Options Section */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#475569',
                          marginBottom: '20px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Choose your answer
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                          flex: 1
                        }}>
                        {testQuestions[currentQuestionIndex]?.options?.map((option, index) => {
                          const optionValue = option.optionText || option;
                          const currentQ = testQuestions[currentQuestionIndex];
                          const currentQuestionId = currentQ.questionId || currentQ.id;
                          const isSelected = answers[currentQuestionId] === optionValue;
                          
                          return (
                            <label 
                              key={index} 
                              onClick={() => handleAnswerChange(currentQuestionId, optionValue)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '24px 28px',
                                background: isSelected ? 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)' : 'white',
                                border: `3px solid ${isSelected ? '#667eea' : '#e2e8f0'}`,
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                boxShadow: isSelected ? '0 4px 12px rgba(102, 126, 234, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                                width: '100%'
                              }}
                              onMouseOver={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                                  e.currentTarget.style.borderColor = '#667eea';
                                  e.currentTarget.style.transform = 'translateX(8px)';
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                }
                              }}
                            >
                          <input
                            type="radio"
                            name={`question_${currentQuestionId}`}
                                value={optionValue}
                                checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleAnswerChange(currentQuestionId, e.target.value);
                            }}
                                style={{ display: 'none' }}
                              />
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '14px',
                                background: isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
                                color: isSelected ? 'white' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: '800',
                                flexShrink: 0,
                                boxShadow: isSelected ? '0 6px 12px rgba(102, 126, 234, 0.5)' : '0 2px 4px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease'
                              }}>
                                {option.optionLetter || String.fromCharCode(65 + index)}
                              </div>
                              <span style={{
                                flex: 1,
                                fontSize: '19px',
                                color: '#1e293b',
                                lineHeight: '1.8',
                                fontWeight: '500'
                              }}>
                                {option.optionText || option}
                              </span>
                              {isSelected && (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '22px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 8px rgba(34, 197, 94, 0.5)'
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
                  </div>

                  {/* Navigation Footer - Fixed */}
                  <div style={{
                    background: 'white',
                    padding: '24px 48px',
                    borderTop: '3px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '32px',
                    flexShrink: 0,
                    boxShadow: '0 -4px 6px rgba(0,0,0,0.05)'
                  }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                      style={{
                        padding: '16px 32px',
                        borderRadius: '12px',
                        border: '2px solid #cbd5e1',
                        background: currentQuestionIndex === 0 ? '#e2e8f0' : 'white',
                        color: currentQuestionIndex === 0 ? '#94a3b8' : '#475569',
                        fontSize: '17px',
                        fontWeight: '600',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        minWidth: '160px',
                        justifyContent: 'center',
                        boxShadow: currentQuestionIndex === 0 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>⬅️</span>
                      Previous
                    </button>

                    <div style={{ 
                      flex: 1, 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ 
                        fontSize: '16px', 
                        color: '#1e293b',
                        fontWeight: '600'
                      }}>
                        Progress: <span style={{ color: '#22c55e' }}>{Object.keys(answers).length}</span> answered, 
                        <span style={{ color: '#ef4444' }}> {testQuestions.length - Object.keys(answers).length}</span> remaining
                      </div>
                      <div style={{
                        height: '12px',
                        background: '#e2e8f0',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        maxWidth: '500px',
                        margin: '0 auto',
                        width: '100%',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                          width: `${(Object.keys(answers).length / testQuestions.length) * 100}%`,
                          transition: 'width 0.3s ease',
                          boxShadow: '0 2px 4px rgba(34, 197, 94, 0.4)'
                        }}></div>
                      </div>
                    </div>

                    {currentQuestionIndex < testQuestions.length - 1 ? (
                    <button 
                      className="btn btn-secondary"
                      onClick={nextQuestion}
                        style={{
                          padding: '16px 32px',
                          borderRadius: '12px',
                          border: '2px solid #667eea',
                          background: 'white',
                          color: '#667eea',
                          fontSize: '17px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          minWidth: '160px',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
                        }}
                    >
                      Next
                        <span style={{ fontSize: '20px' }}>➡️</span>
                    </button>
                    ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={handleSubmitTest}
                      disabled={loading}
                        style={{
                          padding: '16px 40px',
                          borderRadius: '12px',
                          background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          color: 'white',
                          border: 'none',
                          fontSize: '18px',
                          fontWeight: '700',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          minWidth: '200px',
                          justifyContent: 'center',
                          boxShadow: loading ? 'none' : '0 4px 6px rgba(34, 197, 94, 0.4)'
                        }}
                      >
                        <span style={{ fontSize: '22px' }}>{loading ? '⏳' : '✅'}</span>
                        {loading ? 'Submitting...' : 'Submit Test'}
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

      {/* Attempt Details Modal */}
      {showAttemptDetailsModal && selectedAttempt && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            console.log('Overlay clicked', e.target, e.currentTarget);
            if (e.target === e.currentTarget) {
              console.log('Closing modal via backdrop click');
              handleCloseAttemptDetails();
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Modal content clicked - should not close');
            }}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{
              background: selectedAttempt.isPassed 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '32px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>
                {selectedAttempt.isPassed ? '🎉' : '📚'}
              </div>
              <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                {selectedAttempt.isPassed ? 'Test Passed!' : 'Keep Practicing!'}
              </h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.95 }}>
                Attempt #{selectedAttempt.attemptNumber} - {selectedAttempt.testName}
              </p>
              <button
                onClick={handleCloseAttemptDetails}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: 1
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '40px' }}>
              {/* Score Card */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '32px',
                textAlign: 'center',
                border: '2px solid #e0e7ff'
              }}>
                <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '12px', fontWeight: '500' }}>
                  Final Score
                </div>
                <div style={{ 
                  fontSize: '56px', 
                  fontWeight: 'bold', 
                  color: selectedAttempt.isPassed ? '#22c55e' : '#ef4444',
                  marginBottom: '12px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {selectedAttempt.percentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: '20px', color: '#475569', fontWeight: '600' }}>
                  {selectedAttempt.totalMarksObtained} / {selectedAttempt.totalMarksAvailable} marks
                </div>
                <div style={{ 
                  marginTop: '16px', 
                  fontSize: '14px', 
                  color: '#64748b',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: '8px'
                }}>
                  Passing Marks: {selectedAttempt.passingMarks}
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: '#dcfce7',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #86efac'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>
                    {selectedAttempt.correctAnswers}
                  </div>
                  <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>
                    ✓ Correct
                  </div>
                </div>
                
                <div style={{
                  background: '#fee2e2',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #fca5a5'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>
                    {selectedAttempt.wrongAnswers}
                  </div>
                  <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                    ✗ Wrong
                  </div>
                </div>
                
                <div style={{
                  background: '#e0e7ff',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #a5b4fc'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3730a3', marginBottom: '8px' }}>
                    {selectedAttempt.unansweredQuestions}
                  </div>
                  <div style={{ fontSize: '14px', color: '#3730a3', fontWeight: '600' }}>
                    ○ Skipped
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    ⏱️ Time Taken:
                  </span>
                  <span style={{ fontSize: '18px', color: '#1e293b', fontWeight: '700' }}>
                    {formatTime(selectedAttempt.timeTakenSeconds)}
                  </span>
                </div>
                
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    📝 Total Questions:
                  </span>
                  <span style={{ fontSize: '18px', color: '#1e293b', fontWeight: '700' }}>
                    {selectedAttempt.totalQuestions}
                  </span>
                </div>
                
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    📅 Started:
                  </span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                    {new Date(selectedAttempt.startedAt).toLocaleString()}
                  </span>
                </div>
                
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    ✅ Submitted:
                  </span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                    {new Date(selectedAttempt.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              background: '#f8fafc',
              padding: '24px 40px',
              borderTop: '1px solid #e2e8f0',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCloseAttemptDetails}
                style={{
                  padding: '14px 48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                  transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
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
