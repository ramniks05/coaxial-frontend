import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useFormManager } from '../../hooks/useFormManager';

const StudentSubscription = () => {
  const { token, addNotification } = useApp();
  // Using dummy data for now - will be replaced with actual API calls
  const courseTypes = [
    { id: 1, name: "Academic Course", description: "Complete school curriculum courses" },
    { id: 2, name: "Competitive Exam", description: "Preparation courses for various competitive examinations" },
    { id: 3, name: "Professional Course", description: "Skill-based professional development courses" }
  ];
  
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  
  // Dummy data for courses, classes, and exams
  const dummyCourses = [
    { id: 1, name: "Academic Course Class 1-10", courseTypeId: 1 },
    { id: 2, name: "SSC", courseTypeId: 2 },
    { id: 3, name: "Photography", courseTypeId: 3 }
  ];
  
  const dummyClasses = [
    { id: 6, name: "Grade 1", courseId: 1 },
    { id: 7, name: "Grade 2", courseId: 1 },
    { id: 8, name: "Grade 12", courseId: 4 }
  ];
  
  const dummyExams = [
    { id: 1, name: "SSC MTS", courseId: 2 },
    { id: 2, name: "SSC GD", courseId: 2 }
  ];
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Refs for deduplication
  const coursesLoadingRef = useRef(false);
  const classesLoadingRef = useRef(false);
  const examsLoadingRef = useRef(false);
  
  // Removed apiCall - using dummy data for now
  
  const { formData, errors, touched, handleInputChange, handleBlur, setFormData, resetForm } = useFormManager({
    courseTypeId: '',
    courseId: '',
    classId: '',
    examId: '',
    subscriptionType: 'class', // class, exam, course
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  });

  // Load course types on mount - using dummy data for now
  useEffect(() => {
    console.log('Course types loaded:', courseTypes);
  }, [courseTypes]);

  // Load subscriptions - using dummy data for now
  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummySubscriptions = [
        {
          id: 1,
          courseTypeId: 1,
          courseId: 1,
          classId: 6,
          examId: null,
          subscriptionType: 'class',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true
        }
      ];
      
      setSubscriptions(dummySubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Load courses when course type changes - using dummy data for now
  useEffect(() => {
    if (formData.courseTypeId && !coursesLoadingRef.current) {
      coursesLoadingRef.current = true;
      const filteredCourses = dummyCourses.filter(course => course.courseTypeId === parseInt(formData.courseTypeId));
      setCourses(filteredCourses);
      coursesLoadingRef.current = false;
    }
  }, [formData.courseTypeId]);

  // Load classes when course changes and subscription type is class - using dummy data for now
  useEffect(() => {
    if (formData.courseId && formData.subscriptionType === 'class' && !classesLoadingRef.current) {
      classesLoadingRef.current = true;
      const filteredClasses = dummyClasses.filter(cls => cls.courseId === parseInt(formData.courseId));
      setClasses(filteredClasses);
      classesLoadingRef.current = false;
    }
  }, [formData.courseId, formData.subscriptionType]);

  // Load exams when course changes and subscription type is exam - using dummy data for now
  useEffect(() => {
    if (formData.courseId && formData.subscriptionType === 'exam' && !examsLoadingRef.current) {
      examsLoadingRef.current = true;
      const filteredExams = dummyExams.filter(exam => exam.courseId === parseInt(formData.courseId));
      setExams(filteredExams);
      examsLoadingRef.current = false;
    }
  }, [formData.courseId, formData.subscriptionType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Using dummy data for now - simulate API call
      setTimeout(() => {
        const newSubscription = {
          id: Date.now(),
          courseTypeId: parseInt(formData.courseTypeId),
          courseId: parseInt(formData.courseId),
          classId: formData.subscriptionType === 'class' ? parseInt(formData.classId) : null,
          examId: formData.subscriptionType === 'exam' ? parseInt(formData.examId) : null,
          subscriptionType: formData.subscriptionType,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          isActive: formData.isActive
        };
        
        setSubscriptions(prev => [...prev, newSubscription]);
        addNotification('Subscription created successfully', 'success');
        resetForm();
        setShowAddForm(false);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      addNotification('Failed to create subscription', 'error');
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      setLoading(true);
      // Using dummy data for now - simulate API call
      setTimeout(() => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
        addNotification('Subscription deleted successfully', 'success');
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error deleting subscription:', error);
      addNotification('Failed to delete subscription', 'error');
      setLoading(false);
    }
  };

  const getSubscriptionDisplayText = (subscription) => {
    const courseType = courseTypes.find(ct => ct.id === subscription.courseTypeId);
    const course = courses.find(c => c.id === subscription.courseId);
    
    let text = `${courseType?.name || 'Unknown'} - ${course?.name || 'Unknown'}`;
    
    if (subscription.classId) {
      const classItem = classes.find(c => c.id === subscription.classId);
      text += ` - ${classItem?.name || 'Unknown Class'}`;
    } else if (subscription.examId) {
      const exam = exams.find(e => e.id === subscription.examId);
      text += ` - ${exam?.name || 'Unknown Exam'}`;
    }
    
    return text;
  };

  return (
    <div className="student-subscription">
      <div className="page-header">
        <h2>My Subscriptions</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={loading}
        >
          Add New Subscription
        </button>
      </div>

      {/* Add Subscription Form */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Subscription</h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subscriptionType">Subscription Type *</label>
                  <select
                    id="subscriptionType"
                    name="subscriptionType"
                    value={formData.subscriptionType}
                    onChange={(e) => handleInputChange('subscriptionType', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="course">Course Level</option>
                    <option value="class">Class Level</option>
                    <option value="exam">Exam Level</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="courseTypeId">Course Type *</label>
                  <select
                    id="courseTypeId"
                    name="courseTypeId"
                    value={formData.courseTypeId}
                    onChange={(e) => {
                      handleInputChange('courseTypeId', e.target.value);
                      setFormData(prev => ({ ...prev, courseId: '', classId: '', examId: '' }));
                    }}
                    className="form-input"
                    required
                  >
                    <option value="">Select Course Type</option>
                    {courseTypes.map(courseType => (
                      <option key={courseType.id} value={courseType.id}>
                        {courseType.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="courseId">Course *</label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={(e) => {
                      handleInputChange('courseId', e.target.value);
                      setFormData(prev => ({ ...prev, classId: '', examId: '' }));
                    }}
                    className="form-input"
                    required
                    disabled={!formData.courseTypeId}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.subscriptionType === 'class' && (
                  <div className="form-group">
                    <label htmlFor="classId">Class *</label>
                    <select
                      id="classId"
                      name="classId"
                      value={formData.classId}
                      onChange={(e) => handleInputChange('classId', e.target.value)}
                      className="form-input"
                      required
                      disabled={!formData.courseId}
                    >
                      <option value="">Select Class</option>
                      {classes.map(classItem => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.subscriptionType === 'exam' && (
                  <div className="form-group">
                    <label htmlFor="examId">Exam *</label>
                    <select
                      id="examId"
                      name="examId"
                      value={formData.examId}
                      onChange={(e) => handleInputChange('examId', e.target.value)}
                      className="form-input"
                      required
                      disabled={!formData.courseId}
                    >
                      <option value="">Select Exam</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Subscription'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="subscriptions-list">
        {loading && subscriptions.length === 0 ? (
          <div className="loading">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscriptions found. Create your first subscription to get started!</p>
          </div>
        ) : (
          <div className="subscription-cards">
            {subscriptions.map(subscription => (
              <div key={subscription.id} className="subscription-card">
                <div className="subscription-info">
                  <h4>{getSubscriptionDisplayText(subscription)}</h4>
                  <p className="subscription-details">
                    <span>Type: {subscription.subscriptionType}</span>
                    <span>Start: {new Date(subscription.startDate).toLocaleDateString()}</span>
                    {subscription.endDate && (
                      <span>End: {new Date(subscription.endDate).toLocaleDateString()}</span>
                    )}
                    <span className={`status ${subscription.isActive ? 'active' : 'inactive'}`}>
                      {subscription.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="subscription-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteSubscription(subscription.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubscription;
