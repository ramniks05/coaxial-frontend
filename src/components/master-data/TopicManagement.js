import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getTopics, 
  getTopicById, 
  createTopic, 
  createTopicWithClassSubjectLink, 
  createTopicWithExamSubjectLink, 
  createTopicWithCourseSubjectLink, 
  updateTopic, 
  deleteTopic,
  getCourseTypes,
  getCourses,
  getClasses,
  getExams,
  getSubjects,
  getClassSubjects,
  getExamSubjects
} from '../../services/masterDataService';
import './MasterDataComponent.css';

const TopicManagement = () => {
  const { token, addNotification } = useApp();
  
  // Main data states
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filter states for drill-down filtering
  const [filters, setFilters] = useState({
    active: true,
    courseTypeId: '',
    courseId: '',
    subjectId: '',
    classSubjectId: '',
    examSubjectId: '',
    courseSubjectId: ''
  });
  
  // Reference data states
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  
  // Filtered data states
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState([]);
  const [filteredExamSubjects, setFilteredExamSubjects] = useState([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '',
    isActive: true,
    linkingType: 'classSubject', // 'classSubject', 'examSubject', 'courseSubject'
    classSubjectId: '',
    examSubjectId: '',
    courseSubjectId: ''
  });

  // Load initial data
  useEffect(() => {
    fetchReferenceData();
    fetchTopicsData();
  }, []);

  // Effect for course type change - filter courses and fetch topics
  useEffect(() => {
    if (filters.courseTypeId) {
      const courseTypeId = parseInt(filters.courseTypeId);
      console.log('Filtering courses for course type:', courseTypeId);
      
      // Filter courses by course type
      const coursesForType = courses.filter(course => course.courseType?.id === courseTypeId);
      setFilteredCourses(coursesForType);
      
      // Reset dependent filters
      setFilters(prev => ({
        ...prev,
        courseId: '',
        subjectId: '',
        classSubjectId: '',
        examSubjectId: '',
        courseSubjectId: ''
      }));
      
      // Fetch topics for this course type
      fetchTopicsData(courseTypeId);
    } else {
      console.log('No course type selected - showing all courses');
      setFilteredCourses(courses);
      setFilters(prev => ({
        ...prev,
        courseId: '',
        subjectId: '',
        classSubjectId: '',
        examSubjectId: '',
        courseSubjectId: ''
      }));
      fetchTopicsData();
    }
  }, [filters.courseTypeId, courses]);

  // Effect for course change - filter subjects and fetch topics
  useEffect(() => {
    if (filters.courseId) {
      const courseId = parseInt(filters.courseId);
      console.log('Selected course changed:', courseId);
      
      // Filter subjects for this course
      const subjectsForCourse = subjects.filter(subject => 
        subject.course?.id === courseId || 
        subject.classSubjects?.some(cs => cs.class?.course?.id === courseId) ||
        subject.examSubjects?.some(es => es.exam?.course?.id === courseId)
      );
      setFilteredSubjects(subjectsForCourse);
      
      // Reset dependent filters
      setFilters(prev => ({
        ...prev,
        subjectId: '',
        classSubjectId: '',
        examSubjectId: '',
        courseSubjectId: ''
      }));
      
      // Fetch topics for this course
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      fetchTopicsData(courseTypeId, courseId);
    } else {
      setFilteredSubjects([]);
      setFilters(prev => ({
        ...prev,
        subjectId: '',
        classSubjectId: '',
        examSubjectId: '',
        courseSubjectId: ''
      }));
      
      // Fetch topics for course type only
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      fetchTopicsData(courseTypeId);
    }
  }, [filters.courseId, subjects, filters.courseTypeId]);

  // Effect for subject change - filter class/exam subjects and fetch topics
  useEffect(() => {
    if (filters.subjectId) {
      const subjectId = parseInt(filters.subjectId);
      console.log('Selected subject changed:', subjectId);
      
      // Filter class subjects and exam subjects for this subject
      const classSubjectsForSubject = classSubjects.filter(cs => cs.subject?.id === subjectId);
      const examSubjectsForSubject = examSubjects.filter(es => es.subject?.id === subjectId);
      
      setFilteredClassSubjects(classSubjectsForSubject);
      setFilteredExamSubjects(examSubjectsForSubject);
      
      // Reset dependent filters
      setFilters(prev => ({
        ...prev,
        classSubjectId: '',
        examSubjectId: '',
        courseSubjectId: ''
      }));
      
      // Fetch topics for this subject
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      const courseId = filters.courseId ? parseInt(filters.courseId) : null;
      fetchTopicsData(courseTypeId, courseId, subjectId);
    } else {
      setFilteredClassSubjects([]);
      setFilteredExamSubjects([]);
      setFilters(prev => ({
        ...prev,
        classSubjectId: '',
        examSubjectId: '',
        courseSubjectId: ''
      }));
      
      // Fetch topics for course only
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      const courseId = filters.courseId ? parseInt(filters.courseId) : null;
      fetchTopicsData(courseTypeId, courseId);
    }
  }, [filters.subjectId, classSubjects, examSubjects, filters.courseTypeId, filters.courseId]);

  // Effect for class/exam subject change - fetch topics
  useEffect(() => {
    if (filters.classSubjectId || filters.examSubjectId || filters.courseSubjectId) {
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      const courseId = filters.courseId ? parseInt(filters.courseId) : null;
      const subjectId = filters.subjectId ? parseInt(filters.subjectId) : null;
      const classSubjectId = filters.classSubjectId ? parseInt(filters.classSubjectId) : null;
      const examSubjectId = filters.examSubjectId ? parseInt(filters.examSubjectId) : null;
      const courseSubjectId = filters.courseSubjectId ? parseInt(filters.courseSubjectId) : null;
      
      fetchTopicsData(courseTypeId, courseId, subjectId, classSubjectId, examSubjectId, courseSubjectId);
    }
  }, [filters.classSubjectId, filters.examSubjectId, filters.courseSubjectId, filters.courseTypeId, filters.courseId, filters.subjectId]);

  // Effect for active filter change - refetch topics
  useEffect(() => {
    console.log('Active filter changed:', filters.active);
    const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
    const courseId = filters.courseId ? parseInt(filters.courseId) : null;
    const subjectId = filters.subjectId ? parseInt(filters.subjectId) : null;
    const classSubjectId = filters.classSubjectId ? parseInt(filters.classSubjectId) : null;
    const examSubjectId = filters.examSubjectId ? parseInt(filters.examSubjectId) : null;
    const courseSubjectId = filters.courseSubjectId ? parseInt(filters.courseSubjectId) : null;
    
    fetchTopicsData(courseTypeId, courseId, subjectId, classSubjectId, examSubjectId, courseSubjectId, filters.active);
  }, [filters.active]);

  // Helper functions for course type logic
  const isAcademicCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  };

  const isCompetitiveCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('competitive');
  };

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      const [
        courseTypesData, 
        allCoursesData, 
        allClassesData, 
        allExamsData, 
        allSubjectsData,
        allClassSubjectsData,
        allExamSubjectsData
      ] = await Promise.all([
        getCourseTypes(token),
        getCourses(token),
        getClasses(token),
        getExams(token),
        getSubjects(token),
        getClassSubjects(token),
        getExamSubjects(token)
      ]);
      
      setCourseTypes(courseTypesData);
      setCourses(allCoursesData);
      setClasses(allClassesData);
      setExams(allExamsData);
      setSubjects(allSubjectsData);
      setClassSubjects(allClassSubjectsData);
      setExamSubjects(allExamSubjectsData);
      
      // Initialize filtered data
      setFilteredCourses(allCoursesData);
      setFilteredSubjects([]);
      setFilteredClassSubjects([]);
      setFilteredExamSubjects([]);
      
      console.log('Reference data loaded:', {
        courseTypes: courseTypesData.length,
        courses: allCoursesData.length,
        classes: allClassesData.length,
        exams: allExamsData.length,
        subjects: allSubjectsData.length,
        classSubjects: allClassSubjectsData.length,
        examSubjects: allExamSubjectsData.length
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch reference data',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch topics with filters
  const fetchTopicsData = async (courseTypeId = null, courseId = null, subjectId = null, classSubjectId = null, examSubjectId = null, courseSubjectId = null, active = null) => {
    try {
      setLoading(true);
      console.log('fetchTopicsData called with filters:', { 
        courseTypeId, courseId, subjectId, classSubjectId, examSubjectId, courseSubjectId, active 
      });
      
      const data = await getTopics(
        token, 
        active !== null ? active : filters.active,
        courseTypeId, 
        courseId, 
        subjectId, 
        classSubjectId, 
        examSubjectId, 
        courseSubjectId,
        null // chapterId - not used in this context
      );
      
      console.log('Fetched topics data:', data);
      console.log('Number of topics returned:', data?.length || 0);
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch topics',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayOrder: '',
      isActive: true,
      linkingType: 'classSubject',
      classSubjectId: '',
      examSubjectId: '',
      courseSubjectId: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing topic
        const updateData = {
          name: formData.name.trim(),
          description: formData.description ? formData.description.trim() : '',
          displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
          isActive: formData.isActive
        };
        
        await updateTopic(token, editingId, updateData);
        addNotification({
          type: 'success',
          message: 'Topic updated successfully',
          duration: 3000
        });
      } else {
        // Create new topic
        let response;
        
        if (formData.linkingType === 'classSubject' && formData.classSubjectId) {
          const classSubjectData = {
            name: formData.name.trim(),
            description: formData.description ? formData.description.trim() : '',
            displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
            isActive: formData.isActive,
            classSubjectId: parseInt(formData.classSubjectId)
          };
          response = await createTopicWithClassSubjectLink(token, classSubjectData);
        } else if (formData.linkingType === 'examSubject' && formData.examSubjectId) {
          const examSubjectData = {
            name: formData.name.trim(),
            description: formData.description ? formData.description.trim() : '',
            displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
            isActive: formData.isActive,
            examSubjectId: parseInt(formData.examSubjectId)
          };
          response = await createTopicWithExamSubjectLink(token, examSubjectData);
        } else if (formData.linkingType === 'courseSubject' && formData.courseSubjectId) {
          const courseSubjectData = {
            name: formData.name.trim(),
            description: formData.description ? formData.description.trim() : '',
            displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
            isActive: formData.isActive,
            courseSubjectId: parseInt(formData.courseSubjectId)
          };
          response = await createTopicWithCourseSubjectLink(token, courseSubjectData);
        } else {
          // Fallback for topics without specific linking
          const submitData = {
            name: formData.name.trim(),
            description: formData.description ? formData.description.trim() : '',
            displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
            isActive: formData.isActive
          };
          response = await createTopic(token, submitData);
        }
        
        addNotification({
          type: 'success',
          message: 'Topic created successfully',
          duration: 3000
        });
      }
      
      resetForm();
      
      // Refresh topics list
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      const courseId = filters.courseId ? parseInt(filters.courseId) : null;
      const subjectId = filters.subjectId ? parseInt(filters.subjectId) : null;
      const classSubjectId = filters.classSubjectId ? parseInt(filters.classSubjectId) : null;
      const examSubjectId = filters.examSubjectId ? parseInt(filters.examSubjectId) : null;
      const courseSubjectId = filters.courseSubjectId ? parseInt(filters.courseSubjectId) : null;
      
      fetchTopicsData(courseTypeId, courseId, subjectId, classSubjectId, examSubjectId, courseSubjectId, filters.active);
    } catch (error) {
      console.error('Error saving topic:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save topic',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setFormData({
      name: topic.name,
      description: topic.description || '',
      displayOrder: topic.displayOrder || '',
      isActive: topic.isActive,
      linkingType: 'classSubject', // Default for editing
      classSubjectId: '',
      examSubjectId: '',
      courseSubjectId: ''
    });
    setEditingId(topic.id);
    setShowForm(true);
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }
    
    try {
      await deleteTopic(token, topicId);
      addNotification({
        type: 'success',
        message: 'Topic deleted successfully',
        duration: 3000
      });
      
      // Refresh topics list
      const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
      const courseId = filters.courseId ? parseInt(filters.courseId) : null;
      const subjectId = filters.subjectId ? parseInt(filters.subjectId) : null;
      const classSubjectId = filters.classSubjectId ? parseInt(filters.classSubjectId) : null;
      const examSubjectId = filters.examSubjectId ? parseInt(filters.examSubjectId) : null;
      const courseSubjectId = filters.courseSubjectId ? parseInt(filters.courseSubjectId) : null;
      
      fetchTopicsData(courseTypeId, courseId, subjectId, classSubjectId, examSubjectId, courseSubjectId, filters.active);
    } catch (error) {
      console.error('Error deleting topic:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete topic',
        duration: 5000
      });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      active: true,
      courseTypeId: '',
      courseId: '',
      subjectId: '',
      classSubjectId: '',
      examSubjectId: '',
      courseSubjectId: ''
    });
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Topic Management</h2>
          <p>Manage topics with hierarchical filtering and linking to subjects</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={loading}
          >
            <span className="btn-icon">➕</span>
            Add Topic
          </button>
        </div>
      </div>

      {/* Drill-down Filters */}
      <div className="filter-section">
        <div className="filter-header">
          <h4>🔍 Filter Topics</h4>
          <div className="filter-header-controls">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.active}
                onChange={(e) => handleFilterChange('active', e.target.checked)}
              />
              <span>Active Only</span>
            </label>
            <button 
              className="btn btn-outline btn-xs"
              onClick={clearAllFilters}
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
              value={filters.courseTypeId}
              onChange={(e) => handleFilterChange('courseTypeId', e.target.value)}
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
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className="filter-select"
              disabled={!filters.courseTypeId}
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

        <div className="filter-row">
          {/* Subject Filter */}
          <div className="filter-group">
            <label htmlFor="subject-filter">3. Subject:</label>
            <select
              id="subject-filter"
              value={filters.subjectId}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="filter-select"
              disabled={!filters.courseId}
            >
              <option value="">All Subjects</option>
              {filteredSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {filters.courseId && filteredSubjects.length === 0 && (
              <small className="filter-hint">No subjects available for this course</small>
            )}
          </div>

          {/* Class/Exam Subject Filter - Conditional */}
          {filters.subjectId && (
            <div className="filter-group">
              {isAcademicCourseType(filters.courseTypeId) ? (
                <>
                  <label htmlFor="class-subject-filter">4. Class Subject (Academic):</label>
                  <select
                    id="class-subject-filter"
                    value={filters.classSubjectId}
                    onChange={(e) => handleFilterChange('classSubjectId', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Class Subjects</option>
                    {filteredClassSubjects.map(classSubject => (
                      <option key={classSubject.id} value={classSubject.id}>
                        {classSubject.class?.name} - {classSubject.subject?.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : isCompetitiveCourseType(filters.courseTypeId) ? (
                <>
                  <label htmlFor="exam-subject-filter">4. Exam Subject (Competitive):</label>
                  <select
                    id="exam-subject-filter"
                    value={filters.examSubjectId}
                    onChange={(e) => handleFilterChange('examSubjectId', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Exam Subjects</option>
                    {filteredExamSubjects.map(examSubject => (
                      <option key={examSubject.id} value={examSubject.id}>
                        {examSubject.exam?.name} - {examSubject.subject?.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div className="filter-info">
                  <small className="filter-hint">
                    ℹ️ This course type doesn't support Class/Exam subject filtering. 
                    Only topics linked directly to subjects will be shown.
                  </small>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {(filters.courseTypeId || filters.courseId || filters.subjectId || filters.classSubjectId || filters.examSubjectId || filters.courseSubjectId || !filters.active) && (
          <div className="active-filters">
            <strong>Active Filters:</strong>
            {!filters.active && (
              <span className="filter-tag">
                Show: All (Active + Inactive)
              </span>
            )}
            {filters.courseTypeId && (
              <span className="filter-tag">
                Course Type: {courseTypes.find(ct => ct.id === parseInt(filters.courseTypeId))?.name}
              </span>
            )}
            {filters.courseId && (
              <span className="filter-tag">
                Course: {filteredCourses.find(c => c.id === parseInt(filters.courseId))?.name}
              </span>
            )}
            {filters.subjectId && (
              <span className="filter-tag">
                Subject: {filteredSubjects.find(s => s.id === parseInt(filters.subjectId))?.name}
              </span>
            )}
            {filters.classSubjectId && (
              <span className="filter-tag">
                Class Subject: {filteredClassSubjects.find(cs => cs.id === parseInt(filters.classSubjectId))?.class?.name} - {filteredClassSubjects.find(cs => cs.id === parseInt(filters.classSubjectId))?.subject?.name}
              </span>
            )}
            {filters.examSubjectId && (
              <span className="filter-tag">
                Exam Subject: {filteredExamSubjects.find(es => es.id === parseInt(filters.examSubjectId))?.exam?.name} - {filteredExamSubjects.find(es => es.id === parseInt(filters.examSubjectId))?.subject?.name}
              </span>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Topic' : 'Add New Topic'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Topic Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Algebra Basics, Quantitative Aptitude"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="displayOrder">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the topic content and scope"
                />
              </div>
            </div>

            {!editingId && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="linkingType">Linking Type *</label>
                    <select
                      id="linkingType"
                      name="linkingType"
                      value={formData.linkingType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="classSubject">Link to Class Subject (Academic)</option>
                      <option value="examSubject">Link to Exam Subject (Competitive)</option>
                      <option value="courseSubject">Link to Course Subject (Direct)</option>
                    </select>
                  </div>
                </div>

                {/* Class Subject Selection (Academic) */}
                {formData.linkingType === 'classSubject' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="classSubjectId">Class Subject *</label>
                      <select
                        id="classSubjectId"
                        name="classSubjectId"
                        value={formData.classSubjectId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Class Subject</option>
                        {classSubjects.map(classSubject => (
                          <option key={classSubject.id} value={classSubject.id}>
                            {classSubject.class?.name} - {classSubject.subject?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Exam Subject Selection (Competitive) */}
                {formData.linkingType === 'examSubject' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="examSubjectId">Exam Subject *</label>
                      <select
                        id="examSubjectId"
                        name="examSubjectId"
                        value={formData.examSubjectId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Exam Subject</option>
                        {examSubjects.map(examSubject => (
                          <option key={examSubject.id} value={examSubject.id}>
                            {examSubject.exam?.name} - {examSubject.subject?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Course Subject Selection (Direct) */}
                {formData.linkingType === 'courseSubject' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="courseSubjectId">Course Subject *</label>
                      <select
                        id="courseSubjectId"
                        name="courseSubjectId"
                        value={formData.courseSubjectId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Course Subject</option>
                        {/* Note: Course subjects would need to be fetched separately */}
                        <option value="" disabled>Course subjects not implemented yet</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update Topic' : 'Create Topic')}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Topics ({topics.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                const courseTypeId = filters.courseTypeId ? parseInt(filters.courseTypeId) : null;
                const courseId = filters.courseId ? parseInt(filters.courseId) : null;
                const subjectId = filters.subjectId ? parseInt(filters.subjectId) : null;
                const classSubjectId = filters.classSubjectId ? parseInt(filters.classSubjectId) : null;
                const examSubjectId = filters.examSubjectId ? parseInt(filters.examSubjectId) : null;
                const courseSubjectId = filters.courseSubjectId ? parseInt(filters.courseSubjectId) : null;
                fetchTopicsData(courseTypeId, courseId, subjectId, classSubjectId, examSubjectId, courseSubjectId, filters.active);
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
            <div className="spinner"></div>
            <p>Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h4>No Topics Found</h4>
            <p>No topics match your current filters. Try adjusting your filter criteria or create a new topic.</p>
          </div>
        ) : (
          <div className="data-grid">
            {topics.map((topic) => (
              <div key={topic.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{topic.name}</h4>
                    <span className={`status-badge ${topic.isActive ? 'active' : 'inactive'}`}>
                      {topic.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(topic)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(topic.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  {topic.description && (
                    <p className="description">{topic.description}</p>
                  )}
                  
                  {topic.displayOrder && (
                    <p><strong>Display Order:</strong> {topic.displayOrder}</p>
                  )}

                  {/* Show linking information */}
                  {topic.classSubject && (
                    <p><strong>Linked to:</strong> {topic.classSubject.class?.name} - {topic.classSubject.subject?.name} (Class Subject)</p>
                  )}
                  {topic.examSubject && (
                    <p><strong>Linked to:</strong> {topic.examSubject.exam?.name} - {topic.examSubject.subject?.name} (Exam Subject)</p>
                  )}
                  {topic.courseSubject && (
                    <p><strong>Linked to:</strong> {topic.courseSubject.course?.name} - {topic.courseSubject.subject?.name} (Course Subject)</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(topic.createdAt).toLocaleDateString()}
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

export default TopicManagement;