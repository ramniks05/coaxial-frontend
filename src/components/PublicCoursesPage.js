import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getCourseCatalog } from '../services/studentService';
import './PublicCoursesPage.css';

const PublicCoursesPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState('quarterly');
  const [loading, setLoading] = useState(false);
  const [courseSections, setCourseSections] = useState([]);

  // Load courses from API (same as student course catalog)
  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourseCatalog();
      console.log('Course catalog API response:', data);
      
      if (data.success) {
        const sections = [];
        
        // Academic Classes
        if (data.classes && data.classes.length > 0) {
          sections.push({ 
            id: 1, 
            type: 'class',
            name: 'Academic Classes', 
            description: 'School curriculum courses for all grades', 
            icon: '🎓', 
            items: data.classes.map(cls => ({ ...cls, name: cls.className, type: 'class' })) 
          });
        }
        
        // Competitive Exams
        if (data.exams && data.exams.length > 0) {
          const examsWithCounts = data.exams.map(exam => {
            const totalModules = exam.subjects?.reduce((sum, s) => sum + (s.moduleCount || 0), 0) || 0;
            const totalChapters = exam.subjects?.reduce((sum, s) => sum + (s.chapterCount || 0), 0) || 0;
            return { ...exam, name: exam.examName, type: 'exam', moduleCount: totalModules, chapterCount: totalChapters };
          });
          sections.push({ 
            id: 2, 
            type: 'exam',
            name: 'Competitive Exams', 
            description: 'Preparation courses for competitive examinations', 
            icon: '🏆', 
            items: examsWithCounts 
          });
        }
        
        // Professional Courses
        if (data.courses && data.courses.length > 0) {
          sections.push({ 
            id: 3, 
            type: 'course',
            name: 'Professional Courses', 
            description: 'Skill-based professional development courses', 
            icon: '💼', 
            items: data.courses.map(course => ({ ...course, name: course.courseName, type: 'course' })) 
          });
        }
        
        setCourseSections(sections);
        addNotification({ 
          type: 'success', 
          message: 'Course catalog loaded!', 
          duration: 3000 
        });
      } else {
        console.warn('API returned success: false');
        setCourseSections([]);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      addNotification({ 
        type: 'error', 
        message: 'Failed to load course catalog', 
        duration: 6000 
      });
      setCourseSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubscribe = (course) => {
    setSelectedCourse(course);
    setShowLoginModal(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="public-courses-page">
      <div className="page-header">
        <h2>Available Courses</h2>
        <p>Discover our comprehensive learning programs and start your educational journey today</p>
      </div>


      {/* Course Types */}
      <div className="course-types-section">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : courseSections.length === 0 ? (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
            <h3>No courses found</h3>
            <p>No courses are currently available</p>
          </div>
        ) : (
          courseSections.map(courseType => (
          <div key={courseType.id} className="course-type-section">
            <div className="course-type-header">
              <div className="course-type-icon">{courseType.icon}</div>
              <div className="course-type-info">
                <h3>{courseType.name}</h3>
                <p>{courseType.description}</p>
              </div>
            </div>

            <div className="courses-grid">
              {courseType.items && courseType.items.map(item => (
                <div key={item.id} className="class-card">
                  <div className="class-header">
                    <h5>{item.name}</h5>
                    <div className="class-meta">
                      <span className="difficulty">{item.difficulty}</span>
                      <span className="duration">{item.duration}</span>
                    </div>
                  </div>

                  <div className="content-stats">
                    {item.subjectCount > 0 && (
                      <div className="stat">
                        <span className="stat-number">{item.subjectCount}</span>
                        <span className="stat-label">Subjects</span>
                      </div>
                    )}
                    {item.topicCount > 0 && (
                      <div className="stat">
                        <span className="stat-number">{item.topicCount}</span>
                        <span className="stat-label">Topics</span>
                      </div>
                    )}
                    {item.moduleCount > 0 && (
                      <div className="stat">
                        <span className="stat-number">{item.moduleCount}</span>
                        <span className="stat-label">Modules</span>
                      </div>
                    )}
                    {item.chapterCount > 0 && (
                      <div className="stat">
                        <span className="stat-number">{item.chapterCount}</span>
                        <span className="stat-label">Chapters</span>
                      </div>
                    )}
                    {item.questionCount > 0 && (
                      <div className="stat">
                        <span className="stat-number">{item.questionCount}</span>
                        <span className="stat-label">Questions</span>
                      </div>
                    )}
                  </div>

                  {item.subjects && item.subjects.length > 0 && (
                    <div className="subjects-preview">
                      <h6>Subjects Included:</h6>
                      <div className="subjects-list">
                        {item.subjects.map((subject, index) => (
                          <div key={index} className="subject-item">
                            <span className="subject-name">{subject.name}</span>
                            <span className="subject-stats">
                              {subject.topicCount}T, {subject.moduleCount}M, {subject.chapterCount}C, {subject.questionCount}Q
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.skillsCovered && item.skillsCovered.length > 0 && (
                    <div className="subjects-preview">
                      <h6>Skills Covered:</h6>
                      <div className="subjects-list">
                        {item.skillsCovered.map((skill, index) => (
                          <div key={index} className="subject-item">
                            <span className="subject-name">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pricing-section">
                    <div className="pricing-options">
                      <div className="pricing-option">
                        <span className="pricing-period">Monthly</span>
                        <span className="pricing-amount">{formatPrice(item.pricing.monthlyFinalPrice || 0)}</span>
                        {item.pricing?.monthlyDiscountPercent > 0 && (
                          <span className="discount">{item.pricing.monthlyDiscountPercent}% OFF</span>
                        )}
                      </div>
                      <div className="pricing-option recommended">
                        <span className="pricing-period">Quarterly</span>
                        <span className="pricing-amount">{formatPrice(item.pricing.quarterlyFinalPrice || 0)}</span>
                        {item.pricing?.quarterlyDiscountPercent > 0 && (
                          <span className="discount">{item.pricing.quarterlyDiscountPercent}% OFF</span>
                        )}
                      </div>
                      <div className="pricing-option">
                        <span className="pricing-period">Yearly</span>
                        <span className="pricing-amount">{formatPrice(item.pricing.yearlyFinalPrice || 0)}</span>
                        {item.pricing?.yearlyDiscountPercent > 0 && (
                          <span className="discount">{item.pricing.yearlyDiscountPercent}% OFF</span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="btn-subscribe"
                      onClick={() => handleSubscribe(item)}
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ))
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content subscription-modal">
            <div className="modal-header">
              <h3>Subscribe to {selectedCourse.name}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowLoginModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="course-details">
                <p>{selectedCourse.description}</p>
                <div className="course-stats-modal">
                  <div className="stat">
                    <span className="stat-number">{selectedCourse.subjectCount}</span>
                    <span className="stat-label">Subjects</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{selectedCourse.topicCount}</span>
                    <span className="stat-label">Topics</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{selectedCourse.moduleCount}</span>
                    <span className="stat-label">Modules</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{selectedCourse.chapterCount}</span>
                    <span className="stat-label">Chapters</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{selectedCourse.questionCount}</span>
                    <span className="stat-label">Questions</span>
                  </div>
                </div>
              </div>

              <div className="pricing-selection">
                <h4>Choose Subscription Plan</h4>
                <div className="pricing-options-modal">
                  <label className="pricing-option-modal">
                    <input
                      type="radio"
                      name="pricing"
                      value="monthly"
                      checked={selectedPricing === 'monthly'}
                      onChange={(e) => setSelectedPricing(e.target.value)}
                    />
                    <div className="pricing-card">
                      <div className="pricing-header">
                        <span className="pricing-period">Monthly</span>
                        <span className="pricing-amount">{formatPrice(selectedCourse.pricing.monthlyFinalPrice || 0)}</span>
                      </div>
                      <p className="pricing-description">Perfect for trying out the course</p>
                    </div>
                  </label>

                  <label className="pricing-option-modal">
                    <input
                      type="radio"
                      name="pricing"
                      value="quarterly"
                      checked={selectedPricing === 'quarterly'}
                      onChange={(e) => setSelectedPricing(e.target.value)}
                    />
                    <div className="pricing-card">
                      <div className="pricing-header">
                        <span className="pricing-period">Quarterly</span>
                        <span className="pricing-amount">{formatPrice(selectedCourse.pricing.quarterlyFinalPrice || 0)}</span>
                      </div>
                      <p className="pricing-description">Most popular choice</p>
                    </div>
                  </label>

                  <label className="pricing-option-modal">
                    <input
                      type="radio"
                      name="pricing"
                      value="yearly"
                      checked={selectedPricing === 'yearly'}
                      onChange={(e) => setSelectedPricing(e.target.value)}
                    />
                    <div className="pricing-card">
                      <div className="pricing-header">
                        <span className="pricing-period">Yearly</span>
                        <span className="pricing-amount">{formatPrice(selectedCourse.pricing.yearlyFinalPrice || 0)}</span>
                      </div>
                      <p className="pricing-description">Best value for money</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={handleLoginRedirect}
                  className="btn btn-primary"
                >
                  Login to Subscribe
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="btn btn-secondary"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCoursesPage;

