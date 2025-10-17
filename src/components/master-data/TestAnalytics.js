import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import './MasterDataComponent.css';

const TestAnalytics = ({ tests, onClose }) => {
  const { addNotification } = useApp();
  
  // State for analytics data
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('overview');
  
  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!tests || tests.length === 0) {
      return {
        overview: {
          totalTests: 0,
          publishedTests: 0,
          draftTests: 0,
          totalQuestions: 0,
          averageQuestionsPerTest: 0,
          totalMarks: 0,
          averageMarksPerTest: 0
        },
        testTypes: {},
        difficultyDistribution: {},
        timeDistribution: {},
        recentActivity: []
      };
    }
    
    const now = new Date();
    const timeRangeMs = parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000;
    const filteredTests = tests.filter(test => 
      new Date(test.createdAt) >= new Date(now.getTime() - timeRangeMs)
    );
    
    // Overview metrics
    const overview = {
      totalTests: filteredTests.length,
      publishedTests: filteredTests.filter(t => t.isPublished).length,
      draftTests: filteredTests.filter(t => !t.isPublished).length,
      totalQuestions: filteredTests.reduce((sum, test) => sum + (test.questionCount || 0), 0),
      averageQuestionsPerTest: filteredTests.length > 0 ? 
        Math.round(filteredTests.reduce((sum, test) => sum + (test.questionCount || 0), 0) / filteredTests.length) : 0,
      totalMarks: filteredTests.reduce((sum, test) => sum + (test.totalMarks || 0), 0),
      averageMarksPerTest: filteredTests.length > 0 ? 
        Math.round(filteredTests.reduce((sum, test) => sum + (test.totalMarks || 0), 0) / filteredTests.length) : 0
    };
    
    // Test type distribution
    const testTypes = filteredTests.reduce((acc, test) => {
      const type = test.testType || 'PRACTICE';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Time distribution (by creation date)
    const timeDistribution = {};
    filteredTests.forEach(test => {
      const date = new Date(test.createdAt).toLocaleDateString();
      timeDistribution[date] = (timeDistribution[date] || 0) + 1;
    });
    
    // Recent activity
    const recentActivity = filteredTests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(test => ({
        id: test.id,
        name: test.testName,
        type: test.testType || 'PRACTICE',
        status: test.isPublished ? 'Published' : 'Draft',
        createdAt: test.createdAt,
        questions: test.questionCount || 0,
        marks: test.totalMarks || 0
      }));
    
    return {
      overview,
      testTypes,
      difficultyDistribution: {},
      timeDistribution,
      recentActivity
    };
  }, [tests, selectedTimeRange]);
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return '#22c55e';
      case 'Draft': return '#f59e0b';
      default: return '#6b7280';
    }
  };
  
  // Get test type color
  const getTestTypeColor = (type) => {
    switch (type) {
      case 'PRACTICE': return '#3b82f6';
      case 'MOCK': return '#8b5cf6';
      case 'FINAL': return '#ef4444';
      case 'QUIZ': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };
  
  // Calculate percentage
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content test-analytics-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>📊 Test Analytics Dashboard</h3>
            <p>Comprehensive insights into your test management</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          {/* Controls */}
          <div className="analytics-controls">
            <div className="control-group">
              <label>Time Range</label>
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="form-control"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div className="control-group">
              <label>View</label>
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="form-control"
              >
                <option value="overview">Overview</option>
                <option value="types">Test Types</option>
                <option value="timeline">Timeline</option>
                <option value="activity">Recent Activity</option>
              </select>
            </div>
          </div>
          
          {/* Overview Metrics */}
          {selectedMetric === 'overview' && (
            <div className="analytics-section">
              <div className="section-header">
                <h4>📈 Overview Metrics</h4>
                <span className="time-range">
                  Last {selectedTimeRange === 'all' ? 'all time' : `${selectedTimeRange} days`}
                </span>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">📝</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(analyticsData.overview.totalTests)}</div>
                    <div className="metric-label">Total Tests</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(analyticsData.overview.publishedTests)}</div>
                    <div className="metric-label">Published</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">📋</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(analyticsData.overview.draftTests)}</div>
                    <div className="metric-label">Drafts</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">❓</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(analyticsData.overview.totalQuestions)}</div>
                    <div className="metric-label">Total Questions</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <div className="metric-value">{analyticsData.overview.averageQuestionsPerTest}</div>
                    <div className="metric-label">Avg Questions/Test</div>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatNumber(analyticsData.overview.totalMarks)}</div>
                    <div className="metric-label">Total Marks</div>
                  </div>
                </div>
              </div>
              
              {/* Progress bars for published vs draft */}
              <div className="progress-section">
                <h5>Test Status Distribution</h5>
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Published Tests</span>
                    <span>{analyticsData.overview.publishedTests} ({calculatePercentage(analyticsData.overview.publishedTests, analyticsData.overview.totalTests)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill published"
                      style={{ width: `${calculatePercentage(analyticsData.overview.publishedTests, analyticsData.overview.totalTests)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Draft Tests</span>
                    <span>{analyticsData.overview.draftTests} ({calculatePercentage(analyticsData.overview.draftTests, analyticsData.overview.totalTests)}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill draft"
                      style={{ width: `${calculatePercentage(analyticsData.overview.draftTests, analyticsData.overview.totalTests)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Test Types Distribution */}
          {selectedMetric === 'types' && (
            <div className="analytics-section">
              <div className="section-header">
                <h4>📊 Test Types Distribution</h4>
              </div>
              
              <div className="types-grid">
                {Object.entries(analyticsData.testTypes).map(([type, count]) => (
                  <div key={type} className="type-card">
                    <div className="type-header">
                      <div 
                        className="type-icon"
                        style={{ backgroundColor: getTestTypeColor(type) }}
                      >
                        {type.charAt(0)}
                      </div>
                      <div className="type-info">
                        <div className="type-name">{type}</div>
                        <div className="type-count">{count} tests</div>
                      </div>
                    </div>
                    <div className="type-percentage">
                      {calculatePercentage(count, analyticsData.overview.totalTests)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Timeline */}
          {selectedMetric === 'timeline' && (
            <div className="analytics-section">
              <div className="section-header">
                <h4>📅 Creation Timeline</h4>
              </div>
              
              <div className="timeline-chart">
                {Object.entries(analyticsData.timeDistribution)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, count]) => (
                    <div key={date} className="timeline-item">
                      <div className="timeline-date">{date}</div>
                      <div className="timeline-bar">
                        <div 
                          className="timeline-fill"
                          style={{ 
                            width: `${Math.max(10, (count / Math.max(...Object.values(analyticsData.timeDistribution))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="timeline-count">{count}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Recent Activity */}
          {selectedMetric === 'activity' && (
            <div className="analytics-section">
              <div className="section-header">
                <h4>🕒 Recent Activity</h4>
              </div>
              
              <div className="activity-list">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-number">#{index + 1}</div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.name}</div>
                      <div className="activity-meta">
                        <span 
                          className="activity-type"
                          style={{ backgroundColor: getTestTypeColor(activity.type) }}
                        >
                          {activity.type}
                        </span>
                        <span 
                          className="activity-status"
                          style={{ backgroundColor: getStatusColor(activity.status) }}
                        >
                          {activity.status}
                        </span>
                        <span className="activity-stats">
                          {activity.questions} questions • {activity.marks} marks
                        </span>
                      </div>
                    </div>
                    <div className="activity-date">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <span>
              Analytics for {analyticsData.overview.totalTests} tests
            </span>
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
              onClick={() => addNotification({ message: 'Export feature coming soon!', type: 'info' })}
            >
              📊 Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics;
