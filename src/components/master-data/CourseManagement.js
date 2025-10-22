import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFilterSubmit } from '../../hooks/useFilterSubmit';
import { clearCoursesCache, getCourseTypesCached, getCoursesCached } from '../../services/globalApiCache';
import { createCourse, deleteCourse, updateCourse } from '../../services/masterDataService';
import AdminPageHeader from '../common/AdminPageHeader';
import { getCourseFilterConfig, getInitialFilters } from './filters/filterConfigs';
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

const CourseManagement = () => {
  const { token, addNotification } = useApp();
  const [courses, setCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Old filter states removed - now using useFilterSubmit hook
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: { id: '' },
    displayOrder: '',
    isActive: true
  });

  // Use refs to track if data has been fetched to prevent infinite loops
  const courseTypesFetched = useRef(false);
  const coursesFetched = useRef(false);
  const tokenRef = useRef(token);
  
  // Form focus management
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  
  // Filter state and handlers
  const initialFilters = getInitialFilters('course');
  const filterConfig = getCourseFilterConfig({ courseTypes });
  
  // Fetch data function for filters
  const fetchDataWithFilters = useCallback(async (filters) => {
    if (!token) return [];
    
    try {
      const data = await getCoursesCached(token);
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
          item.courseType?.id === parseInt(filters.courseTypeId)
        );
      }
      
      // Apply active filter
      if (filters.isActive) {
        filteredData = filteredData.filter(item => item.isActive === true);
      }
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching courses with filters:', error);
      addNotification({ 
        message: 'Failed to load courses', 
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
  
  // Update token ref when token changes
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  
  // Focus management - focus first input when form is shown
  useEffect(() => {
    if (showForm && firstInputRef.current) {
      // Small delay to ensure form is rendered
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }
  }, [showForm]);

  // Fetch course types on component mount (only once)
  useEffect(() => {
    if (courseTypesFetched.current || !tokenRef.current) return; // Prevent multiple calls or if no token
    
    const fetchCourseTypes = async () => {
      try {
        setLoading(true);
        const courseTypesResponse = await getCourseTypesCached(tokenRef.current);
        console.log('Raw courseTypes API response:', courseTypesResponse);
        console.log('CourseTypes data type:', typeof courseTypesResponse);
        console.log('CourseTypes is array:', Array.isArray(courseTypesResponse));
        
        // Handle different response formats
        let courseTypesArray = [];
        if (Array.isArray(courseTypesResponse)) {
          courseTypesArray = courseTypesResponse;
        } else if (courseTypesResponse && Array.isArray(courseTypesResponse.content)) {
          // Handle paginated response
          courseTypesArray = courseTypesResponse.content;
        } else if (courseTypesResponse && Array.isArray(courseTypesResponse.data)) {
          // Handle wrapped response
          courseTypesArray = courseTypesResponse.data;
        } else if (courseTypesResponse && courseTypesResponse.courseTypes && Array.isArray(courseTypesResponse.courseTypes)) {
          // Handle nested response
          courseTypesArray = courseTypesResponse.courseTypes;
        } else {
          console.warn('Unexpected courseTypes data format:', courseTypesResponse);
          courseTypesArray = [];
        }
        
        console.log('Processed courseTypes array:', courseTypesArray);
        setCourseTypes(courseTypesArray);
        courseTypesFetched.current = true; // Mark as fetched
      } catch (error) {
        console.error('Error fetching course types:', error);
        setCourseTypes([]);
        addNotification({
          type: 'error',
          message: `Failed to fetch course types: ${error.message}`,
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseTypes();
  }, []); // Empty dependency array - only run once on mount

  // Update courses when filters are applied
  useEffect(() => {
    const updateCourses = async () => {
      try {
        const filteredData = await applyFilters();
        setCourses(filteredData);
      } catch (error) {
        console.error('Error applying filters:', error);
        setCourses([]);
      }
    };

    updateCourses();
  }, [applyFilters]);

  // Refresh courses with current filters
  const fetchCourses = async () => {
    try {
      const filteredData = await applyFilters();
      setCourses(filteredData);
    } catch (error) {
      console.error('Error refreshing courses:', error);
      addNotification({
        type: 'error',
        message: `Failed to refresh courses: ${error.message}`,
        duration: 7000
      });
      setCourses([]);
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
          message: 'Course name is required',
          duration: 5000
        });
        return;
      }
      
      if (!formData.courseType.id) {
        addNotification({
          type: 'error',
          message: 'Course type is required',
          duration: 5000
        });
        return;
      }
      
      // Prepare data in the correct format
      const submitData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '', // Ensure description is never null
        courseType: { id: parseInt(formData.courseType.id) }, // Use nested object like creation
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
        isActive: formData.isActive
      };
      
      console.log('Form data being submitted:', submitData);
      console.log('Token available:', !!token);
      
      if (editingId) {
        // Use the same format as creation for updates
        console.log('Update data being submitted:', submitData);
        await updateCourse(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Course updated successfully',
          duration: 3000
        });
        clearCoursesCache(); // Clear cache to force refresh
        // Manually refresh the courses list
        await fetchCourses();
      } else {
        await createCourse(token, submitData);
        addNotification({
          type: 'success',
          message: 'Course created successfully',
          duration: 3000
        });
        clearCoursesCache(); // Clear cache to force refresh
        // Manually refresh the courses list
        await fetchCourses();
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', courseType: { id: '' }, displayOrder: '', isActive: true });
    } catch (error) {
      console.error('Error saving course:', error);
      addNotification({
        type: 'error',
        message: `Failed to save course: ${error.message}`,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    console.log('=== EDIT COURSE DEBUG ===');
    console.log('Editing course:', course);
    console.log('Available courseTypes:', courseTypes);
    console.log('CourseTypes length:', courseTypes?.length || 0);
    
    // Handle different possible course type data structures
    let courseTypeId = '';
    
    // Priority 1: Direct courseTypeId (most reliable for this API)
    if (course.courseTypeId) {
      courseTypeId = course.courseTypeId;
      console.log('Found courseTypeId:', courseTypeId);
    }
    // Priority 2: Nested courseType.id
    else if (course.courseType?.id) {
      courseTypeId = course.courseType.id;
      console.log('Found courseType.id:', courseTypeId);
    }
    // Priority 3: Match by courseTypeName
    else if (course.courseTypeName) {
      const matchingCourseType = courseTypes.find(ct => ct.name === course.courseTypeName);
      if (matchingCourseType) {
        courseTypeId = matchingCourseType.id;
        console.log('Found courseType by name match:', courseTypeId);
      }
    }
    // Priority 4: Other fallbacks
    else if (typeof course.courseType === 'string') {
      courseTypeId = course.courseType;
      console.log('Found courseType as string:', courseTypeId);
    } else if (typeof course.courseType === 'number') {
      courseTypeId = course.courseType.toString();
      console.log('Found courseType as number:', courseTypeId);
    }
    
    console.log('Final extracted courseTypeId:', courseTypeId);
    console.log('CourseTypeId type:', typeof courseTypeId);
    
    // Verify the courseTypeId exists in available courseTypes
    const matchingCourseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    console.log('Matching courseType found:', matchingCourseType);
    
    // Check if courseTypeId matches any available option
    const availableIds = (courseTypes || []).map(ct => ct.id);
    console.log('Available courseType IDs:', availableIds);
    console.log('Is courseTypeId in available IDs?', availableIds.includes(parseInt(courseTypeId)));
    
    const newFormData = {
      name: course.name || '',
      description: course.description || '',
      courseType: { id: courseTypeId },
      displayOrder: course.displayOrder || '',
      isActive: course.isActive !== undefined ? course.isActive : true
    };
    
    console.log('Setting formData to:', newFormData);
    setFormData(newFormData);
    setEditingId(course.id);
    setShowForm(true);
    console.log('=== END EDIT DEBUG ===');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setLoading(true);
        await deleteCourse(token, id);
        addNotification({
          type: 'success',
          message: 'Course deleted successfully',
          duration: 3000
        });
        clearCoursesCache(); // Clear cache to force refresh
        // Manually refresh the courses list
        await fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete course',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', courseType: { id: '' }, displayOrder: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getCourseTypeName = (courseTypeId) => {
    if (!courseTypeId) return 'Unknown';
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType ? courseType.name : 'Unknown';
  };

  // Group courses by course type
  const groupCoursesByType = () => {
    const grouped = {};
    
    (courses || []).forEach(course => {
      const courseTypeId = course.courseType?.id || course.courseTypeId;
      const courseTypeName = getCourseTypeName(courseTypeId);
      
      if (!grouped[courseTypeName]) {
        grouped[courseTypeName] = [];
      }
      grouped[courseTypeName].push(course);
    });
    
    return grouped;
  };

  const groupedCourses = groupCoursesByType();
  const courseTypeNames = Object.keys(groupedCourses).sort();

  return (
    <div className="master-data-component">
      <AdminPageHeader
        title="Course Management"
        subtitle="Manage courses for different course types (e.g., Mathematics, Science, English)"
        showAdminBadge={false}
        actions={(
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Course
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
        masterData={{ courseTypes }}
        hasChanges={hasChanges}
      />

      {showForm && (
        <div className="form-section" ref={formRef}>
          <div className="form-header">
            <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Course Name *</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                  placeholder="e.g., Mathematics, Science, English"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="courseType">Course Type *</label>
                <select
                  id="courseType"
                  name="courseType"
                  value={formData.courseType.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    courseType: { id: e.target.value }
                  })}
                  className="form-input"
                  required
                >
                  <option value="">Select Course Type</option>
                  {(courseTypes?.length || 0) === 0 ? (
                    <option value="" disabled>No Course Types Available</option>
                  ) : (
                    (courseTypes || []).map(courseType => (
                      <option key={courseType.id} value={courseType.id}>
                        {courseType.name}
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
                  placeholder="Brief description of this course"
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
                {loading ? 'Saving...' : (editingId ? 'Update Course' : 'Create Course')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Courses ({courses?.length || 0})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => applyFilters()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : (courses?.length || 0) === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h4>No Courses Found</h4>
            <p>Create your first course to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Course
            </button>
          </div>
        ) : (courseTypeNames?.length || 0) === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No Courses</div>
            <h4>No Courses Found</h4>
            <p>Create your first course to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Course
            </button>
          </div>
        ) : (
          <div className="courses-by-type">
            {(courseTypeNames || []).map((courseTypeName) => (
              <div key={courseTypeName} className="course-type-section">
                <div className="section-header">
                  <h4>{courseTypeName} ({(groupedCourses[courseTypeName] || []).length})</h4>
                </div>
                <div className="data-grid">
                  {(groupedCourses[courseTypeName] || []).map((course) => {
                    // Course field configuration
                    const courseFields = [
                      { 
                        key: 'displayOrder', 
                        label: 'Display Order', 
                        condition: (item) => item.displayOrder !== undefined && item.displayOrder !== null && item.displayOrder !== 0
                      }
                    ];

                    return (
                      <DataCard
                        key={course.id}
                        item={course}
                        itemType="course"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        fields={courseFields}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;