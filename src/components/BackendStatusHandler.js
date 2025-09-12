import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const BackendStatusHandler = ({ children }) => {
  const { backendConnected, isAuthenticated, logout, addNotification } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If backend is disconnected and user is on a protected route
    if (!backendConnected) {
      const protectedRoutes = ['/dashboard', '/admin', '/instructor', '/student'];
      const isOnProtectedRoute = protectedRoutes.some(route => 
        location.pathname.startsWith(route)
      );

      if (isOnProtectedRoute && isAuthenticated) {
        // Show notification
        addNotification({
          type: 'warning',
          message: 'Backend service is unavailable. Redirecting to home page.',
          duration: 5000
        });

        // Logout user and redirect to home
        logout();
        navigate('/', { replace: true });
      } else if (isOnProtectedRoute && !isAuthenticated) {
        // If not authenticated and on protected route, redirect to login
        addNotification({
          type: 'info',
          message: 'Backend service is unavailable. Using offline mode.',
          duration: 5000
        });
        navigate('/login', { replace: true });
      }
    }
  }, [backendConnected, isAuthenticated, location.pathname, logout, navigate, addNotification]);

  // Show offline indicator when backend is disconnected
  if (!backendConnected) {
    return (
      <>
        {children}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#f59e0b',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          Backend Offline
        </div>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </>
    );
  }

  return children;
};

export default BackendStatusHandler;

