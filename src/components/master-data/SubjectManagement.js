import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createSubject, deleteSubject, getClasses, getCourses, getCourseTypes, getExams, getExamsByCourse, getSubjects, updateSubject, createSubjectWithClassLink, createSubjectWithExamLink, createSubjectWithCourseLink } from '../../services/masterDataService';
import './MasterDataComponent.css';

const SubjectManagement = () => {
  const { token, addNotification } = useApp();
  const [subjects, setSubjects] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Filter states for drill-down filtering
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: { id: '' },
    course: { id: '' },
    class: { id: '' },
    exam: { id: '' },
    displayOrder: '',
    isActive: true
  });
  
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    classes: false,
    exams: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Effect for course type change - filter courses and fetch subjects
  useEffect(() => {
    console.log('Selected course type changed:', selectedCourseType);
    if (selectedCourseType) {
      const courseTypeId = parseInt(selectedCourseType);
      console.log('Filtering courses for course type:', courseTypeId);
      
      // Filter courses by course type
      const coursesForType = courses.filter(course => course.courseType?.id === courseTypeId);
      setFilteredCourses(coursesForType);
      
      // Reset dependent filters
      setSelectedCourse('');
      setSelectedClass('');
      setSelectedExam('');
      setFilteredClasses([]);
      setFilteredExams([]);
      
      // Fetch subjects for this course type
      fetchSubjects(courseTypeId, null, null, null, showActiveOnly);
    } else {
      console.log('No course type selected - showing all courses');
      setFilteredCourses(courses);
      setSelectedCourse('');
      setSelectedClass('');
      setSelectedExam('');
      setFilteredClasses([]);
      setFilteredExams([]);
      fetchSubjects(null, null, null, null, showActiveOnly);
    }
  }, [selectedCourseType, courses]);

  // Effect for course change - filter classes/exams and fetch subjects
  useEffect(() => {
    if (selectedCourse) {
      const courseId = parseInt(selectedCourse);
      console.log('Selected course changed:', courseId);
      
      // Filter classes and exams for this course
      const classesForCourse = classes.filter(cls => cls.course?.id === courseId);
      const examsForCourse = exams.filter(exam => exam.course?.id === courseId);
      
      setFilteredClasses(classesForCourse);
      setFilteredExams(examsForCourse);
      
      // Reset dependent filters
      setSelectedClass('');
      setSelectedExam('');
      
      // Fetch subjects for this course
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      fetchSubjects(courseTypeId, courseId, null, null, showActiveOnly);
    } else {
      setFilteredClasses([]);
      setFilteredExams([]);
      setSelectedClass('');
      setSelectedExam('');
      
      // Fetch subjects for course type only
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      fetchSubjects(courseTypeId, null, null, null, showActiveOnly);
    }
  }, [selectedCourse, classes, exams, selectedCourseType]);

  // Effect for class change - fetch subjects for specific class
  useEffect(() => {
    if (selectedClass) {
      const classId = parseInt(selectedClass);
      console.log('Selected class changed:', classId);
      
      // Reset exam selection
      setSelectedExam('');
      
      // Fetch subjects for this class
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = selectedCourse ? parseInt(selectedCourse) : null;
      fetchSubjects(courseTypeId, courseId, classId, null, showActiveOnly);
    } else if (selectedCourse) {
      // If no class selected but course is selected, fetch subjects for course
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = parseInt(selectedCourse);
      fetchSubjects(courseTypeId, courseId, null, null, showActiveOnly);
    }
  }, [selectedClass, selectedCourseType, selectedCourse]);

  // Effect for exam change - fetch subjects for specific exam
  useEffect(() => {
    if (selectedExam) {
      const examId = parseInt(selectedExam);
      console.log('Selected exam changed:', examId);
      
      // Reset class selection
      setSelectedClass('');
      
      // Fetch subjects for this exam
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = selectedCourse ? parseInt(selectedCourse) : null;
      fetchSubjects(courseTypeId, courseId, null, examId, showActiveOnly);
    } else if (selectedCourse) {
      // If no exam selected but course is selected, fetch subjects for course
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = parseInt(selectedCourse);
      fetchSubjects(courseTypeId, courseId, null, null, showActiveOnly);
    }
  }, [selectedExam, selectedCourseType, selectedCourse]);

  // Effect for active filter change - refetch subjects with new active filter
  useEffect(() => {
    console.log('Show active only changed:', showActiveOnly);
    const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
    const courseId = selectedCourse ? parseInt(selectedCourse) : null;
    const classId = selectedClass ? parseInt(selectedClass) : null;
    const examId = selectedExam ? parseInt(selectedExam) : null;
    
    fetchSubjects(courseTypeId, courseId, classId, examId, showActiveOnly);
  }, [showActiveOnly, selectedCourseType, selectedCourse, selectedClass, selectedExam]);

  // Helper functions for course type logic
  const isAcademicCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  };

  const isCompetitiveCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('competitive');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, courseTypesData, allCoursesData, allClassesData, allExamsData] = await Promise.all([
        getSubjects(token, null, null, null, null, showActiveOnly), // Load subjects with active filter
        getCourseTypes(token),
        getCourses(token), // Fetch all courses
        getClasses(token), // Fetch all classes
        getExams(token) // Fetch all exams
      ]);
      setSubjects(subjectsData);
      setCourseTypes(courseTypesData);
      setCourses(allCoursesData);
      setClasses(allClassesData);
      setExams(allExamsData);
      
      // Initialize filtered data
      setFilteredCourses(allCoursesData);
      setFilteredClasses([]);
      setFilteredExams([]);
      
      // Debug logging to see the data structure
      console.log('Subjects data structure:', subjectsData);
      console.log('Courses data:', allCoursesData);
      console.log('Classes data:', allClassesData);
      console.log('Exams data:', allExamsData);
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

  const fetchSubjects = async (courseTypeId = null, courseId = null, classId = null, examId = null, active = null) => {
    try {
      setLoading(true);
      console.log('fetchSubjects called with filters:', { courseTypeId, courseId, classId, examId, active });
      const data = await getSubjects(token, courseTypeId, courseId, classId, examId, active);
      console.log('Fetched subjects data:', data);
      console.log('Number of subjects returned:', data?.length || 0);
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
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        addNotification({
          type: 'error',
          message: 'Subject name is required',
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
        courseType: { id: parseInt(formData.courseType.id) },
        course: { id: parseInt(formData.course?.id) },
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
        // Determine which linking function to use based on form data
        let response;
        if (formData.class?.id) {
          console.log('Creating subject with class link:', formData.class.id);
          const classData = { ...submitData, classId: parseInt(formData.class.id) };
          response = await createSubjectWithClassLink(token, classData);
        } else if (formData.exam?.id) {
          console.log('Creating subject with exam link:', formData.exam.id);
          const examData = { ...submitData, examId: parseInt(formData.exam.id) };
          response = await createSubjectWithExamLink(token, examData);
        } else if (formData.course?.id) {
          console.log('Creating subject with course link:', formData.course.id);
          const courseData = { ...submitData, courseId: parseInt(formData.course.id) };
          response = await createSubjectWithCourseLink(token, courseData);
        } else {
          console.log('Creating subject without linking');
          response = await createSubject(token, submitData);
        }
        
        addNotification({
          type: 'success',
          message: 'Subject created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ 
        name: '', 
        description: '', 
        courseType: { id: '' }, 
        course: { id: '' },
        class: { id: '' },
        exam: { id: '' },
        displayOrder: '', 
        isActive: true 
      });
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
      course: { id: '' },
      class: { id: '' },
      exam: { id: '' },
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
    setFormData({ 
      name: '', 
      description: '', 
      courseType: { id: '' }, 
      course: { id: '' },
      class: { id: '' },
      exam: { id: '' },
      displayOrder: '', 
      isActive: true 
    });
    setEditingId(null);
    setShowForm(false);
    setCourses([]);
    setClasses([]);
    setExams([]);
  };


  const handleCourseTypeChange = async (courseTypeId) => {
    setFormData(prev => ({
      ...prev,
      courseType: { id: courseTypeId },
      course: { id: '' },
      class: { id: '' },
      exam: { id: '' }
    }));
    setCourses([]);
    setClasses([]);
    setExams([]);
    
    if (courseTypeId) {
      try {
        setLoadingStates(prev => ({ ...prev, courses: true }));
        const coursesData = await getCourses(token, courseTypeId);
        console.log('Courses fetched:', coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        addNotification({
          type: 'error',
          message: `Failed to fetch courses: ${error.message}`,
          duration: 5000
        });
        setCourses([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, courses: false }));
      }
    }
  };

  const handleCourseChange = async (courseId) => {
    setFormData(prev => ({
      ...prev,
      course: { id: courseId },
      class: { id: '' },
      exam: { id: '' }
    }));
    setClasses([]);
    setExams([]);
    
    if (courseId && formData.courseType.id) {
      const courseTypeId = parseInt(formData.courseType.id);
      console.log('Course changed:', courseId, 'Course Type:', courseTypeId);
      
      try {
        if (courseTypeId === 1) { // Academic
          console.log('Fetching classes for Academic course:', courseId);
          setLoadingStates(prev => ({ ...prev, classes: true }));
          
          try {
            // Use the correct API endpoint: GET /classes?courseId={id}
            const classesData = await getClasses(token, courseId);
            console.log('Classes fetched:', classesData);
            setClasses(classesData);
          } catch (apiError) {
            console.error('API Error fetching classes:', apiError);
            addNotification({
              type: 'error',
              message: `Failed to fetch classes: ${apiError.message}`,
              duration: 5000
            });
            setClasses([]);
          }
          
          setLoadingStates(prev => ({ ...prev, classes: false }));
        } else if (courseTypeId === 2) { // Competitive
          console.log('Fetching exams for Competitive course:', courseId);
          setLoadingStates(prev => ({ ...prev, exams: true }));
          
          try {
            const examsData = await getExamsByCourse(token, courseId);
            console.log('Exams fetched:', examsData);
            setExams(examsData);
          } catch (apiError) {
            console.error('API Error fetching exams:', apiError);
            addNotification({
              type: 'error',
              message: `Failed to fetch exams: ${apiError.message}`,
              duration: 5000
            });
            setExams([]);
          }
          
          setLoadingStates(prev => ({ ...prev, exams: false }));
        }
      } catch (error) {
        console.error('Error in handleCourseChange:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch data',
          duration: 5000
        });
        setLoadingStates(prev => ({ courses: false, classes: false, exams: false }));
      }
    }
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
                console.log('Available course types:', courseTypes);
                console.log('Token:', token);
                
                // Test GET subjects first
                console.log('Testing GET subjects...');
                const subjects = await getSubjects(token);
                console.log('GET subjects result:', subjects);
                
                // Test GET subjects with course type filter
                if (courseTypes.length > 0) {
                  console.log('Testing GET subjects with course type filter...');
                  const filteredSubjects = await getSubjects(token, courseTypes[0].id);
                  console.log('GET filtered subjects result:', filteredSubjects);
                }
                
                addNotification({
                  type: 'success',
                  message: 'Subject API GET test successful!',
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

      {/* Drill-down Filters */}
      <div className="filter-section">
        <div className="filter-header">
          <h4>🔍 Filter Subjects</h4>
          <div className="filter-header-controls">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              <span>Active Only</span>
            </label>
            <button 
              className="btn btn-outline btn-xs"
              onClick={() => {
                setSelectedCourseType('');
                setSelectedCourse('');
                setSelectedClass('');
                setSelectedExam('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
        
        <div className="filter-row">
          {/* Course Type Filter */}
          <div className="filter-group">
            <label htmlFor="course-type-filter">1. Course Type:</label>
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

          {/* Course Filter */}
          <div className="filter-group">
            <label htmlFor="course-filter">2. Course:</label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="filter-select"
              disabled={!selectedCourseType}
            >
              <option value="">All Courses</option>
              {filteredCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional filters based on course type */}
        {selectedCourseType && (
          <div className="filter-row">
            {/* Class Filter - Only show for Academic course types */}
            {isAcademicCourseType(selectedCourseType) && (
              <div className="filter-group">
                <label htmlFor="class-filter">3. Class (Academic):</label>
                <select
                  id="class-filter"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="filter-select"
                  disabled={!selectedCourse || filteredClasses.length === 0}
                >
                  <option value="">All Classes</option>
                  {filteredClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {selectedCourse && filteredClasses.length === 0 && (
                  <small className="filter-hint">No classes available for this course</small>
                )}
              </div>
            )}

            {/* Exam Filter - Only show for Competitive course types */}
            {isCompetitiveCourseType(selectedCourseType) && (
              <div className="filter-group">
                <label htmlFor="exam-filter">3. Exam (Competitive):</label>
                <select
                  id="exam-filter"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="filter-select"
                  disabled={!selectedCourse || filteredExams.length === 0}
                >
                  <option value="">All Exams</option>
                  {filteredExams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
                {selectedCourse && filteredExams.length === 0 && (
                  <small className="filter-hint">No exams available for this course</small>
                )}
              </div>
            )}

            {/* Show message if course type doesn't match Academic or Competitive */}
            {!isAcademicCourseType(selectedCourseType) && !isCompetitiveCourseType(selectedCourseType) && (
              <div className="filter-group">
                <div className="filter-info">
                  <small className="filter-hint">
                    ℹ️ This course type doesn't support Class/Exam filtering. 
                    Only subjects linked directly to courses will be shown.
                  </small>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {(selectedCourseType || selectedCourse || selectedClass || selectedExam || !showActiveOnly) && (
          <div className="active-filters">
            <strong>Active Filters:</strong>
            {!showActiveOnly && (
              <span className="filter-tag">
                Show: All (Active + Inactive)
              </span>
            )}
            {selectedCourseType && (
              <span className="filter-tag">
                Course Type: {courseTypes.find(ct => ct.id === parseInt(selectedCourseType))?.name}
              </span>
            )}
            {selectedCourse && (
              <span className="filter-tag">
                Course: {filteredCourses.find(c => c.id === parseInt(selectedCourse))?.name}
              </span>
            )}
            {selectedClass && (
              <span className="filter-tag">
                Class: {filteredClasses.find(c => c.id === parseInt(selectedClass))?.name}
              </span>
            )}
            {selectedExam && (
              <span className="filter-tag">
                Exam: {filteredExams.find(e => e.id === parseInt(selectedExam))?.name}
              </span>
            )}
          </div>
        )}
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
                  onChange={(e) => handleCourseTypeChange(e.target.value)}
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
                <label htmlFor="course">Course *</label>
                <select
                  id="course"
                  value={formData.course?.id || ''}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={!formData.courseType.id || loadingStates.courses}
                  required
                >
                  <option value="">
                    {!formData.courseType.id ? 'Select Course Type first' : 
                     loadingStates.courses ? 'Loading courses...' : 
                     'Select Course'}
                  </option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
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
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this subject"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Academic Class Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class">Link to Specific Class</label>
                <select
                  id="class"
                  value={formData.class?.id || ''}
                  onChange={(e) => setFormData({ ...formData, class: { id: e.target.value } })}
                  disabled={formData.courseType.id !== '1' || loadingStates.classes}
                >
                  <option value="">
                    {formData.courseType.id !== '1' ? 'Select Academic course type first' :
                     loadingStates.classes ? 'Loading classes...' :
                     'Select Class (Optional)'}
                  </option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                  {formData.courseType.id === '1' && formData.course.id && classes.length === 0 && !loadingStates.classes && (
                    <option value="" disabled>No classes available</option>
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="exam">Link to Specific Exam</label>
                <select
                  id="exam"
                  value={formData.exam?.id || ''}
                  onChange={(e) => setFormData({ ...formData, exam: { id: e.target.value } })}
                  disabled={formData.courseType.id !== '2' || loadingStates.exams}
                >
                  <option value="">
                    {formData.courseType.id !== '2' ? 'Select Competitive course type first' :
                     loadingStates.exams ? 'Loading exams...' :
                     'Select Exam (Optional)'}
                  </option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                  {formData.courseType.id === '2' && formData.course.id && exams.length === 0 && !loadingStates.exams && (
                    <option value="" disabled>No exams available</option>
                  )}
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
              onClick={() => {
                const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
                const courseId = selectedCourse ? parseInt(selectedCourse) : null;
                const classId = selectedClass ? parseInt(selectedClass) : null;
                const examId = selectedExam ? parseInt(selectedExam) : null;
                fetchSubjects(courseTypeId, courseId, classId, examId, showActiveOnly);
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
