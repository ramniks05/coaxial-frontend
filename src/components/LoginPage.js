import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { extractErrorInfo } from '../utils/errorHandler';
import { safeNavigate } from '../utils/safeNavigation';
import './AuthPage.css';
import SafeRedirect from './SafeRedirect';

const LoginPage = () => {
  // Enhanced form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // Enhanced state management
  const [fieldErrors, setFieldErrors] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for accessibility and focus management
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const submitButtonRef = useRef(null);
  
  // Context and navigation
  const { 
    loading, 
    error, 
    setLoading, 
    setError, 
    clearError, 
    loginSuccess, 
    addNotification, 
    user, 
    isAuthenticated,
    isOnline,
    backendConnected
  } = useApp();
  const navigate = useNavigate();

  // Configuration constants
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  const DEBOUNCE_DELAY = 300;

  // Enhanced validation with debouncing
  const validateField = useCallback((name, value) => {
    const errors = {};
    
    switch (name) {
      case 'username':
        if (!value) {
          errors.username = 'Username is required';
        } else if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
    }
    
    return errors;
  }, []);

  // Debounced field validation
  const debouncedValidation = useMemo(() => {
    let timeoutId;
    return (name, value) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const errors = validateField(name, value);
        setFieldErrors(prev => ({
          ...prev,
          [name]: errors[name] || null
        }));
      }, DEBOUNCE_DELAY);
    };
  }, [validateField]);

  // Calculate remaining lockout time
  const getRemainingLockoutTime = useCallback(() => {
    if (!lockoutTime) return 0;
    const remaining = LOCKOUT_DURATION - (Date.now() - lockoutTime);
    return Math.max(0, remaining);
  }, [lockoutTime]);

  // Format remaining time for display
  const formatRemainingTime = useCallback((ms) => {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }, []);

  // Handle input changes with validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear existing errors
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Trigger validation
    debouncedValidation(name, value);
  }, [fieldErrors, debouncedValidation]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Handle form submission with enhanced security
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Prevent submission if locked out
    if (isLocked) {
      addNotification({
        type: 'error',
        message: 'Account temporarily locked due to multiple failed attempts. Please try again later.',
        autoDismiss: false
      });
      return;
    }

    // Prevent submission if offline
    if (!isOnline) {
      addNotification({
        type: 'error',
        message: 'You are currently offline. Please check your internet connection.',
        autoDismiss: false
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    clearError();
    setFieldErrors({});

    try {
      // Client-side validation
      const validationErrors = {};
      Object.keys(formData).forEach(field => {
        const errors = validateField(field, formData[field]);
        if (errors[field]) {
          validationErrors[field] = errors[field];
        }
      });

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setError('Please correct the errors below');
        return;
      }

      // Prepare login data
      const loginData = {
        username: formData.username.trim(),
        password: formData.password
      };

      // Development mode check (remove in production)
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment && !backendConnected) {
        // Mock authentication for development
        const mockUsers = {
          'instructor': {
            user: {
              id: 1,
              username: 'instructor',
              firstName: 'John',
              lastName: 'Doe',
              email: 'instructor@example.com',
              role: 'INSTRUCTOR'
            },
            token: 'mock-jwt-token-instructor-' + Date.now()
          },
          'admin': {
            user: {
              id: 2,
              username: 'admin',
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              role: 'ADMIN'
            },
            token: 'mock-jwt-token-admin-' + Date.now()
          },
          'student': {
            user: {
              id: 3,
              username: 'student',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'student@example.com',
              role: 'STUDENT'
            },
            token: 'mock-jwt-token-student-' + Date.now()
          }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (mockUsers[loginData.username] && loginData.password === 'password') {
          const responseData = mockUsers[loginData.username];
          
          // Reset login attempts on success
          localStorage.removeItem('loginAttempts');
          localStorage.removeItem('lockoutTime');
          setAttempts(0);
          
          loginSuccess(responseData.user, responseData.token);
          
          addNotification({
            type: 'success',
            message: `Welcome back, ${responseData.user.firstName || responseData.user.username}!`,
            duration: 3000
          });

          // Navigate to dashboard
          const dashboardPath = `/dashboard/${responseData.user.role.toLowerCase()}`;
          safeNavigate(navigate, dashboardPath);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      // Production API call
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(loginData),
        credentials: 'include' // For CSRF protection
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Reset login attempts on success
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');
        setAttempts(0);
        
        loginSuccess(responseData.user, responseData.token);
        
        addNotification({
          type: 'success',
          message: `Welcome back, ${responseData.user.firstName || responseData.user.username}!`,
          duration: 3000
        });

        // Navigate to dashboard
        const dashboardPath = `/dashboard/${responseData.user.role.toLowerCase()}`;
        safeNavigate(navigate, dashboardPath);
        
      } else {
        // Handle failed login
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: 'Invalid response from server' };
        }

        const errorInfo = extractErrorInfo(response, errorData);
        
        // Check if account should be locked
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setIsLocked(true);
          setLockoutTime(Date.now());
          localStorage.setItem('lockoutTime', Date.now().toString());
          
          addNotification({
            type: 'error',
            message: `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts. Please try again in 15 minutes.`,
            autoDismiss: false
          });
        } else {
          addNotification({
            type: 'error',
            message: errorInfo.message,
            duration: 5000
          });
        }

        setError(errorInfo.message);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Increment attempts for network errors
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      const errorInfo = extractErrorInfo(null, { message: err.message });
      setError(errorInfo.message);
      
      addNotification({
        type: 'error',
        message: errorInfo.message,
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [isLocked, isOnline, formData, attempts, validateField, setLoading, clearError, loginSuccess, addNotification, navigate, backendConnected]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isSubmitting && !isLocked) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [isSubmitting, isLocked, handleSubmit]);

  // Check account lockout on component mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedLockoutTime = localStorage.getItem('lockoutTime');
    
    if (storedAttempts) {
      const attemptsCount = parseInt(storedAttempts);
      setAttempts(attemptsCount);
      
      if (storedLockoutTime) {
        const lockTime = parseInt(storedLockoutTime);
        const now = Date.now();
        
        if (now - lockTime < LOCKOUT_DURATION) {
          setIsLocked(true);
          setLockoutTime(lockTime);
          
          // Auto-unlock when time expires
          const remainingTime = LOCKOUT_DURATION - (now - lockTime);
          setTimeout(() => {
            setIsLocked(false);
            setLockoutTime(null);
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lockoutTime');
          }, remainingTime);
        } else {
          // Clear expired lockout
          localStorage.removeItem('loginAttempts');
          localStorage.removeItem('lockoutTime');
        }
      }
    }
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated && user?.role) {
    const dashboardPath = `/dashboard/${user.role.toLowerCase()}`;
    console.log('User already authenticated, redirecting to:', dashboardPath);
    return <SafeRedirect to={dashboardPath} />;
  }



  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
            
            {/* Network status indicator */}
            {!isOnline && (
              <div className="network-status offline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                </svg>
                Offline
              </div>
            )}
          </div>
          
          <div className="auth-form">
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            
            {/* Account lockout warning */}
            {isLocked && (
              <div className="lockout-message" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                Account locked. Try again in {formatRemainingTime(getRemainingLockoutTime())}.
              </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                  <span className="required" aria-label="required">*</span>
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your username"
                  className={`form-input ${fieldErrors.username ? 'error' : ''}`}
                  disabled={isLocked || isSubmitting}
                  autoComplete="username"
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  aria-invalid={!!fieldErrors.username}
                  required
                />
                {fieldErrors.username && (
                  <div id="username-error" className="form-error" role="alert">
                    {fieldErrors.username}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                  <span className="required" aria-label="required">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                    disabled={isLocked || isSubmitting}
                    autoComplete="current-password"
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    aria-invalid={!!fieldErrors.password}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLocked || isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div id="password-error" className="form-error" role="alert">
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLocked || isSubmitting}
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
              </div>

              <button 
                ref={submitButtonRef}
                type="submit" 
                className={`btn btn-primary btn-full ${(loading || isSubmitting) ? 'loading' : ''}`}
                disabled={loading || isSubmitting || isLocked || !isOnline}
                aria-describedby={attempts > 0 ? 'attempts-info' : undefined}
              >
                {loading || isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
              
              {attempts > 0 && (
                <div id="attempts-info" className="attempts-info">
                  {MAX_LOGIN_ATTEMPTS - attempts} attempts remaining
                </div>
              )}
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up here
                </Link>
              </p>
              
              <div className="forgot-password">
                <Link to="/forgot-password" className="auth-link">
                  Forgot your password?
                </Link>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="dev-info">
                  <strong>Development Mode:</strong> Use these credentials:<br/>
                  • <strong>instructor/password</strong> - Instructor Dashboard<br/>
                  • <strong>admin/password</strong> - Admin Dashboard<br/>
                  • <strong>student/password</strong> - Student Dashboard
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
