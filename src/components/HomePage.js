import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);

  const stats = [
    { number: '10,000+', label: 'Active Students', icon: '👨‍🎓' },
    { number: '500+', label: 'Expert Teachers', icon: '👩‍🏫' },
    { number: '1,000+', label: 'Quality Courses', icon: '📚' },
    { number: '95%', label: 'Success Rate', icon: '🎯' }
  ];

  const features = [
    {
      icon: '🎓',
      title: 'Personalized Learning',
      description: 'AI-powered adaptive learning paths customized to your pace and style',
      color: '#1976D2'  // Primary Blue
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Detailed insights and performance tracking to monitor your growth',
      color: '#10b981'  // Success Green
    },
    {
      icon: '🏆',
      title: 'Certification',
      description: 'Earn recognized certificates upon completing courses and assessments',
      color: '#FF9800'  // Accent Orange
    },
    {
      icon: '💬',
      title: 'Live Doubt Sessions',
      description: 'Interactive sessions with expert instructors for instant clarification',
      color: '#ef4444'  // Error Red
    },
    {
      icon: '📱',
      title: 'Mobile Learning',
      description: 'Learn anytime, anywhere with our responsive platform',
      color: '#42A5F5'  // Primary Blue Light
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
      color: '#1565C0'  // Primary Blue Dark
    }
  ];

  const courseCategories = [
    {
      id: 1,
      name: 'Academic Courses',
      description: 'Complete school curriculum from Class 1 to 12',
      image: '🏫',
      courses: 450,
      students: 5000,
      color: '#1976D2'  // Primary Blue
    },
    {
      id: 2,
      name: 'Competitive Exams',
      description: 'Prepare for JEE, NEET, SSC, UPSC and more',
      image: '🎯',
      courses: 350,
      students: 3500,
      color: '#FF9800'  // Accent Orange
    },
    {
      id: 3,
      name: 'Professional Skills',
      description: 'Master in-demand skills for career growth',
      image: '💼',
      courses: 200,
      students: 1500,
      color: '#10b981'  // Success Green
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'JEE Aspirant',
      image: '👩‍🎓',
      rating: 5,
      text: 'Coaxial Academy helped me crack JEE Main with 98.5 percentile! The structured courses and mock tests were game-changers.',
      achievement: 'JEE Main - 98.5%ile'
    },
    {
      name: 'Rahul Kumar',
      role: 'Class 10 Student',
      image: '👨‍🎓',
      rating: 5,
      text: 'Scored 95% in boards thanks to the comprehensive study material and practice questions. Best investment ever!',
      achievement: 'Board Exam - 95%'
    },
    {
      name: 'Anita Desai',
      role: 'SSC Candidate',
      image: '👩‍💼',
      rating: 5,
      text: 'The question bank and test series are phenomenal. I cleared SSC CGL on my first attempt!',
      achievement: 'SSC CGL - Cleared'
    }
  ];

  const howItWorks = [
    { step: '1', title: 'Create Account', description: 'Sign up for free in less than 2 minutes', icon: '📝' },
    { step: '2', title: 'Choose Course', description: 'Browse and select from 1000+ courses', icon: '🎯' },
    { step: '3', title: 'Start Learning', description: 'Access videos, notes, tests, and more', icon: '📚' },
    { step: '4', title: 'Track Progress', description: 'Monitor performance and earn certificates', icon: '🏆' }
  ];

  return (
    <div className="public-home-page">
      {/* Hero Section */}
      <section className="hero-section-new">
        <div className="hero-background">
          <div className="hero-shape-1"></div>
          <div className="hero-shape-2"></div>
          <div className="hero-shape-3"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content-new">
            <div className="hero-badge-new">
              <span className="badge-icon">✨</span>
              <span>Trusted by 10,000+ learners worldwide</span>
            </div>
            
            <h1 className="hero-title-new">
              Transform Your Future with
              <span className="gradient-text"> World-Class Education</span>
            </h1>
            
            <p className="hero-description">
              Join India's fastest-growing online learning platform. Master academic subjects, 
              crack competitive exams, and build professional skills - all in one place.
            </p>
            
            <div className="hero-buttons">
              <button onClick={() => navigate('/register')} className="btn-hero-primary">
                <span>Start Free Trial</span>
                <span className="btn-arrow">→</span>
              </button>
              <button onClick={() => navigate('/login')} className="btn-hero-secondary">
                <span>Sign In</span>
              </button>
            </div>

            <div className="hero-trust-badges">
              <div className="trust-badge">
                <span className="trust-icon">⭐</span>
                <span>4.9/5 Rating</span>
              </div>
              <div className="trust-badge">
                <span className="trust-icon">✅</span>
                <span>Money Back Guarantee</span>
              </div>
              <div className="trust-badge">
                <span className="trust-icon">🔒</span>
                <span>Secure Payments</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">📊</div>
              <div className="card-text">95% Success Rate</div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">🎓</div>
              <div className="card-text">Learn from Experts</div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">⚡</div>
              <div className="card-text">Fast-Track Learning</div>
            </div>
            <div className="hero-main-visual">
              <div className="visual-circle"></div>
              <div className="visual-icon">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card-new">
              <div className="stat-icon-new">{stat.icon}</div>
              <div className="stat-number-new">{stat.number}</div>
              <div className="stat-label-new">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Course Categories */}
      <section className="categories-section">
        <div className="section-container">
          <div className="section-header-new">
            <span className="section-tag">Explore</span>
            <h2 className="section-title-new">Choose Your Learning Path</h2>
            <p className="section-subtitle-new">
              Comprehensive courses designed for every learning goal
            </p>
          </div>

          <div className="categories-grid">
            {courseCategories.map((category, index) => (
              <div 
                key={category.id}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-image">{category.image}</div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-stats">
                  <div className="category-stat">
                    <span className="stat-icon">📚</span>
                    <span>{category.courses} Courses</span>
                  </div>
                  <div className="category-stat">
                    <span className="stat-icon">👥</span>
                    <span>{category.students} Students</span>
                  </div>
                </div>
                <button 
                  className="category-button"
                  onClick={() => navigate('/register')}
                >
                  Explore Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-new">
        <div className="section-container">
          <div className="section-header-new">
            <span className="section-tag">Features</span>
            <h2 className="section-title-new">Everything You Need to Succeed</h2>
            <p className="section-subtitle-new">
              Powerful tools and features designed to enhance your learning experience
            </p>
          </div>

          <div className="features-grid-new">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-new">
                <div className="feature-icon-new" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title-new">{feature.title}</h3>
                <p className="feature-description-new">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header-new">
            <span className="section-tag">Process</span>
            <h2 className="section-title-new">How It Works</h2>
            <p className="section-subtitle-new">
              Get started in 4 simple steps
            </p>
          </div>

          <div className="steps-grid">
            {howItWorks.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-description">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="step-connector">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header-new">
            <span className="section-tag">Success Stories</span>
            <h2 className="section-title-new">What Our Students Say</h2>
            <p className="section-subtitle-new">
              Real stories from real students who achieved their goals
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{testimonial.image}</div>
                  <div className="testimonial-info">
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                  <div className="testimonial-rating">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-achievement">
                  <span className="achievement-icon">🏆</span>
                  <span>{testimonial.achievement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-new">
        <div className="cta-background">
          <div className="cta-shape-1"></div>
          <div className="cta-shape-2"></div>
        </div>
        <div className="cta-container-new">
          <div className="cta-content-new">
            <h2 className="cta-title-new">Ready to Transform Your Future?</h2>
            <p className="cta-subtitle-new">
              Join thousands of successful students. Start your learning journey today!
            </p>
            <div className="cta-buttons">
              <button onClick={() => navigate('/register')} className="btn-cta-large">
                Get Started Free
                <span className="btn-shine"></span>
              </button>
              <button onClick={() => navigate('/login')} className="btn-cta-outline">
                Sign In to Continue
              </button>
            </div>
            <div className="cta-note">
              <span className="note-icon">✨</span>
              <span>No credit card required • 7-day free trial</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
