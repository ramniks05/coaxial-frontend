import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const StudentTestCenter = () => {
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
  
  // Removed apiCall - using dummy data for now
  const testTimerRef = useRef(null);

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

  // Load available tests when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadAvailableTests();
      loadTestAttempts();
    }
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
    if (!selectedSubscription) return;

    try {
      setLoading(true);
      
      // Using dummy data for now
      const dummyTests = [
        {
          id: 1,
          name: 'Mathematics Chapter 1 Test',
          description: 'Test for Chapter 1 of Mathematics',
          duration: 60,
          questionCount: 20,
          maxAttempts: 3,
          subjectName: 'Mathematics',
          chapterName: 'Basic Operations'
        },
        {
          id: 2,
          name: 'Hindi Vocabulary Test',
          description: 'Test for Hindi vocabulary',
          duration: 45,
          questionCount: 15,
          maxAttempts: 5,
          subjectName: 'Hindi',
          chapterName: 'Vocabulary'
        },
        {
          id: 3,
          name: 'Science General Test',
          description: 'General science knowledge test',
          duration: 90,
          questionCount: 30,
          maxAttempts: 2,
          subjectName: 'Science',
          chapterName: 'General Science'
        }
      ];
      
      setAvailableTests(dummyTests);
    } catch (error) {
      console.error('Error loading tests:', error);
      addNotification('Failed to load available tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTestAttempts = async () => {
    if (!selectedSubscription) return;

    try {
      // Using dummy data for now
      const dummyAttempts = [
        {
          id: 1,
          testId: 1,
          testName: 'Mathematics Chapter 1 Test',
          score: 85,
          totalQuestions: 20,
          correctAnswers: 17,
          timeSpent: 1800,
          attemptedAt: '2024-01-15T10:30:00.000Z',
          completedAt: '2024-01-15T11:00:00.000Z',
          isCompleted: true
        },
        {
          id: 2,
          testId: 2,
          testName: 'Hindi Vocabulary Test',
          score: 92,
          totalQuestions: 15,
          correctAnswers: 14,
          timeSpent: 1200,
          attemptedAt: '2024-01-14T14:00:00.000Z',
          completedAt: '2024-01-14T14:20:00.000Z',
          isCompleted: true
        }
      ];
      
      setTestAttempts(dummyAttempts);
    } catch (error) {
      console.error('Error loading test attempts:', error);
    }
  };

  const startTest = async (test) => {
    try {
      setLoading(true);
      
      // Using dummy data for now
      const dummyQuestions = [
        {
          id: 1,
          questionText: "What is 2 + 2?",
          questionType: "MULTIPLE_CHOICE",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4"
        },
        {
          id: 2,
          questionText: "What is the capital of India?",
          questionType: "MULTIPLE_CHOICE",
          options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
          correctAnswer: "Delhi"
        },
        {
          id: 3,
          questionText: "The Earth is round.",
          questionType: "TRUE_FALSE",
          options: ["True", "False"],
          correctAnswer: "True"
        }
      ];
      
      setSelectedTest(test);
      setTestQuestions(dummyQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTestStartTime(Date.now());
      setTestTimeRemaining(test.duration * 60); // Convert minutes to seconds
      setShowTestModal(true);
      
    } catch (error) {
      console.error('Error starting test:', error);
      addNotification('Failed to start test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
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

  const handleSubmitTest = async () => {
    if (!selectedTest || !testQuestions.length) return;

    try {
      setLoading(true);
      
      // Using dummy data for now - simulate API call
      const timeSpent = Math.floor((Date.now() - testStartTime) / 1000);
      const correctAnswers = testQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
      const score = Math.round((correctAnswers / testQuestions.length) * 100);
      
      // Simulate API delay
      setTimeout(() => {
        const newAttempt = {
          id: Date.now(),
          testId: selectedTest.id,
          testName: selectedTest.name,
          score: score,
          totalQuestions: testQuestions.length,
          correctAnswers: correctAnswers,
          timeSpent: timeSpent,
          attemptedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          isCompleted: true
        };
        
        setTestAttempts(prev => [...prev, newAttempt]);
        addNotification('Test submitted successfully!', 'success');
        setShowTestModal(false);
        setSelectedTest(null);
        setTestQuestions([]);
        setAnswers({});
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      addNotification('Failed to submit test', 'error');
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
        <h2>Test Center</h2>
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
                    <span>Start: {new Date(subscription.startDate).toLocaleDateString()}</span>
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
              <p>No tests available for this subscription.</p>
            </div>
          ) : (
            <div className="test-cards">
              {availableTests.map(test => (
                <div key={test.id} className="test-card">
                  <div className="test-info">
                    <h4>{test.name}</h4>
                    <p className="test-description">{test.description}</p>
                    <div className="test-details">
                      <span>Duration: {test.duration} minutes</span>
                      <span>Questions: {test.questionCount}</span>
                      <span>Max Attempts: {test.maxAttempts || 'Unlimited'}</span>
                    </div>
                  </div>
                  <div className="test-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => startTest(test)}
                      disabled={loading}
                    >
                      Start Test
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
          <h3>Test Attempts History</h3>
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
                    <td>{attempt.testName}</td>
                    <td className={getScoreColor(attempt.score)}>
                      {attempt.score ? `${attempt.score}%` : 'N/A'}
                    </td>
                    <td>{formatTime(attempt.timeSpent)}</td>
                    <td>{getAttemptStatus(attempt)}</td>
                    <td>{new Date(attempt.attemptedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && selectedTest && (
        <div className="modal-overlay">
          <div className="modal-content test-modal">
            <div className="modal-header">
              <h3>{selectedTest.name}</h3>
              <div className="test-timer">
                Time Remaining: {formatTime(testTimeRemaining)}
              </div>
            </div>
            
            <div className="test-content">
              {testQuestions.length > 0 && (
                <>
                  {/* Question Navigation */}
                  <div className="question-navigation">
                    {testQuestions.map((_, index) => (
                      <button
                        key={index}
                        className={`question-nav-btn ${index === currentQuestionIndex ? 'active' : ''} ${answers[testQuestions[index].id] ? 'answered' : ''}`}
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Current Question */}
                  <div className="current-question">
                    <h4>Question {currentQuestionIndex + 1} of {testQuestions.length}</h4>
                    <div className="question-text">
                      {testQuestions[currentQuestionIndex]?.questionText}
                    </div>
                    
                    {/* Question Options */}
                    <div className="question-options">
                      {testQuestions[currentQuestionIndex]?.options?.map((option, index) => (
                        <label key={index} className="option-label">
                          <input
                            type="radio"
                            name={`question_${testQuestions[currentQuestionIndex].id}`}
                            value={option}
                            checked={answers[testQuestions[currentQuestionIndex].id] === option}
                            onChange={(e) => handleAnswerChange(testQuestions[currentQuestionIndex].id, e.target.value)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="question-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={nextQuestion}
                      disabled={currentQuestionIndex === testQuestions.length - 1}
                    >
                      Next
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSubmitTest}
                      disabled={loading}
                    >
                      Submit Test
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTestCenter;
