import React from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useApp();

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Track your learning progress and access your courses</p>
      </div>

      <div className="welcome-card">
        <h2>🎓 Welcome to Your Learning Journey!</h2>
        <p>
          You are logged in as a <strong>Student</strong> in the EduLearn platform.
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
          <p>View and access all your enrolled courses.</p>
          <button className="btn btn-primary">View Courses</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Progress Tracking</h3>
          <p>Monitor your learning progress and completion rates.</p>
          <button className="btn btn-primary">View Progress</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Assignments</h3>
          <p>Submit assignments and track your grades.</p>
          <button className="btn btn-primary">View Assignments</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Achievements</h3>
          <p>View your certificates and learning milestones.</p>
          <button className="btn btn-primary">View Achievements</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>Discussion Forum</h3>
          <p>Participate in course discussions and ask questions.</p>
          <button className="btn btn-primary">Join Discussions</button>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Schedule</h3>
          <p>View your class schedule and upcoming deadlines.</p>
          <button className="btn btn-primary">View Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
