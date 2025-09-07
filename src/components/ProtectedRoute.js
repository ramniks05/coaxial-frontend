import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { user, token, isAuthenticated } = useApp();
  
  // Check if user is logged in (both user data and token required)
  if (!isAuthenticated || !user?.username || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has the required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const userRole = user.role?.toLowerCase() || 'student';
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
