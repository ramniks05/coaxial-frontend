import React from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useApp();

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the entire learning management system</p>
      </div>

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
          <p>Manage all users, instructors, and students in the system.</p>
          <button className="btn btn-primary">Manage Users</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Course Management</h3>
          <p>Oversee all courses and approve new course submissions.</p>
          <button className="btn btn-primary">Manage Courses</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>System Analytics</h3>
          <p>View comprehensive system-wide analytics and reports.</p>
          <button className="btn btn-primary">View Analytics</button>
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
    </div>
  );
};

export default AdminDashboard;
