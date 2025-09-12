import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChapterManagement from './master-data/ChapterManagement';
import ClassManagement from './master-data/ClassManagement';
import CourseManagement from './master-data/CourseManagement';
import CourseTypeManagement from './master-data/CourseTypeManagement';
import ExamManagement from './master-data/ExamManagement';
import SubjectManagement from './master-data/SubjectManagement';
import TopicManagement from './master-data/TopicManagement';
import './MasterDataManagement.css';

const MasterDataManagement = ({ onBackToDashboard }) => {
  const { user, token, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState('course-types');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'course-types', label: 'Course Types', icon: '📚' },
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'exams', label: 'Exams', icon: '📝' },
    { id: 'subjects', label: 'Subjects', icon: '📖' },
    { id: 'chapters', label: 'Chapters', icon: '📑' },
    { id: 'topics', label: 'Topics', icon: '📝' }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'course-types':
        return <CourseTypeManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'chapters':
        return <ChapterManagement />;
      case 'topics':
        return <TopicManagement />;
      default:
        return <CourseTypeManagement />;
    }
  };

  return (
    <div className="master-data-management">
      <div className="master-data-header">
        <div className="header-content">
          <h1>Master Data Management</h1>
          <p>Manage course structure, classes, subjects, chapters, and topics</p>
        </div>
        <div className="header-actions">
          {onBackToDashboard && (
            <button 
              className="btn btn-outline"
              onClick={onBackToDashboard}
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              ← Back to Dashboard
            </button>
          )}
          <div className="admin-badge">
            <span className="badge-icon">👑</span>
            <span>Admin Access</span>
          </div>
        </div>
      </div>

      <div className="master-data-content">
        <div className="tabs-container">
          <div className="tabs-nav">
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
        </div>

        <div className="tab-content">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default MasterDataManagement;
