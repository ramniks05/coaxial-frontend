import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCourseTypesCached } from '../../services/globalApiCache';
import { createSubjectWithAutoLink, deleteSubject, getAllSubjectLinkages, getClassesByCourse, getCourses, getExamsByCourse, getMasterSubjectsByCourseType, updateSubject } from '../../services/masterDataService';
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
    masterSubjectId: '',
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
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    classes: false,
    exams: false,
    masterSubjects: false
  });

  // Dedup/abort/cache controls
  const courseTypesAbortRef = useRef(null);
  const courseTypesCacheRef = useRef({ data: null, ts: 0 });
  const subjectsAbortRef = useRef(null);
  const subjectsCacheRef = useRef(new Map()); // key -> { data, ts }
  const lastSubjectsKeyRef = useRef('');
  const lastSubjectsAtRef = useRef(0);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (courseTypesAbortRef.current) {
        try { courseTypesAbortRef.current.abort(); } catch(_) {}
      }
      if (subjectsAbortRef.current) {
        try { subjectsAbortRef.current.abort(); } catch(_) {}
      }
    };
  }, []);

  const hasInitialFetchRef = useRef(false);
  useEffect(() => {
    if (!token || hasInitialFetchRef.current) return;
    hasInitialFetchRef.current = true;
    fetchData();
    // Additionally load full linkage snapshot on first load (no filters)
    (async () => {
      try {
        const linkages = await getAllSubjectLinkages(token, {});
        // Normalize various response shapes to an array
        const list = Array.isArray(linkages) ? linkages : (linkages?.content || linkages?.data || []);
        // Show linkage subjects immediately on initial load
        setSubjects(list || []);
        // Also cache for reuse
        subjectsCacheRef.current.set('ALL_LINKAGES', { data: list || [], ts: Date.now() });
        console.log('Loaded ALL_LINKAGES into subjects. Count:', (list || []).length);
      } catch (e) {
        console.warn('All-linkages preload failed:', e?.message || e);
      }
    })();
  }, [token]);

  // Guards to avoid duplicate initial fetches on first render
  const didMountCourseType = useRef(false);
  const didMountCourse = useRef(false);
  const didMountClass = useRef(false);
  const didMountExam = useRef(false);
  const didMountActive = useRef(false);

  // Effect for course type change - filter courses and fetch subjects
  useEffect(() => {
    if (!didMountCourseType.current) { didMountCourseType.current = true; return; }
    console.log('=== COURSE TYPE CHANGE EFFECT ===');
    console.log('Selected course type changed:', selectedCourseType);
    console.log('Selected course type type:', typeof selectedCourseType);
    console.log('Selected course type length:', selectedCourseType?.length);
    if (selectedCourseType) {
      const courseTypeId = parseInt(selectedCourseType);
      console.log('Filtering courses for course type:', courseTypeId);
      
      // Fetch courses for this course type (subject dropdown is populated via getSubjects elsewhere)
      fetchCoursesByCourseType(courseTypeId);
      
      // Reset dependent filters
      setSelectedCourse('');
      setSelectedClass('');
      setSelectedExam('');
      setFilteredClasses([]);
      setFilteredExams([]);
      // Clear current subjects to avoid showing stale content
      setSubjects([]);
      
      // Fetch subjects via all-linkages endpoint filtered by courseTypeId
      (async () => {
        try {
          console.log('About to fetch subjects via /api/admin/subjects/all-linkages?courseTypeId=.. :', courseTypeId);
          setSubjects([]);
          const data = await getAllSubjectLinkages(token, { courseTypeId });
          const items = Array.isArray(data) ? data : (data?.content || data?.data || []);
          // Keep linkage shape so render uses subjectName/courseName/className/examName
          setSubjects(Array.isArray(items) ? items : []);
        } catch (e) {
          console.warn('Fetch subjects by courseType failed:', e?.message || e);
        }
      })();
    } else {
      console.log('No course type selected - clearing subjects until a filter is applied');
      setFilteredCourses(Array.isArray(courses) ? courses : []);
      setMasterSubjects([]);
      setSelectedCourse('');
      setSelectedClass('');
      setSelectedExam('');
      setFilteredClasses([]);
      setFilteredExams([]);
      // Do not auto-fetch subjects without filters
      setSubjects([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseType, showActiveOnly]);

  // Effect for course change - fetch classes/exams and subjects
  useEffect(() => {
    if (!didMountCourse.current) { didMountCourse.current = true; return; }
    if (selectedCourse) {
      const courseId = parseInt(selectedCourse);
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      console.log('=== COURSE CHANGE EFFECT ===');
      console.log('Selected course changed:', courseId, 'course type:', courseTypeId);
      console.log('About to fetch subjects via all-linkages with courseId & courseTypeId:', courseId, courseTypeId);
      
      // Fetch classes and exams for this course using combined endpoints
      fetchClassesAndExamsByCourse(courseTypeId, courseId);
      
      // Reset dependent filters
      setSelectedClass('');
      setSelectedExam('');
      // Clear current subjects to avoid showing stale content
      setSubjects([]);
      
      // Fetch subjects for this course using all-linkages endpoint
      (async () => {
        try {
          const data = await getAllSubjectLinkages(token, { courseId, courseTypeId });
          const items = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setSubjects(Array.isArray(items) ? items : []);
        } catch (e) {
          console.warn('Fetch subjects by course (all-linkages) failed:', e?.message || e);
          setSubjects([]);
        }
      })();
    } else {
      setFilteredClasses([]);
      setFilteredExams([]);
      setSelectedClass('');
      setSelectedExam('');
      // Do NOT refetch here; course type effect already fetched via all-linkages
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedCourseType, showActiveOnly]);

  // Effect for class change - fetch subjects for specific class
  useEffect(() => {
    if (!didMountClass.current) { didMountClass.current = true; return; }
    if (selectedClass) {
      const classId = parseInt(selectedClass);
      console.log('Selected class changed:', classId);
      
      // Reset exam selection
      setSelectedExam('');
      // Clear master subject selection when class changes
      setFormData(prev => ({
        ...prev,
        name: '',
        description: '',
        masterSubjectId: ''
      }));
      
      // Fetch subjects for this class
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = selectedCourse ? parseInt(selectedCourse) : null;
      fetchSubjects(courseTypeId, courseId, classId, null, showActiveOnly);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedCourseType, selectedCourse]);

  // Effect for exam change - fetch subjects for specific exam
  useEffect(() => {
    if (!didMountExam.current) { didMountExam.current = true; return; }
    if (selectedExam) {
      const examId = parseInt(selectedExam);
      console.log('Selected exam changed:', examId);
      
      // Reset class selection
      setSelectedClass('');
      // Clear master subject selection when exam changes
      setFormData(prev => ({
        ...prev,
        name: '',
        description: '',
        masterSubjectId: ''
      }));
      
      // Clear current subjects to avoid showing stale content
      setSubjects([]);
      
      // Fetch subjects for this exam
      const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const courseId = selectedCourse ? parseInt(selectedCourse) : null;
      fetchSubjects(courseTypeId, courseId, null, examId, showActiveOnly);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam, selectedCourseType, selectedCourse]);

  // Effect for active filter change - refetch subjects with new active filter only
  useEffect(() => {
    if (!didMountActive.current) { didMountActive.current = true; return; }
    console.log('Show active only changed:', showActiveOnly);
    const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
    const courseId = selectedCourse ? parseInt(selectedCourse) : null;
    const classId = selectedClass ? parseInt(selectedClass) : null;
    const examId = selectedExam ? parseInt(selectedExam) : null;
    
    // Do not clear subjects here to avoid flicker; just refetch with new flag
    fetchSubjects(courseTypeId, courseId, classId, examId, showActiveOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActiveOnly]);

  // Debug effect for masterSubjects state changes
  useEffect(() => {
    console.log('Master subjects state changed:', masterSubjects);
    console.log('Master subjects length:', masterSubjects.length);
  }, [masterSubjects]);

  // Helper functions for course type logic
  const isAcademicCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  };

  const getCourseTypeName = (courseTypeId) => {
    if (!Array.isArray(courseTypes)) {
      console.warn('courseTypes is not an array:', courseTypes);
      return 'Unknown';
    }
    const courseType = courseTypes.find(ct => ct.id === courseTypeId);
    return courseType ? courseType.name : 'Unknown';
  };

  // Group subjects by course type
  const groupSubjectsByType = () => {
    const grouped = {};
    
    subjects.forEach(subject => {
      const courseTypeId = subject.courseTypeId || subject.courseType?.id;
      const courseTypeName = getCourseTypeName(courseTypeId);
      
      if (!grouped[courseTypeName]) {
        grouped[courseTypeName] = [];
      }
      grouped[courseTypeName].push(subject);
    });
    
    return grouped;
  };

  const groupedSubjects = groupSubjectsByType();
  const courseTypeNames = Object.keys(groupedSubjects).sort();

  const getCourseName = (courseId) => {
    if (!Array.isArray(courses)) {
      console.warn('courses is not an array:', courses);
      return 'Unknown';
    }
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
  };

  const fetchCoursesByCourseType = async (courseTypeId) => {
    if (!courseTypeId || !token) {
      setFilteredCourses([]);
      return;
    }
    
    try {
      console.log('Fetching courses for course type:', courseTypeId);
      // Use the same endpoint as CourseManagement - paginated courses endpoint
      const data = await getCourses(token, courseTypeId, 0, 100, 'createdAt', 'desc');
      console.log('Raw courses API response (fetchCoursesByCourseType):', data);
      console.log('Courses data type:', typeof data);
      console.log('Courses is array:', Array.isArray(data));
      console.log('Has content property:', !!data.content);
      console.log('Content is array:', Array.isArray(data.content));
      console.log('Content length:', data.content?.length);
      
      // Handle different response formats
      let coursesArray = [];
      if (Array.isArray(data)) {
        coursesArray = data;
      } else if (data && Array.isArray(data.content)) {
        // Handle paginated response
        coursesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        // Handle wrapped response
        coursesArray = data.data;
      } else if (data && data.courses && Array.isArray(data.courses)) {
        // Handle nested response
        coursesArray = data.courses;
      } else {
        console.warn('Unexpected courses data format (fetchCoursesByCourseType):', data);
        coursesArray = [];
      }
      
      console.log('Processed courses array (fetchCoursesByCourseType):', coursesArray);
      setFilteredCourses(coursesArray);
    } catch (error) {
      console.error('Error fetching courses by course type:', error);
      setFilteredCourses([]);
    }
  };

  const fetchClassesAndExamsByCourse = async (courseTypeId, courseId) => {
    if (!courseId || !token) {
      setFilteredClasses([]);
      setFilteredExams([]);
      return;
    }
    
    try {
      console.log('Fetching classes and exams for course type:', courseTypeId, 'course:', courseId);
      
      // Fetch classes and exams using course-specific endpoints with pagination
      const [classesData, examsData] = await Promise.all([
        getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc'),
        getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc')
      ]);
      
      console.log('Raw classes API response (fetchClassesAndExamsByCourse):', classesData);
      console.log('Raw exams API response (fetchClassesAndExamsByCourse):', examsData);
      console.log('Classes has content property:', !!classesData.content);
      console.log('Classes content length:', classesData.content?.length);
      console.log('Exams has content property:', !!examsData.content);
      console.log('Exams content length:', examsData.content?.length);
      
      // Handle different response formats for classes
      let classesArray = [];
      if (Array.isArray(classesData)) {
        classesArray = classesData;
      } else if (classesData && Array.isArray(classesData.content)) {
        classesArray = classesData.content;
      } else if (classesData && Array.isArray(classesData.data)) {
        classesArray = classesData.data;
      } else if (classesData && classesData.classes && Array.isArray(classesData.classes)) {
        classesArray = classesData.classes;
      } else {
        console.warn('Unexpected classes data format (fetchClassesAndExamsByCourse):', classesData);
        classesArray = [];
      }
      
      // Handle different response formats for exams
      let examsArray = [];
      if (Array.isArray(examsData)) {
        examsArray = examsData;
      } else if (examsData && Array.isArray(examsData.content)) {
        examsArray = examsData.content;
      } else if (examsData && Array.isArray(examsData.data)) {
        examsArray = examsData.data;
      } else if (examsData && examsData.exams && Array.isArray(examsData.exams)) {
        examsArray = examsData.exams;
      } else {
        console.warn('Unexpected exams data format (fetchClassesAndExamsByCourse):', examsData);
        examsArray = [];
      }
      
      console.log('Processed classes array (fetchClassesAndExamsByCourse):', classesArray);
      console.log('Processed exams array (fetchClassesAndExamsByCourse):', examsArray);
      
      setFilteredClasses(classesArray);
      setFilteredExams(examsArray);
    } catch (error) {
      console.error('Error fetching classes and exams by course:', error);
      setFilteredClasses([]);
      setFilteredExams([]);
    }
  };

  const fetchMasterSubjects = async (courseTypeId) => {
    if (!courseTypeId || !token) {
      setMasterSubjects([]);
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, masterSubjects: true }));
      console.log('Fetching master subjects for course type (master endpoint):', courseTypeId);
      const data = await getMasterSubjectsByCourseType(token, courseTypeId, { active: showActiveOnly });
      
      // Handle paginated response - extract content array for master subjects
      const masterSubjectsArray = data.content || data;
      setMasterSubjects(Array.isArray(masterSubjectsArray) ? masterSubjectsArray : []);
      
      console.log('Master subjects fetched for course type:', masterSubjectsArray);
      console.log('Master subjects count:', masterSubjectsArray.length);
    } catch (error) {
      console.error('Error fetching master subjects by course type:', error);
      setMasterSubjects([]);
      addNotification({
        type: 'error',
        message: 'Failed to fetch master subjects for selected course type',
        duration: 5000
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, masterSubjects: false }));
    }
  };

  const isCompetitiveCourseType = (courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('competitive');
  };

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
        // Note: masterDataService.getCourseTypes currently doesn't accept signal; apiUtils likely handles
        // Even without signal support, we still gain cache dedup benefits
        courseTypesAbortRef.current = new AbortController();
        courseTypesData = await getCourseTypesCached(token);
        courseTypesCacheRef.current = { data: courseTypesData, ts: now };
      }
      
      // Do NOT fetch subjects on initial load; wait for filters
      setSubjects([]);
      
      console.log('Raw courseTypes API response (SubjectManagement):', courseTypesData);
      console.log('CourseTypes data type:', typeof courseTypesData);
      console.log('CourseTypes is array:', Array.isArray(courseTypesData));
      
      // Handle different response formats
      let courseTypesArray = [];
      if (Array.isArray(courseTypesData)) {
        courseTypesArray = courseTypesData;
      } else if (courseTypesData && Array.isArray(courseTypesData.content)) {
        // Handle paginated response
        courseTypesArray = courseTypesData.content;
      } else if (courseTypesData && Array.isArray(courseTypesData.data)) {
        // Handle wrapped response
        courseTypesArray = courseTypesData.data;
      } else if (courseTypesData && courseTypesData.courseTypes && Array.isArray(courseTypesData.courseTypes)) {
        // Handle nested response
        courseTypesArray = courseTypesData.courseTypes;
      } else {
        console.warn('Unexpected courseTypes data format (SubjectManagement):', courseTypesData);
        courseTypesArray = [];
      }
      
      console.log('Processed courseTypes array (SubjectManagement):', courseTypesArray);
      setCourseTypes(courseTypesArray); // Set course types directly like in ClassManagement
      setCourses([]); // defer loading courses until a course type is selected
      setClasses([]);
      setExams([]);
      
      // Initialize filtered data
      setFilteredCourses([]);
      setFilteredClasses([]);
      setFilteredExams([]);
      
      // Debug logging to see the data structure
      console.log('=== SUBJECT MANAGEMENT FETCH DEBUG ===');
      console.log('Course types raw data:', courseTypesData);
      console.log('Course types type:', typeof courseTypesData);
      console.log('Course types is array:', Array.isArray(courseTypesData));
      console.log('Course types length:', courseTypesData?.length);
      console.log('Initial load: only course types fetched; subjects deferred until filters applied');
      console.log('=====================================');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (courseTypeId = null, courseId = null, classId = null, examId = null, active = null) => {
    try {
      setLoading(true);
      console.log('=== FETCH SUBJECTS DEBUG ===');
      console.log('fetchSubjects called with filters:', { courseTypeId, courseId, classId, examId, active });
      console.log('Token available:', !!token);
      // Do not call API if no filters are applied (initial load or cleared filters)
      if (!courseTypeId && !courseId && !classId && !examId) {
        console.log('No filters provided; skipping subjects API call');
        setSubjects([]);
        return;
      }
      // Build cache key and use 5s cache + 1.5s dedup + abort
      const key = `ct:${courseTypeId || ''}|c:${courseId || ''}|cl:${classId || ''}|e:${examId || ''}|a:${active ? '1' : '0'}`;
      const now = Date.now();
      const cached = subjectsCacheRef.current.get(key);
      let data;
      if (cached && now - cached.ts < 5000) {
        data = cached.data;
      } else {
        if (key === lastSubjectsKeyRef.current && now - lastSubjectsAtRef.current < 2000) {
          // skip duplicate
          data = [];
        } else {
          if (subjectsAbortRef.current) {
            try { subjectsAbortRef.current.abort(); } catch(_) {}
          }
          subjectsAbortRef.current = new AbortController();
          // Record before awaiting to dedup concurrent triggers
          lastSubjectsKeyRef.current = key;
          lastSubjectsAtRef.current = now;
          // Use all-linkages filter endpoint instead of old /subjects
          data = await getAllSubjectLinkages(token, { courseTypeId, courseId, classId, examId, active });
          subjectsCacheRef.current.set(key, { data, ts: now });
        }
      }
      console.log('Fetched subjects raw data:', data);
      
      // Normalize linkage/data array
      let items = Array.isArray(data) ? data : (data?.content || data?.data || []);
      if (!Array.isArray(items)) items = [];
      console.log('Final subjects array (linkages):', items);
      setSubjects(items);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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
          message: 'Master subject selection is required',
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
      
      // Determine course type and selected subject
      const courseTypeId = parseInt(formData.courseType.id);
      const subjectId = formData.masterSubjectId ? parseInt(formData.masterSubjectId) : null;
      const displayOrderVal = formData.displayOrder ? parseInt(formData.displayOrder) : 0;
      if (!subjectId) {
        addNotification({ type: 'error', message: 'Please select a subject', duration: 4000 });
        return;
      }
      
      if (editingId) {
        // Preserve existing update flow (if used)
        const updatePayload = {
          name: formData.name.trim(),
          description: formData.description ? formData.description.trim() : '',
          courseTypeId,
          displayOrder: displayOrderVal,
          isActive: formData.isActive
        };
        await updateSubject(token, editingId, updatePayload);
        addNotification({
          type: 'success',
          message: 'Subject updated successfully',
          duration: 3000
        });
      } else {
        // Build unified link request
        const linkRequest = { subjectId, displayOrder: displayOrderVal };
        if (courseTypeId === 1) {
          if (!formData.class?.id) {
            addNotification({ type: 'error', message: 'Please select a Class to link the subject', duration: 4000 });
            return;
          }
          linkRequest.classId = parseInt(formData.class.id);
          linkRequest.isActive = !!formData.isActive;
        } else if (courseTypeId === 2) {
          if (!formData.exam?.id) {
            addNotification({ type: 'error', message: 'Please select an Exam to link the subject', duration: 4000 });
            return;
          }
          linkRequest.examId = parseInt(formData.exam.id);
          if (formData.weightage) linkRequest.weightage = parseInt(formData.weightage);
        } else if (courseTypeId === 3) {
          if (!formData.course?.id) {
            addNotification({ type: 'error', message: 'Please select a Course to link the subject', duration: 4000 });
            return;
          }
          linkRequest.courseId = parseInt(formData.course.id);
          if (formData.isCompulsory !== undefined) linkRequest.isCompulsory = !!formData.isCompulsory;
        } else {
          addNotification({ type: 'error', message: 'Unsupported course type for linking', duration: 4000 });
          return;
        }

        await createSubjectWithAutoLink(token, linkRequest);
        addNotification({ type: 'success', message: 'Subject linked successfully', duration: 3000 });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ 
        name: '', 
        description: '', 
        masterSubjectId: '',
        courseType: { id: '' }, 
        course: { id: '' },
        class: { id: '' },
        exam: { id: '' },
        displayOrder: '', 
        isActive: true 
      });
      // Refresh the subject list after successful save
      const refreshCourseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
      const refreshCourseId = selectedCourse ? parseInt(selectedCourse) : null;
      const refreshClassId = selectedClass ? parseInt(selectedClass) : null;
      const refreshExamId = selectedExam ? parseInt(selectedExam) : null;
      
      console.log('Refreshing subjects after save with filters:', {
        refreshCourseTypeId, refreshCourseId, refreshClassId, refreshExamId, showActiveOnly
      });
      
      // Always refresh - if no filters, fetch all linkages
      if (refreshCourseTypeId || refreshCourseId || refreshClassId || refreshExamId) {
        await fetchSubjects(refreshCourseTypeId, refreshCourseId, refreshClassId, refreshExamId, showActiveOnly);
      } else {
        // No filters: refresh all linkages
        console.log('No filters applied, fetching all subject linkages');
        const linkages = await getAllSubjectLinkages(token, {});
        const list = Array.isArray(linkages) ? linkages : (linkages?.content || linkages?.data || []);
        setSubjects(list || []);
        subjectsCacheRef.current.set('ALL_LINKAGES', { data: list || [], ts: Date.now() });
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      
      // Extract error message from the error response
      let errorMessage = 'Failed to save subject';
      
      if (error.message) {
        // Check for specific error messages
        if (error.message.includes('Subject is already assigned to this class')) {
          errorMessage = 'Subject is already assigned to this class. Please select a different subject or class.';
        } else if (error.message.includes('Subject with name') && error.message.includes('already exists')) {
          errorMessage = 'A subject with this name already exists for this type. Please choose a different name.';
        } else if (error.message.includes('400')) {
          // Extract the actual error message from 400 responses
          const errorText = error.message.split(' - ').pop();
          if (errorText && errorText !== error.message) {
            try {
              const errorObj = JSON.parse(errorText);
              errorMessage = errorObj.error || errorObj.message || errorMessage;
            } catch (parseError) {
              errorMessage = errorText;
            }
          }
        } else {
          errorMessage = error.message;
        }
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
        const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
        const courseId = selectedCourse ? parseInt(selectedCourse) : null;
        const classId = selectedClass ? parseInt(selectedClass) : null;
        const examId = selectedExam ? parseInt(selectedExam) : null;
        fetchSubjects(courseTypeId, courseId, classId, examId, showActiveOnly);
      } catch (error) {
        console.error('Error deleting subject:', error);
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
    setMasterSubjects([]);
  };


  const handleCourseTypeChange = async (courseTypeId) => {
    setFormData(prev => ({
      ...prev,
      courseType: { id: courseTypeId },
      course: { id: '' },
      class: { id: '' },
      exam: { id: '' },
      name: '' // Reset master subject selection
    }));
    setCourses([]);
    setClasses([]);
    setExams([]);
    
    if (courseTypeId) {
      try {
        setLoadingStates(prev => ({ ...prev, courses: true, masterSubjects: true }));
        
        // Fetch courses and master subjects for this course type (to populate subject dropdown)
        const [coursesData, subjectsData] = await Promise.all([
          getCourses(token, courseTypeId, 0, 100, 'createdAt', 'desc'),
          getMasterSubjectsByCourseType(token, courseTypeId, { 
            active: showActiveOnly
          })
        ]);
        
        console.log('=== SUBJECT MANAGEMENT DEBUG ===');
        console.log('Course Type ID:', courseTypeId);
        console.log('Show Active Only:', showActiveOnly);
        console.log('Raw courses API response:', coursesData);
        console.log('Raw master subjects API response:', subjectsData);
        console.log('Courses has content property:', !!coursesData.content);
        console.log('Courses content length:', coursesData.content?.length);
        console.log('Master subjects has content property:', !!subjectsData.content);
        console.log('Master subjects content length:', subjectsData.content?.length);
        console.log('Master subjects is array:', Array.isArray(subjectsData));
        console.log('Master subjects type:', typeof subjectsData);
        
        // Handle different response formats for courses
        let coursesArray = [];
        if (Array.isArray(coursesData)) {
          coursesArray = coursesData;
        } else if (coursesData && Array.isArray(coursesData.content)) {
          coursesArray = coursesData.content;
        } else if (coursesData && Array.isArray(coursesData.data)) {
          coursesArray = coursesData.data;
        } else if (coursesData && coursesData.courses && Array.isArray(coursesData.courses)) {
          coursesArray = coursesData.courses;
        } else {
          console.warn('Unexpected courses data format (handleCourseTypeChange):', coursesData);
          coursesArray = [];
        }
        
        // Keep only active if flag is on (use form's showActiveOnly toggle from top scope)
        let normalizedCourses = coursesArray.filter(c => (showActiveOnly ? !!c.isActive : true));
        normalizedCourses.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));

        // Handle different response formats for master subjects
        let subjectsArray = [];
        if (Array.isArray(subjectsData)) {
          subjectsArray = subjectsData;
          console.log('Master subjects: Using direct array format');
        } else if (subjectsData && Array.isArray(subjectsData.content)) {
          subjectsArray = subjectsData.content;
          console.log('Master subjects: Using content array format');
        } else if (subjectsData && Array.isArray(subjectsData.data)) {
          subjectsArray = subjectsData.data;
          console.log('Master subjects: Using data array format');
        } else if (subjectsData && subjectsData.subjects && Array.isArray(subjectsData.subjects)) {
          subjectsArray = subjectsData.subjects;
          console.log('Master subjects: Using subjects array format');
        } else {
          console.warn('Unexpected master subjects data format (handleCourseTypeChange):', subjectsData);
          subjectsArray = [];
        }
        
        console.log('Master subjects array after processing:', subjectsArray);
        console.log('Master subjects array length:', subjectsArray.length);
        
        // Normalize subjects for dropdown as {id,label,description}
        let normalizedMasterSubjects = subjectsArray
          .filter(s => (showActiveOnly ? !!s.isActive : true))
          .map(s => ({ id: s.id, label: s.name || '', description: s.description || '' }));
        normalizedMasterSubjects.sort((a, b) => a.label.localeCompare(b.label));
        
        console.log('Master subjects after normalization:', normalizedMasterSubjects);
        console.log('Normalized master subjects length:', normalizedMasterSubjects.length);

        setCourses(normalizedCourses);
        setMasterSubjects(normalizedMasterSubjects);
        
        console.log('Courses fetched:', coursesArray);
        console.log('Master subjects fetched:', normalizedMasterSubjects);
        console.log('Setting masterSubjects state with:', normalizedMasterSubjects.length, 'items');
        console.log('=== END SUBJECT MANAGEMENT DEBUG ===');
      } catch (error) {
        console.error('Error fetching courses and master subjects:', error);
        addNotification({
          type: 'error',
          message: `Failed to fetch courses and master subjects: ${error.message}`,
          duration: 5000
        });
        setCourses([]);
        setMasterSubjects([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, courses: false, masterSubjects: false }));
      }
    } else {
      setMasterSubjects([]);
    }
  };

  const handleCourseChange = async (courseId) => {
    setFormData(prev => ({
      ...prev,
      course: { id: courseId },
      class: { id: '' },
      exam: { id: '' },
      // Clear master subject selection when course changes
      name: '',
      description: '',
      masterSubjectId: ''
    }));
    setClasses([]);
    setExams([]);
    
    if (courseId && formData.courseType.id) {
      const courseTypeId = parseInt(formData.courseType.id);
      console.log('Course changed:', courseId, 'Course Type:', courseTypeId);
      
      try {
        setLoadingStates(prev => ({ ...prev, classes: true, exams: true }));
        
        // Fetch both classes and exams using course-specific endpoints with pagination
        const [classesData, examsData] = await Promise.all([
          getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc'),
          getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc')
        ]);
        
        console.log('Raw classes API response (handleCourseChange):', classesData);
        console.log('Raw exams API response (handleCourseChange):', examsData);
        console.log('Classes has content property:', !!classesData.content);
        console.log('Classes content length:', classesData.content?.length);
        console.log('Exams has content property:', !!examsData.content);
        console.log('Exams content length:', examsData.content?.length);
        
        // Handle different response formats for classes
        let classesArray = [];
        if (Array.isArray(classesData)) {
          classesArray = classesData;
        } else if (classesData && Array.isArray(classesData.content)) {
          classesArray = classesData.content;
        } else if (classesData && Array.isArray(classesData.data)) {
          classesArray = classesData.data;
        } else if (classesData && classesData.classes && Array.isArray(classesData.classes)) {
          classesArray = classesData.classes;
        } else {
          console.warn('Unexpected classes data format (handleCourseChange):', classesData);
          classesArray = [];
        }
        
        let normalizedClasses = classesArray.filter(cl => (showActiveOnly ? !!cl.isActive : true));
        normalizedClasses.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));

        // Handle different response formats for exams
        let examsArray = [];
        if (Array.isArray(examsData)) {
          examsArray = examsData;
        } else if (examsData && Array.isArray(examsData.content)) {
          examsArray = examsData.content;
        } else if (examsData && Array.isArray(examsData.data)) {
          examsArray = examsData.data;
        } else if (examsData && examsData.exams && Array.isArray(examsData.exams)) {
          examsArray = examsData.exams;
        } else {
          console.warn('Unexpected exams data format (handleCourseChange):', examsData);
          examsArray = [];
        }
        
        let normalizedExams = examsArray.filter(ex => (showActiveOnly ? !!ex.isActive : true));
        normalizedExams.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));
        
        setClasses(normalizedClasses);
        setExams(normalizedExams);
        
        console.log('Classes fetched:', classesArray);
        console.log('Exams fetched:', examsArray);
        
      } catch (error) {
        console.error('Error in handleCourseChange:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch classes and exams',
          duration: 5000
        });
        setClasses([]);
        setExams([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, classes: false, exams: false }));
      }
    }
  };


  return (
    <div className="master-data-component">
      <AdminPageHeader
        title="Subject Management"
        subtitle="Create subjects once per course type. Subjects are shared across all classes within a course type."
        showAdminBadge={false}
        actions={(
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Subject
          </button>
        )}
      />

       {/* Drill-down Filters */}
       <div className="filter-section">
         <div className="filter-header">
           <h4>Filter Subjects</h4>
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
                 setFilteredCourses([]);
                 setFilteredClasses([]);
                 setFilteredExams([]);
               }}
               disabled={loading}
             >
               Clear All Filters
             </button>
           </div>
         </div>
         
         {(loading && courseTypes.length === 0) ? (
           <div className="empty-state">
             <div className="empty-icon">No Subjects</div>
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
                 onChange={(e) => setSelectedCourseType(e.target.value)}
                 className="filter-select"
               >
                 <option value="">Select Course Type</option>
                 {Array.isArray(courseTypes) && courseTypes.length > 0 ? courseTypes.map(courseType => (
                   <option key={courseType.id} value={courseType.id}>
                     {courseType.name}
                   </option>
                 )) : (
                   <option value="" disabled>Loading course types...</option>
                 )}
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
                 <option value="">Select Course</option>
                 {Array.isArray(filteredCourses) && filteredCourses.map(course => (
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
                   onChange={(e) => setSelectedClass(e.target.value)}
                   className="filter-select"
                   disabled={!selectedCourse}
                 >
                   <option value="">Select Class</option>
                   {Array.isArray(filteredClasses) && filteredClasses.map(cls => (
                     <option key={cls.id} value={cls.id}>
                       {cls.name}
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
                   onChange={(e) => setSelectedExam(e.target.value)}
                   className="filter-select"
                   disabled={!selectedCourse}
                 >
                   <option value="">Select Exam</option>
                   {Array.isArray(filteredExams) && filteredExams.map(exam => (
                     <option key={exam.id} value={exam.id}>
                       {exam.name}
                     </option>
                   ))}
                 </select>
               </div>
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
            {/* Step 1: Course Type Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseType">Course Type *</label>
                <select
                  id="courseType"
                  name="courseType"
                  value={formData.courseType.id}
                  onChange={(e) => handleCourseTypeChange(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Course Type</option>
                  {Array.isArray(courseTypes) && courseTypes.length > 0 ? courseTypes.map(courseType => (
                    <option key={courseType.id} value={courseType.id}>
                      {courseType.name}
                    </option>
                  )) : (
                    <option value="" disabled>Loading course types...</option>
                  )}
                </select>
              </div>
            </div>
            
            {/* Step 2: Course Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course">Course *</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course?.id || ''}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="form-input"
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
            </div>
            
            {/* Step 3: Class/Exam Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class">Link to Specific Class</label>
                <select
                  id="class"
                  name="class"
                  value={formData.class?.id || ''}
                  onChange={(e) => setFormData({ ...formData, class: { id: e.target.value } })}
                  className="form-input"
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
                  name="exam"
                  value={formData.exam?.id || ''}
                  onChange={(e) => setFormData({ ...formData, exam: { id: e.target.value } })}
                  className="form-input"
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
            
            {/* Step 4: Master Subject Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="masterSubject">Master Subject *</label>
                <select
                  id="masterSubject"
                  name="masterSubject"
                  value={formData.name}
                  onChange={(e) => {
                    const selectedSubjectLabel = e.target.value;
                    const selectedMasterSubject = masterSubjects.find(ms => ms.label === selectedSubjectLabel);
                    setFormData({ 
                      ...formData, 
                      name: selectedSubjectLabel,
                      description: selectedMasterSubject?.description || '',
                      masterSubjectId: selectedMasterSubject?.id || ''
                    });
                  }}
                  className="form-input"
                  disabled={!formData.courseType.id || loadingStates.masterSubjects}
                  required
                >
                  <option value="">
                    {!formData.courseType.id ? 'Select Course Type first' :
                     loadingStates.masterSubjects ? 'Loading master subjects...' : 
                     'Select Master Subject'}
                  </option>
                  {masterSubjects.length > 0 ? masterSubjects.map(masterSubject => (
                    <option key={masterSubject.id} value={masterSubject.label}>
                      {masterSubject.label}
                    </option>
                  )) : (
                    <option value="" disabled>No master subjects available</option>
                  )}
                </select>
                {masterSubjects.length > 0 && (
                  <small className="form-help">
                    {masterSubjects.length} master subjects available
                  </small>
                )}
              </div>
            </div>
            
            {/* Additional Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="displayOrder">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 1, 2, 3"
                  min="1"
                />
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
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  placeholder={formData.name ? "Description from master subject" : "Brief description of this subject"}
                  rows={3}
                  readOnly={!!formData.name}
                  style={{
                    backgroundColor: formData.name ? '#f8f9fa' : '#fff',
                    color: formData.name ? '#6c757d' : '#2c3e50',
                    cursor: formData.name ? 'not-allowed' : 'text'
                  }}
                />
                {formData.name && (
                  <small className="form-help">
                    Description is automatically filled from the selected master subject
                  </small>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update Subject' : 'Create Subject')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>
            Subjects ({(() => {
              const ct = selectedCourseType ? parseInt(selectedCourseType) : null;
              if (!Array.isArray(subjects)) return 0;
              if (!ct) return subjects.length;
              if (ct === 1) return subjects.filter(s => (s.courseTypeId === 1) || (s.structureType === 'ACADEMIC')).length;
              if (ct === 2) return subjects.filter(s => (s.courseTypeId === 2) || (s.structureType === 'COMPETITIVE')).length;
              return subjects.filter(s => (s.courseTypeId && s.courseTypeId !== 1 && s.courseTypeId !== 2) || (s.structureType === 'PROFESSIONAL')).length;
            })()})
          </h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={async () => {
                const hasAnyFilter = !!(selectedCourseType || selectedCourse || selectedClass || selectedExam);
                setLoading(true);
                try {
                  if (hasAnyFilter) {
                    const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
                    const courseId = selectedCourse ? parseInt(selectedCourse) : null;
                    const classId = selectedClass ? parseInt(selectedClass) : null;
                    const examId = selectedExam ? parseInt(selectedExam) : null;
                    await fetchSubjects(courseTypeId, courseId, classId, examId, showActiveOnly);
                  } else {
                    // No filters: refresh all-linkages
                    const linkages = await getAllSubjectLinkages(token, {});
                    const list = Array.isArray(linkages) ? linkages : (linkages?.content || linkages?.data || []);
                    setSubjects(list || []);
                    subjectsCacheRef.current.set('ALL_LINKAGES', { data: list || [], ts: Date.now() });
                  }
                } catch (e) {
                  console.warn('Refresh failed:', e?.message || e);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
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
            <div className="empty-icon">No Subjects</div>
            <h4>No Subjects Found</h4>
            <p>Create your first subject to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Subject
            </button>
          </div>
        ) : courseTypeNames.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No Subjects</div>
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
          <div className="subjects-container">
            {(() => {
              // Group subjects by course type using flat API response structure
              const academicSubjects = subjects.filter(subject => {
                const courseTypeId = subject.courseTypeId || subject.courseType?.id;
                return courseTypeId === 1 || courseTypeId === '1';
              });

              const competitiveSubjects = subjects.filter(subject => {
                const courseTypeId = subject.courseTypeId || subject.courseType?.id;
                return courseTypeId === 2 || courseTypeId === '2';
              });

              const professionalSubjects = subjects.filter(subject => {
                const courseTypeId = subject.courseTypeId || subject.courseType?.id;
                return courseTypeId === 3 || courseTypeId === '3';
              });

              // Subject field configuration
              const subjectFields = [
                { key: 'courseTypeName', label: 'Course Type' },
                { key: 'courseName', label: 'Course' },
                { key: 'className', label: 'Class', condition: (item) => item.className },
                { key: 'examName', label: 'Exam', condition: (item) => item.examName },
                { key: 'subjectType', label: 'Subject Type' },
                { key: 'structureType', label: 'Structure Type' }
              ];

              const renderSubjectCard = (subject) => (
                <DataCard
                  key={`${subject.linkageId}-${subject.subjectId}`}
                  item={subject}
                  itemType="subject"
                  onEdit={(item) => handleEdit({ id: item.subjectId, name: item.subjectName })}
                  onDelete={() => handleDelete(subject.subjectId)}
                  fields={subjectFields}
                />
              );

              return (
                <>
                  {/* Academic Subjects Section */}
                  {academicSubjects.length > 0 && (
                    <div className="subject-section">
                <div className="section-header">
                        <h3>Academic Course Subjects</h3>
                        <span className="section-count">({academicSubjects.length} subjects)</span>
                </div>
                <div className="data-grid">
                        {academicSubjects.map(renderSubjectCard)}
                        </div>
                        </div>
                  )}

                  {/* Competitive Subjects Section */}
                  {competitiveSubjects.length > 0 && (
                    <div className="subject-section">
                      <div className="section-header">
                        <h3>Competitive Course Subjects</h3>
                        <span className="section-count">({competitiveSubjects.length} subjects)</span>
                      </div>
                      <div className="data-grid">
                        {competitiveSubjects.map(renderSubjectCard)}
                      </div>
                    </div>
                  )}

                  {/* Professional Subjects Section */}
                  {professionalSubjects.length > 0 && (
                    <div className="subject-section">
                      <div className="section-header">
                        <h3>Professional Course Subjects</h3>
                        <span className="section-count">({professionalSubjects.length} subjects)</span>
                      </div>
                      <div className="data-grid">
                        {professionalSubjects.map(renderSubjectCard)}
                    </div>
                </div>
                  )}

                  {/* No subjects in any section */}
                  {academicSubjects.length === 0 && competitiveSubjects.length === 0 && professionalSubjects.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">No Subjects</div>
                      <h4>No Subjects Found</h4>
                      <p>No subjects match your current filters. Try adjusting your filter criteria or create a new subject.</p>
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

export default SubjectManagement;
