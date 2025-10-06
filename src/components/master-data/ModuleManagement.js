import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCourseTypesCached } from '../../services/globalApiCache';
import {
  createModule,
  deleteModule,
  getAllSubjectLinkages,
  getClassesByCourse,
  getCourses,
  getExamsByCourse,
  getMasterSubjectsByCourseType,
  getModulesCombinedFilter,
  getTopicsByLinkage,
  updateModule
} from '../../services/masterDataService';
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

const ModuleManagement = () => {
  const { token, addNotification } = useApp();
  
  // Helper functions for course type checking
  const isAcademicCourseType = (courseTypeId) => courseTypeId === '1' || courseTypeId === 1;
  const isCompetitiveCourseType = (courseTypeId) => courseTypeId === '2' || courseTypeId === 2;
  const isProfessionalCourseType = (courseTypeId) => courseTypeId === '3' || courseTypeId === 3;

  // Filter states (separate from form state)
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
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
    subjectId: '',
    topicId: ''
  });
  
  // Dropdown data states (for both filter and form)
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [subjectLinkages, setSubjectLinkages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    classes: false,
    exams: false,
    masterSubjects: false,
    subjects: false,
    topics: false,
    modules: false
  });

  // Component state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Refs for preventing duplicate calls
  const isInitialMountRef = useRef(true);
  const fetchModulesInProgressRef = useRef(false);
  const modulesAbortRef = useRef(null);
  const courseTypesAbortRef = useRef(null);
  const courseTypesCacheRef = useRef({ data: null, ts: 0 });
  const didMountCourseType = useRef(false);
  const didMountCourse = useRef(false);
  const didMountClass = useRef(false);
  const didMountExam = useRef(false);
  const didMountActive = useRef(false);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (courseTypesAbortRef.current) {
        try { courseTypesAbortRef.current.abort(); } catch(_) {}
      }
      if (modulesAbortRef.current) {
        try { modulesAbortRef.current.abort(); } catch(_) {}
      }
    };
  }, []);

  // Initial data fetch
  const fetchData = async () => {
    if (!token) return;
    
    try {
      console.log('🔄 Fetching initial course types for ModuleManagement');
      const data = await getCourseTypesCached(token);
      
      // Robust array handling
      let courseTypesArray = [];
      if (Array.isArray(data)) {
        courseTypesArray = data;
      } else if (data && Array.isArray(data.content)) {
        courseTypesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        courseTypesArray = data.data;
      } else if (data && data.courseTypes && Array.isArray(data.courseTypes)) {
        courseTypesArray = data.courseTypes;
      } else {
        console.warn('Unexpected course types data format:', data);
        courseTypesArray = [];
      }
      
      console.log('Normalized course types array:', courseTypesArray);
      setCourseTypes(courseTypesArray);
      
    } catch (error) {
      console.error('Error fetching course types:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load course types'
      });
    }
  };

  // Fetch courses by course type
  const fetchCoursesByCourseType = async (courseTypeId) => {
    if (!token || !courseTypeId) {
      setFilteredCourses([]);
      setCourses([]);
      return;
    }
    
    try {
      console.log('Fetching courses for course type:', courseTypeId);
      
      const data = await getCourses(token, courseTypeId, 0, 100, 'createdAt', 'desc');
      console.log('Raw courses data from API:', data);
      
      // Robust array handling
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
    }
  };

  // Fetch classes and exams by course
  const fetchClassesAndExamsByCourse = async (courseTypeId, courseId) => {
    if (!token || !courseTypeId || !courseId) {
      setFilteredClasses([]);
      setFilteredExams([]);
      setClasses([]);
      setExams([]);
      return;
    }
    
    try {
      console.log('Fetching classes and exams for course:', courseId, 'courseType:', courseTypeId);
      
      const [classesData, examsData] = await Promise.all([
        getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc'),
        getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc')
      ]);
      
      console.log('Raw classes data:', classesData);
      console.log('Raw exams data:', examsData);
      
      // Handle classes data
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
      
      // Handle exams data
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
    }
  };

  // Fetch master subjects by course type
  const fetchMasterSubjectsByCourseType = async (courseTypeId) => {
    if (!token || !courseTypeId) {
      setMasterSubjects([]);
      return;
    }
    
    try {
      console.log('Fetching master subjects for course type:', courseTypeId);
      
      const data = await getMasterSubjectsByCourseType(token, courseTypeId);
      console.log('Raw master subjects data:', data);
      
      // Robust array handling
      let subjectsArray = [];
      if (Array.isArray(data)) {
        subjectsArray = data;
      } else if (data && Array.isArray(data.content)) {
        subjectsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        subjectsArray = data.data;
      } else if (data && data.subjects && Array.isArray(data.subjects)) {
        subjectsArray = data.subjects;
      } else {
        console.warn('Unexpected master subjects data format:', data);
        subjectsArray = [];
      }
      
      console.log('Normalized master subjects array:', subjectsArray);
      setMasterSubjects(subjectsArray);
      
    } catch (error) {
      console.error('Error fetching master subjects:', error);
      setMasterSubjects([]);
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
  // Fetch modules by topic
  const fetchModulesByTopic = async (topicId) => {
    if (!token || !topicId) {
      setModules([]);
      return;
    }
    
    try {
      console.log('Fetching modules for topic:', topicId);
      
      const data = await getModulesCombinedFilter(token, {
        topicId: parseInt(topicId),
        active: showActiveOnly
      });
      console.log('Raw modules data from API:', data);
      
      // Robust array handling
      let modulesArray = [];
      if (Array.isArray(data)) {
        modulesArray = data;
      } else if (data && Array.isArray(data.content)) {
        modulesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        modulesArray = data.data;
      } else {
        modulesArray = [];
      }
      
      console.log('Normalized modules array:', modulesArray);
      setModules(modulesArray);
      
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      console.log('🔄 ModuleManagement: Initial mount, fetching data...');
      fetchData();
      // Initial load with all modules
      console.log('🔄 ModuleManagement: Fetching initial modules...');
      fetchModulesData();
    }
  }, [token]);

  // Filter effects
  useEffect(() => {
    if (!didMountCourseType.current) { 
      didMountCourseType.current = true; 
      return; 
    }
    
    if (selectedCourseType) {
      console.log('🔄 Filter: Course type changed to:', selectedCourseType);
      const courseTypeId = parseInt(selectedCourseType);
      
      // Fetch courses for this course type
      fetchCoursesByCourseType(courseTypeId);
      
      // Reset dependent filters
      setSelectedCourse('');
      setSelectedClass('');
      setSelectedExam('');
      setSelectedSubject('');
      setSelectedTopic('');
      setFilteredCourses([]);
      setFilteredClasses([]);
      setFilteredExams([]);
      setSubjectLinkages([]);
      setTopics([]);
      setModules([]);
    } else {
      setFilteredCourses([]);
      setFilteredClasses([]);
      setFilteredExams([]);
      setMasterSubjects([]);
      setSubjectLinkages([]);
      setTopics([]);
      setModules([]);
    }
    
    // Always fetch modules when any filter changes
    fetchModulesData();
  }, [selectedCourseType]);

  useEffect(() => {
    if (!didMountCourse.current) { 
      didMountCourse.current = true; 
      return; 
    }
    
    if (selectedCourse && selectedCourseType) {
      console.log('🔄 Filter: Course changed to:', selectedCourse);
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      
      // Fetch classes and exams for this course
      fetchClassesAndExamsByCourse(courseTypeId, courseId);
      
      // Fetch subject linkages for this course
      fetchSubjectLinkages(courseTypeId, courseId, null, null);
      
      // Reset dependent filters
      setSelectedClass('');
      setSelectedExam('');
      setSelectedSubject('');
      setSelectedTopic('');
      setFilteredClasses([]);
      setFilteredExams([]);
      setTopics([]);
      setModules([]);
    } else {
      setFilteredClasses([]);
      setFilteredExams([]);
      setSubjectLinkages([]);
      setTopics([]);
      setModules([]);
    }
    
    // Always fetch modules when any filter changes
    fetchModulesData();
  }, [selectedCourse]);

  useEffect(() => {
    if (!didMountClass.current) { 
      didMountClass.current = true; 
      return; 
    }
    
    if (selectedClass && selectedCourse && selectedCourseType) {
      console.log('🔄 Filter: Class changed to:', selectedClass);
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      const classId = parseInt(selectedClass);
      
      // Fetch subject linkages with class filter
      fetchSubjectLinkages(courseTypeId, courseId, classId, null);
      
      // Reset exam and subject selection
      setSelectedExam('');
      setSelectedSubject('');
      setSelectedTopic('');
      setTopics([]);
      setModules([]);
    }
    
    // Always fetch modules when any filter changes
    fetchModulesData();
  }, [selectedClass]);

  useEffect(() => {
    if (!didMountExam.current) { 
      didMountExam.current = true; 
      return; 
    }
    
    if (selectedExam && selectedCourse && selectedCourseType) {
      console.log('🔄 Filter: Exam changed to:', selectedExam);
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      const examId = parseInt(selectedExam);
      
      // Fetch subject linkages with exam filter
      fetchSubjectLinkages(courseTypeId, courseId, null, examId);
      
      // Reset class and subject selection
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedTopic('');
      setTopics([]);
      setModules([]);
    }
    
    // Always fetch modules when any filter changes
    fetchModulesData();
  }, [selectedExam]);

  useEffect(() => {
    if (!didMountActive.current) { 
      didMountActive.current = true; 
      return; 
    }
    
    const courseTypeId = selectedCourseType ? parseInt(selectedCourseType) : null;
    const courseId = selectedCourse ? parseInt(selectedCourse) : null;
    const classId = selectedClass ? parseInt(selectedClass) : null;
    const examId = selectedExam ? parseInt(selectedExam) : null;
    
    if (courseId) {
      fetchSubjectLinkages(courseTypeId, courseId, classId, examId);
    }
    
    // Always fetch modules when any filter changes
    fetchModulesData();
  }, [showActiveOnly]);
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
        subjectId: '',
        topicId: ''
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
        subjectId: '',
        topicId: ''
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
        subjectId: '',
        topicId: ''
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
      case 'topicId':
        console.log('🔄 Filter: Topic changed to:', value);
        setSelectedTopic(value);
        // Fetch modules when topic is selected
        if (value) {
          fetchModulesByTopic(value);
        } else {
          setModules([]);
        }
        break;
      default:
        console.log('Unknown filter name:', filterName);
    }
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
      subjectId: '',
      topicId: ''
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
    console.log('=== MODULE FORM SUBMISSION STARTED ===');
    console.log('Form data:', formData);

    // Basic validation
    if (!formData.name.trim()) {
      addNotification({
        type: 'error',
        message: 'Module name is required'
      });
      return;
    }

    if (!formData.courseType?.id) {
      addNotification({
        type: 'error',
        message: 'Course type is required'
      });
      return;
    }

    if (!formData.subjectId) {
      addNotification({
        type: 'error',
        message: 'Subject is required'
      });
      return;
    }

    if (!formData.topicId) {
      addNotification({
        type: 'error',
        message: 'Topic is required'
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing module
        const submitData = {
          name: formData.name.trim(),
          description: formData.description ? formData.description.trim() : '',
          displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
          isActive: formData.isActive,
          topicId: parseInt(formData.topicId)
        };
        
        await updateModule(token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Module updated successfully',
          duration: 3000
        });
      } else {
        // Create new module
        const submitData = {
          name: formData.name.trim(),
          description: formData.description ? formData.description.trim() : '',
          displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
          isActive: formData.isActive,
          topicId: parseInt(formData.topicId)
        };
        
        await createModule(token, submitData);
        addNotification({
          type: 'success',
          message: 'Module created successfully',
          duration: 3000
        });
      }

      resetForm();
      
      // Refresh modules if topic is selected
      if (selectedTopic) {
        fetchModulesByTopic(selectedTopic);
      }

    } catch (error) {
      console.error('Error saving module:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save module'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteModule(token, id);
      addNotification({
        type: 'success',
        message: 'Module deleted successfully',
        duration: 3000
      });
      
      // Refresh modules if topic is selected
      if (selectedTopic) {
        fetchModulesByTopic(selectedTopic);
      }

    } catch (error) {
      console.error('Error deleting module:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete module',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (module) => {
    setFormData({
      name: module.name,
      description: module.description || '',
      displayOrder: module.displayOrder || '',
      isActive: module.isActive,
      courseType: { id: module.topic?.subject?.course?.courseType?.id || '' },
      course: { id: module.topic?.subject?.course?.id || '' },
      class: { id: '' },
      exam: { id: '' },
      subjectId: module.topic?.subject?.linkageId || module.topic?.subject?.id || '',
      topicId: module.topic?.id || ''
    });
    setEditingId(module.id);
    setShowForm(true);
  };


  // Fetch modules data
  const fetchModulesData = async () => {
    // Prevent duplicate calls
    if (fetchModulesInProgressRef.current) {
      console.log('🔄 fetchModulesData already in progress, skipping duplicate call');
      return;
    }

    if (!token) {
      console.log('🔄 No token available, skipping modules fetch');
      return;
    }

    try {
      console.log('🔄 Starting fetchModulesData...');
      fetchModulesInProgressRef.current = true;
      setLoadingStates(prev => ({ ...prev, modules: true }));

      const filterParams = buildModulesFilterParams();
      console.log('🔄 Fetching modules with params:', filterParams);
      
      const data = await getModulesCombinedFilter(token, filterParams);
      
      console.log('🔄 Fetched modules data:', data);
      
      // Robust array handling
      let modulesArray = [];
      if (Array.isArray(data)) {
        modulesArray = data;
      } else if (data && Array.isArray(data.content)) {
        modulesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        modulesArray = data.data;
      } else {
        console.warn('Unexpected modules data format:', data);
        modulesArray = [];
      }
      
      console.log('🔄 Normalized modules array:', modulesArray);
      setModules(modulesArray);
      console.log('🔄 Modules state updated with', modulesArray.length, 'modules');
      
    } catch (error) {
      console.error('🔄 Error fetching modules:', error);
      setModules([]);
      addNotification({
        type: 'error',
        message: 'Failed to load modules'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, modules: false }));
      fetchModulesInProgressRef.current = false;
      console.log('🔄 fetchModulesData completed');
    }
  };

  // Build comprehensive filter params for modules
  const buildModulesFilterParams = () => {
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
    
    if (selectedTopic) {
      filterParams.topicId = parseInt(selectedTopic);
    }
    
    return filterParams;
  };

  // Debounced effect for modules fetching on subject/topic changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchModulesData();
    }, 300); // 300ms delay
    
    return () => clearTimeout(timeoutId);
  }, [
    selectedSubject,
    selectedTopic,
    showActiveOnly
  ]);

  // Fetch topics by subject linkage
  const fetchTopicsBySubject = async (courseTypeId, subjectLinkageId) => {
    if (!token || !courseTypeId || !subjectLinkageId) {
      setTopics([]);
      return;
    }
    
    try {
      console.log('🔄 Fetching topics for subject linkage:', { courseTypeId, subjectLinkageId });
      
      const data = await getTopicsByLinkage(token, courseTypeId, subjectLinkageId, showActiveOnly);
      console.log('Raw topics data from API:', data);
      
      // Robust array handling
      let topicsArray = [];
      if (Array.isArray(data)) {
        topicsArray = data;
      } else if (data && Array.isArray(data.content)) {
        topicsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        topicsArray = data.data;
      } else {
        console.warn('Unexpected topics data format:', data);
        topicsArray = [];
      }
      
      console.log('Normalized topics array:', topicsArray);
      setTopics(topicsArray);
      
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
      addNotification({
        type: 'error',
        message: 'Failed to load topics'
      });
    }
  };

  // Effect for subject change - fetch topics by linkage
  useEffect(() => {
    if (selectedSubject && selectedCourseType) {
      console.log('🔄 Filter: Subject changed, fetching topics for subject:', selectedSubject);
      const courseTypeId = parseInt(selectedCourseType);
      const subjectLinkageId = parseInt(selectedSubject);
      fetchTopicsBySubject(courseTypeId, subjectLinkageId);
    } else {
      setTopics([]);
    }
  }, [selectedSubject, selectedCourseType, showActiveOnly]);


  // Form effect for subject change - fetch topics by subject
  useEffect(() => {
    if (formData.subjectId && formData.courseType?.id) {
      console.log('🔄 Form: Subject changed, fetching topics for subject:', formData.subjectId);
      const courseTypeId = parseInt(formData.courseType.id);
      const subjectLinkageId = parseInt(formData.subjectId);
      fetchTopicsBySubject(courseTypeId, subjectLinkageId);
      
      // Clear topic selection when subject changes
      setFormData(prev => ({
        ...prev,
        topicId: ''
      }));
    }
  }, [formData.subjectId, formData.courseType?.id]);


  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Module Management</h2>
          <p>Manage modules with hierarchical filtering and linking to subjects and topics</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            disabled={loading}
          >
            Add Module
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h4>Filter Modules</h4>
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
                setSelectedSubject('');
                setSelectedTopic('');
                setFilteredCourses([]);
                setFilteredClasses([]);
                setFilteredExams([]);
                setSubjectLinkages([]);
                setTopics([]);
                setModules([]);
              }}
              disabled={loading}
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
              disabled={!selectedCourseType}
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
                disabled={!selectedCourse}
              >
                <option value="">Select Class</option>
                {filteredClasses && filteredClasses.length > 0 ? filteredClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
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
                disabled={!selectedCourse}
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

          {/* Topic Filter */}
          <div className="filter-group">
            <label htmlFor="topic-filter">5. Topic:</label>
            <select
              id="topic-filter"
              value={selectedTopic}
              onChange={(e) => handleFilterChange('topicId', e.target.value)}
              className="filter-select"
              disabled={!selectedSubject || loadingStates.topics}
            >
              <option value="">Select Topic</option>
              {topics && topics.length > 0 ? topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              )) : <option value="" disabled>No topics available</option>}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCourseType || selectedCourse || selectedClass || selectedExam || selectedSubject || selectedTopic) && (
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
                Subject: {subjectLinkages.find(s => s.linkageId === parseInt(selectedSubject))?.subjectName || subjectLinkages.find(s => s.linkageId === parseInt(selectedSubject))?.name}
              </span>
            )}
            {selectedTopic && (
              <span className="filter-tag">
                Topic: {topics.find(t => t.id === parseInt(selectedTopic))?.name}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Form Section */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Module' : 'Add New Module'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Module Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., Introduction to Programming"
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
                  placeholder="Describe the module content and scope"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseType">Course Type *</label>
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

              <div className="form-group">
                <label htmlFor="topicId">Topic *</label>
                <select
                  id="topicId"
                  name="topicId"
                  value={formData.topicId}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={!formData.subjectId}
                >
                  <option value="">
                    {!formData.subjectId ? 'Select Subject first' : 'Select Topic'}
                  </option>
                  {topics && topics.length > 0 ? topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  )) : <option value="" disabled>No topics available</option>}
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
                {loading ? 'Saving...' : (editingId ? 'Update Module' : 'Create Module')}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Section */}
      <div className="data-section">
        <div className="data-header">
          <h4>📦 Modules ({modules.length})</h4>
          {console.log('🔄 Rendering modules:', modules.length, modules)}
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              fetchModulesData();
            }}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loadingStates.modules ? (
          <div className="loading-state">
            <p>Loading modules...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No Modules</div>
            <h4>No Modules Found</h4>
            <p>
              {selectedTopic 
                ? "No modules found for the selected topic" 
                : "No modules found. Try adjusting your filter criteria or create a new module."
              }
            </p>
          </div>
        ) : (
          <div className="modules-container">
            {(() => {
              // Group modules by course type using flat API response structure
              const academicModules = modules.filter(module => {
                const courseTypeId = module.courseTypeId || module.courseType?.id;
                return courseTypeId === 1 || courseTypeId === '1';
              });

              const competitiveModules = modules.filter(module => {
                const courseTypeId = module.courseTypeId || module.courseType?.id;
                return courseTypeId === 2 || courseTypeId === '2';
              });

              const professionalModules = modules.filter(module => {
                const courseTypeId = module.courseTypeId || module.courseType?.id;
                return courseTypeId === 3 || courseTypeId === '3';
              });

              // Module field configuration
              const moduleFields = [
                { key: 'courseTypeName', label: 'Course Type' },
                { key: 'courseName', label: 'Course' },
                { key: 'className', label: 'Class', condition: (item) => item.className },
                { key: 'examName', label: 'Exam', condition: (item) => item.examName },
                { key: 'subjectName', label: 'Subject' },
                { key: 'topicName', label: 'Topic' },
                { key: 'structureType', label: 'Structure Type' }
              ];

              const renderModuleCard = (module) => (
                <DataCard
                  key={module.id}
                  item={module}
                  itemType="module"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  fields={moduleFields}
                />
              );

              return (
                <>
                  {/* Academic Modules Section */}
                  {academicModules.length > 0 && (
                    <div className="module-section">
                      <div className="section-header">
                        <h3>Academic Course Modules</h3>
                        <span className="section-count">({academicModules.length} modules)</span>
                      </div>
                      <div className="data-grid">
                        {academicModules.map(renderModuleCard)}
                      </div>
                    </div>
                  )}

                  {/* Competitive Modules Section */}
                  {competitiveModules.length > 0 && (
                    <div className="module-section">
                      <div className="section-header">
                        <h3>Competitive Course Modules</h3>
                        <span className="section-count">({competitiveModules.length} modules)</span>
                      </div>
                      <div className="data-grid">
                        {competitiveModules.map(renderModuleCard)}
                      </div>
                    </div>
                  )}

                  {/* Professional Modules Section */}
                  {professionalModules.length > 0 && (
                    <div className="module-section">
                      <div className="section-header">
                        <h3>Professional Course Modules</h3>
                        <span className="section-count">({professionalModules.length} modules)</span>
                      </div>
                      <div className="data-grid">
                        {professionalModules.map(renderModuleCard)}
                      </div>
                    </div>
                  )}

                  {/* No modules in any section */}
                  {academicModules.length === 0 && competitiveModules.length === 0 && professionalModules.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">No Modules</div>
                      <h4>No Modules Found</h4>
                      <p>No modules match your current filters. Try adjusting your filter criteria or create a new module.</p>
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

export default ModuleManagement;
