import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../../context/AppContext';
import './AcademicLevelFilters.css';

const AcademicLevelFilters = ({ filters, onFilterChange, isLoading }) => {
  const { token } = useApp();
  
  // State for dropdown options
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // Loading states for each dropdown
  const [loadingStates, setLoadingStates] = useState({
    courseTypes: false,
    courses: false,
    classes: false,
    exams: false,
    subjects: false,
    topics: false,
    modules: false,
    chapters: false
  });

  // Fetch course types
  const fetchCourseTypes = useCallback(async () => {
    if (!token) return;
    
    setLoadingStates(prev => ({ ...prev, courseTypes: true }));
    try {
      const response = await fetch('/api/admin/master-data/course-types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCourseTypes(data);
      } else if (data.content) {
        setCourseTypes(data.content);
      } else {
        // Fallback course types if API fails
        setCourseTypes([
          { id: 1, name: 'Academic' },
          { id: 2, name: 'Competitive' },
          { id: 3, name: 'Professional' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching course types:', error);
      // Fallback course types if API fails
      setCourseTypes([
        { id: 1, name: 'Academic' },
        { id: 2, name: 'Competitive' },
        { id: 3, name: 'Professional' }
      ]);
    } finally {
      setLoadingStates(prev => ({ ...prev, courseTypes: false }));
    }
  }, [token]);

  // Fetch courses by course type
  const fetchCourses = useCallback(async (courseTypeId) => {
    if (!token || !courseTypeId) return;
    
    setLoadingStates(prev => ({ ...prev, courses: true }));
    try {
      const response = await fetch(`/api/admin/master-data/courses?courseTypeId=${courseTypeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.content) {
        setCourses(data.content);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, courses: false }));
    }
  }, [token]);

  // Fetch classes by course
  const fetchClasses = useCallback(async (courseTypeId, courseId) => {
    if (!token || !courseTypeId || !courseId) return;
    
    setLoadingStates(prev => ({ ...prev, classes: true }));
    try {
      const response = await fetch(`/api/admin/master-data/classes?courseTypeId=${courseTypeId}&courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setClasses(data);
      } else if (data.content) {
        setClasses(data.content);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, classes: false }));
    }
  }, [token]);

  // Fetch exams by course
  const fetchExams = useCallback(async (courseTypeId, courseId) => {
    if (!token || !courseTypeId || !courseId) return;
    
    setLoadingStates(prev => ({ ...prev, exams: true }));
    try {
      const response = await fetch(`/api/admin/master-data/exams?courseTypeId=${courseTypeId}&courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setExams(data);
      } else if (data.content) {
        setExams(data.content);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, exams: false }));
    }
  }, [token]);

  // Fetch subjects by linkage
  const fetchSubjects = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!token || !courseTypeId || !courseId) return;
    
    setLoadingStates(prev => ({ ...prev, subjects: true }));
    try {
      let endpoint = `/api/admin/subjects/subject-linkages/filter?courseTypeId=${courseTypeId}&courseId=${courseId}`;
      if (classId) endpoint += `&classId=${classId}`;
      if (examId) endpoint += `&examId=${examId}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSubjects(data);
      } else if (data.content) {
        setSubjects(data.content);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, subjects: false }));
    }
  }, [token]);

  // Fetch topics by subject
  const fetchTopics = useCallback(async (subjectId) => {
    if (!token || !subjectId) return;
    
    setLoadingStates(prev => ({ ...prev, topics: true }));
    try {
      const response = await fetch(`/api/admin/master-data/topics?subjectId=${subjectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTopics(data);
      } else if (data.content) {
        setTopics(data.content);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, topics: false }));
    }
  }, [token]);

  // Fetch modules by topic
  const fetchModules = useCallback(async (topicId) => {
    if (!token || !topicId) return;
    
    setLoadingStates(prev => ({ ...prev, modules: true }));
    try {
      const response = await fetch(`/api/admin/master-data/modules?topicId=${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setModules(data);
      } else if (data.content) {
        setModules(data.content);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, modules: false }));
    }
  }, [token]);

  // Fetch chapters by module
  const fetchChapters = useCallback(async (moduleId) => {
    if (!token || !moduleId) return;
    
    setLoadingStates(prev => ({ ...prev, chapters: true }));
    try {
      const response = await fetch(`/api/admin/master-data/chapters?moduleId=${moduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setChapters(data);
      } else if (data.content) {
        setChapters(data.content);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, chapters: false }));
    }
  }, [token]);

  // Load course types on mount
  useEffect(() => {
    fetchCourseTypes();
  }, [fetchCourseTypes]);

  // Debug logging
  useEffect(() => {
    console.log('AcademicLevelFilters - courseTypes:', courseTypes);
    console.log('AcademicLevelFilters - loadingStates:', loadingStates);
    console.log('AcademicLevelFilters - filters:', filters);
  }, [courseTypes, loadingStates, filters]);

  // Clear dependent dropdowns when parent changes
  const clearDependentDropdowns = (level) => {
    const updates = {};
    if (level === 'courseType') {
      updates.courseId = null;
      updates.relationshipId = null;
      updates.subjectId = null;
      updates.topicId = null;
      updates.moduleId = null;
      updates.chapterId = null;
    } else if (level === 'course') {
      updates.relationshipId = null;
      updates.subjectId = null;
      updates.topicId = null;
      updates.moduleId = null;
      updates.chapterId = null;
    } else if (level === 'subject') {
      updates.topicId = null;
      updates.moduleId = null;
      updates.chapterId = null;
    } else if (level === 'topic') {
      updates.moduleId = null;
      updates.chapterId = null;
    } else if (level === 'module') {
      updates.chapterId = null;
    }
    
    onFilterChange(updates);
  };

  // Handle course type change
  const handleCourseTypeChange = (courseTypeId) => {
    clearDependentDropdowns('courseType');
    onFilterChange({ courseTypeId: courseTypeId ? parseInt(courseTypeId) : null });
    
    if (courseTypeId) {
      fetchCourses(courseTypeId);
    } else {
      setCourses([]);
      setClasses([]);
      setExams([]);
      setSubjects([]);
      setTopics([]);
      setModules([]);
      setChapters([]);
    }
  };

  // Handle course change
  const handleCourseChange = (courseId) => {
    clearDependentDropdowns('course');
    onFilterChange({ courseId: courseId ? parseInt(courseId) : null });
    
    if (courseId && filters.courseTypeId) {
      const courseTypeId = filters.courseTypeId;
      
      // Fetch classes and exams based on course type
      if (courseTypeId === 1) { // Academic
        fetchClasses(courseTypeId, courseId);
      } else if (courseTypeId === 2) { // Competitive
        fetchExams(courseTypeId, courseId);
      }
      
      // Always fetch subjects
      fetchSubjects(courseTypeId, courseId, null, null);
    } else {
      setClasses([]);
      setExams([]);
      setSubjects([]);
      setTopics([]);
      setModules([]);
      setChapters([]);
    }
  };

  // Handle class/exam change
  const handleClassExamChange = (value, type) => {
    clearDependentDropdowns('subject');
    const updates = {};
    if (type === 'class') {
      updates.relationshipId = value ? parseInt(value) : null;
    } else if (type === 'exam') {
      updates.relationshipId = value ? parseInt(value) : null;
    }
    onFilterChange(updates);
    
    if (value && filters.courseTypeId && filters.courseId) {
      const courseTypeId = filters.courseTypeId;
      const courseId = filters.courseId;
      
      if (type === 'class') {
        fetchSubjects(courseTypeId, courseId, value, null);
      } else if (type === 'exam') {
        fetchSubjects(courseTypeId, courseId, null, value);
      }
    } else {
      setSubjects([]);
      setTopics([]);
      setModules([]);
      setChapters([]);
    }
  };

  // Handle subject change
  const handleSubjectChange = (subjectId) => {
    clearDependentDropdowns('subject');
    onFilterChange({ subjectId: subjectId ? parseInt(subjectId) : null });
    
    if (subjectId) {
      fetchTopics(subjectId);
    } else {
      setTopics([]);
      setModules([]);
      setChapters([]);
    }
  };

  // Handle topic change
  const handleTopicChange = (topicId) => {
    clearDependentDropdowns('topic');
    onFilterChange({ topicId: topicId ? parseInt(topicId) : null });
    
    if (topicId) {
      fetchModules(topicId);
    } else {
      setModules([]);
      setChapters([]);
    }
  };

  // Handle module change
  const handleModuleChange = (moduleId) => {
    clearDependentDropdowns('module');
    onFilterChange({ moduleId: moduleId ? parseInt(moduleId) : null });
    
    if (moduleId) {
      fetchChapters(moduleId);
    } else {
      setChapters([]);
    }
  };

  // Handle chapter change
  const handleChapterChange = (chapterId) => {
    onFilterChange({ chapterId: chapterId ? parseInt(chapterId) : null });
  };

  const getCourseTypeName = (id) => {
    const type = courseTypes.find(ct => ct.id === id);
    return type ? type.name : 'Unknown';
  };

  const isAcademic = filters.courseTypeId === 1;
  const isCompetitive = filters.courseTypeId === 2;
  const isProfessional = filters.courseTypeId === 3;

  return (
    <div className="academic-level-filters">
      {/* Course Type */}
      <div className="filter-group">
        <label className="filter-label">Course Type</label>
        <div className="radio-group">
          {loadingStates.courseTypes ? (
            <div className="loading-indicator">Loading course types...</div>
          ) : courseTypes.length > 0 ? (
            courseTypes.map(courseType => (
              <label key={courseType.id} className="radio-option">
                <input
                  type="radio"
                  name="courseType"
                  value={courseType.id}
                  checked={filters.courseTypeId === courseType.id}
                  onChange={(e) => handleCourseTypeChange(e.target.value)}
                  disabled={isLoading || loadingStates.courseTypes}
                />
                <span className="radio-label">{courseType.name}</span>
              </label>
            ))
          ) : (
            <div className="no-data">No course types available</div>
          )}
        </div>
      </div>

      {/* Course */}
      {filters.courseTypeId && (
        <div className="filter-group">
          <label className="filter-label">Course</label>
          <select
            className="filter-select"
            value={filters.courseId || ''}
            onChange={(e) => handleCourseChange(e.target.value)}
            disabled={isLoading || loadingStates.courses}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          {loadingStates.courses && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Class (for Academic) */}
      {isAcademic && filters.courseId && (
        <div className="filter-group">
          <label className="filter-label">Class</label>
          <select
            className="filter-select"
            value={filters.relationshipId || ''}
            onChange={(e) => handleClassExamChange(e.target.value, 'class')}
            disabled={isLoading || loadingStates.classes}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {loadingStates.classes && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Exam (for Competitive) */}
      {isCompetitive && filters.courseId && (
        <div className="filter-group">
          <label className="filter-label">Exam</label>
          <select
            className="filter-select"
            value={filters.relationshipId || ''}
            onChange={(e) => handleClassExamChange(e.target.value, 'exam')}
            disabled={isLoading || loadingStates.exams}
          >
            <option value="">Select Exam</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          {loadingStates.exams && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Subject */}
      {filters.courseId && (
        <div className="filter-group">
          <label className="filter-label">Subject</label>
          <select
            className="filter-select"
            value={filters.subjectId || ''}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={isLoading || loadingStates.subjects}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.linkageId || subject.id} value={subject.linkageId || subject.id}>
                {subject.subjectName || subject.name}
              </option>
            ))}
          </select>
          {loadingStates.subjects && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Topic */}
      {filters.subjectId && (
        <div className="filter-group">
          <label className="filter-label">Topic</label>
          <select
            className="filter-select"
            value={filters.topicId || ''}
            onChange={(e) => handleTopicChange(e.target.value)}
            disabled={isLoading || loadingStates.topics}
          >
            <option value="">Select Topic</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          {loadingStates.topics && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Module */}
      {filters.topicId && (
        <div className="filter-group">
          <label className="filter-label">Module</label>
          <select
            className="filter-select"
            value={filters.moduleId || ''}
            onChange={(e) => handleModuleChange(e.target.value)}
            disabled={isLoading || loadingStates.modules}
          >
            <option value="">Select Module</option>
            {modules.map(module => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>
          {loadingStates.modules && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Chapter */}
      {filters.moduleId && (
        <div className="filter-group">
          <label className="filter-label">Chapter</label>
          <select
            className="filter-select"
            value={filters.chapterId || ''}
            onChange={(e) => handleChapterChange(e.target.value)}
            disabled={isLoading || loadingStates.chapters}
          >
            <option value="">Select Chapter</option>
            {chapters.map(chapter => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.name}
              </option>
            ))}
          </select>
          {loadingStates.chapters && <div className="loading-indicator">Loading...</div>}
        </div>
      )}

      {/* Applied Filters Summary */}
      {(filters.courseTypeId || filters.courseId || filters.subjectId || 
        filters.topicId || filters.moduleId || filters.chapterId) && (
        <div className="applied-filters">
          <h5>Applied Academic Filters:</h5>
          <div className="filter-tags">
            {filters.courseTypeId && (
              <span className="filter-tag">
                Type: {getCourseTypeName(filters.courseTypeId)}
                <button
                  type="button"
                  onClick={() => handleCourseTypeChange(null)}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
            {(filters.subjectId || filters.topicId || filters.moduleId || filters.chapterId) && (
              <span className="filter-tag">
                Hierarchy: {
                  [
                    filters.chapterId && 'Chapter',
                    filters.moduleId && 'Module', 
                    filters.topicId && 'Topic',
                    filters.subjectId && 'Subject'
                  ].filter(Boolean).join(' → ')
                }
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      subjectId: null,
                      topicId: null,
                      moduleId: null,
                      chapterId: null
                    });
                  }}
                  className="remove-tag"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicLevelFilters;
