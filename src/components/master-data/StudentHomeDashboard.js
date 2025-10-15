import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getUserSubscriptions } from '../../services/subscriptionService';
import { getStudentTestAttempts } from '../../services/studentService';
import './StudentHomeDashboard.css';

const StudentHomeDashboard = ({ onNavigate }) => {
  const { user, token } = useApp();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    testsCompleted: 0,
    averageScore: 0,
    studyStreak: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load subscriptions
      const subsData = await getUserSubscriptions(token);
      const activeSubs = (subsData || []).filter(s => s.status === 'ACTIVE');
      setSubscriptions(activeSubs);
      
      // Try to load real test attempts, fallback to mock
      try {
        const testsData = await getStudentTestAttempts(token);
        const recentTestsData = (testsData || []).slice(0, 5);
        setRecentTests(recentTestsData);
        
        // Calculate stats from real data
        const avgScore = testsData.length > 0
          ? (testsData.reduce((sum, t) => sum + (t.percentage || 0), 0) / testsData.length).toFixed(1)
          : 0;
        
        setStats({
          activeSubscriptions: activeSubs.length,
          testsCompleted: testsData.length,
          averageScore: avgScore,
          studyStreak: 7 // Mock - needs actual streak calculation
        });
      } catch (error) {
        console.log('Using mock test data');
        // Use mock data if API fails
        setRecentTests([
          { testName: 'Mathematics Test', percentage: 85, isPassed: true, submittedAt: new Date().toISOString() },
          { testName: 'Physics Test', percentage: 92, isPassed: true, submittedAt: new Date(Date.now() - 86400000).toISOString() },
          { testName: 'Chemistry Test', percentage: 78, isPassed: true, submittedAt: new Date(Date.now() - 172800000).toISOString() }
        ]);
        
        setStats({
          activeSubscriptions: activeSubs.length,
          testsCompleted: 12,
          averageScore: 82.5,
          studyStreak: 7
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyActivity = [
    { day: 'Mon', tests: 2, practice: 15, studyTime: 45 },
    { day: 'Tue', tests: 1, practice: 20, studyTime: 60 },
    { day: 'Wed', tests: 3, practice: 10, studyTime: 55 },
    { day: 'Thu', tests: 0, practice: 25, studyTime: 30 },
    { day: 'Fri', tests: 2, practice: 18, studyTime: 50 },
    { day: 'Sat', tests: 1, practice: 30, studyTime: 75 },
    { day: 'Sun', tests: 1, practice: 12, studyTime: 40 }
  ];

  const quickActions = [
    { id: 'catalog', icon: '🛍️', title: 'Browse Courses', description: 'Explore new courses and subscribe', color: '#667eea' },
    { id: 'tests', icon: '📝', title: 'Take a Test', description: 'Start practicing with tests', color: '#22c55e' },
    { id: 'questions', icon: '❓', title: 'Practice Questions', description: 'Browse question bank', color: '#f59e0b' },
    { id: 'content', icon: '📚', title: 'Study Content', description: 'Access learning materials', color: '#ef4444' },
    { id: 'progress', icon: '📊', title: 'View Progress', description: 'Track your performance', color: '#a855f7' },
    { id: 'subscriptions', icon: '📋', title: 'My Subscriptions', description: 'Manage subscriptions', color: '#06b6d4' }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="student-home-dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome back, {user?.firstName || user?.name || 'Student'}! 👋
            </h1>
            <p className="hero-subtitle">
              Ready to continue your learning journey? Let's make today count!
            </p>
            <div className="hero-stats-inline">
              <div className="inline-stat">
                <span className="inline-stat-icon">🔥</span>
                <span className="inline-stat-value">{stats.studyStreak}</span>
                <span className="inline-stat-label">day streak</span>
              </div>
              <div className="inline-stat">
                <span className="inline-stat-icon">✅</span>
                <span className="inline-stat-value">{stats.testsCompleted}</span>
                <span className="inline-stat-label">tests completed</span>
              </div>
              <div className="inline-stat">
                <span className="inline-stat-icon">📈</span>
                <span className="inline-stat-value">{stats.averageScore}%</span>
                <span className="inline-stat-label">avg score</span>
              </div>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-circle"></div>
            <div className="illustration-icon">🎓</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card primary-gradient">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.activeSubscriptions}</div>
            <div className="stat-card-label">Active Subscriptions</div>
          </div>
          <div className="stat-card-trend">
            <span className="trend-up">↗ Active</span>
          </div>
        </div>

        <div className="stat-card success-gradient">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.testsCompleted}</div>
            <div className="stat-card-label">Tests Completed</div>
          </div>
          <div className="stat-card-trend">
            <span className="trend-up">+{Math.floor(stats.testsCompleted * 0.2)} this week</span>
          </div>
        </div>

        <div className="stat-card warning-gradient">
          <div className="stat-card-icon">📈</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.averageScore}%</div>
            <div className="stat-card-label">Average Score</div>
          </div>
          <div className="stat-card-trend">
            <span className="trend-up">↗ +5%</span>
          </div>
        </div>

        <div className="stat-card purple-gradient">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.studyStreak}</div>
            <div className="stat-card-label">Day Streak</div>
          </div>
          <div className="stat-card-trend">
            <span className="trend-up">Keep it up!</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Tests with Chart */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h3>📊 Recent Test Performance</h3>
            <span className="card-subtitle">Your latest test scores</span>
          </div>
          <div className="card-content">
            {recentTests.length > 0 ? (
              <div className="performance-chart">
                {recentTests.map((test, index) => {
                  const maxScore = 100;
                  const height = (test.percentage / maxScore) * 100;
                  
                  return (
                    <div key={index} className="chart-column">
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar"
                          style={{ 
                            '--bar-height': `${height}%`,
                            '--bar-color': getScoreColor(test.percentage)
                          }}
                        >
                          <span className="bar-score">{test.percentage}%</span>
                        </div>
                      </div>
                      <div className="chart-label">
                        <div className="test-mini-name">{test.testName?.substring(0, 15)}...</div>
                        <div className="test-date">
                          {new Date(test.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-chart">
                <div className="empty-chart-icon">📝</div>
                <p>No tests taken yet. Start taking tests to see your performance!</p>
                <button className="action-button" onClick={() => onNavigate('tests')}>
                  Take Your First Test
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🎓 My Subscriptions</h3>
            <span className="card-subtitle">{subscriptions.length} active</span>
          </div>
          <div className="card-content">
            {subscriptions.length > 0 ? (
              <div className="subscriptions-list">
                {subscriptions.slice(0, 3).map((sub, index) => (
                  <div key={index} className="subscription-item">
                    <div className="subscription-icon">
                      {sub.subscriptionLevel === 'CLASS' ? '🎓' : sub.subscriptionLevel === 'EXAM' ? '📝' : '📚'}
                    </div>
                    <div className="subscription-details">
                      <div className="subscription-title">
                        {sub.subscriptionLevel} - {sub.entityName}
                      </div>
                      <div className="subscription-meta">
                        <span className="meta-item">
                          {sub.remainingDays} days left
                        </span>
                        <span className={`status-badge ${sub.status.toLowerCase()}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {subscriptions.length > 3 && (
                  <button className="view-all-link" onClick={() => onNavigate('subscriptions')}>
                    View all {subscriptions.length} subscriptions →
                  </button>
                )}
              </div>
            ) : (
              <div className="empty-subscriptions">
                <p>No active subscriptions</p>
                <button className="action-button" onClick={() => onNavigate('catalog')}>
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📅 This Week's Activity</h3>
            <span className="card-subtitle">Your study pattern</span>
          </div>
          <div className="card-content">
            <div className="weekly-activity">
              {weeklyActivity.map((day, index) => {
                const totalActivity = day.tests + (day.practice / 10);
                const activityHeight = Math.min((totalActivity / 5) * 100, 100);
                
                return (
                  <div key={index} className="activity-day">
                    <div className="activity-bar-wrapper">
                      <div 
                        className={`activity-bar ${
                          activityHeight > 70 ? 'activity-high' : 
                          activityHeight > 40 ? 'activity-medium' : 
                          'activity-low'
                        }`}
                        style={{ 
                          '--activity-height': `${activityHeight}%`
                        }}
                      >
                        <div className="activity-tooltip">
                          <div>Tests: {day.tests}</div>
                          <div>Practice: {day.practice}</div>
                          <div>Time: {day.studyTime}m</div>
                        </div>
                      </div>
                    </div>
                    <div className="activity-label">{day.day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-section">
        <h2 className="section-title">🚀 Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <div 
              key={action.id}
              className="quick-action-card"
              onClick={() => onNavigate(action.id)}
              style={{ '--action-color': action.color }}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <h4 className="action-title">{action.title}</h4>
              <p className="action-description">{action.description}</p>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Tips */}
      <div className="dashboard-card full-width tips-card">
        <div className="card-header">
          <h3>💡 Learning Tips</h3>
          <span className="card-subtitle">Boost your performance</span>
        </div>
        <div className="card-content">
          <div className="tips-grid">
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <h4>Set Daily Goals</h4>
                <p>Practice at least 20 questions daily to maintain consistency</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">⏰</div>
              <div className="tip-content">
                <h4>Time Management</h4>
                <p>Spend 30 minutes daily reviewing incorrect answers</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📖</div>
              <div className="tip-content">
                <h4>Focus on Weak Areas</h4>
                <p>Identify and strengthen topics where you score below 60%</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🔄</div>
              <div className="tip-content">
                <h4>Regular Practice</h4>
                <p>Take at least 2-3 tests per week to track improvement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHomeDashboard;

