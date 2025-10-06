import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout, toggleSidebar, setCurrentPage, backendConnected, checkBackendConnectivity } = useApp();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) {
      return;
    }

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
      setIsUserMenuOpen(false);
    }
  };


  const handleNavigation = (path, pageName) => {
    setCurrentPage(pageName);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  // Close dropdown when clicking outside and handle keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      // Ctrl+Shift+L for quick logout
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        if (isAuthenticated) {
          handleLogout();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated]);

  return (
    <header className="header">
      <div className="header-container">
        <Link 
          to="/" 
          className="header-logo"
          onClick={() => setCurrentPage('home')}
        >
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="logo-text">Coaxial Academy</span>
        </Link>

        <nav className="header-nav">
          {/* Simple connectivity indicator */}
          <div style={{
            marginRight: '16px',
            fontSize: '12px',
            fontWeight: '500',
            color: backendConnected ? '#10b981' : '#ef4444',
            cursor: 'pointer'
          }}
          onClick={() => {
            console.log('Manual connectivity check triggered');
            checkBackendConnectivity();
          }}
          title={`Backend is ${backendConnected ? 'connected' : 'disconnected'}`}
          >
            {backendConnected ? 'Online' : 'Offline'}
          </div>

          {isAuthenticated ? (
            <div className="header-actions">
              <div className={`user-menu ${isUserMenuOpen ? 'open' : ''}`} ref={userMenuRef}>
                <button 
                  className="user-button"
                  onClick={toggleUserMenu}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="user-avatar">
                    {getUserInitials()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user?.firstName || user?.username || 'User'}
                    </div>
                    <div className="user-role">
                      {user?.role || 'Student'}
                    </div>
                  </div>
                  <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Settings
                    </Link>
                    <button 
                      className="dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className="btn-login"
                onClick={() => setCurrentPage('login')}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-register"
                onClick={() => setCurrentPage('register')}
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg className="mobile-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <ul className="mobile-nav-links">
            <li>
              <Link 
                to="/" 
                className="mobile-nav-link"
                onClick={() => handleNavigation('/', 'home')}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/courses" 
                className="mobile-nav-link"
                onClick={() => handleNavigation('/courses', 'courses')}
              >
                Courses
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="mobile-nav-link"
                onClick={() => handleNavigation('/about', 'about')}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="mobile-nav-link"
                onClick={() => handleNavigation('/contact', 'contact')}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link 
                to="/subject-filter" 
                className="mobile-nav-link"
                onClick={() => handleNavigation('/subject-filter', 'subject-filter')}
              >
                Subject Filter
              </Link>
            </li>
          </ul>
          
          {!isAuthenticated ? (
            <div className="mobile-auth-buttons">
              <Link 
                to="/login" 
                className="btn btn-outline btn-full"
                onClick={() => handleNavigation('/login', 'login')}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary btn-full"
                onClick={() => handleNavigation('/register', 'register')}
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="mobile-user-actions">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {getUserInitials()}
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">
                    {user?.firstName || user?.username || 'User'}
                  </div>
                  <div className="mobile-user-role">
                    {user?.role || 'Student'}
                  </div>
                </div>
              </div>
              <div className="mobile-user-buttons">
                <button 
                  className="btn btn-outline btn-full"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </header>
  );
};

export default Header;
