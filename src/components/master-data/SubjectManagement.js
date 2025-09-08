import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createSubject, deleteSubject, getCourseTypes, getSubjects, updateSubject } from '../../services/masterDataService';
import './MasterDataComponent.css';

const SubjectManagement = () => {
  const { token, addNotification } = useApp();
  const [subjects, setSubjects] = useState([]);
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
      fetchSubjects(selectedCourseType);
    } else {
      fetchSubjects();
    }
  }, [selectedCourseType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, courseTypesData] = await Promise.all([
        getSubjects(token),
        getCourseTypes(token)
      ]);
      setSubjects(subjectsData);
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

  const fetchSubjects = async (courseTypeId = null) => {
    try {
      setLoading(true);
      const data = await getSubjects(token, courseTypeId);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch subjects',
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
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null,
        isActive: formData.isActive
      };
      
      if (editingId) {
        await updateSubject(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Subject updated successfully',
          duration: 3000
        });
      } else {
        await createSubject(token, submitData);
        addNotification({
          type: 'success',
          message: 'Subject created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', courseType: { id: '' }, displayOrder: '', isActive: true });
      fetchSubjects(selectedCourseType);
    } catch (error) {
      console.error('Error saving subject:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save subject',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      description: subject.description || '',
      courseType: { id: subject.courseType?.id || '' },
      displayOrder: subject.displayOrder || '',
      isActive: subject.isActive
    });
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        setLoading(true);
        await deleteSubject(token, id);
        addNotification({
          type: 'success',
          message: 'Subject deleted successfully',
          duration: 3000
        });
        fetchSubjects(selectedCourseType);
      } catch (error) {
        console.error('Error deleting subject:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete subject',
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
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : 'Unknown';
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Subject Management</h2>
          <p>Create subjects once per course type. Subjects are shared across all classes within a course type.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">➕</span>
            Add Subject
          </button>
          <button 
            className="btn btn-outline"
            onClick={async () => {
              try {
                console.log('Testing Subject API connection...');
                const testData = { 
                  name: 'Test Subject', 
                  description: 'Test Description', 
                  courseType: { id: courseTypes[0]?.id || '1' },
                  displayOrder: 1,
                  isActive: true 
                };
                console.log('Test data:', testData);
                console.log('Token:', token);
                const result = await createSubject(token, testData);
                console.log('Test result:', result);
                addNotification({
                  type: 'success',
                  message: 'Subject API test successful!',
                  duration: 3000
                });
              } catch (error) {
                console.error('Subject API test failed:', error);
                addNotification({
                  type: 'error',
                  message: `Subject API test failed: ${error.message}`,
                  duration: 5000
                });
              }
            }}
          >
            Test Subject API
          </button>
        </div>
      </div>

      {/* Filters */}
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
            <h3>{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Subject Name *</label>
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
                <label htmlFor="displayOrder">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  placeholder="e.g., 1, 2, 3"
                  min="1"
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this subject"
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
          <h3>Subjects ({subjects.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => fetchSubjects(selectedCourseType)}
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
            <p>Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h4>No Subjects Found</h4>
            <p>Create your first subject to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Subject
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{subject.name}</h4>
                    <span className={`status-badge ${subject.isActive ? 'active' : 'inactive'}`}>
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(subject)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(subject.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Course Type:</strong> {getCourseTypeName(subject.courseType?.id)}</p>
                  {subject.displayOrder && (
                    <p><strong>Display Order:</strong> {subject.displayOrder}</p>
                  )}
                  {subject.description && (
                    <p>{subject.description}</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(subject.createdAt).toLocaleDateString()}
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

export default SubjectManagement;
