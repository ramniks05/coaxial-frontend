import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    getClassSubjects,
    getClasses,
    getExamSubjects,
    getExams,
    getSubjects
} from '../services/masterDataService';
import { getCourseTypesCached, getCoursesCached } from '../services/globalApiCache';

const SubjectFilter = () => {
  const { token } = useApp();
  
  // Filter states
  const [filters, setFilters] = useState({
    courseTypeId: null,
    courseId: null,
    classId: null,
    examId: null,
    activeOnly: true
  });

  // Data states
  const [subjects, setSubjects] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course types and all subjects initially
      const [courseTypesData, subjectsData] = await Promise.all([
        getCourseTypesCached(token),
        getSubjects(token)
      ]);
      
      setCourseTypes(courseTypesData || []);
      setSubjects(subjectsData || []);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all subjects for "All Course Types"');
      const subjectsData = await getSubjects(token);
      
      // Apply active filter if needed
      let filteredSubjects = subjectsData || [];
      if (filters.activeOnly) {
        filteredSubjects = filteredSubjects.filter(subject => subject.isActive);
      }
      
      // Remove duplicates and sort by display order
      const uniqueSubjects = filteredSubjects.filter((subject, index, self) => 
        index === self.findIndex(s => s.id === subject.id)
      );
      
      uniqueSubjects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setSubjects(uniqueSubjects);
      console.log(`Loaded ${uniqueSubjects.length} subjects for all course types`);
      
    } catch (error) {
      console.error('Error fetching all subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses when course type changes
  useEffect(() => {
    if (filters.courseTypeId && token) {
      fetchCourses();
    } else {
      setCourses([]);
      setClasses([]);
      setExams([]);
      // When "All Course Types" is selected, reload all subjects
      fetchAllSubjects();
    }
  }, [filters.courseTypeId, token]);

  // Fetch classes/exams when course changes
  useEffect(() => {
    if (filters.courseId && token) {
      fetchClassesAndExams();
    } else {
      setClasses([]);
      setExams([]);
      setSubjects([]);
    }
  }, [filters.courseId, token]);

  // Fetch subjects when class/exam changes
  useEffect(() => {
    if ((filters.classId || filters.examId) && token) {
      fetchFilteredSubjects();
    } else if (filters.courseId && token) {
      // If no class/exam selected, show all subjects for the course
      fetchSubjectsByCourse();
    }
  }, [filters.classId, filters.examId, filters.courseId, token]);

  // Handle activeOnly filter changes
  useEffect(() => {
    if (!filters.courseTypeId && !filters.courseId && !filters.classId && !filters.examId) {
      // If no specific filters are applied, reload all subjects with active filter
      fetchAllSubjects();
    }
  }, [filters.activeOnly, token]);

  const fetchCourses = async () => {
    try {
      const coursesData = await getCoursesCached(token);
      // Filter courses by selected course type
      const filteredCourses = coursesData?.filter(course => 
        course.courseType?.id === filters.courseTypeId
      ) || [];
      setCourses(filteredCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    }
  };

  const fetchClassesAndExams = async () => {
    try {
      const [classesData, examsData] = await Promise.all([
        getClasses(token),
        getExams(token)
      ]);

      // Filter classes by selected course
      const filteredClasses = classesData?.filter(classItem => 
        classItem.course?.id === filters.courseId
      ) || [];

      // Filter exams by selected course
      const filteredExams = examsData?.filter(exam => 
        exam.course?.id === filters.courseId
      ) || [];

      setClasses(filteredClasses);
      setExams(filteredExams);
    } catch (error) {
      console.error('Error fetching classes and exams:', error);
      setError('Failed to load classes and exams');
    }
  };

  const fetchFilteredSubjects = async () => {
    try {
      setLoading(true);
      let subjectsData = [];

      if (filters.classId) {
        // Get subjects for the selected class
        const classSubjectsData = await getClassSubjects(token, filters.classId);
        subjectsData = classSubjectsData?.map(cs => cs.subject) || [];
      } else if (filters.examId) {
        // Get subjects for the selected exam
        const examSubjectsData = await getExamSubjects(token, filters.examId);
        subjectsData = examSubjectsData?.map(es => es.subject) || [];
      }

      // Apply active filter if needed
      if (filters.activeOnly) {
        subjectsData = subjectsData.filter(subject => subject.isActive);
      }

      // Remove duplicates and sort by display order
      const uniqueSubjects = subjectsData.filter((subject, index, self) => 
        index === self.findIndex(s => s.id === subject.id)
      );
      
      uniqueSubjects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching filtered subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsByCourse = async () => {
    try {
      setLoading(true);
      // Get all subjects and filter by course
      const allSubjects = await getSubjects(token);
      const filteredSubjects = allSubjects?.filter(subject => 
        subject.course?.id === filters.courseId
      ) || [];

      // Apply active filter if needed
      let finalSubjects = filteredSubjects;
      if (filters.activeOnly) {
        finalSubjects = filteredSubjects.filter(subject => subject.isActive);
      }

      // Remove duplicates and sort by display order
      const uniqueSubjects = finalSubjects.filter((subject, index, self) => 
        index === self.findIndex(s => s.id === subject.id)
      );
      
      uniqueSubjects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching subjects by course:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset dependent filters when parent filter changes
      if (key === 'courseTypeId') {
        newFilters.courseId = null;
        newFilters.classId = null;
        newFilters.examId = null;
      } else if (key === 'courseId') {
        newFilters.classId = null;
        newFilters.examId = null;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      courseTypeId: null,
      courseId: null,
      classId: null,
      examId: null,
      activeOnly: true
    });
    setCourses([]);
    setClasses([]);
    setExams([]);
    // Reload all subjects when filters are cleared
    fetchAllSubjects();
  };

  const getCourseTypeName = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : '';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : '';
  };

  const getClassName = (classId) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : '';
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.name : '';
  };

  return (
    <div className="subject-filter-container">
      <div className="filter-header">
        <h2>Subject Filter</h2>
        <button onClick={clearFilters} className="btn btn-secondary">
          Clear All Filters
        </button>
      </div>

      <div className="filter-controls">
        {/* Course Type Filter */}
        <div className="form-group">
          <label htmlFor="courseType">Course Type:</label>
          <select
            id="courseType"
            className="form-control"
            value={filters.courseTypeId || ''}
            onChange={(e) => handleFilterChange('courseTypeId', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select Course Type</option>
            {courseTypes?.map(ct => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Filter */}
        <div className="form-group">
          <label htmlFor="course">Course:</label>
          <select
            id="course"
            className="form-control"
            value={filters.courseId || ''}
            onChange={(e) => handleFilterChange('courseId', e.target.value ? Number(e.target.value) : null)}
            disabled={!filters.courseTypeId}
          >
            <option value="">Select Course</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter (for Academic courses) */}
        {filters.courseTypeId === 1 && (
          <div className="form-group">
            <label htmlFor="class">Class:</label>
            <select
              id="class"
              className="form-control"
              value={filters.classId || ''}
              onChange={(e) => handleFilterChange('classId', e.target.value ? Number(e.target.value) : null)}
              disabled={!filters.courseId}
            >
              <option value="">Select Class</option>
              {classes?.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exam Filter (for Competitive courses) */}
        {filters.courseTypeId === 2 && (
          <div className="form-group">
            <label htmlFor="exam">Exam:</label>
            <select
              id="exam"
              className="form-control"
              value={filters.examId || ''}
              onChange={(e) => handleFilterChange('examId', e.target.value ? Number(e.target.value) : null)}
              disabled={!filters.courseId}
            >
              <option value="">Select Exam</option>
              {exams?.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active Only Filter */}
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
            />
            Active Only
          </label>
        </div>
      </div>

      {/* Current Filter Summary */}
      {(filters.courseTypeId || filters.courseId || filters.classId || filters.examId) && (
        <div className="filter-summary">
          <h4>Current Filter:</h4>
          <div className="filter-breadcrumb">
            {filters.courseTypeId && (
              <span className="filter-item">
                Course Type: {getCourseTypeName(filters.courseTypeId)}
              </span>
            )}
            {filters.courseId && (
              <span className="filter-item">
                → Course: {getCourseName(filters.courseId)}
              </span>
            )}
            {filters.classId && (
              <span className="filter-item">
                → Class: {getClassName(filters.classId)}
              </span>
            )}
            {filters.examId && (
              <span className="filter-item">
                → Exam: {getExamName(filters.examId)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="results-section">
        <div className="results-header">
          <h3>Subjects ({subjects.length})</h3>
          {loading && <span className="loading-indicator">Loading...</span>}
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="subjects-grid">
            {subjects.length === 0 ? (
              <div className="no-results">
                {filters.courseTypeId ? 'No subjects found matching the current filters.' : 'Please select a course type to start filtering subjects.'}
              </div>
            ) : (
              subjects.map(subject => (
                <div key={subject.id} className="subject-card">
                  <h4>{subject.name}</h4>
                  {subject.description && (
                    <p className="subject-description">{subject.description}</p>
                  )}
                  <div className="subject-meta">
                    <div className="subject-status">
                      <span className={`badge ${subject.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="display-order">Order: {subject.displayOrder}</span>
                    </div>
                  </div>
                  <div className="subject-details">
                    <small className="text-muted">
                      Created: {new Date(subject.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectFilter;