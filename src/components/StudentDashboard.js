import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';
import './master-data/StudentDashboard.css';

// Import student components
import StudentHomeDashboard from './master-data/StudentHomeDashboard';
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
        return <StudentHomeDashboard onNavigate={setActiveTab} />;
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
