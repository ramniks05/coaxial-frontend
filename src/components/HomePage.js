import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <main className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Transform Your Learning Journey</h1>
              <p>
                Join thousands of students and educators in our comprehensive 
                online learning management system. Access courses, track progress, 
                and achieve your educational goals.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  Start Learning Today
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="learning-illustration">
                <div className="book-icon">📚</div>
                <div className="laptop-icon">💻</div>
                <div className="certificate-icon">🏆</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="container">
          <h2>Why Choose EduLearn?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>Adaptive learning paths tailored to your pace and preferences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals and academic experts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning journey with detailed analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global Community</h3>
              <p>Connect with learners from around the world.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
