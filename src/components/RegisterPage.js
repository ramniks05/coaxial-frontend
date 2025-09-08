import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { extractErrorInfo, getErrorSeverity } from '../utils/errorHandler';
import './AuthPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT'
  });
  const { loading, error, setLoading, setError, clearError, loginSuccess, addNotification } = useApp();
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match' });
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        const newFieldErrors = {};
        if (!formData.username) newFieldErrors.username = 'Username is required';
        if (!formData.email) newFieldErrors.email = 'Email is required';
        if (!formData.password) newFieldErrors.password = 'Password is required';
        if (!formData.firstName) newFieldErrors.firstName = 'First name is required';
        if (!formData.lastName) newFieldErrors.lastName = 'Last name is required';
        setFieldErrors(newFieldErrors);
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data for backend API
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };

      // Call backend API
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(registrationData)
      });

      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.user;
        const token = responseData.token;

        // Use context to store user data and token
        loginSuccess(userData, token);

        // Add success notification with shorter duration
        addNotification({
          type: 'success',
          message: `Welcome to EduLearn, ${userData.firstName}!`,
          duration: 3000 // 3 seconds
        });

        // Navigate based on user role
        const role = formData.role || 'STUDENT';
        navigate(`/dashboard/${role.toLowerCase()}`);
      } else {
        // Handle error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: 'Invalid response from server' };
        }

        const errorInfo = extractErrorInfo(response, errorData);
        console.log('Registration error:', errorInfo);

        // Set appropriate error message
        setError(errorInfo.message);

        // Add notification with appropriate severity
        addNotification({
          type: getErrorSeverity(errorInfo.code),
          message: errorInfo.message
        });

        // Handle specific field errors for validation errors
        if (errorInfo.code === 'VALIDATION_ERROR' && errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorInfo = extractErrorInfo(null, { message: err.message });
      setError(errorInfo.message);

      addNotification({
        type: 'error',
        message: errorInfo.message
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
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="auth-title">Join EduLearn</h1>
            <p className="auth-subtitle">Create your account to start learning</p>
          </div>
          
          <div className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`form-input ${fieldErrors.username ? 'error' : ''}`}
                  required
                />
                {fieldErrors.username && (
                  <div className="form-error">{fieldErrors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                  required
                />
                {fieldErrors.email && (
                  <div className="form-error">{fieldErrors.email}</div>
                )}
              </div>

              <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-4)' }}>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className={`form-input ${fieldErrors.firstName ? 'error' : ''}`}
                    required
                  />
                  {fieldErrors.firstName && (
                    <div className="form-error">{fieldErrors.firstName}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className={`form-input ${fieldErrors.lastName ? 'error' : ''}`}
                    required
                  />
                  {fieldErrors.lastName && (
                    <div className="form-error">{fieldErrors.lastName}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  required
                />
                {fieldErrors.password && (
                  <div className="form-error">{fieldErrors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <div className="form-error">{fieldErrors.confirmPassword}</div>
                )}
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              className="btn btn-google btn-full"
              disabled={true}
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google (Coming Soon)
            </button>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
