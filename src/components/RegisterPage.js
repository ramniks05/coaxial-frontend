import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { extractErrorInfo, getErrorSeverity } from '../utils/errorHandler';
import { safeNavigate } from '../utils/safeNavigation';
import './AuthPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    bio: ''
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
        role: formData.role,
        phoneNumber: formData.phoneNumber || null,
        dateOfBirth: formData.dateOfBirth || null,
        address: formData.address || null,
        bio: formData.bio || null
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
          message: `Welcome to Coaxial Academy, ${userData.firstName}!`,
          duration: 3000 // 3 seconds
        });

        // Navigate based on user role
        const role = formData.role || 'STUDENT';
        const dashboardPath = `/dashboard/${role.toLowerCase()}`;
        
        // Use safe navigation to prevent insecure operation errors
        safeNavigate(navigate, dashboardPath);
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
        } else {
          // Handle specific backend errors and map them to fields
          const newFieldErrors = {};
          const errorMessage = errorInfo.message || '';
          
          // Check for email already exists error (various formats)
          if (errorMessage.includes('Email already exists') || 
              errorMessage.includes('email already exists') ||
              errorMessage.includes('Email is already taken') ||
              errorMessage.includes('email is already taken')) {
            newFieldErrors.email = 'This email address is already registered';
          }
          
          // Check for username already exists error (various formats)
          if (errorMessage.includes('Username already exists') || 
              errorMessage.includes('username already exists') ||
              errorMessage.includes('Username is already taken') ||
              errorMessage.includes('username is already taken')) {
            newFieldErrors.username = 'This username is already taken';
          }
          
          // Check for invalid email format
          if (errorMessage.includes('Invalid email format') || 
              errorMessage.includes('invalid email') ||
              errorMessage.includes('Email format is invalid')) {
            newFieldErrors.email = 'Please enter a valid email address';
          }
          
          // Check for password validation errors
          if (errorMessage.includes('Password') && 
              (errorMessage.includes('too short') || 
               errorMessage.includes('too weak') || 
               errorMessage.includes('invalid') ||
               errorMessage.includes('required'))) {
            newFieldErrors.password = errorMessage;
          }
          
          // Check for username validation errors
          if (errorMessage.includes('Username') && 
              (errorMessage.includes('too short') || 
               errorMessage.includes('invalid') ||
               errorMessage.includes('required'))) {
            newFieldErrors.username = errorMessage;
          }
          
          // Check for name validation errors
          if (errorMessage.includes('First name') && 
              (errorMessage.includes('required') || 
               errorMessage.includes('invalid'))) {
            newFieldErrors.firstName = errorMessage;
          }
          if (errorMessage.includes('Last name') && 
              (errorMessage.includes('required') || 
               errorMessage.includes('invalid'))) {
            newFieldErrors.lastName = errorMessage;
          }
          
          // Check for phone number validation errors
          if (errorMessage.includes('Phone number') && 
              (errorMessage.includes('invalid') || 
               errorMessage.includes('format'))) {
            newFieldErrors.phoneNumber = errorMessage;
          }
          
          // If we found field-specific errors, set them
          if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
          }
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
            <h1 className="auth-title">Join Coaxial Academy</h1>
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

              <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-4)' }}>
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className={`form-input ${fieldErrors.phoneNumber ? 'error' : ''}`}
                  />
                  {fieldErrors.phoneNumber && (
                    <div className="form-error">{fieldErrors.phoneNumber}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address (optional)"
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself (optional)"
                  className="form-textarea"
                  rows={3}
                />
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
