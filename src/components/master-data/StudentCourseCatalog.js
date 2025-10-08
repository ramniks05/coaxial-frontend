import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createSubscription, verifyPayment } from '../../services/subscriptionService';
import { getCourseCatalog } from '../../services/studentService';
import { loadRazorpayScript } from '../../utils/razorpay';

// Shared Catalogue Card Component
const CatalogueCard = ({ item, onSubscribe, formatPrice, isSubscribed }) => {
  const itemName = item.name || item.className || item.examName || item.courseName;
  const difficulty = item.difficulty || item.level;
  
  return (
    <div className="class-card">
      <div className="class-header">
        <h5>{itemName}</h5>
        <div className="class-meta">
          <span className="difficulty">{difficulty}</span>
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
          <div className="pricing-option best-value">
            <span className="pricing-period">Yearly</span>
            <span className="pricing-amount">{formatPrice(item.pricing.yearlyFinalPrice || 0)}</span>
            {item.pricing?.yearlyDiscountPercent > 0 && (
              <span className="discount">{item.pricing.yearlyDiscountPercent}% OFF</span>
            )}
          </div>
        </div>
      </div>

      <button 
        className={isSubscribed ? 'btn btn-secondary subscribe-btn' : 'btn btn-primary subscribe-btn'}
        onClick={() => onSubscribe(item)}
        disabled={isSubscribed}
      >
        {isSubscribed ? '✓ Subscribed' : 'Subscribe Now'}
      </button>
    </div>
    </div>
};

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
  const [subscribedItems, setSubscribedItems] = useState(new Set());
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
      const data = await getCourseCatalog();
      
      if (data.success) {
        const sections = [];
        
        if (data.classes && data.classes.length > 0) {
          sections.push({ 
            id: 1, 
            name: 'Academic Classes', 
            description: 'School curriculum courses for all grades', 
            icon: '🎓', 
            items: data.classes.map(cls => ({ ...cls, name: cls.className })) 
          });
        }
        
        if (data.exams && data.exams.length > 0) {
          const examsWithCounts = data.exams.map(exam => {
            const totalModules = exam.subjects?.reduce((sum, s) => sum + (s.moduleCount || 0), 0) || 0;
            const totalChapters = exam.subjects?.reduce((sum, s) => sum + (s.chapterCount || 0), 0) || 0;
            return { ...exam, name: exam.examName, moduleCount: totalModules, chapterCount: totalChapters };
          });
          sections.push({ 
            id: 2, 
            name: 'Competitive Exams', 
            description: 'Preparation courses for competitive examinations', 
            icon: '🏆', 
            items: examsWithCounts 
          });
        }
        
        if (data.courses && data.courses.length > 0) {
          sections.push({ 
            id: 3, 
            name: 'Professional Courses', 
            description: 'Skill-based professional development courses', 
            icon: '💼', 
            items: data.courses.map(course => ({ ...course, name: course.courseName })) 
          });
        }
        
        setCourseTypes(sections);
        addNotification({ type: 'success', message: 'Course catalog loaded!', duration: 3000 });
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      addNotification({ type: 'error', message: 'Failed to load course catalog', duration: 6000 });
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
      addNotification({ type: 'info', message: 'Creating subscription...', duration: 3000 });
      const subscriptionData = {
        subscriptionLevel: selectedCourse.type === 'class' ? 'CLASS' : selectedCourse.type === 'exam' ? 'EXAM' : 'COURSE',
        entityId: selectedCourse.id,
        amount: selectedCourse.pricing[selectedPricing + 'FinalPrice'] || selectedCourse.pricing[selectedPricing + 'Price'] || 0,
        durationDays: selectedPricing === 'monthly' ? 30 : selectedPricing === 'quarterly' ? 90 : 365
      };
      const response = await createSubscription(token, subscriptionData);
      if (!response.order || !response.order.id) throw new Error('Failed to create Razorpay order');
      const notes = JSON.parse(response.order.notes);
      const subscriptionId = parseInt(notes.subscription_id);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load Razorpay script');
      if (!window.Razorpay) throw new Error('Razorpay not available');
      const options = {
        key: response.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: response.order.amount,
        currency: 'INR',
        order_id: response.order.id,
        name: 'Coaxial LMS',
        description: 'Course Subscription',
        handler: async function (paymentResponse) {
          try {
            const verificationData = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              subscriptionId: subscriptionId
            };
            const verifyResult = await verifyPayment(token, verificationData);
            if (verifyResult.success) {
              const itemKey = `_`;
              setSubscribedItems(prev => new Set([...prev, itemKey]));
              setShowSubscriptionModal(false);
              setSelectedCourse(null);
              setLoading(false);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            addNotification({ type: 'warning', message: 'Payment received! Activation in progress...', duration: 6000 });
            setShowSubscriptionModal(false);
            setSelectedCourse(null);
            setLoading(false);
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: function() {
            addNotification({ type: 'warning', message: 'Payment cancelled', duration: 4000 });
            setLoading(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        addNotification({ type: 'error', message: 'Payment failed: ' + response.error.description, duration: 6000 });
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      addNotification({ type: 'error', message: 'Failed to initialize payment: ' + error.message, duration: 6000 });
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
             (courseType.items && courseType.items.some(item => item.name?.toLowerCase().includes(searchLower)));
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
                {courseType.items && courseType.items.map(item => {
                  const itemKey = `_`;
                  const itemKey = `_`;
                  return <CatalogueCard key={item.id} item={item} onSubscribe={handleSubscribe} formatPrice={formatPrice} isSubscribed={isSubscribed} />;
                })}
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
                    <div className="pricing-card recommended">
                      <div className="pricing-header">
                        <span className="pricing-period">Quarterly</span>
                        <span className="pricing-amount">{formatPrice(selectedCourse.pricing.quarterlyFinalPrice || 0)}</span>
                        {selectedCourse.pricing?.quarterlyDiscountPercent > 0 && <span className="discount">{selectedCourse.pricing.quarterlyDiscountPercent}% OFF</span>}
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
                        <span className="pricing-amount">{formatPrice(selectedCourse.pricing.yearlyFinalPrice || 0)}</span>
                        {selectedCourse.pricing?.yearlyDiscountPercent > 0 && <span className="discount">{selectedCourse.pricing.yearlyDiscountPercent}% OFF</span>}
                      </div>
                      <p className="pricing-description">Best value for serious students</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="total-amount">
                <div className="amount-breakdown">
                  <span>Plan: {selectedPricing.charAt(0).toUpperCase() + selectedPricing.slice(1)}</span>
                  <span>{formatPrice(selectedCourse.pricing[selectedPricing + "FinalPrice"] || selectedCourse.pricing[selectedPricing + "Price"] || 0)}</span>
                </div>
                <div className="amount-total">
                  <span>Total Amount</span>
                  <span>{formatPrice(selectedCourse.pricing[selectedPricing + "FinalPrice"] || selectedCourse.pricing[selectedPricing + "Price"] || 0)}</span>
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















