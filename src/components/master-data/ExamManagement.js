import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createExam, deleteExam, getCourses, getExams, updateExam } from '../../services/masterDataService';
import './MasterDataComponent.css';

// Reusable DataCard Component
const DataCard = ({ 
  item, 
  itemType = 'item',
  onEdit, 
  onDelete,
  fields = [],
  badges = []
}) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };

  const renderField = (field) => {
    const { key, label, value, condition } = field;
    
    if (condition && !condition(item)) {
      return null;
    }
    
    // Handle function-based value extraction
    const fieldValue = typeof value === 'function' ? value(item) : (value || item[key]);
    
    if (!fieldValue) {
      return null;
    }
    
    return (
      <p key={key}>
        <strong>{label}:</strong> {fieldValue}
      </p>
    );
  };

  const renderBadge = (badge) => {
    const { key, label, value, condition, style, icon } = badge;
    
    if (condition && !condition(item)) {
      return null;
    }
    
    const badgeValue = value || item[key];
    
    if (!badgeValue) {
      return null;
    }

    return (
      <span 
        key={key}
        className="structure-badge"
        style={style}
      >
        {icon} {badgeValue}
      </span>
    );
  };

  const getItemName = () => {
    switch (itemType) {
      case 'subject':
        return item.subjectName || item.name;
      case 'topic':
        return item.topicName || item.name;
      case 'module':
        return item.name;
      case 'courseType':
        return item.name;
      case 'course':
        return item.name;
      case 'class':
        return item.name;
      case 'exam':
        return item.name;
      default:
        return item.name;
    }
  };

  const getItemDescription = () => {
    return item.description;
  };

  const getCreatedBy = () => {
    return item.createdByName;
  };

  return (
    <div className="data-card">
      <div className="card-header">
        <div className="card-title">
          <h4>{getItemName()}</h4>
          <div className="card-badges">
            <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
            {badges.map(renderBadge)}
          </div>
        </div>
        <div className="card-actions">
          <button 
            className="btn btn-outline btn-xs"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button 
            className="btn btn-danger btn-xs"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="card-content">
        {getItemDescription() && (
          <p className="description">{getItemDescription()}</p>
        )}
        
        {fields.map(renderField)}
      </div>
      
      <div className="card-footer">
        <small className="text-muted">
          Created: {new Date(item.createdAt).toLocaleDateString()}
          {getCreatedBy() && (
            <span> by {getCreatedBy()}</span>
          )}
        </small>
      </div>
    </div>
  );
};

/**
 * Exam Management Component
 * 
 * Features:
 * - 2-level filtering: Course Type → Course → Exams
 * - API automatically returns only active exams (isActive = true)
 * - Results are ordered by displayOrder and then by name
 * - Full CRUD operations for exams
 * - Dynamic course dropdown based on selected course type
 */

