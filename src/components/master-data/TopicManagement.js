import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCourseTypesCached } from '../../services/globalApiCache';
import {
    createTopic,
    deleteTopic,
    getAllSubjectLinkages,
    getClassesByCourse,
    getCourses,
    getExamsByCourse,
    getMasterSubjectsByCourseType,
    getTopicsCombinedFilter,
    updateTopic
} from '../../services/masterDataService';
import AdminPageHeader from '../common/AdminPageHeader';
import './MasterDataComponent.css';

// Reusable DataCard Component
const DataCard = ({ 
  item, 
  itemType = 'item',
  onEdit, 
  onDelete,
  fields = [],
  badges = []
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

    return (
      <span 
        key={key}
        className="structure-badge"
        style={style}
      >
        {icon} {badgeValue}
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

const TopicManagement = () => {
  const { token, addNotification } = useApp();
  
  // Main data states
  const [topics, setTopics] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filter states for drill-down filtering
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Form data state (separate from filter state)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '',
    isActive: true,
    courseType: { id: '' },
    course: { id: '' },
    class: { id: '' },
    exam: { id: '' },
    subjectId: ''
  });
  
  // Dropdown data states (for both filter and form)
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [subjectLinkages, setSubjectLinkages] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    classes: false,
    exams: false,
    masterSubjects: false
  });

  // Refs for preventing duplicate calls
  const isInitialMountRef = useRef(true);
  const fetchTopicsInProgressRef = useRef(false);
  const topicsAbortRef = useRef(null);
  const courseTypesAbortRef = useRef(null);
  const courseTypesCacheRef = useRef({ data: null, ts: 0 });
  
  // Guards to avoid duplicate initial fetches on first render
  const didMountCourseType = useRef(false);
  const didMountCourse = useRef(false);
  const didMountClass = useRef(false);
  const didMountExam = useRef(false);
  const didMountActive = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (courseTypesAbortRef.current) {
        try { courseTypesAbortRef.current.abort(); } catch(_) {}
      }
      if (topicsAbortRef.current) {
        try { topicsAbortRef.current.abort(); } catch(_) {}
      }
    };
  }, []);

  // Initial data load
  const hasInitialFetchRef = useRef(false);
  useEffect(() => {
    if (!token || hasInitialFetchRef.current) return;
    hasInitialFetchRef.current = true;
    fetchData();
  }, [token]);

  // Helper functions for course type logic
  const isAcademicCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  };

  const isCompetitiveCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('competitive');
  };

  const isProfessionalCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('professional');
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Course types with 5s cache + abort/dedup
      let courseTypesData = null;
      const now = Date.now();
      if (courseTypesCacheRef.current.data && now - courseTypesCacheRef.current.ts < 5000) {
        courseTypesData = courseTypesCacheRef.current.data;
      } else {
        if (courseTypesAbortRef.current) {
          try { courseTypesAbortRef.current.abort(); } catch(_) {}
        }
        courseTypesAbortRef.current = new AbortController();
        courseTypesData = await getCourseTypesCached(token);
        courseTypesCacheRef.current = { data: courseTypesData, ts: now };
      }
      
      console.log('Raw courseTypes API response (TopicManagement):', courseTypesData);
      
      // Handle different response formats
      let courseTypesArray = [];
      if (Array.isArray(courseTypesData)) {
        courseTypesArray = courseTypesData;
      } else if (courseTypesData && Array.isArray(courseTypesData.content)) {
        courseTypesArray = courseTypesData.content;
      } else if (courseTypesData && Array.isArray(courseTypesData.data)) {
        courseTypesArray = courseTypesData.data;
      } else if (courseTypesData && courseTypesData.courseTypes && Array.isArray(courseTypesData.courseTypes)) {
        courseTypesArray = courseTypesData.courseTypes;
      } else {
        console.warn('Unexpected course types data format:', courseTypesData);
        courseTypesArray = [];
      }
      
      console.log('Normalized course types array:', courseTypesArray);
      setCourseTypes(courseTypesArray);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load course types',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses by course type
  const fetchCoursesByCourseType = async (courseTypeId) => {
    if (!courseTypeId) {
      setFilteredCourses([]);
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, courses: true }));
      console.log('Fetching courses for course type:', courseTypeId);
      
      const data = await getCourses(token, courseTypeId, 0, 100, 'createdAt', 'desc');
      console.log('Raw courses data from API:', data);
      
      // Robust array handling for various response formats
      let coursesArray = [];
      if (Array.isArray(data)) {
        coursesArray = data;
      } else if (data && Array.isArray(data.content)) {
        coursesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        coursesArray = data.data;
      } else if (data && data.courses && Array.isArray(data.courses)) {
        coursesArray = data.courses;
      } else {
        console.warn('Unexpected courses data format:', data);
        coursesArray = [];
      }
      
      console.log('Normalized courses array:', coursesArray);
      setFilteredCourses(coursesArray);
      setCourses(coursesArray); // Also set for form dropdowns
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setFilteredCourses([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, courses: false }));
    }
  };

  // Fetch classes and exams by course
  const fetchClassesAndExamsByCourse = async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      setFilteredExams([]);
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, classes: true, exams: true }));
      console.log('Fetching classes and exams for course:', courseId);
      
      const [classesData, examsData] = await Promise.all([
        getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc'),
        getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc')
      ]);
      
      console.log('Raw classes data from API:', classesData);
      console.log('Raw exams data from API:', examsData);
      
      // Robust array handling for classes
      let classesArray = [];
      if (Array.isArray(classesData)) {
        classesArray = classesData;
      } else if (classesData && Array.isArray(classesData.content)) {
        classesArray = classesData.content;
      } else if (classesData && Array.isArray(classesData.data)) {
        classesArray = classesData.data;
      } else {
        classesArray = [];
      }
      
      // Robust array handling for exams
      let examsArray = [];
      if (Array.isArray(examsData)) {
        examsArray = examsData;
      } else if (examsData && Array.isArray(examsData.content)) {
        examsArray = examsData.content;
      } else if (examsData && Array.isArray(examsData.data)) {
        examsArray = examsData.data;
      } else {
        examsArray = [];
      }
      
      console.log('Normalized classes array:', classesArray);
      console.log('Normalized exams array:', examsArray);
      setFilteredClasses(classesArray);
      setFilteredExams(examsArray);
      setClasses(classesArray); // Also set for form dropdowns
      setExams(examsArray); // Also set for form dropdowns
      
    } catch (error) {
      console.error('Error fetching classes and exams:', error);
      setFilteredClasses([]);
      setFilteredExams([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, classes: false, exams: false }));
    }
  };

  // Fetch master subjects by course type
  const fetchMasterSubjectsByCourseType = async (courseTypeId) => {
    if (!courseTypeId) {
      setMasterSubjects([]);
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, masterSubjects: true }));
      console.log('Fetching master subjects for course type:', courseTypeId);
      
      const data = await getMasterSubjectsByCourseType(token, courseTypeId, { active: showActiveOnly });
      console.log('Raw master subjects data from API:', data);
      
      // Robust array handling
      let subjectsArray = [];
      if (Array.isArray(data)) {
        subjectsArray = data;
      } else if (data && Array.isArray(data.content)) {
        subjectsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        subjectsArray = data.data;
      } else {
        subjectsArray = [];
      }
      
      console.log('Normalized master subjects array:', subjectsArray);
      setMasterSubjects(subjectsArray);
      
    } catch (error) {
      console.error('Error fetching master subjects:', error);
      setMasterSubjects([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, masterSubjects: false }));
    }
  };

  // Fetch subject linkages
  const fetchSubjectLinkages = async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) {
      setSubjectLinkages([]);
      return;
    }
    
    try {
      console.log('Fetching subject linkages for:', { courseTypeId, courseId, classId, examId });
      
      const data = await getAllSubjectLinkages(token, {
        courseTypeId,
        courseId,
        classId,
        examId,
        active: showActiveOnly
      });
      console.log('Raw subject linkages data from API:', data);
      
      // Robust array handling
      let subjectsArray = [];
      if (Array.isArray(data)) {
        subjectsArray = data;
      } else if (data && Array.isArray(data.content)) {
        subjectsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        subjectsArray = data.data;
      } else {
        subjectsArray = [];
      }
      
      console.log('Normalized subject linkages array:', subjectsArray);
      setSubjectLinkages(subjectsArray);
      
    } catch (error) {
      console.error('Error fetching subject linkages:', error);
      setSubjectLinkages([]);
    }
  };

  // Filter change effects
  useEffect(() => {
    if (!didMountCourseType.current) { 
      didMountCourseType.current = true; 
      return; 
    }
    console.log('=== COURSE TYPE CHANGE EFFECT ===');
    console.log('Selected course type changed:', selectedCourseType);
    
    if (selectedCourseType) {
      const courseTypeId = parseInt(selectedCourseType);
      console.log('Filtering courses for course type:', courseTypeId);
      
      // Fetch courses and master subjects for this course type
      fetchCoursesByCourseType(courseTypeId);
      fetchMasterSubjectsByCourseType(courseTypeId);
      
      // Reset dependent filters
      setSelectedCourse('');
      setSelectedClass('');
      setSelectedExam('');
      setSelectedSubject('');
    } else {
      setFilteredCourses([]);
      setFilteredClasses([]);
      setFilteredExams([]);
      setMasterSubjects([]);
      setSubjectLinkages([]);
    }
  }, [selectedCourseType]);

  useEffect(() => {
    if (!didMountCourse.current) { 
      didMountCourse.current = true; 
      return; 
    }
    if (selectedCourse) {
      const courseId = parseInt(selectedCourse);
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      console.log('=== COURSE CHANGE EFFECT ===');
      console.log('Selected course changed:', courseId, 'course type:', courseTypeId);
      
      // Fetch classes, exams, and subject linkages for this course
      fetchClassesAndExamsByCourse(courseTypeId, courseId);
      fetchSubjectLinkages(courseTypeId, courseId, null, null);
      
      // Reset dependent filters
      setSelectedClass('');
      setSelectedExam('');
      setSelectedSubject('');
    } else {
      setFilteredClasses([]);
      setFilteredExams([]);
      setSubjectLinkages([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (!didMountClass.current) { 
      didMountClass.current = true; 
      return; 
    }
    if (selectedClass) {
      const classId = parseInt(selectedClass);
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = selectedCourse ? parseInt(selectedCourse) : null;
      console.log('=== CLASS CHANGE EFFECT ===');
      console.log('Selected class changed:', classId);
      
      // Fetch subject linkages with class filter
      fetchSubjectLinkages(courseTypeId, courseId, classId, null);
      
      // Reset exam and subject selection
      setSelectedExam('');
      setSelectedSubject('');
    }
  }, [selectedClass]);

  useEffect(() => {
    if (!didMountExam.current) { 
      didMountExam.current = true; 
      return; 
    }
    if (selectedExam) {
      const examId = parseInt(selectedExam);
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = selectedCourse ? parseInt(selectedCourse) : null;
      console.log('=== EXAM CHANGE EFFECT ===');
      console.log('Selected exam changed:', examId);
      
      // Fetch subject linkages with exam filter
      fetchSubjectLinkages(courseTypeId, courseId, null, examId);
      
      // Reset class and subject selection
      setSelectedClass('');
      setSelectedSubject('');
    }
  }, [selectedExam]);

  useEffect(() => {
    if (!didMountActive.current) { 
      didMountActive.current = true; 
      return; 
    }
    console.log('Show active only changed:', showActiveOnly);
    const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
    const courseId = selectedCourse ? parseInt(selectedCourse) : null;
    const classId = selectedClass ? parseInt(selectedClass) : null;
    const examId = selectedExam ? parseInt(selectedExam) : null;
    
    // Refetch with new active flag
    if (courseTypeId) {
      fetchMasterSubjectsByCourseType(courseTypeId);
    }
    if (courseId) {
      fetchSubjectLinkages(courseTypeId, courseId, classId, examId);
    }
  }, [showActiveOnly]);

  // Convert filter state to the format expected by the topics API
  const buildTopicsFilterParams = () => {
    const filterParams = {
      active: showActiveOnly
    };
    
    if (selectedCourseType) {
      filterParams.courseTypeId = parseInt(selectedCourseType);
    }
    
    if (selectedCourse) {
      filterParams.courseId = parseInt(selectedCourse);
    }
    
    if (selectedClass) {
      filterParams.classId = parseInt(selectedClass);
    }
    
    if (selectedExam) {
      filterParams.examId = parseInt(selectedExam);
    }
    
    if (selectedSubject) {
      filterParams.subjectId = parseInt(selectedSubject);
    }
    
    return filterParams;
  };

  // Fetch topics with consolidated filter
  const fetchTopicsData = async () => {
    // Prevent duplicate calls
    if (fetchTopicsInProgressRef.current) {
      console.log('fetchTopicsData already in progress, skipping duplicate call');
      return;
    }

    try {
      fetchTopicsInProgressRef.current = true;
      setLoading(true);
      
      // Abort previous request
      if (topicsAbortRef.current) {
        topicsAbortRef.current.abort();
      }
      topicsAbortRef.current = new AbortController();
      
      const filterParams = buildTopicsFilterParams();
      console.log('Fetching topics with params:', filterParams);
      
      const data = await getTopicsCombinedFilter(token, filterParams);
      
      console.log('Fetched topics data:', data);
      setTopics(data || []);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching topics:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch topics',
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
      fetchTopicsInProgressRef.current = false;
    }
  };

  // All filter effects are now handled by the unified hook

  // All filter effects are now handled by the unified hook

  // All filter effects are now handled by the unified hook

  // Effect for fetching topics when filters change
  useEffect(() => {
    console.log('🔄 Topic filters changed:', {
      courseType: selectedCourseType,
      course: selectedCourse,
      class: selectedClass,
      exam: selectedExam,
      subject: selectedSubject,
      showActiveOnly
    });
    
    // Skip if this is the initial mount and no filters are set
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    // Debounce topics fetching to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchTopicsData();
    }, 300); // 300ms delay
    
    return () => clearTimeout(timeoutId);
  }, [
    selectedCourseType,
    selectedCourse,
    selectedClass,
    selectedExam,
    selectedSubject,
    showActiveOnly
  ]);

  // All data fetching is now handled by direct service calls

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('🔄 Form input change:', name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Form effects for dependent dropdowns (separate from filter effects)
  useEffect(() => {
    console.log('🔄 Form effect triggered - courseTypeId:', formData.courseType?.id);
    
    if (formData.courseType?.id) {
      console.log('🔄 Course type selected in form, fetching courses and master subjects');
      const courseTypeId = parseInt(formData.courseType.id);
      fetchCoursesByCourseType(courseTypeId);
      fetchMasterSubjectsByCourseType(courseTypeId);
    } else {
      console.log('🔄 No course type selected, clearing dependent fields');
      setFormData(prev => ({
        ...prev,
        course: { id: '' },
        class: { id: '' },
        exam: { id: '' },
        subjectId: ''
      }));
      setCourses([]);
      setClasses([]);
      setExams([]);
      setMasterSubjects([]);
    }
  }, [formData.courseType?.id]);

  useEffect(() => {
    console.log('🔄 Form effect - courseId:', formData.course?.id);
    
    if (formData.course?.id && formData.courseType?.id) {
      console.log('🔄 Course selected in form, fetching classes and exams');
      const courseId = parseInt(formData.course.id);
      const courseTypeId = parseInt(formData.courseType.id);
      
      // For professional courses, fetch subjects directly
      if (formData.courseType?.id === '3') {
        console.log('🔄 Professional course selected, fetching subjects by courseId only');
        fetchSubjectLinkages(courseTypeId, courseId, null, null);
      } else {
        // For academic/competitive courses, fetch classes and exams
        fetchClassesAndExamsByCourse(courseTypeId, courseId);
      }
    } else {
      console.log('🔄 No course selected, clearing classes/exams/subjects');
      setFormData(prev => ({
        ...prev,
        class: { id: '' },
        exam: { id: '' },
        subjectId: ''
      }));
      setClasses([]);
      setExams([]);
    }
  }, [formData.course?.id, formData.courseType?.id]);

  useEffect(() => {
    console.log('🔄 Form effect - class/exam change triggered');
    console.log('🔄 Current formData.class?.id:', formData.class?.id);
    console.log('🔄 Current formData.exam?.id:', formData.exam?.id);
    console.log('🔄 Current formData.courseType?.id:', formData.courseType?.id);
    
    const courseTypeId = formData.courseType?.id;
    const isProfessionalCourse = courseTypeId === '3'; // Professional course type
    
    if (formData.class?.id || formData.exam?.id || isProfessionalCourse) {
      console.log('🔄 Class, exam, or professional course selected in form, fetching subjects');
      // Clear subject when class/exam/course changes
      setFormData(prev => ({
        ...prev,
        subjectId: ''
      }));
      
      // Fetch subjects based on current selections
      if (formData.courseType?.id && formData.course?.id) {
        const courseTypeIdInt = parseInt(formData.courseType.id);
        const courseIdInt = parseInt(formData.course.id);
        
        if (isProfessionalCourse) {
          // For professional courses, fetch subjects by courseId only
          console.log('🔄 Professional course detected, fetching subjects by courseId only:', courseIdInt);
          fetchSubjectLinkages(courseTypeIdInt, courseIdInt, null, null);
        } else {
          // For academic/competitive courses, fetch subjects with class/exam filters
          const classId = formData.class?.id ? parseInt(formData.class.id) : null;
          const examId = formData.exam?.id ? parseInt(formData.exam.id) : null;
          
          console.log('🔄 Fetching subjects for courseTypeId:', courseTypeIdInt, 'courseId:', courseIdInt, 'classId:', classId, 'examId:', examId);
          fetchSubjectLinkages(courseTypeIdInt, courseIdInt, classId, examId);
        }
      } else {
        console.log('🔄 Missing courseType or course selection, cannot fetch subjects');
      }
    } else {
      console.log('🔄 No class, exam, or professional course selected, clearing subjects');
      setSubjectLinkages([]);
    }
  }, [formData.class?.id, formData.exam?.id, formData.courseType?.id]);

  const handleFilterChange = (filterName, value) => {
    console.log('🔄 Filter change:', filterName, value);
    
    switch (filterName) {
      case 'courseTypeId':
        console.log('🔄 Filter: Course type changed to:', value);
        setSelectedCourseType(value);
        break;
      case 'courseId':
        console.log('🔄 Filter: Course changed to:', value);
        setSelectedCourse(value);
        break;
      case 'classId':
        console.log('🔄 Filter: Class changed to:', value);
        setSelectedClass(value);
        break;
      case 'examId':
        console.log('🔄 Filter: Exam changed to:', value);
        setSelectedExam(value);
        break;
      case 'subjectId':
        console.log('🔄 Filter: Subject changed to:', value);
        setSelectedSubject(value);
        break;
      default:
        break;
    }
  };

  const resetFilters = () => {
    setSelectedCourseType('');
    setSelectedCourse('');
    setSelectedClass('');
    setSelectedExam('');
    setSelectedSubject('');
    setFilteredCourses([]);
    setFilteredClasses([]);
    setFilteredExams([]);
    setMasterSubjects([]);
    setSubjectLinkages([]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayOrder: '',
      isActive: true,
      courseType: { id: '' },
      course: { id: '' },
      class: { id: '' },
      exam: { id: '' },
      subjectId: ''
    });
    setShowForm(false);
    setEditingId(null);
    // Clear form dropdown data
    setCourses([]);
    setClasses([]);
    setExams([]);
    setMasterSubjects([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== TOPIC FORM SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    
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
        const courseTypeId = parseInt(formData.courseType?.id);
        const relationshipId = parseInt(formData.subjectId); // This is now linkageId
        
        const submitData = {
          name: formData.name.trim(),
          description: formData.description ? formData.description.trim() : '',
          courseTypeId: courseTypeId,
          relationshipId: relationshipId, // This is linkageId from the dropdown
          displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
          isActive: formData.isActive
        };
        
        await createTopic(token, submitData);
        addNotification({
          type: 'success',
          message: 'Topic created successfully',
          duration: 3000
        });
      }
      
      resetForm();
      fetchTopicsData(); // Refresh topics list
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
      courseType: { id: topic.subject?.course?.courseType?.id || '' },
      course: { id: topic.subject?.course?.id || '' },
      class: { id: '' },
      exam: { id: '' },
      subjectId: topic.subject?.linkageId || topic.subject?.id || '' // Use linkageId if available
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
      
      fetchTopicsData(); // Refresh topics list
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
    resetFilters();
  };

  return (
    <div className="master-data-component">
      <AdminPageHeader
        title="Topic Management"
        subtitle="Manage topics with optimized filtering and shared cache"
        showAdminBadge={false}
        actions={(
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            disabled={loading}
          >
            Add Topic
          </button>
        )}
      />

      {/* Optimized Filters using shared hook */}
      <div className="filter-section">
        <div className="filter-header">
          <h4>Filter Topics</h4>
          <div className="filter-header-controls">
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
              value={selectedCourseType}
              onChange={(e) => handleFilterChange('courseTypeId', e.target.value)}
              className="filter-select"
            >
              <option value="">Select Course Type</option>
              {courseTypes && courseTypes.length > 0 ? courseTypes.map(courseType => (
                <option key={courseType.id} value={courseType.id}>
                  {courseType.name}
                </option>
              )) : <option value="" disabled>No course types available</option>}
            </select>
          </div>

          {/* Course Filter */}
          <div className="filter-group">
            <label htmlFor="course-filter">2. Course:</label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className="filter-select"
              disabled={!selectedCourseType || loadingStates.courses}
            >
              <option value="">Select Course</option>
              {filteredCourses && filteredCourses.length > 0 ? filteredCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              )) : <option value="" disabled>No courses available</option>}
            </select>
          </div>

          {/* Class Filter (Academic only) */}
          {isAcademicCourseType(selectedCourseType) && (
            <div className="filter-group">
              <label htmlFor="class-filter">3. Class:</label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => handleFilterChange('classId', e.target.value)}
                className="filter-select"
                disabled={!selectedCourse || loadingStates.classes}
              >
                <option value="">Select Class</option>
                  {filteredClasses && filteredClasses.length > 0 ? filteredClasses.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                  )) : <option value="" disabled>No classes available</option>}
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
                onChange={(e) => handleFilterChange('examId', e.target.value)}
                className="filter-select"
                disabled={!selectedCourse || loadingStates.exams}
              >
                <option value="">Select Exam</option>
                  {filteredExams && filteredExams.length > 0 ? filteredExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                  )) : <option value="" disabled>No exams available</option>}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          <div className="filter-group">
            <label htmlFor="subject-filter">4. Subject:</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="filter-select"
              disabled={!selectedCourse || loadingStates.subjects}
            >
              <option value="">Select Subject</option>
              {subjectLinkages && subjectLinkages.length > 0 ? subjectLinkages.map(subject => (
                <option key={subject.linkageId} value={subject.linkageId}>
                  {subject.subjectName || subject.name}
                </option>
              )) : <option value="" disabled>No subjects available</option>}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCourseType || selectedCourse || selectedClass || selectedExam || selectedSubject) && (
          <div className="active-filters">
            <strong>Active Filters:</strong>
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
            {selectedSubject && (
              <span className="filter-tag">
                Subject: {subjectLinkages.find(s => s.id === parseInt(selectedSubject))?.subjectName || subjectLinkages.find(s => s.id === parseInt(selectedSubject))?.name}
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
                  className="form-input"
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
                  className="form-input"
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
                  className="form-input"
                  rows={3}
                  placeholder="Describe the topic content and scope"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseTypeId">Course Type *</label>
                <select
                  id="courseType"
                  name="courseType"
                  value={formData.courseType?.id || ''}
                  onChange={(e) => setFormData({ ...formData, courseType: { id: e.target.value } })}
                  className="form-input"
                  required
                >
                  <option value="">Select Course Type</option>
                  {courseTypes && courseTypes.length > 0 ? courseTypes.map(courseType => (
                    <option key={courseType.id} value={courseType.id}>
                      {courseType.name}
                    </option>
                  )) : <option value="" disabled>No course types available</option>}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="course">Course *</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course?.id || ''}
                  onChange={(e) => setFormData({ ...formData, course: { id: e.target.value } })}
                  className="form-input"
                  required
                  disabled={!formData.courseType?.id}
                >
                  <option value="">
                    {!formData.courseType?.id ? 'Select Course Type first' :
                     loadingStates.courses ? 'Loading courses...' :
                     'Select Course'}
                  </option>
                  {courses && courses.length > 0 ? courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  )) : <option value="" disabled>No courses available</option>}
                </select>
              </div>
            </div>

            {/* Class/Exam Selection - Conditional based on Course Type */}
            {(isAcademicCourseType(formData.courseType?.id) || isCompetitiveCourseType(formData.courseType?.id)) && (
              <div className="form-row">
                {/* Class Selection - Only for Academic Course Types */}
                {isAcademicCourseType(formData.courseType?.id) && (
                  <div className="form-group">
                    <label htmlFor="class">Class *</label>
                    <select
                      id="class"
                      name="class"
                      value={formData.class?.id || ''}
                      onChange={(e) => setFormData({ ...formData, class: { id: e.target.value } })}
                      className="form-input"
                      required
                      disabled={!formData.course?.id || loadingStates.classes}
                    >
                      <option value="">
                        {!formData.course?.id ? 'Select Course first' :
                         loadingStates.classes ? 'Loading classes...' :
                         'Select Class'}
                      </option>
                      {classes && classes.length > 0 ? classes.map(classItem => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      )) : <option value="" disabled>No classes available</option>}
                    </select>
                  </div>
                )}

                {/* Exam Selection - Only for Competitive Course Types */}
                {isCompetitiveCourseType(formData.courseType?.id) && (
                  <div className="form-group">
                    <label htmlFor="exam">Exam *</label>
                    <select
                      id="exam"
                      name="exam"
                      value={formData.exam?.id || ''}
                      onChange={(e) => setFormData({ ...formData, exam: { id: e.target.value } })}
                      className="form-input"
                      required
                      disabled={!formData.course?.id || loadingStates.exams}
                    >
                      <option value="">
                        {!formData.course?.id ? 'Select Course first' :
                         loadingStates.exams ? 'Loading exams...' :
                         'Select Exam'}
                      </option>
                      {exams && exams.length > 0 ? exams.map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {exam.name}
                        </option>
                      )) : <option value="" disabled>No exams available</option>}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subjectId">Subject *</label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={
                    !formData.course?.id || 
                    (isAcademicCourseType(formData.courseType?.id) && !formData.class?.id) ||
                    (isCompetitiveCourseType(formData.courseType?.id) && !formData.exam?.id)
                    // Professional courses (courseTypeId === '3') are enabled when course is selected
                  }
                >
                  <option value="">
                    {!formData.course?.id ? 'Select Course first' :
                     (isAcademicCourseType(formData.courseType?.id) && !formData.class?.id) ? 'Select Class first' :
                     (isCompetitiveCourseType(formData.courseType?.id) && !formData.exam?.id) ? 'Select Exam first' :
                     (formData.courseType?.id === '3') ? 'Professional course - Select Subject' :
                     'Select Subject'}
                  </option>
                  {subjectLinkages && subjectLinkages.length > 0 ? subjectLinkages.map(subject => (
                    <option key={subject.linkageId} value={subject.linkageId}>
                      {subject.subjectName || subject.name}
                    </option>
                  )) : <option value="" disabled>No subjects available</option>}
                </select>
              </div>
            </div>
          
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
                fetchTopicsData();
              }}
              disabled={loading}
            >
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
            <div className="empty-icon">No Topics</div>
            <h4>No Topics Found</h4>
            <p>No topics match your current filters. Try adjusting your filter criteria or create a new topic.</p>
          </div>
        ) : (
          <div className="topics-container">
            {(() => {
              // Group topics by course type
              const academicTopics = topics.filter(topic => {
                const courseTypeId = topic.courseTypeId 
                  || topic.subject?.course?.courseType?.id 
                  || topic.classSubject?.class?.course?.courseType?.id 
                  || topic.examSubject?.exam?.course?.courseType?.id 
                  || topic.courseSubject?.course?.courseType?.id;
                return courseTypeId === 1 || courseTypeId === '1';
              });

              const competitiveTopics = topics.filter(topic => {
                const courseTypeId = topic.courseTypeId 
                  || topic.subject?.course?.courseType?.id 
                  || topic.classSubject?.class?.course?.courseType?.id 
                  || topic.examSubject?.exam?.course?.courseType?.id 
                  || topic.courseSubject?.course?.courseType?.id;
                return courseTypeId === 2 || courseTypeId === '2';
              });

              const professionalTopics = topics.filter(topic => {
                const courseTypeId = topic.courseTypeId 
                  || topic.subject?.course?.courseType?.id 
                  || topic.classSubject?.class?.course?.courseType?.id 
                  || topic.examSubject?.exam?.course?.courseType?.id 
                  || topic.courseSubject?.course?.courseType?.id;
                return courseTypeId === 3 || courseTypeId === '3';
              });

              // Topic field configuration with complex fallback logic
              const topicFields = [
                { 
                  key: 'courseTypeName', 
                  label: 'Course Type',
                  value: (item) => item.courseTypeName 
                    || item.subject?.course?.courseType?.name 
                    || item.classSubject?.class?.course?.courseType?.name 
                    || item.examSubject?.exam?.course?.courseType?.name 
                    || item.courseSubject?.course?.courseType?.name
                },
                { 
                  key: 'courseName', 
                  label: 'Course',
                  value: (item) => item.courseName 
                    || item.subject?.course?.name 
                    || item.classSubject?.class?.course?.name 
                    || item.examSubject?.exam?.course?.name 
                    || item.courseSubject?.course?.name
                },
                { 
                  key: 'className', 
                  label: 'Class',
                  value: (item) => item.className || item.classSubject?.class?.name,
                  condition: (item) => (item.className || item.classSubject?.class?.name)
                },
                { 
                  key: 'examName', 
                  label: 'Exam',
                  value: (item) => item.examName || item.examSubject?.exam?.name,
                  condition: (item) => (item.examName || item.examSubject?.exam?.name) && !(item.className || item.classSubject?.class?.name)
                },
                { 
                  key: 'subjectName', 
                  label: 'Subject',
                  value: (item) => item.subjectName 
                    || item.subject?.name 
                    || item.classSubject?.subject?.name 
                    || item.examSubject?.subject?.name 
                    || item.courseSubject?.subject?.name
                }
              ];

              const renderTopicCard = (topic) => (
                <DataCard
                  key={topic.id}
                  item={topic}
                  itemType="topic"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  fields={topicFields}
                />
              );

              return (
                <>
                  {/* Academic Topics Section */}
                  {academicTopics.length > 0 && (
                    <div className="topic-section">
                      <div className="section-header">
                        <h3>Academic Course Topics</h3>
                        <span className="section-count">({academicTopics.length} topics)</span>
                      </div>
                      <div className="data-grid">
                        {academicTopics.map(renderTopicCard)}
                      </div>
                    </div>
                  )}

                  {/* Competitive Topics Section */}
                  {competitiveTopics.length > 0 && (
                    <div className="topic-section">
                      <div className="section-header">
                        <h3>Competitive Course Topics</h3>
                        <span className="section-count">({competitiveTopics.length} topics)</span>
                      </div>
                      <div className="data-grid">
                        {competitiveTopics.map(renderTopicCard)}
                      </div>
                    </div>
                  )}

                  {/* Professional Topics Section */}
                  {professionalTopics.length > 0 && (
                    <div className="topic-section">
                      <div className="section-header">
                        <h3>Professional Course Topics</h3>
                        <span className="section-count">({professionalTopics.length} topics)</span>
                      </div>
                      <div className="data-grid">
                        {professionalTopics.map(renderTopicCard)}
                      </div>
                    </div>
                  )}

                  {/* No topics in any section */}
                  {academicTopics.length === 0 && competitiveTopics.length === 0 && professionalTopics.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">No Topics</div>
                      <h4>No Topics Found</h4>
                      <p>No topics match your current filters. Try adjusting your filter criteria or create a new topic.</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicManagement;