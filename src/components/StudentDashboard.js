import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';
import './master-data/StudentDashboard.css';

// Import student components
import StudentCourseCatalog from './master-data/StudentCourseCatalog';
import StudentSubscription from './master-data/StudentSubscription';
import StudentContentBrowser from './master-data/StudentContentBrowser';
import StudentTestCenter from './master-data/StudentTestCenter';
import StudentQuestionBank from './master-data/StudentQuestionBank';
import StudentProgressTracker from './master-data/StudentProgressTracker';

const StudentDashboard = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'catalog', label: 'Course Catalog', icon: '🛍️' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '📋' },
    { id: 'content', label: 'Content Browser', icon: '📚' },
    { id: 'tests', label: 'Test Center', icon: '📝' },
    { id: 'questions', label: 'Question Bank', icon: '❓' },
    { id: 'progress', label: 'Progress Tracker', icon: '📊' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return <StudentCourseCatalog />;
      case 'subscriptions':
        return <StudentSubscription />;
      case 'content':
        return <StudentContentBrowser />;
      case 'tests':
        return <StudentTestCenter />;
      case 'questions':
        return <StudentQuestionBank />;
      case 'progress':
        return <StudentProgressTracker />;
      default:
        return (
          <div className="dashboard-overview">
            <div className="welcome-card">
              <h2>🎓 Welcome to Your Learning Journey!</h2>
              <p>
                You are logged in as a <strong>Student</strong> in the Coaxial Academy platform.
              </p>
              <div className="user-details">
                <p><strong>Name:</strong> {user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => setActiveTab('catalog')}>
                <div className="feature-icon">🛍️</div>
                <h3>Course Catalog</h3>
                <p>Browse and subscribe to courses, classes, and exams.</p>
                <button className="btn btn-primary">Browse Catalog</button>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('subscriptions')}>
                <div className="feature-icon">📋</div>
                <h3>My Subscriptions</h3>
                <p>Manage your class, exam, or course level subscriptions.</p>
                <button className="btn btn-primary">Manage Subscriptions</button>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('content')}>
                <div className="feature-icon">📚</div>
                <h3>Content Browser</h3>
                <p>Browse subjects, topics, modules, and chapters.</p>
                <button className="btn btn-primary">Browse Content</button>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('tests')}>
                <div className="feature-icon">📝</div>
                <h3>Test Center</h3>
                <p>Take tests and view your test history.</p>
                <button className="btn btn-primary">Take Tests</button>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('questions')}>
                <div className="feature-icon">❓</div>
                <h3>Question Bank</h3>
                <p>Practice questions and track your progress.</p>
                <button className="btn btn-primary">Practice Questions</button>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('progress')}>
                <div className="feature-icon">📊</div>
                <h3>Progress Tracker</h3>
                <p>Monitor your learning progress and performance.</p>
                <button className="btn btn-primary">View Progress</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Track your learning progress and access your courses</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;
