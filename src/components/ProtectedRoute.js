import React from 'react';
import { useApp } from '../context/AppContext';
import SafeRedirect from './SafeRedirect';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, isAuthenticated } = useApp();
  
  // Check if user is logged in (both user data and token required)
  if (!isAuthenticated || !user?.username || !token) {
    return <SafeRedirect to="/login" />;
  }
  
  // Check if user has the required role
  if (requiredRole && user.role !== requiredRole) {
    const userRole = user.role?.toLowerCase() || 'student';
    return <SafeRedirect to={`/dashboard/${userRole}`} />;
  }
  
  // If all checks pass, render children
  return children;
};

export default ProtectedRoute;
