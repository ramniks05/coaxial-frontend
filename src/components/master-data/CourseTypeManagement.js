import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFilterSubmit } from '../../hooks/useFilterSubmit';
import { clearCourseTypesCache, getCourseTypesCached } from '../../services/globalApiCache';
import { createCourseType, deleteCourseType, updateCourseType } from '../../services/masterDataService';
import AdminPageHeader from '../common/AdminPageHeader';
import { getCourseTypeFilterConfig, getInitialFilters } from './filters/filterConfigs';
import FilterPanel from './filters/FilterPanel';
import './MasterDataComponent.css';

// Reusable DataCard Component
const DataCard = ({ 
  item, 
  itemType = 'item',
  onEdit, 
  onDelete,
  fields = [],
  badges = [],
  structureTypes = []
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

    // For structure type badges, get the actual style and icon
    let badgeStyle = style;
    let badgeIcon = icon;
    
    if (key === 'structureType' && structureTypes.length > 0) {
      const structureType = structureTypes.find(t => t.value === badgeValue);
      if (structureType) {
        badgeStyle = { 
          backgroundColor: structureType.color || '#666',
          color: 'white'
        };
        badgeIcon = structureType.icon;
      }
    }

    return (
      <span 
        key={key}
        className="structure-badge"
        style={badgeStyle}
        title={key === 'structureType' ? structureTypes.find(t => t.value === badgeValue)?.description : undefined}
      >
        {badgeIcon} {badgeValue}
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

const CourseTypeManagement = () => {
  const { token, addNotification } = useApp();
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    structureType: '',
    displayOrder: 0,
    isActive: true
  });

  // Use ref to track if data has been fetched to prevent infinite loops
  const courseTypesFetched = useRef(false);
  const tokenRef = useRef(token);
  
  // Form focus management
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  
  // Filter state and handlers
  const initialFilters = getInitialFilters('courseType');
  const filterConfig = getCourseTypeFilterConfig({ courseTypes });
  
  // Fetch data function for filters
  const fetchDataWithFilters = useCallback(async (filters) => {
    if (!token) return [];
    
    try {
      const data = await getCourseTypesCached(token);
      let filteredData = Array.isArray(data) ? data : [];
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply active filter
      if (filters.isActive) {
        filteredData = filteredData.filter(item => item.isActive === true);
      }
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching course types with filters:', error);
      addNotification({ 
        message: 'Failed to load course types', 
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

  // Structure types configuration
  const structureTypes = [
    {
      value: 'ACADEMIC',
      label: 'Academic',
      description: 'CourseType → Course → Class → Subject → Topic → Module → Chapter',
      icon: '🏫',
      color: '#4CAF50'
    },
    {
      value: 'COMPETITIVE',
      label: 'Competitive',
      description: 'CourseType → Course → Exam → Subject → Topic → Module → Chapter',
      icon: '📝',
      color: '#FF9800'
    },
    {
      value: 'PROFESSIONAL',
      label: 'Professional',
      description: 'CourseType → Course → Subject → Topic → Module → Chapter',
      icon: '💼',
      color: '#2196F3'
    },
    {
      value: 'CUSTOM',
      label: 'Custom',
      description: 'Flexible structure based on requirements',
      icon: '⚙️',
      color: '#9C27B0'
    }
  ];

  // Update course types when filters are applied
  useEffect(() => {
    const updateCourseTypes = async () => {
      try {
        const filteredData = await applyFilters();
        setCourseTypes(filteredData);
      } catch (error) {
        console.error('Error applying filters:', error);
        setCourseTypes([]);
      }
    };

    updateCourseTypes();
  }, [applyFilters]);

  // Refresh course types with current filters
  const refreshCourseTypes = async () => {
    try {
      const filteredData = await applyFilters();
      setCourseTypes(filteredData);
    } catch (error) {
      console.error('Error refreshing course types:', error);
      addNotification({
        type: 'error',
        message: `Failed to refresh course types: ${error.message}`,
        duration: 7000
      });
      setCourseTypes([]);
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

      if (!formData.structureType) {
        addNotification({
          type: 'error',
          message: 'Structure type is required',
          duration: 5000
        });
        return;
      }
      
      // Prepare data in the correct format - only include fields that should be updated
      const submitData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '',
        structureType: formData.structureType,
        displayOrder: formData.displayOrder || 0,
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
      clearCourseTypesCache(); // Clear cache to force refresh
      refreshCourseTypes();
    } catch (error) {
      console.error('Error saving course type:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to save course type';
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication required. Please login first or implement backend authentication.';
      } else if (error.message.includes('cascade')) {
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
      structureType: courseType.structureType || '',
      displayOrder: courseType.displayOrder || 0,
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
        clearCourseTypesCache(); // Clear cache to force refresh
        refreshCourseTypes();
      } catch (error) {
        console.error('Error deleting course type:', error);
        
        let errorMessage = 'Failed to delete course type';
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication required. Please login first or implement backend authentication.';
        } else if (error.message.includes('cascade')) {
          errorMessage = 'Cannot delete course type due to existing relationships. Please remove related data first.';
        }
        
        addNotification({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', structureType: '', displayOrder: 0, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="master-data-component">
      <AdminPageHeader
        title="Course Type Management"
        subtitle="Manage different types of courses with their hierarchical structures (Academic, Competitive, Professional, Custom)"
        showAdminBadge={false}
        actions={(
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            Add Course Type
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
            <h3>{editingId ? 'Edit Course Type' : 'Add New Course Type'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Course Type Name *</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                  placeholder="e.g., Academic, Professional, Certification"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="displayOrder">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="structureType">Structure Type *</label>
                <select
                  id="structureType"
                  name="structureType"
                  value={formData.structureType}
                  onChange={(e) => setFormData({ ...formData, structureType: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Select Structure Type</option>
                  {structureTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
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

            {/* Structure Type Preview */}
            {formData.structureType && (
              <div className="form-section structure-preview">
                <h4>📋 Structure Preview</h4>
                <div className="structure-flow" style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  color: '#495057',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  {structureTypes.find(t => t.value === formData.structureType)?.description}
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  placeholder="Brief description of this course type"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update Course Type' : 'Create Course Type')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Course Types ({courseTypes?.length || 0})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={refreshCourseTypes}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading course types...</p>
          </div>
        ) : (courseTypes?.length || 0) === 0 ? (
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
            {(courseTypes || []).map((courseType) => {
              // CourseType field configuration
              const courseTypeFields = [
                { 
                  key: 'displayOrder', 
                  label: 'Display Order', 
                  condition: (item) => item.displayOrder !== null && item.displayOrder !== undefined 
                }
              ];

              // CourseType badge configuration
              const courseTypeBadges = [
                { 
                  key: 'structureType', 
                  label: 'Structure Type',
                  condition: (item) => item.structureType
                }
              ];

              return (
                <DataCard
                  key={courseType.id}
                  item={courseType}
                  itemType="courseType"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  fields={courseTypeFields}
                  badges={courseTypeBadges}
                  structureTypes={structureTypes}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseTypeManagement;
