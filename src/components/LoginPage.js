import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../utils/apiUtils';
import { extractErrorInfo } from '../utils/errorHandler';
import './AuthPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  
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
    isOnline
  } = useApp();
  
  const navigate = useNavigate();

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = user.role === 'ADMIN' ? '/dashboard/admin' 
        : user.role === 'INSTRUCTOR' ? '/dashboard/instructor' 
        : '/dashboard/student';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  const validateField = useCallback((name, value) => {
    const errors = {};
    
    if (name === 'username') {
      if (!value) {
        errors.username = 'Username is required';
      } else if (value.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    return errors;
  }, []);

  const getRemainingLockoutTime = useCallback(() => {
    if (!lockoutTime) return 0;
    const remaining = LOCKOUT_DURATION - (Date.now() - lockoutTime);
    return Math.max(0, remaining);
  }, [lockoutTime, LOCKOUT_DURATION]);

  const formatRemainingTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isLocked) {
      const interval = setInterval(() => {
        const remaining = getRemainingLockoutTime();
        if (remaining === 0) {
          setIsLocked(false);
          setLockoutTime(null);
          setAttempts(0);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isLocked, getRemainingLockoutTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    
    clearError();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      addNotification({ 
        message: `Account locked. Try again in ${formatRemainingTime(getRemainingLockoutTime())}`, 
        type: 'error' 
      });
      return;
    }
    
    clearError();
    setFieldErrors({});
    
    const usernameErrors = validateField('username', formData.username);
    const passwordErrors = validateField('password', formData.password);
    const allErrors = { ...usernameErrors, ...passwordErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setIsLocked(true);
          setLockoutTime(Date.now());
          addNotification({ 
            message: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`, 
            type: 'error' 
          });
        }
        
        const errorInfo = extractErrorInfo(data);
        setError(errorInfo.message || 'Login failed');
        addNotification({ 
          message: errorInfo.message || 'Login failed', 
          type: 'error' 
        });
      } else {
        loginSuccess(data.user, data.token);
        
        const dashboardPath = data.user.role === 'ADMIN' ? '/dashboard/admin' 
          : data.user.role === 'INSTRUCTOR' ? '/dashboard/instructor' 
          : '/dashboard/student';
        
        addNotification({ 
          message: `✅ Welcome back, ${data.user.firstName || data.user.username}!`, 
          type: 'success' 
        });
        navigate(dashboardPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection.');
      addNotification({ 
        message: 'Network error. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container-modern">
        {/* Left Side - Branding */}
        <div className="auth-left-panel">
          <div className="panel-content">
            <div className="brand-section">
              <div className="brand-logo">🎓</div>
              <h1 className="brand-title">Coaxial Academy</h1>
              <p className="brand-tagline">Your Gateway to Success</p>
            </div>
            
            <div className="panel-features">
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Access 1000+ Quality Courses</div>
              </div>
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Learn from Expert Instructors</div>
              </div>
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Track Your Progress</div>
              </div>
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Earn Certificates</div>
              </div>
            </div>

            <div className="panel-stats">
              <div className="panel-stat">
                <div className="panel-stat-number">10K+</div>
                <div className="panel-stat-label">Students</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat-number">500+</div>
                <div className="panel-stat-label">Courses</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat-number">95%</div>
                <div className="panel-stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-right-panel">
          <div className="form-container-modern">
            <div className="form-header-modern">
              <h2 className="form-title-modern">Welcome Back!</h2>
              <p className="form-subtitle-modern">Sign in to continue your learning</p>
            </div>

            {error && (
              <div className="alert-error-modern">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {isLocked && (
              <div className="alert-warning-modern">
                <span className="alert-icon">🔒</span>
                <span>Account locked. Try again in {formatRemainingTime(getRemainingLockoutTime())}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-modern">
              <div className="form-field-modern">
                <label className="field-label-modern">Username</label>
                <input
                  ref={usernameRef}
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`field-input-modern ${fieldErrors.username ? 'error' : ''}`}
                  disabled={isLocked || isSubmitting}
                  autoComplete="username"
                />
                {fieldErrors.username && (
                  <div className="field-error-modern">{fieldErrors.username}</div>
                )}
              </div>

              <div className="form-field-modern">
                <label className="field-label-modern">Password</label>
                <div className="password-field-wrapper">
                  <input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`field-input-modern ${fieldErrors.password ? 'error' : ''}`}
                    disabled={isLocked || isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-modern"
                    onClick={togglePasswordVisibility}
                    disabled={isLocked || isSubmitting}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="field-error-modern">{fieldErrors.password}</div>
                )}
              </div>

              <div className="form-options-modern">
                <label className="checkbox-modern">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLocked || isSubmitting}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link-modern">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="submit-button-modern"
                disabled={loading || isSubmitting || isLocked || !isOnline}
              >
                {loading || isSubmitting ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>

              {attempts > 0 && !isLocked && (
                <div className="attempts-warning">
                  ⚠️ {MAX_LOGIN_ATTEMPTS - attempts} attempts remaining
                </div>
              )}
            </form>

            <div className="form-footer-modern">
              <p className="footer-text">
                Don't have an account?{' '}
                <Link to="/register" className="footer-link">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
