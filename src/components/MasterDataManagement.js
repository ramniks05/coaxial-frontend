import React, { lazy, Suspense, useState } from 'react';
import { useApp } from '../context/AppContext';
import './MasterDataManagement.css';

// Lazy load components to prevent auto-fetching when not active
const CourseTypeManagement = lazy(() => import('./master-data/CourseTypeManagement'));
const CourseManagement = lazy(() => import('./master-data/CourseManagement'));
const ClassManagement = lazy(() => import('./master-data/ClassManagement'));
const ExamManagement = lazy(() => import('./master-data/ExamManagement'));
const SubjectManagement = lazy(() => import('./master-data/SubjectManagement'));
const TopicManagement = lazy(() => import('./master-data/TopicManagement'));
const ModuleManagement = lazy(() => import('./master-data/ModuleManagement'));
const ChapterManagement = lazy(() => import('./master-data/chapter/ChapterManagementNew'));

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
    { id: 'topics', label: 'Topics', icon: '📝' },
    { id: 'modules', label: 'Modules', icon: '📦' },
    { id: 'chapters', label: 'Chapters', icon: '📑' }
  ];

  const renderActiveComponent = () => {
    const LoadingSpinner = () => (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );

    switch (activeTab) {
      case 'course-types':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CourseTypeManagement />
          </Suspense>
        );
      case 'courses':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CourseManagement />
          </Suspense>
        );
      case 'classes':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassManagement />
          </Suspense>
        );
      case 'exams':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ExamManagement />
          </Suspense>
        );
      case 'subjects':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SubjectManagement />
          </Suspense>
        );
      case 'topics':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TopicManagement />
          </Suspense>
        );
      case 'modules':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ModuleManagement />
          </Suspense>
        );
      case 'chapters':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ChapterManagement />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CourseTypeManagement />
          </Suspense>
        );
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
              className="btn btn-primary btn-success"
              onClick={onBackToDashboard}
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