const ExamManagement = () => {
  const { token, addNotification } = useApp();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: { id: '' },
    displayOrder: '',
    isActive: true
  });

  useEffect(() => {
    if (token && !fetchDataInProgressRef.current) {
      fetchData();
    } else if (!token) {
      console.warn('No token available, skipping data fetch');
      addNotification({
        type: 'warning',
        message: 'Please log in to access exam management features',
        duration: 5000
      });
    }
  }, [token]);

  // Refs for preventing duplicate calls and managing state
  const isInitialMountRef = useRef(true);
  const hasInitialFetchRef = useRef(false);
  const coursesAbortRef = useRef(null);
  const coursesCacheRef = useRef({ data: null, ts: 0, courseTypeId: null });
  const lastCoursesQueryRef = useRef('');
  const lastCoursesQueryTimeRef = useRef(0);
  const fetchDataInProgressRef = useRef(false);

  // Combined effect for handling filter changes
  useEffect(() => {
    // Skip initial mount to avoid duplicate calls
    if (isInitialMountRef.current || !hasInitialFetchRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    if (selectedCourse) {
      // Handle course change - fetch exams for specific course
      console.log('Course changed to:', selectedCourse);
      fetchExams(null, selectedCourse);
    } else {
      // Handle "All Competitive Courses" selection - fetch all competitive exams
      console.log('Fetching all competitive exams');
      fetchExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  // Abort/dedup/cache controls
  const examsAbortRef = useRef(null);
  const examsCacheRef = useRef(new Map()); // key => { data, ts }
  const lastExamsKeyRef = useRef('');
  const lastExamsAtRef = useRef(0);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (examsAbortRef.current) {
        try { examsAbortRef.current.abort(); } catch(_) {}
      }
      if (coursesAbortRef.current) {
        try { coursesAbortRef.current.abort(); } catch(_) {}
      }
    };
  }, []);

  const fetchData = async () => {
    // Prevent duplicate calls
    if (fetchDataInProgressRef.current) {
      console.log('fetchData already in progress, skipping duplicate call');
      return;
    }
    
    try {
      fetchDataInProgressRef.current = true;
      setLoading(true);
      
      // Debug token information
      console.log('ExamManagement - Token status:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      });
      
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }
      
      // Auto-fetch competitive courses (course type ID = 2) using getCourses with courseTypeId parameter
      const now = Date.now();
      const competitiveKey = 'courseType:2';
      // 5s cache; if no fresh cache, always fetch (no hard skip)
      const cacheFresh = (
        coursesCacheRef.current.courseTypeId === 2 &&
        coursesCacheRef.current.data &&
        now - coursesCacheRef.current.ts < 5000
      );
      if (cacheFresh) {
        setCourses(coursesCacheRef.current.data);
      } else {
        // Abort previous and fetch to ensure we aren't blocked
        if (coursesAbortRef.current) {
          try { coursesAbortRef.current.abort(); } catch(_) {}
        }
        coursesAbortRef.current = new AbortController();
        // Record key/time BEFORE awaiting to avoid concurrent duplicates
        lastCoursesQueryRef.current = competitiveKey;
        lastCoursesQueryTimeRef.current = now;
        const competitiveCoursesData = await getCourses(token, 2, 0, 100); // courseTypeId=2, page=0, size=100
        const coursesArray = competitiveCoursesData.content || competitiveCoursesData;
        const processed = Array.isArray(coursesArray) ? coursesArray : [];
        setCourses(processed);
        coursesCacheRef.current = { data: processed, ts: now, courseTypeId: 2 };
      }

      // Exams with 5s cache + 1.5s dedup
      const examsKey = 'type:|course:'; // initial, no filters
      let examsData;
      const cached = examsCacheRef.current.get(examsKey);
      if (cached && now - cached.ts < 5000) {
        examsData = cached.data;
      } else {
        if (examsKey === lastExamsKeyRef.current && now - lastExamsAtRef.current < 2000) {
          // skip duplicate initial fetch
          examsData = null;
        } else {
          if (examsAbortRef.current) {
            try { examsAbortRef.current.abort(); } catch(_) {}
          }
          examsAbortRef.current = new AbortController();
          // Record last key/time BEFORE awaiting to dedup concurrent triggers
          lastExamsKeyRef.current = examsKey;
          lastExamsAtRef.current = now;
          examsData = await getExams(token);
          examsCacheRef.current.set(examsKey, { data: examsData, ts: now });
        }
      }
      
      console.log('ExamManagement - Raw API responses:', { examsData });
      
      // Handle paginated response - extract content array for exams
      if (examsData) {
        const examsArray = examsData.content || examsData;
        setExams(Array.isArray(examsArray) ? examsArray : []);
      }
      // Courses were set above via cache/dedup logic
      
      console.log('ExamManagement - Processed data:', {
        examsCount: Array.isArray(exams) ? exams.length : 0,
        coursesCount: Array.isArray(courses) ? courses.length : 0
      });
      
      // Mark that initial fetch is complete
      hasInitialFetchRef.current = true;
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch data';
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('No authentication token')) {
        errorMessage = 'Please log in to access this feature.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 7000
      });
    } finally {
      setLoading(false);
      fetchDataInProgressRef.current = false;
    }
  };


  const fetchExams = async (courseTypeId = null, courseId = null) => {
    try {
      setLoading(true);
      // Convert string values to numbers for API call
      const typeId = courseTypeId ? parseInt(courseTypeId) : null;
      const id = courseId ? parseInt(courseId) : null;
      
      // cache key + 5s cache + 1.5s dedup + abort
      const key = `type:${typeId || ''}|course:${id || ''}`;
      const now = Date.now();
      const cached = examsCacheRef.current.get(key);
      let data;
      if (cached && now - cached.ts < 5000) {
        data = cached.data;
      } else {
        if (key === lastExamsKeyRef.current && now - lastExamsAtRef.current < 2000) {
          data = [];
        } else {
          if (examsAbortRef.current) {
            try { examsAbortRef.current.abort(); } catch(_) {}
          }
          examsAbortRef.current = new AbortController();
          // Record last key/time BEFORE awaiting to dedup concurrent triggers
          lastExamsKeyRef.current = key;
          lastExamsAtRef.current = now;
          data = await getExams(token, typeId, id);
          examsCacheRef.current.set(key, { data, ts: now });
        }
      }
      
      // Handle paginated response - extract content array for exams
      const examsArray = data.content || data;
      setExams(Array.isArray(examsArray) ? examsArray : []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch exams',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        addNotification({
          type: 'error',
          message: 'Exam name is required',
          duration: 5000
        });
        return;
      }
      
      if (!formData.course.id) {
        addNotification({
          type: 'error',
          message: 'Course is required',
          duration: 5000
        });
        return;
      }
      
      // Prepare data in the correct format according to backend requirements
      const submitData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '', // Ensure description is never null
        courseId: parseInt(formData.course.id),
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
        isActive: formData.isActive
      };
      
      console.log('Form data being submitted:', submitData);
      
      if (editingId) {
        await updateExam(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Exam updated successfully',
          duration: 3000
        });
      } else {
        await createExam(token, submitData);
        addNotification({
          type: 'success',
          message: 'Exam created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', course: { id: '' }, displayOrder: '', isActive: true });
      
      // Clear caches to ensure fresh data
      examsCacheRef.current.clear();
      coursesCacheRef.current = { data: null, ts: 0, courseTypeId: null };
      
      // Refresh the exam list with current filters
      if (selectedCourse) {
        fetchExams(null, selectedCourse);
      } else {
        fetchExams();
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      addNotification({
        type: 'error',
        message: `Failed to save exam: ${error.message}`,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam) => {
    const courseId = exam.course?.id || exam.courseId;
    
    setFormData({
      name: exam.name,
      description: exam.description || '',
      course: { id: courseId || '' },
      displayOrder: exam.displayOrder || '',
      isActive: exam.isActive
    });
    
    if (courseId) {
      setSelectedCourse(courseId.toString());
    }
    
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        setLoading(true);
        await deleteExam(token, id);
        addNotification({
          type: 'success',
          message: 'Exam deleted successfully',
          duration: 3000
        });
        
        // Clear caches to ensure fresh data
        examsCacheRef.current.clear();
        coursesCacheRef.current = { data: null, ts: 0, courseTypeId: null };
        
        // Refresh the exam list with current filters
        if (selectedCourse) {
          fetchExams(null, selectedCourse);
        } else {
          fetchExams();
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete exam',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', course: { id: '' }, displayOrder: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getCourseName = (courseId) => {
    if (!Array.isArray(courses)) {
      console.warn('courses is not an array:', courses);
      return 'Unknown';
    }
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
  };

  const getCourseTypeName = (courseTypeId) => {
    // For competitive exams, always return 'Competitive'
    return 'Competitive';
  };


  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Exam Management</h2>
          <p>Manage exams for all course types (e.g., JEE, NEET, UPSC, Mid-term, Final)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Exam
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="course-filter">Competitive Course:</label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
          >
            <option value="">All Competitive Courses</option>
            {Array.isArray(courses) && courses.length > 0 ? courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            )) : (
              <option value="" disabled>No competitive courses available</option>
            )}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Exam' : 'Add New Exam'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Exam Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                  placeholder="e.g., JEE Main, NEET, UPSC Prelims"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="course">Course *</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    course: { id: e.target.value }
                  })}
                  className="form-input"
                  required
                >
                  <option value="">Select Competitive Course</option>
                  {Array.isArray(courses) && courses.length > 0 ? courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  )) : (
                    <option value="" disabled>No competitive courses available - Create a competitive course first</option>
                  )}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  placeholder="Brief description of this exam"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="displayOrder">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 1, 2, 3"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  name="isActive"
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="form-input"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update Exam' : 'Create Exam')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Exams ({exams.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (selectedCourse) {
                  fetchExams(null, selectedCourse);
                } else {
                  fetchExams();
                }
              }}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No Exams</div>
            <h4>No Exams Found</h4>
            <p>
              {selectedCourse ? `No active exams found for the selected course.` : 'No active exams have been created yet.'}
            </p>
            <p className="text-muted">
              <small>Note: Only active exams are displayed. Results are ordered by display order and name.</small>
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create First Exam
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {exams.map((exam) => {
              // Exam field configuration with complex fallback logic
              const examFields = [
                { 
                  key: 'courseTypeName', 
                  label: 'Course Type',
                  value: (item) => item.courseTypeName || item.course?.courseTypeName || getCourseTypeName(item.course?.courseType?.id || item.courseType?.id || item.courseTypeId)
                },
                { 
                  key: 'courseName', 
                  label: 'Course',
                  value: (item) => item.courseName || getCourseName(item.course?.id || item.courseId)
                }
              ];

              return (
                <DataCard
                  key={exam.id}
                  item={exam}
                  itemType="exam"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  fields={examFields}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
