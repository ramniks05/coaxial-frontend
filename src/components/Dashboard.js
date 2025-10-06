import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <h2>Coaxial Academy</h2>
            <div className="nav-actions">
              <span className="user-info">
                Welcome, {user.name || user.firstName || 'User'}!
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Welcome to your learning dashboard</p>
          </div>

          <div className="dashboard-content">
            <div className="welcome-card">
              <h2>🎉 Welcome to Coaxial Academy!</h2>
              <p>
                You have successfully logged in using email authentication.
              </p>
              <div className="user-details">
                <p><strong>Name:</strong> {user.name || `${user.firstName} ${user.lastName}`}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Login Method:</strong> {user.loginMethod}</p>
                {user.picture && (
                  <div className="profile-picture">
                    <img src={user.picture} alt="Profile" />
                  </div>
                )}
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>My Courses</h3>
                <p>Access your enrolled courses and continue learning.</p>
                <button className="btn btn-primary">View Courses</button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Progress</h3>
                <p>Track your learning progress and achievements.</p>
                <button className="btn btn-primary">View Progress</button>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Achievements</h3>
                <p>View your certificates and learning milestones.</p>
                <button className="btn btn-primary">View Achievements</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
