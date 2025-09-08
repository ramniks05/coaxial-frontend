import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createClass, deleteClass, getClasses, getCourseTypes, updateClass } from '../../services/masterDataService';
import './MasterDataComponent.css';

const ClassManagement = () => {
  const { token, addNotification } = useApp();
  const [classes, setClasses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: { id: '' },
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourseType) {
      fetchClasses(selectedCourseType);
    } else {
      fetchClasses();
    }
  }, [selectedCourseType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, courseTypesData] = await Promise.all([
        getClasses(token),
        getCourseTypes(token)
      ]);
      setClasses(classesData);
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

  const fetchClasses = async (courseTypeId = null) => {
    try {
      setLoading(true);
      const data = await getClasses(token, courseTypeId);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch classes',
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
      
      // Prepare data in the correct format
      const submitData = {
        name: formData.name,
        description: formData.description,
        courseType: { id: parseInt(formData.courseType.id) },
        isActive: formData.isActive
      };
      
      console.log('Form data being submitted:', submitData);
      console.log('Token available:', !!token);
      
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
      setFormData({ name: '', description: '', courseType: { id: '' }, isActive: true });
      fetchClasses(selectedCourseType);
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
      courseType: { id: classItem.courseType?.id || classItem.courseTypeId || '' },
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
        fetchClasses(selectedCourseType);
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
    setFormData({ name: '', description: '', courseTypeId: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getCourseTypeName = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : 'Unknown';
  };

  const isAcademicCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType && courseType.name.toLowerCase().includes('academic');
  };

  const getAcademicCourseTypes = () => {
    return courseTypes.filter(ct => ct.name.toLowerCase().includes('academic'));
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Class Management</h2>
          <p>Manage classes for Academic course types only (e.g., Grade 1, Grade 2, Class A, Class B)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">➕</span>
            Add Class
          </button>
          <button 
            className="btn btn-outline"
            onClick={async () => {
              try {
                console.log('Testing Class API connection...');
                const academicCourseTypes = getAcademicCourseTypes();
                const testData = { 
                  name: 'Test Class', 
                  description: 'Test Description', 
                  courseType: { id: parseInt(academicCourseTypes[0]?.id || '1') },
                  isActive: true 
                };
                console.log('Test data:', testData);
                console.log('Token:', token);
                const result = await createClass(token, testData);
                console.log('Test result:', result);
                addNotification({
                  type: 'success',
                  message: 'Class API test successful!',
                  duration: 3000
                });
              } catch (error) {
                console.error('Class API test failed:', error);
                addNotification({
                  type: 'error',
                  message: `Class API test failed: ${error.message}`,
                  duration: 5000
                });
              }
            }}
          >
            Test Class API
          </button>
        </div>
      </div>

      {/* Course Type Filter */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="course-type-filter">Filter by Academic Course Type:</label>
          <select
            id="course-type-filter"
            value={selectedCourseType}
            onChange={(e) => setSelectedCourseType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Academic Course Types</option>
            {getAcademicCourseTypes().map(courseType => (
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
            <h3>{editingId ? 'Edit Class' : 'Add New Class'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Class Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Grade 1, Class A, Batch 2024"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="courseType">Academic Course Type *</label>
                <select
                  id="courseType"
                  value={formData.courseType.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    courseType: { id: e.target.value }
                  })}
                  required
                >
                  <option value="">Select Academic Course Type</option>
                  {getAcademicCourseTypes().length === 0 ? (
                    <option value="" disabled>No Academic Course Types Available</option>
                  ) : (
                    getAcademicCourseTypes().map(courseType => (
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
                  placeholder="Brief description of this class"
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
          <h3>Classes ({classes.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => fetchClasses(selectedCourseType)}
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
            <p>Loading classes...</p>
          </div>
        ) : getAcademicCourseTypes().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h4>No Academic Course Types Found</h4>
            <p>You need to create an Academic course type first before you can create classes.</p>
            <p>Classes are only applicable for Academic course types.</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏫</div>
            <h4>No Classes Found</h4>
            <p>Create your first class for an Academic course type</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Class
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {classes.map((classItem) => (
              <div key={classItem.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{classItem.name}</h4>
                    <span className={`status-badge ${classItem.isActive ? 'active' : 'inactive'}`}>
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(classItem)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(classItem.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Course Type:</strong> {getCourseTypeName(classItem.courseType?.id || classItem.courseTypeId)}</p>
                  {classItem.description && (
                    <p>{classItem.description}</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(classItem.createdAt).toLocaleDateString()}
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

export default ClassManagement;
