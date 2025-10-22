import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFilterSubmit } from '../../hooks/useFilterSubmit';
import { getCourseTypesCached } from '../../services/globalApiCache';
import { createClass, deleteClass, getClasses, getCourses, updateClass } from '../../services/masterDataService';
import AdminPageHeader from '../common/AdminPageHeader';
import { getClassFilterConfig, getInitialFilters } from './filters/filterConfigs';
import FilterPanel from './filters/FilterPanel';
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

const ClassManagement = () => {
  const { token, addNotification } = useApp();
  const [classes, setClasses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Old filter states removed - now using useFilterSubmit hook
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: { id: '' },
    isActive: true
  });

  // Optimization refs for request deduplication and caching
  const classesAbortRef = useRef(null);
  const coursesAbortRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const hasInitialFetchRef = useRef(false);
  const lastClassesQueryRef = useRef('');
  const lastClassesQueryTimeRef = useRef(0);
  const classesCacheRef = useRef({ data: null, ts: 0 });
  const lastCoursesQueryRef = useRef('');
  const lastCoursesQueryTimeRef = useRef(0);
  const coursesCacheRef = useRef({ data: null, ts: 0 });
  
  // Form focus management
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  
  // State declarations
  const [coursesByType, setCoursesByType] = useState([]);
  
  // Filter state and handlers
  const initialFilters = getInitialFilters('class');
  const filterConfig = getClassFilterConfig({ courseTypes, courses: coursesByType });
  
  // Fetch data function for filters
  const fetchDataWithFilters = useCallback(async (filters) => {
    if (!token) return [];
    
    try {
      const data = await getClasses(token);
      let filteredData = Array.isArray(data) ? data : [];
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply course type filter
      if (filters.courseTypeId) {
        filteredData = filteredData.filter(item => 
          item.course?.courseType?.id === parseInt(filters.courseTypeId)
        );
      }
      
      // Apply course filter
      if (filters.courseId) {
        filteredData = filteredData.filter(item => 
          item.course?.id === parseInt(filters.courseId)
        );
      }
      
      // Apply active filter
      if (filters.isActive) {
        filteredData = filteredData.filter(item => item.isActive === true);
      }
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching classes with filters:', error);
      addNotification({ 
        message: 'Failed to load classes', 
        type: 'error' 
      });
      return [];
    }
  }, [token, addNotification]);
  
  // Filter management
  const {
    filters,
    loading: filterLoading,
    hasChanges,
    handleFilterChange,
    applyFilters,
    clearFilters
  } = useFilterSubmit(initialFilters, fetchDataWithFilters, {
    autoFetchOnMount: true
  });
  
  // Focus management - focus first input when form is shown
  useEffect(() => {
    if (showForm && firstInputRef.current) {
      // Small delay to ensure form is rendered
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [showForm]);

  // Update classes when filters are applied
  useEffect(() => {
    const updateClasses = async () => {
      try {
        const filteredData = await applyFilters();
        setClasses(filteredData);
      } catch (error) {
        console.error('Error applying filters:', error);
        setClasses([]);
      }
    };

    updateClasses();
  }, [applyFilters]);

  // Old filter effect removed - now using useFilterSubmit hook

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (classesAbortRef.current) {
        try { classesAbortRef.current.abort(); } catch(_) {}
      }
      if (coursesAbortRef.current) {
        try { coursesAbortRef.current.abort(); } catch(_) {}
      }
    };
  }, []);

  const fetchData = async () => {
    console.log('fetchData called');
    try {
      setLoading(true);
      
      // Debug token information
      console.log('Token status:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      });
      
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }
      
      // Use optimized fetchClasses instead of direct API call
      console.log('Fetching course types...');
      const courseTypesData = await getCourseTypesCached(token);
      console.log('Raw courseTypes API response (ClassManagement):', courseTypesData);
      console.log('CourseTypes data type:', typeof courseTypesData);
      console.log('CourseTypes is array:', Array.isArray(courseTypesData));
      
      // Handle different response formats
      let courseTypesArray = [];
      if (Array.isArray(courseTypesData)) {
        courseTypesArray = courseTypesData;
      } else if (courseTypesData && Array.isArray(courseTypesData.content)) {
        // Handle paginated response
        courseTypesArray = courseTypesData.content;
      } else if (courseTypesData && Array.isArray(courseTypesData.data)) {
        // Handle wrapped response
        courseTypesArray = courseTypesData.data;
      } else if (courseTypesData && courseTypesData.courseTypes && Array.isArray(courseTypesData.courseTypes)) {
        // Handle nested response
        courseTypesArray = courseTypesData.courseTypes;
      } else {
        console.warn('Unexpected courseTypes data format (ClassManagement):', courseTypesData);
        courseTypesArray = [];
      }
      
      console.log('Processed courseTypes array (ClassManagement):', courseTypesArray);
      setCourseTypes(courseTypesArray);
      
      // Old auto-filter logic removed - now using FilterPanel
      
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
    }
  };

  const fetchClasses = async (courseTypeId = null, courseId = null) => {
    console.log('fetchClasses called with:', { courseTypeId, courseId });
    try {
      setLoading(true);
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Create query key for deduplication and caching
      const queryKey = `classes_${courseTypeId || 'all'}_${courseId || 'all'}`;
      const now = Date.now();
      
      // Check short-lived cache (5 seconds)
      if (classesCacheRef.current.data && 
          classesCacheRef.current.queryKey === queryKey && 
          now - classesCacheRef.current.ts < 5000) {
        console.log('Using cached classes data for:', queryKey);
        setClasses(classesCacheRef.current.data);
        setLoading(false);
        return;
      }
      
      // Check for duplicate requests (1.5 second deduplication window)
      if (lastClassesQueryRef.current === queryKey && 
          now - lastClassesQueryTimeRef.current < 1500) {
        console.log('Skipping duplicate classes request:', queryKey);
        setLoading(false);
        return;
      }
      
      // Cancel previous request
      if (classesAbortRef.current) {
        try { classesAbortRef.current.abort(); } catch(_) {}
      }
      
      // Create new abort controller
      classesAbortRef.current = new AbortController();
      
      console.log('fetchClasses called with:', {
        courseTypeId,
        courseId,
        hasToken: !!token,
        queryKey,
        // Old filter variables removed
      });
      
      // Update query tracking
      lastClassesQueryRef.current = queryKey;
      lastClassesQueryTimeRef.current = now;
      
      // Call API with correct parameters (courseTypeId, courseId)
      const data = await getClasses(token, courseTypeId || null, courseId || null, classesAbortRef.current.signal);
      
      console.log('API response for classes:', data);
      
      // Handle paginated response - extract content array
      const classesArray = data.content || data;
      let filteredData = Array.isArray(classesArray) ? classesArray : [];
      
      console.log('Classes array before filtering:', filteredData);
      console.log('Filtering by courseTypeId:', courseTypeId);
      
      // Additional frontend filtering if needed (for courseTypeId filtering)
      if (courseTypeId && !courseId) {
        // Filter by course type on frontend since API doesn't support courseTypeId directly
        const originalLength = filteredData.length;
        console.log('Starting frontend filtering with courseTypeId:', courseTypeId);
        console.log('Original data length:', originalLength);
        
        filteredData = filteredData.filter(cls => {
          // Try multiple ways to get the course type ID
          const clsCourseTypeId = cls.course?.courseType?.id || 
                                 cls.courseType?.id || 
                                 cls.courseTypeId ||
                                 cls.course?.courseTypeId;
          
          // Also check if it's an academic course by structureType or courseTypeName
          const isAcademic = cls.structureType === 'ACADEMIC' || 
                           (cls.courseTypeName && cls.courseTypeName.toLowerCase().includes('academic'));
          
          console.log('Class filtering check:', {
            id: cls.id,
            name: cls.name,
            clsCourseTypeId: clsCourseTypeId,
            expectedCourseTypeId: parseInt(courseTypeId),
            structureType: cls.structureType,
            courseTypeName: cls.courseTypeName,
            isAcademic: isAcademic,
            match: clsCourseTypeId === parseInt(courseTypeId) || isAcademic,
            course: cls.course,
            courseType: cls.courseType
          });
          
          // Match by course type ID or by academic structure
          return clsCourseTypeId === parseInt(courseTypeId) || isAcademic;
        });
        console.log(`Filtered ${originalLength} classes to ${filteredData.length} classes for course type ${courseTypeId}`);
      } else {
        console.log('No frontend filtering applied - showing all classes');
      }
      
      // Update cache
      classesCacheRef.current = {
        data: filteredData,
        queryKey,
        ts: now
      };
      
      console.log('Setting classes state with:', filteredData);
      setClasses(filteredData);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Classes request was aborted');
        return;
      }
      
      console.error('Error fetching classes:', error);
      console.error('Error details:', { courseTypeId, courseId, errorMessage: error.message });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch classes';
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.message.includes('No authentication token')) {
        errorMessage = 'Please log in to access this feature.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare data in the correct format according to backend requirements
      const submitData = {
        name: formData.name,
        description: formData.description,
        courseId: parseInt(formData.course.id), // Backend expects courseId as Long, not course object
        displayOrder: 0,
        isActive: formData.isActive
      };
      
      console.log('Submitting class data:', submitData);
      console.log('Token available:', !!token);
      
      // Validate required fields
      console.log('Form data validation:', {
        courseId: formData.course.id,
        courseIdType: typeof formData.course.id,
        hasCourseId: !!formData.course.id
      });
      
      if (!formData.course.id) {
        throw new Error('Please select a course');
      }
      
      if (editingId) {
        await updateClass(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Class updated successfully',
          duration: 3000
        });
      } else {
        await createClass(token, submitData);
        addNotification({
          type: 'success',
          message: 'Class created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', course: { id: '' }, isActive: true });
      
      // Refresh data using new filter system
      await applyFilters();
    } catch (error) {
      console.error('Error saving class:', error);
      addNotification({
        type: 'error',
        message: `Failed to save class: ${error.message}`,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem) => {
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      course: { id: classItem.course?.id || classItem.courseId || '' },
      isActive: classItem.isActive
    });
    setEditingId(classItem.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setLoading(true);
        await deleteClass(token, id);
        addNotification({
          type: 'success',
          message: 'Class deleted successfully',
          duration: 3000
        });
        
        // Refresh data using new filter system
        await applyFilters();
      } catch (error) {
        console.error('Error deleting class:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete class',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', course: { id: '' }, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getCourseTypeName = (courseTypeId) => {
    if (!Array.isArray(courseTypes)) {
      console.warn('courseTypes is not an array:', courseTypes);
      return 'Unknown';
    }
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : 'Unknown';
  };

  const getCourseName = (courseId) => {
    if (!Array.isArray(coursesByType)) {
      console.warn('coursesByType is not an array:', coursesByType);
      return 'Unknown';
    }
    const course = coursesByType.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
  };

  const isAcademicCourseType = (courseTypeId) => {
    if (!Array.isArray(courseTypes)) {
      console.warn('courseTypes is not an array:', courseTypes);
      return false;
    }
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    const isAcademic = courseType && courseType.name.toLowerCase().includes('academic');
    console.log('isAcademicCourseType check:', {
      courseTypeId,
      courseType,
      isAcademic
    });
    return isAcademic;
  };

  const getAcademicCourseTypes = () => {
    if (!Array.isArray(courseTypes)) {
      console.warn('courseTypes is not an array:', courseTypes);
      return [];
    }
    const academicTypes = courseTypes.filter(ct => ct.name.toLowerCase().includes('academic'));
    console.log('Available course types:', courseTypes);
    console.log('Academic course types:', academicTypes);
    return academicTypes;
  };

  const getAcademicCourses = () => {
    if (!Array.isArray(coursesByType)) {
      console.warn('coursesByType is not an array:', coursesByType);
      return [];
    }
    console.log('All courses:', coursesByType);
    const academicCourses = coursesByType.filter(c => {
      // Check courseTypeName directly first (most reliable)
      if (c.courseTypeName && c.courseTypeName.toLowerCase().includes('academic')) {
        console.log('Found academic course by courseTypeName:', c);
        return true;
      }
      // Fallback to checking course type lookup
      const isAcademic = isAcademicCourseType(c.courseType?.id || c.courseTypeId);
      if (isAcademic) {
        console.log('Found academic course by courseType lookup:', c);
      }
      return isAcademic;
    });
    console.log('Academic courses found:', academicCourses);
    return academicCourses;
  };

  const fetchCoursesByCourseType = async (courseTypeId) => {
    if (!courseTypeId || !token) {
      setCoursesByType([]);
      return;
    }
    
    try {
      // Create query key for deduplication and caching
      const queryKey = `courses_${courseTypeId}`;
      const now = Date.now();
      
      // Check short-lived cache (5 seconds)
      if (coursesCacheRef.current.data && 
          coursesCacheRef.current.queryKey === queryKey && 
          now - coursesCacheRef.current.ts < 5000) {
        console.log('Using cached courses data for:', queryKey);
        setCoursesByType(coursesCacheRef.current.data);
        return;
      }
      
      // Check for duplicate requests (1.5 second deduplication window)
      if (lastCoursesQueryRef.current === queryKey && 
          now - lastCoursesQueryTimeRef.current < 1500) {
        console.log('Skipping duplicate courses request:', queryKey);
        return;
      }
      
      // Cancel previous request
      if (coursesAbortRef.current) {
        try { coursesAbortRef.current.abort(); } catch(_) {}
      }
      
      // Create new abort controller
      coursesAbortRef.current = new AbortController();
      
      console.log('Fetching courses for course type:', courseTypeId);
      
      // Update query tracking
      lastCoursesQueryRef.current = queryKey;
      lastCoursesQueryTimeRef.current = now;
      
      const data = await getCourses(token, courseTypeId, 0, 100); // courseTypeId, page=0, size=100
      
      // Handle paginated response - extract content array for courses
      const coursesArray = data.content || data;
      const filteredData = Array.isArray(coursesArray) ? coursesArray : [];
      
      // Update cache
      coursesCacheRef.current = {
        data: filteredData,
        queryKey,
        ts: now
      };
      
      setCoursesByType(filteredData);
      
      console.log('Courses fetched for course type:', filteredData);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Courses request was aborted');
        return;
      }
      
      console.error('Error fetching courses by course type:', error);
      setCoursesByType([]);
      addNotification({
        type: 'error',
        message: 'Failed to fetch courses for selected course type',
        duration: 5000
      });
    }
  };

  const getCoursesByCourseTypeLocal = (courseTypeId) => {
    if (!courseTypeId) {
      return getAcademicCourses();
    }
    
    return coursesByType;
  };

  const getClassesForCourse = (courseId) => {
    if (!Array.isArray(classes)) {
      console.warn('classes is not an array:', classes);
      return [];
    }
    return classes.filter(c => c.course?.id === courseId || c.courseId === courseId);
  };

  return (
    <div className="master-data-component">
      <AdminPageHeader
        title="Class Management"
        subtitle="Manage classes for Academic course types only (e.g., Grade 1, Grade 2, Class A, Class B)"
        showAdminBadge={false}
        actions={(
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Class
          </button>
        )}
      />

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        loading={filterLoading}
        filterConfig={filterConfig}
        masterData={{ courseTypes, courses: coursesByType }}
        hasChanges={hasChanges}
      />

      {showForm && (
        <div className="form-section" ref={formRef}>
          <div className="form-header">
            <h3>{editingId ? 'Edit Class' : 'Add New Class'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Class Name *</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                  placeholder="e.g., Grade 1, Class A, Batch 2024"
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
                  <option value="">Select Course</option>
                  {getAcademicCourses().length === 0 ? (
                    <option value="" disabled>No Academic Courses Available - Create a course first</option>
                  ) : (
                    getAcademicCourses().map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.courseTypeName || getCourseTypeName(course.courseType?.id || course.courseTypeId)})
                      </option>
                    ))
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
                  placeholder="Brief description of this class"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="form-row">
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
                {loading ? 'Saving...' : (editingId ? 'Update Class' : 'Create Class')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Classes ({classes?.length || 0})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                // Clear cache to force fresh data fetch
                classesCacheRef.current = { data: null, ts: 0 };
                // Refresh data using new filter system
                applyFilters();
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
            <p>Loading classes...</p>
          </div>
        ) : (classes?.length || 0) === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No Classes</div>
            <h4>No Classes Found</h4>
            <p>
              No classes found. Create your first class.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Class
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {Array.isArray(classes) ? classes.map((classItem) => {
              // Class field configuration with complex fallback logic
              const classFields = [
                { 
                  key: 'courseTypeName', 
                  label: 'Course Type',
                  value: (item) => item.course?.courseTypeName || item.courseTypeName || getCourseTypeName(item.course?.courseType?.id || item.courseType?.id || item.courseTypeId)
                },
                { 
                  key: 'courseName', 
                  label: 'Course',
                  value: (item) => item.courseName || getCourseName(item.course?.id || item.courseId)
                }
              ];

              return (
                <DataCard
                  key={classItem.id}
                  item={classItem}
                  itemType="class"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  fields={classFields}
                />
              );
            }) : (
              <div className="empty-state">
                <div className="empty-icon">Error</div>
                <h4>Data Loading Error</h4>
                <p>Classes data is not in the expected format. Please refresh the page.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManagement;
