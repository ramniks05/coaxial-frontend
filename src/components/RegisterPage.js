import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { extractErrorInfo, getErrorSeverity } from '../utils/errorHandler';
import { API_BASE } from '../utils/apiUtils';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: null
      });
    }
    clearError();
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

      const response = await fetch(`${API_BASE}/api/auth/register`, {
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

        loginSuccess(userData, token);
        addNotification({ 
          message: `✅ Welcome to Coaxial Academy, ${userData.firstName}!`, 
          type: 'success' 
        });

        const role = formData.role || 'STUDENT';
        const dashboardPath = role === 'ADMIN' ? '/dashboard/admin'
          : role === 'INSTRUCTOR' ? '/dashboard/instructor'
          : '/dashboard/student';
        
        navigate(dashboardPath);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: 'Invalid response from server' };
        }

        const errorInfo = extractErrorInfo(response, errorData);
        setError(errorInfo.message);
        addNotification({ 
          message: errorInfo.message, 
          type: getErrorSeverity(errorInfo.code) 
        });

        // Handle field-specific errors
        if (errorInfo.code === 'VALIDATION_ERROR' && errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
        } else {
          const newFieldErrors = {};
          const errorMessage = errorInfo.message || '';
          
          if (errorMessage.toLowerCase().includes('email already')) {
            newFieldErrors.email = 'This email address is already registered';
          }
          if (errorMessage.toLowerCase().includes('username already')) {
            newFieldErrors.username = 'This username is already taken';
          }
          
          if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
          }
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
      addNotification({ 
        message: 'Network error. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container-modern">
        {/* Left Side - Branding */}
        <div className="auth-left-panel">
          <div className="panel-content">
            <div className="brand-section">
              <div className="brand-logo">🎓</div>
              <h1 className="brand-title">Coaxial Academy</h1>
              <p className="brand-tagline">Start Your Learning Journey Today</p>
            </div>
            
            <div className="panel-features">
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">1000+ Quality Courses</div>
              </div>
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Expert Instructors</div>
              </div>
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Flexible Learning</div>
              </div>
              <div className="panel-feature">
                <div className="feature-check">✓</div>
                <div className="feature-text">Certified Programs</div>
              </div>
            </div>

            <div className="panel-testimonial">
              <p className="testimonial-text">
                "Coaxial Academy transformed my career. Best decision I ever made!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🎓</div>
                <div>
                  <div className="author-name">Rahul Kumar</div>
                  <div className="author-role">Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="auth-right-panel">
          <div className="form-container-modern">
            <div className="form-header-modern">
              <h2 className="form-title-modern">Create Your Account</h2>
              <p className="form-subtitle-modern">Join thousands of successful learners</p>
            </div>

            {error && (
              <div className="alert-error-modern">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-modern">
              <div className="form-row-modern">
                <div className="form-field-modern">
                  <label className="field-label-modern">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`field-input-modern ${fieldErrors.firstName ? 'error' : ''}`}
                    required
                  />
                  {fieldErrors.firstName && (
                    <div className="field-error-modern">{fieldErrors.firstName}</div>
                  )}
                </div>

                <div className="form-field-modern">
                  <label className="field-label-modern">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={`field-input-modern ${fieldErrors.lastName ? 'error' : ''}`}
                    required
                  />
                  {fieldErrors.lastName && (
                    <div className="field-error-modern">{fieldErrors.lastName}</div>
                  )}
                </div>
              </div>

              <div className="form-field-modern">
                <label className="field-label-modern">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a unique username"
                  className={`field-input-modern ${fieldErrors.username ? 'error' : ''}`}
                  required
                />
                {fieldErrors.username && (
                  <div className="field-error-modern">{fieldErrors.username}</div>
                )}
              </div>

              <div className="form-field-modern">
                <label className="field-label-modern">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`field-input-modern ${fieldErrors.email ? 'error' : ''}`}
                  required
                />
                {fieldErrors.email && (
                  <div className="field-error-modern">{fieldErrors.email}</div>
                )}
              </div>

              <div className="form-field-modern">
                <label className="field-label-modern">I am a *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="field-input-modern"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
              </div>

              <div className="form-row-modern">
                <div className="form-field-modern">
                  <label className="field-label-modern">Password *</label>
                  <div className="password-field-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password (min 6 characters)"
                      className={`field-input-modern ${fieldErrors.password ? 'error' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-modern"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="field-error-modern">{fieldErrors.password}</div>
                  )}
                </div>

                <div className="form-field-modern">
                  <label className="field-label-modern">Confirm Password *</label>
                  <div className="password-field-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`field-input-modern ${fieldErrors.confirmPassword ? 'error' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-modern"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <div className="field-error-modern">{fieldErrors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <div className="form-field-modern">
                <label className="field-label-modern">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  className={`field-input-modern ${fieldErrors.phoneNumber ? 'error' : ''}`}
                />
                {fieldErrors.phoneNumber && (
                  <div className="field-error-modern">{fieldErrors.phoneNumber}</div>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-button-modern"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="form-footer-modern">
              <p className="footer-text">
                Already have an account?{' '}
                <Link to="/login" className="footer-link">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="form-terms">
              <p>By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
