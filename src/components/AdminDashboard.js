import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';
import MasterDataManagement from './MasterDataManagement';
import UserManagementPage from './UserManagementPage';

const AdminDashboard = () => {
  const { user } = useApp();
  const [activeModule, setActiveModule] = useState('overview');

  const renderModule = () => {
    switch (activeModule) {
      case 'users':
        return <UserManagementPage onBackToDashboard={() => setActiveModule('overview')} />;
      case 'master-data':
        return <MasterDataManagement onBackToDashboard={() => setActiveModule('overview')} />;
      case 'overview':
      default:
        return (
          <>
            <div className="welcome-card">
              <h2>⚙️ Welcome to the Admin Control Panel!</h2>
              <p>
                You are logged in as an <strong>Administrator</strong> in the EduLearn platform.
              </p>
              <div className="user-details">
                <p><strong>Name:</strong> {user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
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
        
        {activeModule !== 'overview' && (
          <div className="dashboard-nav">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setActiveModule('overview')}
            >
              ← Back to Overview
            </button>
          </div>
        )}
      </div>

      {renderModule()}
    </div>
  );
};

export default AdminDashboard;
