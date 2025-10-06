import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './AuthPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { addNotification, isOnline } = useApp();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      addNotification({
        type: 'error',
        message: 'You are currently offline. Please check your internet connection.',
        autoDismiss: false
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsSubmitted(true);
        addNotification({
          type: 'success',
          message: 'Password reset email sent successfully!',
          duration: 5000
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send password reset email');
        addNotification({
          type: 'error',
          message: errorData.message || 'Failed to send password reset email',
          duration: 5000
        });
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please try again later.');
      addNotification({
        type: 'error',
        message: 'Network error. Please try again later.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, addNotification, isOnline]);

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              </div>
              <h1 className="auth-title">Check Your Email</h1>
              <p className="auth-subtitle">We've sent password reset instructions to {email}</p>
            </div>
            
            <div className="auth-form">
              <div className="success-message">
                <p>If you don't see the email in your inbox, please check your spam folder.</p>
                <p>You can also try again with a different email address.</p>
              </div>
              
              <div className="auth-footer">
                <Link to="/login" className="btn btn-primary btn-full">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-subtitle">Enter your email address and we'll send you reset instructions</p>
            
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
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                  <span className="required" aria-label="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="form-input"
                  disabled={isLoading || !isOnline}
                  autoComplete="email"
                  required
                />
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || !isOnline || !email.trim()}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
