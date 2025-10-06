import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';
import MasterDataManagement from './MasterDataManagement';
import UserManagementPage from './UserManagementPage';
import QuestionManagement from './master-data/QuestionManagement';
import TestManagement from './master-data/TestManagement';
import PricingDashboard from './pricing/PricingDashboard';

const AdminDashboard = () => {
  const { user } = useApp();
  const [activeModule, setActiveModule] = useState('overview');

  const renderModule = () => {
    switch (activeModule) {
      case 'users':
        return <UserManagementPage onBackToDashboard={() => setActiveModule('overview')} />;
      case 'master-data':
        return <MasterDataManagement onBackToDashboard={() => setActiveModule('overview')} />;
      case 'question-management':
        return <QuestionManagement onBackToDashboard={() => setActiveModule('overview')} />;
      case 'test-management':
        return <TestManagement onBackToDashboard={() => setActiveModule('overview')} />;
      case 'pricing':
        return <PricingDashboard onBackToDashboard={() => setActiveModule('overview')} />;
      case 'overview':
      default:
        return (
          <>
            <div className="welcome-card compact">
              <div className="welcome-header">
                <h2>⚙️ Admin Control Panel</h2>
                <div className="user-info">
                  <span className="user-name">{user?.name || `${user?.firstName} ${user?.lastName}`}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>User Management</h3>
                <p>Manage all users, view statistics, and analytics in one place.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveModule('users')}
                >
                  Manage Users
                </button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🗂️</div>
                <h3>Master Data Management</h3>
                <p>Manage course types, classes, subjects, chapters, and topics.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveModule('master-data')}
                >
                  Manage Master Data
                </button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">❓</div>
                <h3>Question Management</h3>
                <p>Create and manage questions with exam tagging and hierarchical organization.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveModule('question-management')}
                >
                  Manage Questions
                </button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Test Management</h3>
                <p>Create and manage tests with intelligent question filtering and exam integration.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveModule('test-management')}
                >
                  Manage Tests
                </button>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Pricing Management</h3>
                <p>Set course base plans and class/exam overrides with discounts.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveModule('pricing')}
                >
                  Manage Pricing
                </button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Course Management</h3>
                <p>Oversee all courses and approve new course submissions.</p>
                <button className="btn btn-primary">Manage Courses</button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⚙️</div>
                <h3>System Settings</h3>
                <p>Configure system-wide settings and preferences.</p>
                <button className="btn btn-primary">System Settings</button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Security & Permissions</h3>
                <p>Manage user roles, permissions, and security settings.</p>
                <button className="btn btn-primary">Security Settings</button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Reports</h3>
                <p>Generate and view detailed system reports.</p>
                <button className="btn btn-primary">Generate Reports</button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Subject Filter Chat</h3>
                <p>Real-time subject filtering by course type with chat interface.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.open('/subject-filter-chat', '_blank')}
                >
                  Open Filter Chat
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <p>Manage the entire learning management system</p>
        </div>
        
      </div>

      {renderModule()}
    </div>
  );
};

export default AdminDashboard;
