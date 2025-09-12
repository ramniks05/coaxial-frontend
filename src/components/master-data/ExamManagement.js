import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createExam, deleteExam, getCourses, getCourseTypes, getExams, updateExam } from '../../services/masterDataService';
import './MasterDataComponent.css';

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
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: { id: '' },
    displayOrder: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchExams(selectedCourseType, selectedCourse);
    } else if (selectedCourseType) {
      fetchExams(selectedCourseType);
    } else {
      fetchExams();
    }
  }, [selectedCourseType, selectedCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsData, coursesData, courseTypesData] = await Promise.all([
        getExams(token),
        getCourses(token),
        getCourseTypes(token)
      ]);
      setExams(examsData);
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

  const fetchExams = async (courseTypeId = null, courseId = null) => {
    try {
      setLoading(true);
      // Convert string values to numbers for API call
      const typeId = courseTypeId ? parseInt(courseTypeId) : null;
      const id = courseId ? parseInt(courseId) : null;
      
      // Use the enhanced API with 2-level filtering
      // API automatically handles: active exams only, proper ordering by displayOrder and name
      const data = await getExams(token, typeId, id);
      setExams(data);
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
      const selectedCourse = courses.find(c => c.id === parseInt(formData.course.id));
      const submitData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '', // Ensure description is never null
        course: {
          id: parseInt(formData.course.id),
          name: selectedCourse ? selectedCourse.name : "Unknown Course",
          description: selectedCourse ? selectedCourse.description : "Unknown Course Description",
          courseType: {
            id: selectedCourse ? selectedCourse.courseType?.id || selectedCourse.courseTypeId : 1,
            name: selectedCourse ? getCourseTypeName(selectedCourse.courseType?.id || selectedCourse.courseTypeId) : "Unknown Course Type"
          }
        },
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
      // Refresh the exam list with current filters
      if (selectedCourse) {
        fetchExams(selectedCourseType, selectedCourse);
      } else if (selectedCourseType) {
        fetchExams(selectedCourseType);
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
    const courseTypeId = exam.course?.courseType?.id || exam.courseType?.id || exam.courseTypeId;
    
    setFormData({
      name: exam.name,
      description: exam.description || '',
      course: { id: courseId || '' },
      displayOrder: exam.displayOrder || '',
      isActive: exam.isActive
    });
    
    // Set the filters to match the exam being edited
    if (courseTypeId) {
      setSelectedCourseType(courseTypeId.toString());
    }
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
        // Refresh the exam list with current filters
        if (selectedCourse) {
          fetchExams(selectedCourseType, selectedCourse);
        } else if (selectedCourseType) {
          fetchExams(selectedCourseType);
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

  const getCourseTypeName = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : 'Unknown';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
  };

  const getAllCourses = () => {
    return courses; // Return all courses, not just competitive ones
  };

  const isCompetitiveCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType && courseType.name.toLowerCase().includes('competitive');
  };

  const getCompetitiveCourseTypes = () => {
    return courseTypes.filter(ct => ct.name.toLowerCase().includes('competitive'));
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
            <span className="btn-icon">➕</span>
            Add Exam
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="course-type-filter">Course Type:</label>
          <select
            id="course-type-filter"
            value={selectedCourseType}
            onChange={(e) => {
              setSelectedCourseType(e.target.value);
              setSelectedCourse('');
            }}
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

        {selectedCourseType && (
          <div className="filter-group">
            <label htmlFor="course-filter">Course:</label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="filter-select"
            >
              <option value="">All Courses</option>
              {getAllCourses().filter(course => 
                course.courseType?.id === parseInt(selectedCourseType) || 
                course.courseTypeId === parseInt(selectedCourseType)
              ).map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Exam Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., JEE Main, NEET, UPSC Prelims"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="course">Course *</label>
                <select
                  id="course"
                  value={formData.course.id}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    course: { id: e.target.value }
                  })}
                  required
                >
                  <option value="">Select Course</option>
                  {getAllCourses().length === 0 ? (
                    <option value="" disabled>No Courses Available - Create a course first</option>
                  ) : (
                    getAllCourses().map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({getCourseTypeName(course.courseType?.id || course.courseTypeId)})
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
                  placeholder="Brief description of this exam"
                  rows={3}
                />
              </div>
              
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
            </div>
            
            <div className="form-row">
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
          <h3>Exams ({exams.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (selectedCourse) {
                  fetchExams(selectedCourseType, selectedCourse);
                } else if (selectedCourseType) {
                  fetchExams(selectedCourseType);
                } else {
                  fetchExams();
                }
              }}
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
            <p>Loading exams...</p>
          </div>
        ) : getAllCourses().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h4>No Courses Found</h4>
            <p>You need to create courses first before you can create exams.</p>
            <p>Go to the "Courses" tab to create your first course.</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>No Exams Found</h4>
            <p>
              {selectedCourse 
                ? `No active exams found for the selected course.`
                : selectedCourseType 
                ? `No active exams found for the selected course type.`
                : 'No active exams have been created yet.'
              }
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
            {exams.map((exam) => (
              <div key={exam.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{exam.name}</h4>
                    <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(exam)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(exam.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Course:</strong> {getCourseName(exam.course?.id || exam.courseId)}</p>
                  <p><strong>Course Type:</strong> {getCourseTypeName(exam.course?.courseType?.id || exam.courseType?.id || exam.courseTypeId)}</p>
                  {exam.description && (
                    <p>{exam.description}</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(exam.createdAt).toLocaleDateString()}
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

export default ExamManagement;
