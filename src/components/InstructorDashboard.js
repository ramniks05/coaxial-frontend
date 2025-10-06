import React from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

const InstructorDashboard = () => {
  const { user } = useApp();

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Instructor Dashboard</h1>
        <p>Manage your courses and track student progress</p>
      </div>

      <div className="welcome-card">
        <h2>👨‍🏫 Welcome to Your Teaching Hub!</h2>
        <p>
          You are logged in as an <strong>Instructor</strong> in the Coaxial Academy platform.
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
          <div className="feature-icon">📚</div>
          <h3>My Courses</h3>
          <p>Create and manage your course content and materials.</p>
          <button className="btn btn-primary">Manage Courses</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Students</h3>
          <p>View and manage your enrolled students.</p>
          <button className="btn btn-primary">View Students</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Assignments</h3>
          <p>Create assignments and grade student submissions.</p>
          <button className="btn btn-primary">Manage Assignments</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Analytics</h3>
          <p>View detailed analytics and student performance metrics.</p>
          <button className="btn btn-primary">View Analytics</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>Discussion Forum</h3>
          <p>Moderate course discussions and answer student questions.</p>
          <button className="btn btn-primary">Moderate Forum</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Schedule</h3>
          <p>Manage your class schedule and important dates.</p>
          <button className="btn btn-primary">Manage Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
