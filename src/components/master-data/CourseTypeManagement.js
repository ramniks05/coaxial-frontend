import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createCourseType, deleteCourseType, getCourseTypes, updateCourseType } from '../../services/masterDataService';
import './MasterDataComponent.css';

const CourseTypeManagement = () => {
  const { token, addNotification } = useApp();
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCourseTypes();
  }, []);

  const fetchCourseTypes = async () => {
    try {
      setLoading(true);
      const data = await getCourseTypes(token);
      setCourseTypes(data);
    } catch (error) {
      console.error('Error fetching course types:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch course types',
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
          message: 'Course type name is required',
          duration: 5000
        });
        return;
      }
      
      // Prepare data in the correct format - only include fields that should be updated
      const submitData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '',
        isActive: formData.isActive
      };
      
      // For updates, include the ID but exclude any relationship collections
      if (editingId) {
        submitData.id = editingId;
      }
      
      // Ensure we don't include any relationship fields that might cause cascade issues
      delete submitData.courses;
      delete submitData.subjects;
      
      console.log('Form data being submitted:', submitData);
      console.log('Token available:', !!token);
      
      if (editingId) {
        await updateCourseType(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Course type updated successfully',
          duration: 3000
        });
      } else {
        await createCourseType(token, submitData);
        addNotification({
          type: 'success',
          message: 'Course type created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', isActive: true });
      fetchCourseTypes();
    } catch (error) {
      console.error('Error saving course type:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to save course type';
      if (error.message.includes('cascade')) {
        errorMessage = 'Course type update failed due to relationship constraints. Please try again or contact support.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error occurred while saving course type. Please try again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid data provided. Please check your input and try again.';
      } else {
        errorMessage = `Failed to save course type: ${error.message}`;
      }
      
      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (courseType) => {
    setFormData({
      name: courseType.name,
      description: courseType.description || '',
      isActive: courseType.isActive
    });
    setEditingId(courseType.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course type?')) {
      try {
        setLoading(true);
        await deleteCourseType(token, id);
        addNotification({
          type: 'success',
          message: 'Course type deleted successfully',
          duration: 3000
        });
        fetchCourseTypes();
      } catch (error) {
        console.error('Error deleting course type:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete course type',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Course Type Management</h2>
          <p>Manage different types of courses (e.g., Academic, Professional, Certification)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">➕</span>
            Add Course Type
          </button>
          <button 
            className="btn btn-outline"
            onClick={async () => {
              try {
                console.log('Testing API connection...');
                const testData = { name: 'Test Course Type', description: 'Test Description', isActive: true };
                console.log('Test data:', testData);
                console.log('Token:', token);
                const result = await createCourseType(token, testData);
                console.log('Test result:', result);
                addNotification({
                  type: 'success',
                  message: 'API test successful!',
                  duration: 3000
                });
              } catch (error) {
                console.error('API test failed:', error);
                addNotification({
                  type: 'error',
                  message: `API test failed: ${error.message}`,
                  duration: 5000
                });
              }
            }}
          >
            Test API
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Course Type' : 'Add New Course Type'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Course Type Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Academic, Professional, Certification"
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
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this course type"
                rows={3}
              />
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
          <h3>Course Types ({courseTypes.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={fetchCourseTypes}
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
            <p>Loading course types...</p>
          </div>
        ) : courseTypes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h4>No Course Types Found</h4>
            <p>Create your first course type to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Course Type
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {courseTypes.map((courseType) => (
              <div key={courseType.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{courseType.name}</h4>
                    <span className={`status-badge ${courseType.isActive ? 'active' : 'inactive'}`}>
                      {courseType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(courseType)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(courseType.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {courseType.description && (
                  <div className="card-content">
                    <p>{courseType.description}</p>
                  </div>
                )}
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(courseType.createdAt).toLocaleDateString()}
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

export default CourseTypeManagement;
