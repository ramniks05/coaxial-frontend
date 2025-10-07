import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { loadRazorpayScript } from '../../utils/razorpay';
import './StudentDashboard.css';

const StudentCourseCatalog = () => {
  const { token, addNotification } = useApp();
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState('monthly');
  const [filters, setFilters] = useState({
    courseType: '',
    priceRange: '',
    duration: '',
    search: ''
  });

  // Mock data for testing
  const mockCourseData = [
    {
      id: 1,
      name: "Academic Course",
      description: "Complete school curriculum courses for grades 1-12",
      icon: "🎓",
      courses: [
        {
          id: 1,
          name: "Academic Course Class 1-10",
          description: "Complete academic curriculum for primary and secondary education",
          classes: [
            {
              id: 6,
              name: "Grade 1",
              description: "Foundation learning for young students",
              subjectCount: 3,
              topicCount: 45,
              moduleCount: 135,
              chapterCount: 360,
              questionCount: 1500,
              duration: "1 academic year",
              difficulty: "Beginner",
              pricing: {
                monthly: 299,
                quarterly: 799,
                yearly: 2499
              },
              subjects: [
                { name: "Mathematics", topicCount: 15, moduleCount: 45, chapterCount: 120, questionCount: 500 },
                { name: "Hindi", topicCount: 12, moduleCount: 36, chapterCount: 96, questionCount: 400 },
                { name: "English", topicCount: 18, moduleCount: 54, chapterCount: 144, questionCount: 600 }
              ]
            },
            {
              id: 7,
              name: "Grade 2",
              description: "Advanced foundation learning",
              subjectCount: 4,
              topicCount: 60,
              moduleCount: 180,
              chapterCount: 480,
              questionCount: 2000,
              duration: "1 academic year",
              difficulty: "Beginner",
              pricing: {
                monthly: 349,
                quarterly: 899,
                yearly: 2799
              },
              subjects: [
                { name: "Mathematics", topicCount: 18, moduleCount: 54, chapterCount: 144, questionCount: 600 },
                { name: "Hindi", topicCount: 15, moduleCount: 45, chapterCount: 120, questionCount: 500 },
                { name: "English", topicCount: 20, moduleCount: 60, chapterCount: 160, questionCount: 700 },
                { name: "Science", topicCount: 7, moduleCount: 21, chapterCount: 56, questionCount: 200 }
              ]
            }
          ]
        },
        {
          id: 4,
          name: "Academic Course Class 11-12",
          description: "Higher secondary education curriculum",
          classes: [
            {
              id: 8,
              name: "Grade 12",
              description: "Final year of school education",
              subjectCount: 5,
              topicCount: 100,
              moduleCount: 300,
              chapterCount: 800,
              questionCount: 3500,
              duration: "1 academic year",
              difficulty: "Advanced",
              pricing: {
                monthly: 599,
                quarterly: 1599,
                yearly: 4999
              },
              subjects: [
                { name: "Mathematics", topicCount: 25, moduleCount: 75, chapterCount: 200, questionCount: 1000 },
                { name: "Physics", topicCount: 20, moduleCount: 60, chapterCount: 160, questionCount: 800 },
                { name: "Chemistry", topicCount: 18, moduleCount: 54, chapterCount: 144, questionCount: 700 },
                { name: "Biology", topicCount: 22, moduleCount: 66, chapterCount: 176, questionCount: 600 },
                { name: "Political Science", topicCount: 15, moduleCount: 45, chapterCount: 120, questionCount: 400 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Competitive Exam",
      description: "Preparation courses for various competitive examinations",
      icon: "🏆",
      courses: [
        {
          id: 2,
          name: "SSC",
          description: "Staff Selection Commission exam preparation",
          exams: [
            {
              id: 1,
              name: "SSC MTS",
              description: "Multi-Tasking Staff examination",
              subjectCount: 4,
              topicCount: 80,
              moduleCount: 240,
              chapterCount: 640,
              questionCount: 3000,
              duration: "6 months",
              difficulty: "Intermediate",
              pricing: {
                monthly: 499,
                quarterly: 1299,
                yearly: 3999
              },
              subjects: [
                { name: "General Intelligence", topicCount: 20, moduleCount: 60, chapterCount: 160, questionCount: 800 },
                { name: "General Awareness", topicCount: 25, moduleCount: 75, chapterCount: 200, questionCount: 1000 },
                { name: "Mathematics", topicCount: 20, moduleCount: 60, chapterCount: 160, questionCount: 800 },
                { name: "English", topicCount: 15, moduleCount: 45, chapterCount: 120, questionCount: 400 }
              ]
            },
            {
              id: 2,
              name: "SSC GD",
              description: "General Duty examination",
              subjectCount: 4,
              topicCount: 75,
              moduleCount: 225,
              chapterCount: 600,
              questionCount: 2800,
              duration: "6 months",
              difficulty: "Intermediate",
              pricing: {
                monthly: 499,
                quarterly: 1299,
                yearly: 3999
              },
              subjects: [
                { name: "General Intelligence", topicCount: 18, moduleCount: 54, chapterCount: 144, questionCount: 720 },
                { name: "General Awareness", topicCount: 22, moduleCount: 66, chapterCount: 176, questionCount: 880 },
                { name: "Mathematics", topicCount: 18, moduleCount: 54, chapterCount: 144, questionCount: 720 },
                { name: "English", topicCount: 17, moduleCount: 51, chapterCount: 136, questionCount: 480 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Professional Course",
      description: "Skill-based professional development courses",
      icon: "💼",
      courses: [
        {
          id: 3,
          name: "Photography",
          description: "Complete photography and graphic design course",
          courses: [
            {
              id: 5,
              name: "Photography Fundamentals",
              description: "Basic to advanced photography techniques",
              subjectCount: 3,
              topicCount: 50,
              moduleCount: 150,
              chapterCount: 400,
              questionCount: 2000,
              duration: "4 months",
              difficulty: "Beginner",
              pricing: {
                monthly: 699,
                quarterly: 1899,
                yearly: 5999
              },
              subjects: [
                { name: "Camera Basics", topicCount: 15, moduleCount: 45, chapterCount: 120, questionCount: 600 },
                { name: "Lighting Techniques", topicCount: 20, moduleCount: 60, chapterCount: 160, questionCount: 800 },
                { name: "Post-Processing", topicCount: 15, moduleCount: 45, chapterCount: 120, questionCount: 600 }
              ]
            }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    loadCourseData();
  }, []);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Later replace with actual API call
      // const response = await fetch('/api/student/courses/catalog', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourseTypes(mockCourseData);
    } catch (error) {
      console.error('Error loading course data:', error);
      addNotification('Failed to load course catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (course) => {
    setSelectedCourse(course);
    setShowSubscriptionModal(true);
  };

  const handlePayment = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);
      addNotification('Initializing payment...', 'info');

      // Load Razorpay script first
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay not available on window object');
      }

      // Simple payment without order_id (direct payment flow)
      const amount = selectedCourse.pricing[selectedPricing] * 100; // Convert to paise

      const options = {
        key: 'rzp_test_ROysXhPNhStyyy', // Updated with new working credentials
        amount: amount,
        currency: 'INR',
        name: 'Education Platform',
        description: `Subscription for ${selectedCourse.name}`,
        // Removed order_id to use direct payment flow
        handler: function (response) {
          console.log('Payment successful:', response);
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            addNotification('Payment cancelled', 'warning');
            setLoading(false);
          }
        }
      };

      console.log('Opening Razorpay with options:', options);
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      addNotification('Payment failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      console.log('Payment successful, response:', response);
      addNotification('Payment successful! Creating subscription...', 'success');

      // Simulate subscription creation
      setTimeout(() => {
        addNotification('Subscription created successfully! Welcome to your course.', 'success');
        setShowSubscriptionModal(false);
        setSelectedCourse(null);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Payment success handling error:', error);
      addNotification('Payment successful but subscription creation failed. Please contact support.', 'error');
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${price}`;
  };

  const getDiscountedPrice = (price, type) => {
    if (type === 'quarterly') return Math.round(price * 3 * 0.9); // 10% discount
    if (type === 'yearly') return Math.round(price * 12 * 0.8); // 20% discount
    return price;
  };

  const filteredCourses = courseTypes.filter(courseType => {
    if (filters.courseType && courseType.id !== parseInt(filters.courseType)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return courseType.name.toLowerCase().includes(searchLower) ||
             courseType.courses.some(course => 
               course.name.toLowerCase().includes(searchLower) ||
               (course.classes && course.classes.some(cls => cls.name.toLowerCase().includes(searchLower))) ||
               (course.exams && course.exams.some(exam => exam.name.toLowerCase().includes(searchLower)))
             );
    }
    return true;
  });

  return (
    <div className="student-course-catalog">
      <div className="page-header">
        <h2>Course Catalog</h2>
        <p>Explore and subscribe to our comprehensive learning programs</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.courseType}
              onChange={(e) => setFilters(prev => ({ ...prev, courseType: e.target.value }))}
              className="form-input"
            >
              <option value="">All Course Types</option>
              {courseTypes.map(courseType => (
                <option key={courseType.id} value={courseType.id}>
                  {courseType.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="form-input"
            >
              <option value="">All Prices</option>
              <option value="0-500">Under ₹500</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="1000+">Above ₹1000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Types */}
      {loading ? (
        <div className="loading">Loading course catalog...</div>
      ) : (
        <div className="course-types-section">
          {filteredCourses.map(courseType => (
            <div key={courseType.id} className="course-type-section">
              <div className="course-type-header">
                <div className="course-type-icon">{courseType.icon}</div>
                <div className="course-type-info">
                  <h3>{courseType.name}</h3>
                  <p>{courseType.description}</p>
                </div>
              </div>

              <div className="courses-grid">
                {courseType.courses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <h4>{course.name}</h4>
                      <p>{course.description}</p>
                    </div>

                    {/* Classes */}
                    {course.classes && course.classes.map(cls => (
                      <div key={cls.id} className="class-card">
                        <div className="class-header">
                          <h5>{cls.name}</h5>
                          <div className="class-meta">
                            <span className="difficulty">{cls.difficulty}</span>
                            <span className="duration">{cls.duration}</span>
                          </div>
                        </div>

                        <div className="content-stats">
                          <div className="stat">
                            <span className="stat-number">{cls.subjectCount}</span>
                            <span className="stat-label">Subjects</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{cls.topicCount}</span>
                            <span className="stat-label">Topics</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{cls.moduleCount}</span>
                            <span className="stat-label">Modules</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{cls.chapterCount}</span>
                            <span className="stat-label">Chapters</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{cls.questionCount}</span>
                            <span className="stat-label">Questions</span>
                          </div>
                        </div>

                        <div className="subjects-preview">
                          <h6>Subjects Included:</h6>
                          <div className="subjects-list">
                            {cls.subjects.map((subject, index) => (
                              <div key={index} className="subject-item">
                                <span className="subject-name">{subject.name}</span>
                                <span className="subject-stats">
                                  {subject.topicCount}T, {subject.moduleCount}M, {subject.chapterCount}C, {subject.questionCount}Q
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pricing-section">
                          <div className="pricing-options">
                            <div className="pricing-option">
                              <span className="pricing-period">Monthly</span>
                              <span className="pricing-amount">{formatPrice(cls.pricing.monthly)}</span>
                            </div>
                            <div className="pricing-option recommended">
                              <span className="pricing-period">Quarterly</span>
                              <span className="pricing-amount">{formatPrice(getDiscountedPrice(cls.pricing.monthly, 'quarterly'))}</span>
                              <span className="discount">10% OFF</span>
                            </div>
                            <div className="pricing-option best-value">
                              <span className="pricing-period">Yearly</span>
                              <span className="pricing-amount">{formatPrice(getDiscountedPrice(cls.pricing.monthly, 'yearly'))}</span>
                              <span className="discount">20% OFF</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          className="btn btn-primary subscribe-btn"
                          onClick={() => handleSubscribe(cls)}
                        >
                          Subscribe Now
                        </button>
                      </div>
                    ))}

                    {/* Exams */}
                    {course.exams && course.exams.map(exam => (
                      <div key={exam.id} className="class-card">
                        <div className="class-header">
                          <h5>{exam.name}</h5>
                          <div className="class-meta">
                            <span className="difficulty">{exam.difficulty}</span>
                            <span className="duration">{exam.duration}</span>
                          </div>
                        </div>

                        <div className="content-stats">
                          <div className="stat">
                            <span className="stat-number">{exam.subjectCount}</span>
                            <span className="stat-label">Subjects</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{exam.topicCount}</span>
                            <span className="stat-label">Topics</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{exam.moduleCount}</span>
                            <span className="stat-label">Modules</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{exam.chapterCount}</span>
                            <span className="stat-label">Chapters</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{exam.questionCount}</span>
                            <span className="stat-label">Questions</span>
                          </div>
                        </div>

                        <div className="subjects-preview">
                          <h6>Subjects Included:</h6>
                          <div className="subjects-list">
                            {exam.subjects.map((subject, index) => (
                              <div key={index} className="subject-item">
                                <span className="subject-name">{subject.name}</span>
                                <span className="subject-stats">
                                  {subject.topicCount}T, {subject.moduleCount}M, {subject.chapterCount}C, {subject.questionCount}Q
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pricing-section">
                          <div className="pricing-options">
                            <div className="pricing-option">
                              <span className="pricing-period">Monthly</span>
                              <span className="pricing-amount">{formatPrice(exam.pricing.monthly)}</span>
                            </div>
                            <div className="pricing-option recommended">
                              <span className="pricing-period">Quarterly</span>
                              <span className="pricing-amount">{formatPrice(getDiscountedPrice(exam.pricing.monthly, 'quarterly'))}</span>
                              <span className="discount">10% OFF</span>
                            </div>
                            <div className="pricing-option best-value">
                              <span className="pricing-period">Yearly</span>
                              <span className="pricing-amount">{formatPrice(getDiscountedPrice(exam.pricing.monthly, 'yearly'))}</span>
                              <span className="discount">20% OFF</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          className="btn btn-primary subscribe-btn"
                          onClick={() => handleSubscribe(exam)}
                        >
                          Subscribe Now
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content subscription-modal">
            <div className="modal-header">
              <h3>Subscribe to {selectedCourse.name}</h3>
              <button 
                className="btn-close"
                onClick={() => setShowSubscriptionModal(false)}
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
                        <span className="pricing-amount">{formatPrice(selectedCourse.pricing.monthly)}</span>
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
                    <div className="pricing-card recommended">
                      <div className="pricing-header">
                        <span className="pricing-period">Quarterly</span>
                        <span className="pricing-amount">{formatPrice(getDiscountedPrice(selectedCourse.pricing.monthly, 'quarterly'))}</span>
                        <span className="discount">10% OFF</span>
                      </div>
                      <p className="pricing-description">Great value for committed learners</p>
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
                    <div className="pricing-card best-value">
                      <div className="pricing-header">
                        <span className="pricing-period">Yearly</span>
                        <span className="pricing-amount">{formatPrice(getDiscountedPrice(selectedCourse.pricing.monthly, 'yearly'))}</span>
                        <span className="discount">20% OFF</span>
                      </div>
                      <p className="pricing-description">Best value for serious students</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="total-amount">
                <div className="amount-breakdown">
                  <span>Plan: {selectedPricing.charAt(0).toUpperCase() + selectedPricing.slice(1)}</span>
                  <span>{formatPrice(selectedCourse.pricing[selectedPricing])}</span>
                </div>
                <div className="amount-total">
                  <span>Total Amount</span>
                  <span>{formatPrice(selectedCourse.pricing[selectedPricing])}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourseCatalog;
