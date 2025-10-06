import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getUserCounts } from '../services/userService';
import './UserStatistics.css';

const UserStatistics = ({ onBackToDashboard }) => {
  const { token, addNotification } = useApp();
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    instructors: 0,
    students: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const userStats = await getUserCounts(token);
      setStats(userStats);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setError(err.message);
      addNotification({
        type: 'error',
        message: 'Failed to fetch user statistics',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="user-statistics">
        <div className="stats-header">
          <div className="header-content">
            <h2>User Statistics</h2>
            <div className="header-actions">
              {onBackToDashboard && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={onBackToDashboard}
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  ← Back to Dashboard
                </button>
              )}
              <button 
                onClick={fetchUserStats}
                className="btn btn-outline btn-sm"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-statistics">
        <div className="stats-header">
          <div className="header-content">
            <h2>User Statistics</h2>
            <div className="header-actions">
              {onBackToDashboard && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={onBackToDashboard}
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  ← Back to Dashboard
                </button>
              )}
              <button 
                onClick={fetchUserStats}
                className="btn btn-outline btn-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-statistics">
      <div className="stats-header">
        <div className="header-content">
          <h2>User Statistics</h2>
          <div className="header-actions">
            {onBackToDashboard && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={onBackToDashboard}
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                ← Back to Dashboard
              </button>
            )}
            <button 
              onClick={fetchUserStats}
              className="btn btn-outline btn-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {/* Total Users */}
        <div className="stat-card total">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-1.5-2c-.47-.62-1.21-.99-2.01-.99H9.46c-.8 0-1.54.37-2.01.99L5 10.5l-1.5-2C3.03 8.37 2.29 8 1.5 8H.46c-.8 0-1.54.37-2.01.99L-2 10.5v11.5h2v-6h2.5l2.54 7.63A1.5 1.5 0 0 0 5.46 24H7c.8 0 1.54-.37 2.01-.99L10 20.5l1.5 2c.47.62 1.21.99 2.01.99h1.54c.8 0 1.54-.37 2.01-.99L18 20.5l1.5 2c.47.62 1.21.99 2.01.99h1.54c.8 0 1.54-.37 2.01-.99L26 20.5v-6h2v6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        {/* Active Users */}
        <div className="stat-card active">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active Users</div>
            <div className="stat-percentage">
              {getPercentage(stats.active, stats.total)}% of total
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="stat-card inactive">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.inactive}</div>
            <div className="stat-label">Inactive Users</div>
            <div className="stat-percentage">
              {getPercentage(stats.inactive, stats.total)}% of total
            </div>
          </div>
        </div>

        {/* Admins */}
        <div className="stat-card admin">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.admins}</div>
            <div className="stat-label">Administrators</div>
            <div className="stat-percentage">
              {getPercentage(stats.admins, stats.total)}% of total
            </div>
          </div>
        </div>

        {/* Instructors */}
        <div className="stat-card instructor">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.instructors}</div>
            <div className="stat-label">Instructors</div>
            <div className="stat-percentage">
              {getPercentage(stats.instructors, stats.total)}% of total
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="stat-card student">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.students}</div>
            <div className="stat-label">Students</div>
            <div className="stat-percentage">
              {getPercentage(stats.students, stats.total)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Summary Chart */}
      <div className="stats-summary">
        <h3>User Distribution</h3>
        <div className="distribution-chart">
          <div className="chart-bar">
            <div className="bar-label">Active</div>
            <div className="bar-container">
              <div 
                className="bar-fill active-bar"
                style={{ width: `${getPercentage(stats.active, stats.total)}%` }}
              ></div>
            </div>
            <div className="bar-value">{stats.active}</div>
          </div>
          <div className="chart-bar">
            <div className="bar-label">Inactive</div>
            <div className="bar-container">
              <div 
                className="bar-fill inactive-bar"
                style={{ width: `${getPercentage(stats.inactive, stats.total)}%` }}
              ></div>
            </div>
            <div className="bar-value">{stats.inactive}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
