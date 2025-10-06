import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const StudentProgressTracker = () => {
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
  const [progressData, setProgressData] = useState({
    overall: {},
    subjects: [],
    topics: [],
    modules: [],
    chapters: []
  });
  const [testPerformance, setTestPerformance] = useState([]);
  const [questionStats, setQuestionStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30'); // days
  
  // Removed apiCall - using dummy data for now

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

  // Load progress data when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadProgressData();
      loadTestPerformance();
      loadQuestionStats();
    }
  }, [selectedSubscription, timeRange]);

  const loadProgressData = async () => {
    if (!selectedSubscription) return;

    try {
      setLoading(true);
      
      // Using dummy data for now
      const dummyProgressData = {
        overall: {
          chaptersCompleted: 25,
          totalChapters: 360,
          questionsAttempted: 150,
          correctAnswers: 120,
          timeSpent: 7200
        },
        subjects: [
          {
            id: 1,
            name: 'Mathematics',
            chaptersCompleted: 10,
            totalChapters: 120,
            questionsAttempted: 80,
            accuracy: 85,
            progressPercentage: 8
          },
          {
            id: 2,
            name: 'Hindi',
            chaptersCompleted: 8,
            totalChapters: 96,
            questionsAttempted: 45,
            accuracy: 78,
            progressPercentage: 8
          }
        ],
        topics: [
          {
            id: 1,
            name: 'Basic Addition',
            subjectName: 'Mathematics',
            chaptersCompleted: 5,
            totalChapters: 15,
            accuracy: 90,
            progressPercentage: 33
          }
        ]
      };
      
      setProgressData(dummyProgressData);
    } catch (error) {
      console.error('Error loading progress data:', error);
      addNotification('Failed to load progress data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTestPerformance = async () => {
    if (!selectedSubscription) return;

    try {
      // Using dummy data for now
      const dummyTestPerformance = [
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
      
      setTestPerformance(dummyTestPerformance);
    } catch (error) {
      console.error('Error loading test performance:', error);
    }
  };

  const loadQuestionStats = async () => {
    if (!selectedSubscription) return;

    try {
      // Using dummy data for now
      const dummyQuestionStats = {
        totalAttempted: 150,
        correctAnswers: 120,
        accuracy: 80,
        timeSpent: 7200,
        currentStreak: 5,
        longestStreak: 15,
        totalStudyTime: 18000
      };
      
      setQuestionStats(dummyQuestionStats);
    } catch (error) {
      console.error('Error loading question stats:', error);
    }
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

  const calculateProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'progress-success';
    if (percentage >= 60) return 'progress-warning';
    if (percentage >= 40) return 'progress-info';
    return 'progress-danger';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-info';
    return 'text-danger';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeRangeLabel = (days) => {
    switch (days) {
      case '7': return 'Last 7 days';
      case '30': return 'Last 30 days';
      case '90': return 'Last 90 days';
      case '365': return 'Last year';
      default: return 'All time';
    }
  };

  return (
    <div className="student-progress-tracker">
      <div className="page-header">
        <h2>Progress Tracker</h2>
        <div className="time-range-selector">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>
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

      {/* Overall Progress */}
      {selectedSubscription && progressData.overall && (
        <div className="progress-section">
          <h3>Overall Progress ({getTimeRangeLabel(timeRange)})</h3>
          
          <div className="progress-cards">
            <div className="progress-card">
              <h4>Learning Progress</h4>
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-label">Chapters Completed</span>
                  <span className="stat-value">
                    {progressData.overall.chaptersCompleted || 0} / {progressData.overall.totalChapters || 0}
                  </span>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getProgressColor(calculateProgressPercentage(
                        progressData.overall.chaptersCompleted || 0,
                        progressData.overall.totalChapters || 0
                      ))}`}
                      style={{ 
                        width: `${calculateProgressPercentage(
                          progressData.overall.chaptersCompleted || 0,
                          progressData.overall.totalChapters || 0
                        )}%` 
                      }}
                    ></div>
                  </div>
                  <span className="progress-percentage">
                    {calculateProgressPercentage(
                      progressData.overall.chaptersCompleted || 0,
                      progressData.overall.totalChapters || 0
                    )}%
                  </span>
                </div>
              </div>
            </div>

            <div className="progress-card">
              <h4>Question Practice</h4>
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-label">Questions Attempted</span>
                  <span className="stat-value">{questionStats.totalAttempted || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Correct Answers</span>
                  <span className={`stat-value ${getScoreColor(questionStats.accuracy || 0)}`}>
                    {questionStats.correctAnswers || 0} ({questionStats.accuracy || 0}%)
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Time Spent</span>
                  <span className="stat-value">{formatTime(questionStats.timeSpent || 0)}</span>
                </div>
              </div>
            </div>

            <div className="progress-card">
              <h4>Test Performance</h4>
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-label">Tests Taken</span>
                  <span className="stat-value">{testPerformance.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Average Score</span>
                  <span className={`stat-value ${getScoreColor(testPerformance.reduce((acc, t) => acc + (t.score || 0), 0) / Math.max(testPerformance.length, 1))}`}>
                    {testPerformance.length > 0 
                      ? Math.round(testPerformance.reduce((acc, t) => acc + (t.score || 0), 0) / testPerformance.length)
                      : 0}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Best Score</span>
                  <span className={`stat-value ${getScoreColor(Math.max(...testPerformance.map(t => t.score || 0), 0))}`}>
                    {testPerformance.length > 0 
                      ? Math.max(...testPerformance.map(t => t.score || 0))
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Progress */}
      {selectedSubscription && progressData.subjects.length > 0 && (
        <div className="progress-section">
          <h3>Subject-wise Progress</h3>
          
          <div className="subject-progress-table">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Chapters</th>
                  <th>Progress</th>
                  <th>Questions</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {progressData.subjects.map(subject => (
                  <tr key={subject.id}>
                    <td>{subject.name}</td>
                    <td>
                      {subject.chaptersCompleted} / {subject.totalChapters}
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${getProgressColor(subject.progressPercentage)}`}
                          style={{ width: `${subject.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{subject.progressPercentage}%</span>
                    </td>
                    <td>{subject.questionsAttempted}</td>
                    <td className={getScoreColor(subject.accuracy)}>
                      {subject.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Performance Details */}
      {selectedSubscription && testPerformance.length > 0 && (
        <div className="progress-section">
          <h3>Test Performance Details</h3>
          
          <div className="test-performance-table">
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Time Spent</th>
                  <th>Questions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {testPerformance.map(test => (
                  <tr key={test.id}>
                    <td>{test.testName}</td>
                    <td>{new Date(test.attemptedAt).toLocaleDateString()}</td>
                    <td className={getScoreColor(test.score)}>
                      {test.score}%
                    </td>
                    <td>{formatTime(test.timeSpent)}</td>
                    <td>{test.totalQuestions}</td>
                    <td>
                      <span className={`status ${test.isCompleted ? 'completed' : 'incomplete'}`}>
                        {test.isCompleted ? 'Completed' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Topic-wise Progress */}
      {selectedSubscription && progressData.topics.length > 0 && (
        <div className="progress-section">
          <h3>Topic-wise Progress</h3>
          
          <div className="topics-grid">
            {progressData.topics.map(topic => (
              <div key={topic.id} className="topic-progress-card">
                <div className="topic-header">
                  <h4>{topic.name}</h4>
                  <span className="topic-subject">{topic.subjectName}</span>
                </div>
                
                <div className="topic-stats">
                  <div className="stat">
                    <span className="stat-label">Chapters</span>
                    <span className="stat-value">
                      {topic.chaptersCompleted} / {topic.totalChapters}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">{topic.progressPercentage}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Accuracy</span>
                    <span className={`stat-value ${getScoreColor(topic.accuracy)}`}>
                      {topic.accuracy}%
                    </span>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getProgressColor(topic.progressPercentage)}`}
                    style={{ width: `${topic.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Streak */}
      {selectedSubscription && (
        <div className="progress-section">
          <h3>Learning Streak</h3>
          
          <div className="streak-cards">
            <div className="streak-card">
              <h4>Current Streak</h4>
              <div className="streak-number">{questionStats.currentStreak || 0}</div>
              <p>days</p>
            </div>
            
            <div className="streak-card">
              <h4>Longest Streak</h4>
              <div className="streak-number">{questionStats.longestStreak || 0}</div>
              <p>days</p>
            </div>
            
            <div className="streak-card">
              <h4>Total Study Time</h4>
              <div className="streak-number">{formatTime(questionStats.totalStudyTime || 0)}</div>
              <p>this period</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgressTracker;
