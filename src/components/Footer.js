import React from 'react';
import { useApp } from '../context/AppContext';
import './Footer.css';

const Footer = () => {
  const { currentPage } = useApp();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EduLearn</h3>
            <p>Transform your learning journey with our comprehensive online learning management system.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="Instagram">📷</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#progress">Progress Tracking</a></li>
              <li><a href="#certificates">Certificates</a></li>
              <li><a href="#forum">Discussion Forum</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 EduLearn. All rights reserved.</p>
          <p className="current-page">Current Page: {currentPage}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
