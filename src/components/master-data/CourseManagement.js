import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createCourse, deleteCourse, getCourses, getCourseTypes, updateCourse } from '../../services/masterDataService';
import './MasterDataComponent.css';

const CourseManagement = () => {
  const { token, addNotification } = useApp();
  const [courses, setCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: { id: '' },
    displayOrder: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourseType) {
      fetchCourses(selectedCourseType);
    } else {
      fetchCourses();
    }
  }, [selectedCourseType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, courseTypesData] = await Promise.all([
        getCourses(token),
        getCourseTypes(token)
      ]);
      setCourses(coursesData);
      setCourseTypes(courseTypesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch data',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (courseTypeId = null) => {
    try {
      setLoading(true);
      const data = await getCourses(token, courseTypeId);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch courses',
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
      } else {
        await createCourse(token, submitData);
        addNotification({
          type: 'success',
          message: 'Course created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', courseType: { id: '' }, isActive: true });
      fetchCourses(selectedCourseType);
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
    setFormData({
      name: course.name,
      description: course.description || '',
      courseType: { id: course.courseType?.id || course.courseTypeId || '' },
      isActive: course.isActive
    });
    setEditingId(course.id);
    setShowForm(true);
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
        fetchCourses(selectedCourseType);
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
    setFormData({ name: '', description: '', courseType: { id: '' }, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getCourseTypeName = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : 'Unknown';
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Course Management</h2>
          <p>Manage courses for different course types (e.g., Mathematics, Science, English)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">➕</span>
            Add Course
          </button>
        </div>
      </div>

      {/* Course Type Filter */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="course-type-filter">Filter by Course Type:</label>
          <select
            id="course-type-filter"
            value={selectedCourseType}
            onChange={(e) => setSelectedCourseType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Course Types</option>
            {courseTypes.map(courseType => (
              <option key={courseType.id} value={courseType.id}>
                {courseType.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Course Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Mathematics, Science, English"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="courseType">Course Type *</label>
                <select
                  id="courseType"
                  value={formData.courseType.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    courseType: { id: e.target.value }
                  })}
                  required
                >
                  <option value="">Select Course Type</option>
                  {courseTypes.length === 0 ? (
                    <option value="" disabled>No Course Types Available</option>
                  ) : (
                    courseTypes.map(courseType => (
                      <option key={courseType.id} value={courseType.id}>
                        {courseType.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this course"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
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
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Courses ({courses.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => fetchCourses(selectedCourseType)}
              disabled={loading}
            >
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
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
        ) : (
          <div className="data-grid">
            {courses.map((course) => (
              <div key={course.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{course.name}</h4>
                    <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Course Type:</strong> {getCourseTypeName(course.courseType?.id || course.courseTypeId)}</p>
                  {course.description && (
                    <p>{course.description}</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </small>
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
