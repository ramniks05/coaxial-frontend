import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useMasterData } from '../../../hooks/useMasterData';
import { useSharedMasterDataFilters } from '../../../hooks/useSharedMasterDataFilters';
import { getCourseTypesCached } from '../../../services/globalApiCache';
import '../MasterDataComponent.css';

/**
 * Chapter Filters Component
 * Handles the filter UI and logic for chapter management
 */
const ChapterFilters = ({ onFiltersChange, loading }) => {
  const { token } = useApp();
  const { getCourseTypeName } = useMasterData();
  const [courseTypes, setCourseTypes] = useState([]);

  // Use the master data filters hook
  const {
    selectedCourseType,
    setSelectedCourseType,
    selectedCourse,
    setSelectedCourse,
    selectedClass,
    setSelectedClass,
    selectedExam,
    setSelectedExam,
    selectedSubject,
    setSelectedSubject,
    selectedTopic,
    setSelectedTopic,
    selectedModule,
    setSelectedModule,
    showActiveOnly,
    setShowActiveOnly,
    filteredCourses,
    filteredClasses,
    filteredExams,
    filteredSubjects,
    filteredTopics,
    filteredModules,
    loadingStates,
    resetFilters,
    isAcademicCourseType,
    isCompetitiveCourseType
  } = useSharedMasterDataFilters();

  // Load course types on mount
  useEffect(() => {
    const loadCourseTypes = async () => {
      if (!token) return;
      try {
        const data = await getCourseTypesCached(token);
        console.log('Raw courseTypes API response (ChapterFilters):', data);
        console.log('CourseTypes data type:', typeof data);
        console.log('CourseTypes is array:', Array.isArray(data));
        
        // Handle different response formats
        let courseTypesArray = [];
        if (Array.isArray(data)) {
          courseTypesArray = data;
        } else if (data && Array.isArray(data.content)) {
          // Handle paginated response
          courseTypesArray = data.content;
        } else if (data && Array.isArray(data.data)) {
          // Handle wrapped response
          courseTypesArray = data.data;
        } else if (data && data.courseTypes && Array.isArray(data.courseTypes)) {
          // Handle nested response
          courseTypesArray = data.courseTypes;
        } else {
          console.warn('Unexpected courseTypes data format (ChapterFilters):', data);
          courseTypesArray = [];
        }
        
        console.log('Processed courseTypes array (ChapterFilters):', courseTypesArray);
        setCourseTypes(courseTypesArray);
      } catch (error) {
        console.error('Error loading course types:', error);
      }
    };
    loadCourseTypes();
  }, [token]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        courseType: selectedCourseType,
        course: selectedCourse,
        class: selectedClass,
        exam: selectedExam,
        subject: selectedSubject,
        topic: selectedTopic,
        module: selectedModule,
        showActiveOnly
      });
    }
  }, [selectedCourseType, selectedCourse, selectedClass, selectedExam, selectedSubject, selectedTopic, selectedModule, showActiveOnly, onFiltersChange]);

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'courseType':
        setSelectedCourseType(value);
        // Reset dependent filters
        setSelectedCourse('');
        setSelectedClass('');
        setSelectedExam('');
        setSelectedSubject('');
        setSelectedTopic('');
        setSelectedModule('');
        break;
      case 'course':
        setSelectedCourse(value);
        // Reset dependent filters
        setSelectedClass('');
        setSelectedExam('');
        setSelectedSubject('');
        setSelectedTopic('');
        setSelectedModule('');
        break;
      case 'class':
        setSelectedClass(value);
        // Reset dependent filters
        setSelectedSubject('');
        setSelectedTopic('');
        setSelectedModule('');
        break;
      case 'exam':
        setSelectedExam(value);
        // Reset dependent filters
        setSelectedSubject('');
        setSelectedTopic('');
        setSelectedModule('');
        break;
      case 'subject':
        setSelectedSubject(value);
        // Reset dependent filters
        setSelectedTopic('');
        setSelectedModule('');
        break;
      case 'topic':
        setSelectedTopic(value);
        // Reset dependent filters
        setSelectedModule('');
        break;
      case 'module':
        setSelectedModule(value);
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    resetFilters();
  };

  return (
    <div className="filter-section">
      <div className="filter-header">
        <h4>Filter Chapters</h4>
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
            onClick={clearAllFilters}
            disabled={loading}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {(loading && courseTypes.length === 0) ? (
        <div className="empty-state">
          <div className="empty-icon">No Chapters</div>
          <h4>Loading Course Types...</h4>
          <p>Please wait while we load the course types</p>
        </div>
      ) : (
        <div className="filter-row">
          {/* Course Type Filter */}
          <div className="filter-group">
            <label htmlFor="course-type-filter">1. Course Type:</label>
            <select
              id="course-type-filter"
              value={selectedCourseType}
              onChange={(e) => handleFilterChange('courseType', e.target.value)}
              className="filter-select"
            >
              <option value="">Select Course Type</option>
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
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="filter-select"
              disabled={!selectedCourseType || loadingStates.courses}
            >
              <option value="">Select Course</option>
              {filteredCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter (Academic only) */}
          {isAcademicCourseType(selectedCourseType) && (
            <div className="filter-group">
              <label htmlFor="class-filter">3. Class:</label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => handleFilterChange('class', e.target.value)}
                className="filter-select"
                disabled={!selectedCourse || loadingStates.classes}
              >
                <option value="">Select Class</option>
                {filteredClasses.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam Filter (Competitive only) */}
          {isCompetitiveCourseType(selectedCourseType) && (
            <div className="filter-group">
              <label htmlFor="exam-filter">3. Exam:</label>
              <select
                id="exam-filter"
                value={selectedExam}
                onChange={(e) => handleFilterChange('exam', e.target.value)}
                className="filter-select"
                disabled={!selectedCourse || loadingStates.exams}
              >
                <option value="">Select Exam</option>
                {filteredExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          <div className="filter-group">
            <label htmlFor="subject-filter">4. Subject:</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="filter-select"
              disabled={!selectedCourse || loadingStates.subjects}
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map(subject => {
                const subjectName = subject.subjectName || subject.name;
                return (
                  <option key={subject.linkageId || subject.id} value={subject.linkageId || subject.id}>
                    {subjectName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Topic Filter */}
          <div className="filter-group">
            <label htmlFor="topic-filter">5. Topic:</label>
            <select
              id="topic-filter"
              value={selectedTopic}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
              className="filter-select"
              disabled={!selectedSubject || loadingStates.topics}
            >
              <option value="">Select Topic</option>
              {filteredTopics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="filter-group">
            <label htmlFor="module-filter">6. Module:</label>
            <select
              id="module-filter"
              value={selectedModule}
              onChange={(e) => handleFilterChange('module', e.target.value)}
              className="filter-select"
              disabled={!selectedTopic || loadingStates.modules}
            >
              <option value="">Select Module</option>
              {filteredModules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(selectedCourseType || selectedCourse || selectedClass || selectedExam || selectedSubject || selectedTopic || selectedModule || !showActiveOnly) && (
        <div className="active-filters">
          <strong>Active Filters:</strong>
          {selectedCourseType && (
            <span className="filter-tag">
              Course Type: {getCourseTypeName(selectedCourseType)}
            </span>
          )}
          {selectedCourse && (
            <span className="filter-tag">
              Course: {filteredCourses.find(c => c.id == selectedCourse)?.name}
            </span>
          )}
          {selectedClass && (
            <span className="filter-tag">
              Class: {filteredClasses.find(c => c.id == selectedClass)?.name}
            </span>
          )}
          {selectedExam && (
            <span className="filter-tag">
              Exam: {filteredExams.find(e => e.id == selectedExam)?.name}
            </span>
          )}
          {selectedSubject && (
            <span className="filter-tag">
              Subject: {filteredSubjects.find(s => s.id == selectedSubject)?.name || filteredSubjects.find(s => s.id == selectedSubject)?.subjectName}
            </span>
          )}
          {selectedTopic && (
            <span className="filter-tag">
              Topic: {filteredTopics.find(t => t.id == selectedTopic)?.name}
            </span>
          )}
          {selectedModule && (
            <span className="filter-tag">
              Module: {filteredModules.find(m => m.id == selectedModule)?.name}
            </span>
          )}
          {!showActiveOnly && (
            <span className="filter-tag">Including Inactive</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterFilters;
