import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createChapter, deleteChapter, getChapters, getClasses, getSubjects, updateChapter } from '../../services/masterDataService';
import './MasterDataComponent.css';

const ChapterManagement = () => {
  const { token, addNotification } = useApp();
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: { id: '' },
    classEntity: { id: '' },
    displayOrder: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubject || selectedClass) {
      fetchChapters(selectedSubject, selectedClass);
    } else {
      fetchChapters();
    }
  }, [selectedSubject, selectedClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chaptersData, subjectsData, classesData] = await Promise.all([
        getChapters(token),
        getSubjects(token),
        getClasses(token)
      ]);
      setChapters(chaptersData);
      setSubjects(subjectsData);
      setClasses(classesData);
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

  const fetchChapters = async (subjectId = null, classId = null) => {
    try {
      setLoading(true);
      const data = await getChapters(token, subjectId, classId);
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch chapters',
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
        subject: { id: parseInt(formData.subject.id) },
        classEntity: formData.classEntity.id ? { id: parseInt(formData.classEntity.id) } : null,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null,
        isActive: formData.isActive
      };
      
      if (editingId) {
        await updateChapter(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Chapter updated successfully',
          duration: 3000
        });
      } else {
        await createChapter(token, submitData);
        addNotification({
          type: 'success',
          message: 'Chapter created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', subject: { id: '' }, classEntity: { id: '' }, displayOrder: '', isActive: true });
      fetchChapters(selectedSubject, selectedClass);
    } catch (error) {
      console.error('Error saving chapter:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save chapter',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter) => {
    setFormData({
      name: chapter.name,
      description: chapter.description || '',
      subject: { id: chapter.subject?.id || chapter.subjectId || '' },
      classEntity: { id: chapter.classEntity?.id || chapter.classId || '' },
      displayOrder: chapter.displayOrder || chapter.order || '',
      isActive: chapter.isActive
    });
    setEditingId(chapter.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        setLoading(true);
        await deleteChapter(token, id);
        addNotification({
          type: 'success',
          message: 'Chapter deleted successfully',
          duration: 3000
        });
        fetchChapters(selectedSubject, selectedClass);
      } catch (error) {
        console.error('Error deleting chapter:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete chapter',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', subject: { id: '' }, classEntity: { id: '' }, displayOrder: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getClassName = (classId) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : 'Unknown';
  };

  const getSubjectCourseType = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.courseType : null;
  };

  const isAcademicSubject = (subjectId) => {
    const courseType = getSubjectCourseType(subjectId);
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  };

  const getClassesForSubject = (subjectId) => {
    const courseType = getSubjectCourseType(subjectId);
    if (!courseType || !courseType.name.toLowerCase().includes('academic')) {
      return [];
    }
    return classes.filter(c => c.courseType?.id === courseType.id);
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Chapter Management</h2>
          <p>Create chapters for subjects. For Academic subjects, optionally select which class(es) the content applies to.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">➕</span>
          Add Chapter
        </button>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="subject-filter">Filter by Subject:</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedClass(''); // Reset class filter when subject changes
              }}
              className="filter-select"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="class-filter">Filter by Class:</label>
            <select
              id="class-filter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="filter-select"
              disabled={!selectedSubject || !isAcademicSubject(selectedSubject)}
            >
              <option value="">All Classes</option>
              {selectedSubject && isAcademicSubject(selectedSubject) && getClassesForSubject(selectedSubject).map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Chapter Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Chapter 1: Introduction to Algebra"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  value={formData.subject.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    subject: { id: e.target.value },
                    classEntity: { id: '' } // Reset class when subject changes
                  })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="classEntity">Class (Optional)</label>
                <select
                  id="classEntity"
                  value={formData.classEntity.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    classEntity: { id: e.target.value }
                  })}
                  disabled={!formData.subject.id || !isAcademicSubject(formData.subject.id)}
                >
                  <option value="">No specific class (applies to all)</option>
                  {formData.subject.id && isAcademicSubject(formData.subject.id) && getClassesForSubject(formData.subject.id).map(classItem => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
                {formData.subject.id && !isAcademicSubject(formData.subject.id) && (
                  <small className="form-help">Class selection is only available for Academic subjects</small>
                )}
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
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this chapter"
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
          <h3>Chapters ({chapters.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => fetchChapters(selectedSubject, selectedClass)}
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
            <p>Loading chapters...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📑</div>
            <h4>No Chapters Found</h4>
            <p>Create your first chapter to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Chapter
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{chapter.name}</h4>
                    <span className={`status-badge ${chapter.isActive ? 'active' : 'inactive'}`}>
                      {chapter.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(chapter)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(chapter.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Subject:</strong> {getSubjectName(chapter.subject?.id || chapter.subjectId)}</p>
                  {chapter.classEntity?.id || chapter.classId ? (
                    <p><strong>Class:</strong> {getClassName(chapter.classEntity?.id || chapter.classId)}</p>
                  ) : (
                    <p><strong>Class:</strong> <em>Applies to all classes</em></p>
                  )}
                  {chapter.displayOrder || chapter.order ? (
                    <p><strong>Display Order:</strong> {chapter.displayOrder || chapter.order}</p>
                  ) : null}
                  {chapter.description && (
                    <p>{chapter.description}</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(chapter.createdAt).toLocaleDateString()}
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

export default ChapterManagement;
