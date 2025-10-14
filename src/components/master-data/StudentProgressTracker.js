import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getUserSubscriptions } from '../../services/subscriptionService';
import './StudentProgressTracker.css';

const StudentProgressTracker = () => {
  const { token, addNotification } = useApp();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [loading, setLoading] = useState(false);
  
  // Mock data - structured to be easily replaced with real APIs
  const [dashboardData, setDashboardData] = useState({
    totalTests: 15,
    averageScore: 78.5,
    passRate: 80,
    totalQuestionsPracticed: 450,
    totalStudyTime: 14400, // seconds
    currentStreak: 7,
    longestStreak: 12,
    lastActivityDate: new Date().toISOString()
  });

  const [testHistory, setTestHistory] = useState([
    { id: 1, testName: 'Mathematics - Algebra Test', score: 85, totalQuestions: 20, correctAnswers: 17, date: '2025-10-14', timeTaken: 1200, isPassed: true },
    { id: 2, testName: 'Physics - Motion Test', score: 92, totalQuestions: 15, correctAnswers: 14, date: '2025-10-13', timeTaken: 900, isPassed: true },
    { id: 3, testName: 'Chemistry - Atoms Test', score: 68, totalQuestions: 25, correctAnswers: 17, date: '2025-10-12', timeTaken: 1500, isPassed: true },
    { id: 4, testName: 'Mathematics - Geometry Test', score: 55, totalQuestions: 20, correctAnswers: 11, date: '2025-10-11', timeTaken: 1100, isPassed: false },
    { id: 5, testName: 'English - Grammar Test', score: 88, totalQuestions: 30, correctAnswers: 26, date: '2025-10-10', timeTaken: 1800, isPassed: true }
  ]);

  const [subjectPerformance, setSubjectPerformance] = useState([
    { subject: 'Mathematics', testsAttempted: 5, averageScore: 82, questionsAttempted: 120, accuracy: 85, strongTopics: 3, weakTopics: 1 },
    { subject: 'Physics', testsAttempted: 3, averageScore: 88, questionsAttempted: 90, accuracy: 90, strongTopics: 2, weakTopics: 0 },
    { subject: 'Chemistry', testsAttempted: 4, averageScore: 72, questionsAttempted: 110, accuracy: 75, strongTopics: 1, weakTopics: 2 },
    { subject: 'English', testsAttempted: 3, averageScore: 86, questionsAttempted: 85, accuracy: 88, strongTopics: 2, weakTopics: 1 }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { type: 'test', title: 'Completed Mathematics Test', score: 85, date: '2025-10-14T10:30:00' },
    { type: 'practice', title: 'Practiced 15 Physics questions', date: '2025-10-14T09:00:00' },
    { type: 'test', title: 'Completed English Test', score: 88, date: '2025-10-13T14:30:00' },
    { type: 'bookmark', title: 'Bookmarked 5 questions', date: '2025-10-13T11:00:00' },
    { type: 'test', title: 'Completed Chemistry Test', score: 68, date: '2025-10-12T16:00:00' }
  ]);

  const [performanceTrend, setPerformanceTrend] = useState([
    { date: '2025-10-08', avgScore: 65 },
    { date: '2025-10-09', avgScore: 70 },
    { date: '2025-10-10', avgScore: 75 },
    { date: '2025-10-11', avgScore: 68 },
    { date: '2025-10-12', avgScore: 78 },
    { date: '2025-10-13', avgScore: 82 },
    { date: '2025-10-14', avgScore: 85 }
  ]);

  // Load subscriptions
  useEffect(() => {
    if (token) {
      loadSubscriptions();
    }
  }, [token]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getUserSubscriptions(token);
      const activeSubscriptions = (data || []).filter(
        sub => sub.status === 'ACTIVE' && sub.paymentStatus === 'PAID'
      );
      setSubscriptions(activeSubscriptions);
      
      if (activeSubscriptions.length > 0) {
        setSelectedSubscription(activeSubscriptions[0]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification('❌ Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test': return '📝';
      case 'practice': return '💡';
      case 'bookmark': return '❤️';
      default: return '📚';
    }
  };

  return (
    <div className="student-progress-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div>
          <h1 className="tracker-title">📊 Progress Tracker</h1>
          <p className="tracker-subtitle">Track your learning journey and performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-selector"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Subscription Tabs */}
      {subscriptions.length > 0 && (
        <div className="subscription-tabs">
          {subscriptions.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubscription(sub)}
              className={`subscription-tab ${selectedSubscription?.id === sub.id ? 'active' : ''}`}
            >
              <span className="tab-icon">
                {sub.subscriptionLevel === 'CLASS' ? '🎓' : sub.subscriptionLevel === 'EXAM' ? '📝' : '📚'}
              </span>
              <span className="tab-text">
                {sub.subscriptionLevel} - {sub.entityName}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Dashboard Overview */}
      <div className="dashboard-overview">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.totalTests}</div>
            <div className="stat-label">Tests Completed</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.passRate}%</div>
            <div className="stat-label">Pass Rate</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💡</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.totalQuestionsPracticed}</div>
            <div className="stat-label">Questions Practiced</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(dashboardData.totalStudyTime)}</div>
            <div className="stat-label">Total Study Time</div>
          </div>
        </div>

        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      <div className="tracker-grid">
        {/* Performance Trend Chart */}
        <div className="tracker-section full-width">
          <div className="section-header">
            <h3>📈 Performance Trend</h3>
            <span className="section-subtitle">Your score progression over time</span>
          </div>
          <div className="chart-container">
            <div className="trend-chart">
              {performanceTrend.map((point, index) => {
                const maxScore = Math.max(...performanceTrend.map(p => p.avgScore));
                const height = (point.avgScore / maxScore) * 100;
                
                return (
                  <div key={index} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar"
                        style={{ 
                          height: `${height}%`,
                          background: `linear-gradient(to top, ${getScoreColor(point.avgScore)}, ${getScoreColor(point.avgScore)}dd)`
                        }}
                      >
                        <span className="bar-value">{point.avgScore}%</span>
                      </div>
                    </div>
                    <div className="chart-label">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="tracker-section">
          <div className="section-header">
            <h3>📚 Subject Performance</h3>
            <span className="section-subtitle">Your performance across subjects</span>
          </div>
          <div className="subject-performance-list">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="subject-card">
                <div className="subject-header">
                  <h4>{subject.subject}</h4>
                  <span className="subject-score" style={{ color: getScoreColor(subject.averageScore) }}>
                    {subject.averageScore}%
                  </span>
                </div>
                <div className="subject-stats">
                  <div className="stat-row">
                    <span>Tests: {subject.testsAttempted}</span>
                    <span>Questions: {subject.questionsAttempted}</span>
                  </div>
                  <div className="stat-row">
                    <span>Accuracy: {subject.accuracy}%</span>
                    <span className="topics-info">
                      <span className="strong">💪 {subject.strongTopics}</span>
                      <span className="weak">📉 {subject.weakTopics}</span>
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${subject.averageScore}%`,
                      background: getScoreColor(subject.averageScore)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="tracker-section">
          <div className="section-header">
            <h3>🕒 Recent Activity</h3>
            <span className="section-subtitle">Your latest learning activities</span>
          </div>
          <div className="activity-timeline">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  {activity.score && (
                    <span className="activity-score" style={{ color: getScoreColor(activity.score) }}>
                      Score: {activity.score}%
                    </span>
                  )}
                  <div className="activity-date">
                    {new Date(activity.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test History Table */}
      <div className="tracker-section full-width">
        <div className="section-header">
          <h3>📝 Test History</h3>
          <span className="section-subtitle">All your completed tests</span>
        </div>
        <div className="table-container">
          <table className="test-history-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Date</th>
                <th>Score</th>
                <th>Questions</th>
                <th>Accuracy</th>
                <th>Time</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map(test => {
                const accuracy = Math.round((test.correctAnswers / test.totalQuestions) * 100);
                return (
                  <tr key={test.id}>
                    <td className="test-name">{test.testName}</td>
                    <td>{new Date(test.date).toLocaleDateString()}</td>
                    <td>
                      <span className="score-badge" style={{ background: getScoreColor(test.score) }}>
                        {test.score}%
                      </span>
                    </td>
                    <td>{test.correctAnswers}/{test.totalQuestions}</td>
                    <td>
                      <div className="mini-progress">
                        <div 
                          className="mini-progress-bar"
                          style={{ 
                            width: `${accuracy}%`,
                            background: getScoreColor(accuracy)
                          }}
                        ></div>
                      </div>
                      <span className="accuracy-text">{accuracy}%</span>
                    </td>
                    <td>{formatTime(test.timeTaken)}</td>
                    <td>
                      <span className={`result-badge ${test.isPassed ? 'passed' : 'failed'}`}>
                        {test.isPassed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Learning Insights */}
      <div className="tracker-grid insights-grid">
        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-icon">🎯</span>
            <h4>Strong Areas</h4>
          </div>
          <ul className="insight-list">
            <li>Physics - Motion (92% avg)</li>
            <li>English - Grammar (88% avg)</li>
            <li>Mathematics - Algebra (85% avg)</li>
          </ul>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-icon">📈</span>
            <h4>Areas to Improve</h4>
          </div>
          <ul className="insight-list">
            <li>Mathematics - Geometry (55% avg)</li>
            <li>Chemistry - Atoms (68% avg)</li>
            <li>Physics - Electricity (needs practice)</li>
          </ul>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-icon">💪</span>
            <h4>Recommendations</h4>
          </div>
          <ul className="insight-list">
            <li>Practice more Geometry questions</li>
            <li>Retake Chemistry - Atoms test</li>
            <li>Focus on weak topics daily</li>
          </ul>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <span className="insight-icon">🏆</span>
            <h4>Achievements</h4>
          </div>
          <ul className="insight-list">
            <li>🔥 7-day study streak</li>
            <li>⭐ 80% overall pass rate</li>
            <li>🎯 450+ questions practiced</li>
          </ul>
        </div>
      </div>

      {/* Study Pattern */}
      <div className="tracker-section full-width">
        <div className="section-header">
          <h3>📅 Study Pattern</h3>
          <span className="section-subtitle">Your weekly study activity</span>
        </div>
        <div className="study-pattern">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const activity = Math.floor(Math.random() * 5); // 0-4 activity level
            return (
              <div key={day} className="day-column">
                <div className="day-label">{day}</div>
                <div className={`activity-bar activity-level-${activity}`}>
                  <span className="activity-count">{activity > 0 ? activity : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {subscriptions.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Progress Data</h2>
          <p>Subscribe to courses and start taking tests to track your progress.</p>
        </div>
      )}
    </div>
  );
};

export default StudentProgressTracker;
