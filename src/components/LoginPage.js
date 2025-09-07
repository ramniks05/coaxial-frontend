import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { extractErrorInfo, getErrorSeverity } from '../utils/errorHandler';
import './AuthPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { loading, error, setLoading, setError, clearError, loginSuccess, addNotification, user, isAuthenticated } = useApp();
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const dashboardPath = `/dashboard/${user.role.toLowerCase()}`;
      console.log('User already authenticated, redirecting to:', dashboardPath);
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    setFieldErrors({});

    try {
      // Validate required fields
      if (!formData.username || !formData.password) {
        const newFieldErrors = {};
        if (!formData.username) newFieldErrors.username = 'Username is required';
        if (!formData.password) newFieldErrors.password = 'Password is required';
        setFieldErrors(newFieldErrors);
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data for backend API
      const loginData = {
        username: formData.username,
        password: formData.password
      };

      // Call backend API
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Login response:', responseData);

        const userData = responseData.user;
        const token = responseData.token;

        // Use context to store user data and token
        loginSuccess(userData, token);

        // Add success notification with shorter duration
        addNotification({
          type: 'success',
          message: `Welcome back, ${userData.firstName || userData.username}!`,
          duration: 3000 // 3 seconds
        });

        // Navigate based on user role
        const role = userData.role || 'STUDENT';
        const dashboardPath = `/dashboard/${role.toLowerCase()}`;
        console.log('Login successful, navigating to:', dashboardPath);
        console.log('User data:', userData);
        console.log('User role:', role);

        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          navigate(dashboardPath);
        }, 100);
      } else {
        // Handle error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: 'Invalid response from server' };
        }

        const errorInfo = extractErrorInfo(response, errorData);
        console.log('Login error:', errorInfo);

        // Set appropriate error message
        setError(errorInfo.message);

        // Add notification with appropriate severity and duration
        const errorDuration = errorInfo.code === 'VALIDATION_ERROR' ? 4000 : 6000;
        addNotification({
          type: getErrorSeverity(errorInfo.code),
          message: errorInfo.message,
          duration: errorDuration
        });

        // Handle specific field errors for validation errors
        if (errorInfo.code === 'VALIDATION_ERROR' && errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorInfo = extractErrorInfo(null, { message: err.message });
      setError(errorInfo.message);

      addNotification({
        type: 'error',
        message: errorInfo.message,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Spring Security OAuth2 will handle the entire OAuth flow
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };


  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo-link">
            <h2>EduLearn</h2>
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your learning journey</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={fieldErrors.username ? 'error' : ''}
                required
              />
              {fieldErrors.username && (
                <div className="field-error">{fieldErrors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={fieldErrors.password ? 'error' : ''}
                required
              />
              {fieldErrors.password && (
                <div className="field-error">{fieldErrors.password}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            className="btn btn-google btn-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Loading...' : 'Continue with Google'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
