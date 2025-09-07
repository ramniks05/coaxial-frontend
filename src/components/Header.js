import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout, toggleSidebar, setCurrentPage } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'accept': '*/*'
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
      navigate('/');
    }
  };

  const handleNavigation = (path, pageName) => {
    setCurrentPage(pageName);
    navigate(path);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <Link 
              to="/" 
              className="logo"
              onClick={() => setCurrentPage('home')}
            >
              <h2>EduLearn</h2>
            </Link>
          </div>

          <nav className="header-nav">
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-name">
                    Welcome, {user?.name || user?.firstName || 'User'}!
                  </span>
                  <span className="user-role">
                    {user?.role}
                  </span>
                </div>
                <div className="user-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleNavigation('/login', 'login')}
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleNavigation('/register', 'register')}
                >
                  Get Started
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
