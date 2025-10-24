import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFilterSubmit } from '../../hooks/useFilterSubmit';
import { getCourseTypesCached } from '../../services/globalApiCache';
import {
    createChapter,
    deleteChapter,
    getAllSubjectLinkages,
    getChaptersByModule,
    getChaptersCombinedFilter,
    getClassesByCourse,
    getCourses,
    getExamsByCourse,
    getMasterSubjectsByCourseType,
    getModules,
    getModulesByTopic,
    getTopicsByLinkage,
    updateChapter
} from '../../services/masterDataService';
import {
    validateFileType
} from '../../utils/documentUtils';
import {
    getYouTubeEmbedUrl,
    getYouTubeThumbnail,
    getYouTubeVideoId,
    isValidYouTubeUrl,
    normalizeYouTubeUrl
} from '../../utils/youtubeUtils';
import ChapterListCard from './ChapterListCard';
import './ChapterListCard.css';
import DocumentPreviewCard from './DocumentPreviewCard';
import './DocumentPreviewCard.css';
import DocumentPreviewModal from './DocumentPreviewModal';
import './DocumentPreviewModal.css';
import { getChapterFilterConfig, getInitialFilters } from './filters/filterConfigs';
import FilterPanel from './filters/FilterPanel';
import './MasterDataComponent.css';
import './VideoPreviewCard.css';
import VideoPreviewModal from './VideoPreviewModal';
import './VideoPreviewModal.css';

const ChapterManagement = () => {
  const { token, addNotification } = useApp();
  
  // Helper functions for course type checking
  const isAcademicCourseType = (courseTypeId) => {
    return courseTypeId === 1 || courseTypeId === '1';
  };

  const isCompetitiveCourseType = (courseTypeId) => {
    return courseTypeId === 2 || courseTypeId === '2';
  };

  const isProfessionalCourseType = (courseTypeId) => {
    return courseTypeId === 3 || courseTypeId === '3';
  };

  // Main data states
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [subjectLinkages, setSubjectLinkages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [combinedChapters, setCombinedChapters] = useState([]);
  
  // Loading states
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
  
  // Form management - separated filter and data entry forms
  const initialFormData = {
    name: '',
    description: '',
    displayOrder: '',
    isActive: true,
    courseType: { id: '' },
    course: { id: '' },
    class: { id: '' },
    exam: { id: '' },
    subjectId: '',
    topicId: '',
    moduleId: '',
    youtubeLinks: [],
    uploadedFiles: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Component state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  
  
  
  // Fetch data function for filters
  const fetchDataWithFilters = useCallback(async (filters) => {
    if (!token) {
      return [];
    }
    
    try {
      const apiParams = {
        courseTypeId: filters.courseTypeId || '',
        courseId: filters.courseId || '',
        classId: filters.classId || '',
        examId: filters.examId || '',
        subjectId: filters.subjectId || '',
        topicId: filters.topicId || '',
        moduleId: filters.moduleId || ''
      };
      
      const data = await getChaptersCombinedFilter(token, apiParams);
      
      // Handle different response structures
      let filteredData = [];
      if (Array.isArray(data)) {
        filteredData = data;
      } else if (data && Array.isArray(data.content)) {
        filteredData = data.content;
      } else if (data && Array.isArray(data.data)) {
        filteredData = data.data;
      } else if (data && Array.isArray(data.items)) {
        filteredData = data.items;
      } else {
        console.warn('Unexpected data format:', data);
        filteredData = [];
      }
      
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching chapters with filters:', error);
      addNotification({ 
        message: 'Failed to load chapters', 
        type: 'error' 
      });
      return [];
    }
  }, [token, addNotification]);
  
  // Track API calls to prevent duplicates
  const fetchingChaptersRef = useRef(false);

  // Direct filter application function
  const applyFiltersDirect = useCallback(async (filtersToApply) => {
    
    if (fetchingChaptersRef.current) {
      return;
    }

    try {
      fetchingChaptersRef.current = true;
      setLoadingStates(prev => ({ ...prev, chapters: true }));
      const filteredData = await fetchDataWithFilters(filtersToApply);
      setCombinedChapters(filteredData || []);
      return filteredData;
    } catch (error) {
      console.error('Error applying filters directly:', error);
      setCombinedChapters([]);
      return [];
    } finally {
      fetchingChaptersRef.current = false;
      setLoadingStates(prev => ({ ...prev, chapters: false }));
    }
  }, [fetchDataWithFilters]);
  
  // Filtered data states (for filter form)
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);

  // Filter configuration
  const filterConfig = getChapterFilterConfig({
    courseTypes,
    courses: filteredCourses,
    classes: filteredClasses,
    exams: filteredExams,
    subjects: subjectLinkages,
    topics,
    modules
  });

  // Filter state and handlers
  const initialFilters = getInitialFilters('chapter');
  

  // Filter management
  const {
    filters,
    loading: filterLoading,
    hasChanges,
    handleFilterChange,
    applyFilters,
    clearFilters
  } = useFilterSubmit(initialFilters, fetchDataWithFilters, {
    autoFetchOnMount: false // We'll handle initial loading manually
  });

  // Form filtered data states (for data entry form)
  const [formFilteredCourses, setFormFilteredCourses] = useState([]);
  const [formFilteredClasses, setFormFilteredClasses] = useState([]);
  const [formFilteredExams, setFormFilteredExams] = useState([]);
  const [formFilteredSubjects, setFormFilteredSubjects] = useState([]);
  const [formFilteredTopics, setFormFilteredTopics] = useState([]);
  const [formFilteredModules, setFormFilteredModules] = useState([]);

  // Refs for caching and preventing duplicate API calls
  const isInitialMountRef = useRef(true);
  const fetchChaptersInProgressRef = useRef(false);
  const chaptersAbortRef = useRef(null);
  const courseTypesAbortRef = useRef(null);
  const initialLoadDoneRef = useRef(false);

  // File upload states
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');
  const [fileInputs, setFileInputs] = useState([]);
  
  // Video preview states
  const [videoPreviewModal, setVideoPreviewModal] = useState(false);
  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [youtubeLinkError, setYoutubeLinkError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Document preview states
  const [documentPreviewModal, setDocumentPreviewModal] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] = useState(null);
  const [fileInputError, setFileInputError] = useState('');
  const [uploadedFileObjects, setUploadedFileObjects] = useState({});


  // Track previous course type to detect actual changes
  const prevCourseTypeRef = useRef(null);
  const prevCourseRef = useRef(null);
  
  // Track API calls to prevent duplicates
  const fetchingCoursesRef = useRef(false);
  const fetchingClassesExamsRef = useRef(false);
  const fetchingSubjectsRef = useRef(false);
  const fetchingTopicsRef = useRef(false);
  const fetchingModulesRef = useRef(false);

  // Clear dependent filters when course type actually changes
  useEffect(() => {
    if (filters.courseTypeId && prevCourseTypeRef.current !== filters.courseTypeId) {
      // Course type changed, clear dependent filters
      if (filters.courseId) {
        handleFilterChange('courseId', '');
      }
      if (filters.classId) {
        handleFilterChange('classId', '');
      }
      if (filters.examId) {
        handleFilterChange('examId', '');
      }
      if (filters.subjectId) {
        handleFilterChange('subjectId', '');
      }
      if (filters.topicId) {
        handleFilterChange('topicId', '');
      }
      if (filters.moduleId) {
        handleFilterChange('moduleId', '');
      }
      prevCourseTypeRef.current = filters.courseTypeId;
    }
  }, [filters.courseTypeId, handleFilterChange]);

  // Clear dependent filters when course actually changes
  useEffect(() => {
    if (filters.courseId && prevCourseRef.current !== filters.courseId) {
      // Course changed, clear dependent filters
      if (filters.classId) {
        handleFilterChange('classId', '');
      }
      if (filters.examId) {
        handleFilterChange('examId', '');
      }
      if (filters.subjectId) {
        handleFilterChange('subjectId', '');
      }
      if (filters.topicId) {
        handleFilterChange('topicId', '');
      }
      if (filters.moduleId) {
        handleFilterChange('moduleId', '');
      }
      prevCourseRef.current = filters.courseId;
    }
  }, [filters.courseId, handleFilterChange]);

  // Define fetchCoursesByCourseType before using it
  const fetchCoursesByCourseType = useCallback(async (courseTypeId) => {
    if (!courseTypeId) {
      setFilteredCourses([]);
      return;
    }

    try {
      const data = await getCourses(token, courseTypeId, 0, 100, 'name', 'asc');

      const courses = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setFilteredCourses(courses);
    } catch (error) {
      console.error('Error fetching courses by course type:', error);
      setFilteredCourses([]);
      addNotification({
        type: 'error',
        message: 'Failed to load courses',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  // Handle course type changes - fetch courses
  useEffect(() => {
    
    if (filters.courseTypeId && !fetchingCoursesRef.current) {
      fetchingCoursesRef.current = true;
      fetchCoursesByCourseType(filters.courseTypeId).finally(() => {
        fetchingCoursesRef.current = false;
      });
    }
  }, [filters.courseTypeId, fetchCoursesByCourseType]);

  // Handle course changes - fetch classes and exams
  useEffect(() => {
    if (filters.courseId && filters.courseTypeId && !fetchingClassesExamsRef.current) {
      fetchingClassesExamsRef.current = true;
      fetchClassesAndExamsByCourse(filters.courseTypeId, filters.courseId).finally(() => {
        fetchingClassesExamsRef.current = false;
      });
    }
  }, [filters.courseId, filters.courseTypeId]);

  // Handle class/exam changes - fetch subjects
  useEffect(() => {
    if ((filters.classId || filters.examId) && filters.courseTypeId && filters.courseId && !fetchingSubjectsRef.current) {
      fetchingSubjectsRef.current = true;
      fetchSubjectLinkages(filters.courseTypeId, filters.courseId, filters.classId, filters.examId).finally(() => {
        fetchingSubjectsRef.current = false;
      });
    }
  }, [filters.classId, filters.examId, filters.courseTypeId, filters.courseId]);

  // Handle subject changes - fetch topics
  useEffect(() => {
    if (filters.subjectId && filters.courseTypeId && filters.courseId && !fetchingTopicsRef.current) {
      fetchingTopicsRef.current = true;
      fetchTopicsBySubject(filters.subjectId, filters.courseTypeId).finally(() => {
        fetchingTopicsRef.current = false;
      });
    }
  }, [filters.subjectId, filters.courseTypeId, filters.courseId]);

  // Handle topic changes - fetch modules
  useEffect(() => {
    if (filters.topicId && !fetchingModulesRef.current) {
      fetchingModulesRef.current = true;
      fetchModulesByTopic(filters.topicId).finally(() => {
        fetchingModulesRef.current = false;
      });
    }
  }, [filters.topicId]);

  // API fetch functions


  // Missing function definitions
  const fetchClasses = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      return;
    }

    try {
      if (isAcademicCourseType(courseTypeId)) {
        const classesData = await getClassesByCourse(token, courseId, 0, 100, 'name', 'asc');
        setFilteredClasses(Array.isArray(classesData) ? classesData : (classesData?.content || classesData?.data || []));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setFilteredClasses([]);
    }
  }, [token]);

  const fetchExams = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredExams([]);
      return;
    }

    try {
      if (isCompetitiveCourseType(courseTypeId)) {
        const examsData = await getExamsByCourse(token, courseId, 0, 100, 'name', 'asc');
        setFilteredExams(Array.isArray(examsData) ? examsData : (examsData?.content || examsData?.data || []));
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setFilteredExams([]);
    }
  }, [token]);

  const fetchSubjects = useCallback(async (courseTypeId, courseId, classId, examId, isForm = false) => {
    if (!courseTypeId || !courseId) {
      if (isForm) {
        setFormFilteredSubjects([]);
      } else {
        setFilteredSubjects([]);
      }
      return;
    }

    try {
      const data = await getAllSubjectLinkages(token, {
        courseTypeId,
        courseId,
        classId,
        examId
      });
      
      const subjectsArray = Array.isArray(data) ? data : (data?.content || data?.data || []);
      
      if (isForm) {
        setFormFilteredSubjects(subjectsArray);
      } else {
        setFilteredSubjects(subjectsArray);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      if (isForm) {
        setFormFilteredSubjects([]);
      } else {
        setFilteredSubjects([]);
      }
    }
  }, [token]);

  const fetchChapters = useCallback(async () => {
    // This function can be used for manual chapter refresh
    try {
      const data = await getChaptersCombinedFilter(token, { active: true });
      const chaptersArray = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setCombinedChapters(chaptersArray);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setCombinedChapters([]);
    }
  }, [token]);

  // Missing utility functions
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Chapter name is required';
    }
    
    if (!formData.moduleId) {
      errors.moduleId = 'Module is required';
    }
    
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const executeApiCall = useCallback(async (apiFunction, ...args) => {
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, []);

  const fetchClassesAndExamsByCourse = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      setFilteredExams([]);
      return;
    }

    try {
      if (isAcademicCourseType(courseTypeId)) {
        const classesData = await getClassesByCourse(token, courseId, 0, 100, 'name', 'asc');
        setFilteredClasses(Array.isArray(classesData) ? classesData : (classesData?.content || classesData?.data || []));
      }

      if (isCompetitiveCourseType(courseTypeId)) {
        const examsData = await getExamsByCourse(token, courseId, 0, 100, 'name', 'asc');
        setFilteredExams(Array.isArray(examsData) ? examsData : (examsData?.content || examsData?.data || []));
      }
    } catch (error) {
      console.error('Error fetching classes/exams:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load classes/exams',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  const fetchMasterSubjectsByCourseType = async (courseTypeId) => {
    if (!courseTypeId) {
      setMasterSubjects([]);
      return;
    }

    try {
      const data = await getMasterSubjectsByCourseType(token, courseTypeId);
      setMasterSubjects(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching master subjects:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load subjects',
        duration: 3000
      });
    }
  };

  const fetchSubjectLinkages = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) {
      setSubjectLinkages([]);
      return;
    }

    try {
      const params = {
        courseTypeId,
        courseId,
        classId: classId || null,
        examId: examId || null,
        page: 0,
        size: 100,
        sortBy: 'subjectName',
        sortDir: 'asc'
      };

      const data = await getAllSubjectLinkages(token, params);
      setSubjectLinkages(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching subject linkages:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load subjects',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  const fetchTopicsBySubject = useCallback(async (subjectId, courseTypeId) => {
    if (!subjectId || !courseTypeId) {
      setTopics([]);
      return;
    }

    try {
      const relationshipId = parseInt(subjectId);
      const data = await getTopicsByLinkage(token, courseTypeId, relationshipId);
      setTopics(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching topics:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load topics',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  const fetchModulesByTopic = useCallback(async (topicId) => {
    if (!topicId) {
      setModules([]);
      return;
    }

    try {
      const data = await getModulesByTopic(token, topicId, true);
      setModules(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching modules:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load modules',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  // Old fetchChaptersData function removed - now using new filter system
  
  // Chapters list states
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const initialChaptersLoadDoneRef = useRef(false);
  
  // Missing refs
  const lastFormTopicKeyRef = useRef(null);
  const formTopicsLoadingRef = useRef(false);

  // Initial load effect
  useEffect(() => {
    if (initialLoadDoneRef.current) {
      return;
    }
    
    const initializeData = async () => {
      try {
        initialLoadDoneRef.current = true;
        
        // Fetch course types
        const courseTypesData = await getCourseTypesCached(token);
        const courseTypesList = Array.isArray(courseTypesData) ? courseTypesData : (courseTypesData?.content || courseTypesData?.data || []);
        setCourseTypes(courseTypesList);
        
        // Fetch initial courses for filter dropdown
        const coursesData = await getCourses(token, null, 0, 100, 'name', 'asc');
        const coursesList = Array.isArray(coursesData) ? coursesData : (coursesData?.content || coursesData?.data || []);
        setCourses(coursesList);
        
        // Fetch chapters with initial filters (no filters = load all)
        
        const chaptersData = await getChaptersCombinedFilter(token, { 
          active: true, 
          page: 0, 
          size: 100,
          sortBy: 'createdAt',
          sortDir: 'desc'
        });
        
        const chaptersList = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.content || chaptersData?.data || []);
        setCombinedChapters(chaptersList || []);
        
      } catch (error) {
        console.error('Error in initial load:', error);
        addNotification({
          type: 'error',
          message: 'Failed to load initial data',
          duration: 3000
        });
      }
    };
    
    initializeData();
  }, [token, addNotification]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (chaptersAbortRef.current) {
        chaptersAbortRef.current.abort();
      }
      if (courseTypesAbortRef.current) {
        courseTypesAbortRef.current.abort();
      }
    };
  }, []);

  // Old filter effects removed - now using new filter system with FilterPanel

  // Form effects - separated for data entry form
  useEffect(() => {
    if (formData.courseType?.id) {
      fetchCoursesByCourseType(formData.courseType.id).then(setFormFilteredCourses);
    } else {
      setFormFilteredCourses([]);
    }
  }, [formData.courseType?.id]);

  // Form effect for course change - fetch classes and exams based on course type
  useEffect(() => {
    if (formData.courseId && formData.courseTypeId) {
      if (isAcademicCourseType(formData.courseTypeId)) {
        // Academic course - fetch classes and exams
        Promise.all([
          fetchClasses(formData.courseTypeId, formData.courseId),
          fetchExams(formData.courseTypeId, formData.courseId)
        ]).then(([classesData, examsData]) => {
          setFormFilteredClasses(classesData);
          setFormFilteredExams(examsData);
        });
      } else if (isCompetitiveCourseType(formData.courseTypeId)) {
        // Competitive course - only fetch exams
        fetchExams(formData.courseTypeId, formData.courseId).then(setFormFilteredExams);
        setFormFilteredClasses([]); // Clear classes for competitive courses
      } else if (isProfessionalCourseType(formData.courseTypeId)) {
        // Professional course - no classes or exams needed
        setFormFilteredClasses([]);
        setFormFilteredExams([]);
      }
    } else {
      setFormFilteredClasses([]);
      setFormFilteredExams([]);
    }
  }, [formData.courseId, formData.courseTypeId, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, fetchClasses, fetchExams]);

  // Consolidated form subject fetching effect to prevent multiple API calls
  useEffect(() => {
    if (!formData.courseTypeId || !formData.courseId) {
      setFormFilteredSubjects([]);
      return;
    }

    const fetchSubjectsForForm = async () => {
      try {
        let subjectsData = [];
        
        if (isAcademicCourseType(formData.courseTypeId) && formData.classId) {
          subjectsData = await fetchSubjects(formData.courseTypeId, formData.courseId, formData.classId, null, true);
        } else if (isCompetitiveCourseType(formData.courseTypeId) && formData.examId) {
          subjectsData = await fetchSubjects(formData.courseTypeId, formData.courseId, null, formData.examId, true);
        } else if (isProfessionalCourseType(formData.courseTypeId)) {
          subjectsData = await fetchSubjects(formData.courseTypeId, formData.courseId, null, null, true);
        }
        
        setFormFilteredSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching subjects for form:', error);
        setFormFilteredSubjects([]);
      }
    };

    fetchSubjectsForForm();
  }, [formData.courseTypeId, formData.courseId, formData.classId, formData.examId, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, fetchSubjects]);

  // Form effect for subject change - fetch topics by linkage (with de-dup)
  useEffect(() => {
    const courseTypeIdNum = formData.courseTypeId ? parseInt(formData.courseTypeId) : null;
    const relationshipIdNum = formData.subjectId ? parseInt(formData.subjectId) : null;
    if (!courseTypeIdNum || !relationshipIdNum) {
      lastFormTopicKeyRef.current = '';
      setFormFilteredTopics([]);
      return;
    }
    const key = `${courseTypeIdNum}|${relationshipIdNum}`;
    if (lastFormTopicKeyRef.current === key && formFilteredTopics.length > 0) {
      return;
    }
    if (formTopicsLoadingRef.current) return;
    formTopicsLoadingRef.current = true;
    getTopicsByLinkage(token, {
      courseTypeId: courseTypeIdNum,
      relationshipId: relationshipIdNum
    })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setFormFilteredTopics(list || []);
        lastFormTopicKeyRef.current = key;
      })
      .finally(() => {
        formTopicsLoadingRef.current = false;
      });
  }, [formData.subjectId, formData.courseTypeId, token]);

  // Form effect for topic change - fetch modules by topic
  useEffect(() => {
    if (formData.topicId) {
      fetchModulesByTopic(formData.topicId, true).then((modulesData) => {
            setFormFilteredModules(modulesData);
      });
          } else {
            setFormFilteredModules([]);
          }
  }, [formData.topicId, fetchModulesByTopic]);

  // Helper function for displaying subject names with context
  const getSubjectDisplayText = useCallback((subject, courseTypeId) => {
    const subjectName = subject.subjectName || subject.name;
    if (isAcademicCourseType(courseTypeId)) {
      return `${subjectName} (Class-Subject)`;
    } else if (isCompetitiveCourseType(courseTypeId)) {
      return `${subjectName} (Exam-Subject)`;
    } else if (isProfessionalCourseType(courseTypeId)) {
      return `${subjectName} (Course-Subject)`;
    }
    return subjectName;
  }, [isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType]);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear dependent fields when parent changes
    if (field === 'courseType') {
      setFormData(prev => ({
        ...prev,
        courseType: { id: value },
        course: { id: '' },
        class: { id: '' },
        exam: { id: '' },
        subjectId: '',
        topicId: '',
        moduleId: ''
      }));
    } else if (field === 'course') {
      setFormData(prev => ({
        ...prev,
        course: { id: value },
        class: { id: '' },
        exam: { id: '' },
        subjectId: '',
        topicId: '',
        moduleId: ''
      }));
    } else if (field === 'class' || field === 'exam') {
      setFormData(prev => ({
        ...prev,
        [field]: { id: value },
        subjectId: '',
        topicId: '',
        moduleId: ''
      }));
    } else if (field === 'subjectId') {
      setFormData(prev => ({
        ...prev,
        subjectId: value,
        topicId: '',
        moduleId: ''
      }));
    } else if (field === 'topicId') {
      setFormData(prev => ({
        ...prev,
        topicId: value,
        moduleId: ''
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setFormFilteredCourses([]);
    setFormFilteredClasses([]);
    setFormFilteredExams([]);
    setFormFilteredSubjects([]);
    setFormFilteredTopics([]);
    setFormFilteredModules([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Check if subjects are still loading before validation
    if (!formData.courseTypeId || !formData.courseId) {
      addNotification({
        type: 'error',
        message: 'Please select course type and course first',
        duration: 3000
      });
      return;
    }

    // For Academic/Competitive courses, check if class/exam is selected
    if (isAcademicCourseType(formData.courseTypeId) && !formData.classId) {
      addNotification({
        type: 'error',
        message: 'Please select a class for Academic courses',
        duration: 3000
      });
      return;
    }
    
    if (isCompetitiveCourseType(formData.courseTypeId) && !formData.examId) {
      addNotification({
        type: 'error',
        message: 'Please select an exam for Competitive courses',
        duration: 3000
      });
      return;
    }

    // Check if subjects are loaded
    if (formFilteredSubjects.length === 0) {
      addNotification({
        type: 'error',
        message: 'Please wait for subjects to load or check your selections',
        duration: 3000
      });
      return;
    }
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        message: 'Please fix the form errors',
        duration: 3000
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare videos array
      const videos = [];
      if (formData.youtubeLinks && formData.youtubeLinks.length > 0) {
        formData.youtubeLinks.forEach((link, index) => {
          if (link && link.trim()) {
            videos.push({
              youtubeLink: link.trim(),
              videoTitle: formData.youtubeTitles?.[index] || `Video ${index + 1}`,
              displayOrder: index + 1
            });
          }
        });
      }

      // Prepare documents array
      const documents = [];
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        formData.uploadedFiles.forEach((fileName, index) => {
          if (fileName && fileName.trim()) {
            documents.push({
              fileName: fileName.trim(),
              documentTitle: formData.uploadedFileTitles?.[index] || fileName.replace(/\.[^/.]+$/, ""),
              displayOrder: index + 1
            });
          }
        });
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        moduleId: parseInt(formData.moduleId),
        displayOrder: parseInt(formData.displayOrder) || 0,
        isActive: formData.isActive,
        videos: videos,
        documents: documents
      };

      // Include file objects for multipart upload
      if (uploadedFileObjects && Object.keys(uploadedFileObjects).length > 0) {
        submitData.uploadedFileObjects = uploadedFileObjects;
      }
      
      if (editingId) {
        await executeApiCall(updateChapter, token, editingId, submitData);
        addNotification({
          type: 'success',
          message: 'Chapter updated successfully',
          duration: 3000
        });
      } else {
        await executeApiCall(createChapter, token, submitData);
        addNotification({
          type: 'success',
          message: 'Chapter created successfully',
          duration: 3000
        });
      }
      
      resetForm();
      
      setShowForm(false);
      setEditingId(null);
      
      // Refresh chapters using new filter system
      // Old module-based refresh removed

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
  }, [formData, editingId, validateForm, executeApiCall, addNotification, resetForm, token]);

  const handleEdit = async (chapter) => {
    console.log('Editing chapter:', chapter);
    
    // Extract videos data
    const youtubeLinks = [];
    const youtubeTitles = [];
    if (chapter.videos && Array.isArray(chapter.videos)) {
      chapter.videos.forEach(video => {
        youtubeLinks.push(video.youtubeLink || '');
        youtubeTitles.push(video.videoTitle || '');
      });
    }

    // Extract documents data
    const uploadedFiles = [];
    const uploadedFileTitles = [];
    if (chapter.documents && Array.isArray(chapter.documents)) {
      chapter.documents.forEach(doc => {
        uploadedFiles.push(doc.fileName || '');
        uploadedFileTitles.push(doc.documentTitle || '');
      });
    }

    // Extract values from chapter data with proper fallbacks
    const courseTypeId = chapter.topic?.subject?.courseTypeId || chapter.module?.topic?.subject?.courseTypeId || '';
    const courseId = chapter.topic?.subject?.courseId || chapter.module?.topic?.subject?.courseId || '';
    const classId = chapter.topic?.subject?.classId || chapter.module?.topic?.subject?.classId || '';
    const examId = chapter.topic?.subject?.examId || chapter.module?.topic?.subject?.examId || '';
    const subjectId = chapter.topic?.subject?.subjectId || chapter.module?.topic?.subject?.id || '';
    const topicId = chapter.topic?.id || chapter.module?.topic?.id || '';
    const moduleId = chapter.moduleId || '';

    // Set editing ID first
    setEditingId(chapter.id);
    setShowForm(true);
    
    // Store the original values to restore after dropdowns are populated
    const originalValues = {
      name: chapter.name || '',
      description: chapter.description || '',
      displayOrder: chapter.displayOrder || '',
      isActive: chapter.isActive !== undefined ? chapter.isActive : true,
      courseType: { id: courseTypeId },
      course: { id: courseId },
      class: { id: classId },
      exam: { id: examId },
      subjectId: subjectId,
      topicId: topicId,
      moduleId: moduleId,
      youtubeLinks: youtubeLinks,
      youtubeTitles: youtubeTitles,
      uploadedFiles: uploadedFiles,
      uploadedFileTitles: uploadedFileTitles
    };
    
    // Initially set form data with available values
    setFormData(originalValues);
    
    // Trigger course type change to populate related dropdowns
    if (courseTypeId) {
      // Create a modified version that doesn't clear the form data
      const handleCourseTypeChangeForEdit = async (courseTypeId) => {
        setFormData(prev => ({
          ...prev,
          courseType: { id: courseTypeId },
          course: { id: '' },
          class: { id: '' },
          exam: { id: '' },
          subjectId: '',
          topicId: '',
          moduleId: ''
          // Don't clear name, description, displayOrder, isActive, youtubeLinks, etc.
        }));
        setFormFilteredCourses([]);
        setFormFilteredClasses([]);
        setFormFilteredExams([]);
        setFormFilteredSubjects([]);
        setFormFilteredTopics([]);
        setFormFilteredModules([]);
        
        if (courseTypeId) {
          try {
            setLoadingStates(prev => ({ ...prev, courses: true }));
            
            // Fetch courses for this course type
            const coursesData = await getCourses(token, courseTypeId, 0, 100, 'createdAt', 'desc');
            
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
              console.warn('Unexpected courses data format (handleCourseTypeChangeForEdit):', coursesData);
              coursesArray = [];
            }
            
            // Keep only active courses
            let normalizedCourses = coursesArray.filter(c => !!c.isActive);
            normalizedCourses.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));

            setFormFilteredCourses(normalizedCourses);
            
          } catch (error) {
            console.error('Error fetching courses:', error);
            addNotification({
              type: 'error',
              message: `Failed to fetch courses: ${error.message}`,
              duration: 5000
            });
            setFormFilteredCourses([]);
          } finally {
            setLoadingStates(prev => ({ ...prev, courses: false }));
          }
        }
      };
      
      await handleCourseTypeChangeForEdit(courseTypeId);
      
      // Restore the original values after course type change
      setFormData(prev => ({
        ...prev,
        ...originalValues
      }));
      
      // Trigger course change to populate class/exam/subject/topic/module dropdowns
      if (courseId) {
        // Create a modified version of handleCourseChange that doesn't clear the form
        const handleCourseChangeForEdit = async (courseId) => {
          setFormData(prev => ({
            ...prev,
            course: { id: courseId },
            class: { id: '' },
            exam: { id: '' },
            subjectId: '',
            topicId: '',
            moduleId: ''
            // Don't clear name, description, displayOrder, isActive, youtubeLinks, etc.
          }));
          setFormFilteredClasses([]);
          setFormFilteredExams([]);
          setFormFilteredSubjects([]);
          setFormFilteredTopics([]);
          setFormFilteredModules([]);
          
          if (courseId) {
            try {
              setLoadingStates(prev => ({ ...prev, classes: true, exams: true, subjects: true }));
              
              // Fetch classes, exams, and subjects
              const [classesData, examsData, subjectsData] = await Promise.all([
                getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc'),
                getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc'),
                fetchSubjectLinkages(courseTypeId, courseId, null, null)
              ]);
              
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
                console.warn('Unexpected classes data format (handleCourseChangeForEdit):', classesData);
                classesArray = [];
              }
              
              let normalizedClasses = classesArray.filter(cl => !!cl.isActive);
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
                console.warn('Unexpected exams data format (handleCourseChangeForEdit):', examsData);
                examsArray = [];
              }
              
              let normalizedExams = examsArray.filter(ex => !!ex.isActive);
              normalizedExams.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));

              // Handle subjects data
              let subjectsArray = [];
              if (Array.isArray(subjectsData)) {
                subjectsArray = subjectsData;
              } else if (subjectsData && Array.isArray(subjectsData.content)) {
                subjectsArray = subjectsData.content;
              } else if (subjectsData && Array.isArray(subjectsData.data)) {
                subjectsArray = subjectsData.data;
              } else {
                console.warn('Unexpected subjects data format (handleCourseChangeForEdit):', subjectsData);
                subjectsArray = [];
              }
              
              setFormFilteredClasses(normalizedClasses);
              setFormFilteredExams(normalizedExams);
              setFormFilteredSubjects(subjectsArray);
              
              // Fetch topics for the selected subject
              if (subjectId) {
                try {
                  setLoadingStates(prev => ({ ...prev, topics: true }));
                  const topicsData = await getTopicsByLinkage(token, courseTypeId, subjectId);
                  let topicsArray = [];
                  if (Array.isArray(topicsData)) {
                    topicsArray = topicsData;
                  } else if (topicsData && Array.isArray(topicsData.content)) {
                    topicsArray = topicsData.content;
                  } else if (topicsData && Array.isArray(topicsData.data)) {
                    topicsArray = topicsData.data;
                  } else {
                    console.warn('Unexpected topics data format (handleCourseChangeForEdit):', topicsData);
                    topicsArray = [];
                  }
                  setFormFilteredTopics(topicsArray);
                  
                  // Fetch modules for the selected topic
                  if (topicId) {
                    try {
                      setLoadingStates(prev => ({ ...prev, modules: true }));
                      const modulesData = await getModulesByTopic(token, topicId, true);
                      let modulesArray = [];
                      if (Array.isArray(modulesData)) {
                        modulesArray = modulesData;
                      } else if (modulesData && Array.isArray(modulesData.content)) {
                        modulesArray = modulesData.content;
                      } else if (modulesData && Array.isArray(modulesData.data)) {
                        modulesArray = modulesData.data;
                      } else {
                        console.warn('Unexpected modules data format (handleCourseChangeForEdit):', modulesData);
                        modulesArray = [];
                      }
                      setFormFilteredModules(modulesArray);
                    } catch (error) {
                      console.error('Error fetching modules:', error);
                      setFormFilteredModules([]);
                    } finally {
                      setLoadingStates(prev => ({ ...prev, modules: false }));
                    }
                  }
                } catch (error) {
                  console.error('Error fetching topics:', error);
                  setFormFilteredTopics([]);
                  setFormFilteredModules([]);
                } finally {
                  setLoadingStates(prev => ({ ...prev, topics: false }));
                }
              }
              
            } catch (error) {
              console.error('Error in handleCourseChangeForEdit:', error);
              addNotification({
                type: 'error',
                message: 'Failed to fetch classes, exams, and subjects',
                duration: 5000
              });
              setFormFilteredClasses([]);
              setFormFilteredExams([]);
              setFormFilteredSubjects([]);
              setFormFilteredTopics([]);
              setFormFilteredModules([]);
            } finally {
              setLoadingStates(prev => ({ ...prev, classes: false, exams: false, subjects: false }));
            }
          }
        };
        
        await handleCourseChangeForEdit(courseId);
        
        // Restore the original values after course change
        setFormData(prev => ({
          ...prev,
          ...originalValues
        }));
      }
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) {
      return;
    }
    
    try {
      setLoading(true);
      await executeApiCall(deleteChapter, token, id);
      addNotification({
        type: 'success',
        message: 'Chapter deleted successfully',
        duration: 3000
      });
      
      // Refresh chapters using new filter system
      // Old module-based refresh removed

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
  }, [executeApiCall, addNotification, token]);


  // YouTube link management
  const addYoutubeLink = () => {
    const url = youtubeLinkInput.trim();
    if (!url) {
      setYoutubeLinkError('Please enter a YouTube URL');
      return;
    }
    
    if (!isValidYouTubeUrl(url)) {
      setYoutubeLinkError('Please enter a valid YouTube URL');
      return;
    }
    
    const normalizedUrl = normalizeYouTubeUrl(url);
    const currentLinks = formData.youtubeLinks || [];
    
    // Check for duplicates
    if (currentLinks.some(link => normalizeYouTubeUrl(link) === normalizedUrl)) {
      setYoutubeLinkError('This video is already added');
      return;
    }
    
    handleInputChange('youtubeLinks', [...currentLinks, normalizedUrl]);
    setYoutubeLinkInput('');
    setYoutubeLinkError('');
  };

  const removeYoutubeLink = (index) => {
    const currentLinks = formData.youtubeLinks || [];
    handleInputChange('youtubeLinks', currentLinks.filter((_, i) => i !== index));
  };

  const editYoutubeLink = (index, currentUrl) => {
    const newUrl = prompt('Edit YouTube URL:', currentUrl);
    if (newUrl && newUrl.trim()) {
      if (!isValidYouTubeUrl(newUrl)) {
        addNotification({
          type: 'error',
          message: 'Please enter a valid YouTube URL',
          duration: 3000
        });
        return;
      }
      
      const normalizedUrl = normalizeYouTubeUrl(newUrl);
      const currentLinks = [...(formData.youtubeLinks || [])];
      currentLinks[index] = normalizedUrl;
      handleInputChange('youtubeLinks', currentLinks);
    }
  };

  const openVideoPreview = (embedUrl, watchUrl) => {
    setSelectedVideoData({ embedUrl, watchUrl });
    setVideoPreviewModal(true);
  };

  const closeVideoPreview = () => {
    setVideoPreviewModal(false);
    setSelectedVideoData(null);
  };

  // Drag and drop functionality for video reordering
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Remove drag-over class from all elements
    document.querySelectorAll('.video-preview-card').forEach(card => {
      card.classList.remove('drag-over');
    });
  };

  const handleDrop = (draggedIndex, dropIndex) => {
    const currentLinks = [...(formData.youtubeLinks || [])];
    const draggedItem = currentLinks[draggedIndex];
    
    // Remove dragged item
    currentLinks.splice(draggedIndex, 1);
    
    // Insert at new position
    currentLinks.splice(dropIndex, 0, draggedItem);
    
    handleInputChange('youtubeLinks', currentLinks);
    handleDragEnd();
  };

  const handleYoutubeLinkInputChange = (e) => {
    const value = e.target.value;
    setYoutubeLinkInput(value);
    
    // Clear error when user starts typing
    if (youtubeLinkError) {
      setYoutubeLinkError('');
    }
    
    // Real-time validation
    if (value.trim() && !isValidYouTubeUrl(value)) {
      setYoutubeLinkError('Invalid YouTube URL format');
    } else {
      setYoutubeLinkError('');
    }
  };

  const handleYoutubeLinkInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addYoutubeLink();
    }
  };

  // File upload management
  const addFileInput = () => {
    setFileInputs(prev => [...prev, { id: Date.now(), file: null }]);
  };

  const handleFileChange = (inputId, file) => {
    if (file) {
      const validation = validateFileType(file.name, ['pdf']);
      
      if (!validation.isValid) {
        setFileInputError(validation.error);
        return;
      }
      
      setFileInputError('');
      
      // Add file to the uploadedFiles array
      const currentFiles = formData.uploadedFiles || [];
      const newFiles = [...currentFiles, file.name];
      handleInputChange('uploadedFiles', newFiles);
    }
    
    setFileInputs(prev => prev.map(input => 
      input.id === inputId ? { ...input, file } : input
    ));
  };

  const removeFileInput = (inputId) => {
    setFileInputs(prev => prev.filter(input => input.id !== inputId));
  };

  const removeUploadedFile = (index) => {
    const currentFiles = formData.uploadedFiles || [];
    const fileNameToRemove = currentFiles[index];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    handleInputChange('uploadedFiles', newFiles);
    
    // Remove the file object as well
    setUploadedFileObjects(prev => {
      const newObjects = { ...prev };
      delete newObjects[fileNameToRemove];
      return newObjects;
    });
  };


  const openDocumentPreview = (fileName, filePath = null) => {
    // Get the actual file object if available
    const fileObject = uploadedFileObjects[fileName];
    setSelectedDocumentData({ fileName, filePath, fileObject });
    setDocumentPreviewModal(true);
  };

  const closeDocumentPreview = () => {
    setDocumentPreviewModal(false);
    setSelectedDocumentData(null);
  };

  // Old module-based chapter loading removed - now using new filter system

  // Chapter list handlers
  const handleEditChapter = (chapter) => {
    // Extract videos data
    const youtubeLinks = [];
    const youtubeTitles = [];
    if (chapter.videos && Array.isArray(chapter.videos)) {
      chapter.videos.forEach(video => {
        youtubeLinks.push(video.youtubeLink || '');
        youtubeTitles.push(video.videoTitle || '');
      });
    }

    // Extract documents data
    const uploadedFiles = [];
    const uploadedFileTitles = [];
    if (chapter.documents && Array.isArray(chapter.documents)) {
      chapter.documents.forEach(doc => {
        uploadedFiles.push(doc.fileName || '');
        uploadedFileTitles.push(doc.documentTitle || '');
      });
    }

    setFormData({
      name: chapter.name || '',
      description: chapter.description || '',
      displayOrder: chapter.displayOrder || '',
      isActive: chapter.isActive !== undefined ? chapter.isActive : true,
      courseTypeId: chapter.module?.topic?.subject?.courseTypeId || '',
      courseId: chapter.module?.topic?.subject?.courseId || '',
      classId: chapter.module?.topic?.subject?.classId || '',
      examId: chapter.module?.topic?.subject?.examId || '',
      subjectId: chapter.module?.topic?.subject?.id || '',
      topicId: chapter.module?.topic?.id || '',
      moduleId: chapter.module?.id || '',
      youtubeLinks: youtubeLinks,
      youtubeTitles: youtubeTitles,
      uploadedFiles: uploadedFiles,
      uploadedFileTitles: uploadedFileTitles
    });
    setEditingId(chapter.id);
    setShowForm(true);
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) {
      return;
    }

    try {
      const response = await executeApiCall(
        () => deleteChapter(token, chapterId),
        'Failed to delete chapter'
      );
      
      if (response.success) {
        addNotification({
          type: 'success',
          message: 'Chapter deleted successfully',
          duration: 3000
        });
        // Refresh chapters using new filter system
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handlePreviewVideoFromList = (videoData) => {
    setSelectedVideoData(videoData);
    setVideoPreviewModal(true);
  };

  const handlePreviewDocumentFromList = (documentData) => {
    setSelectedDocumentData(documentData);
    setDocumentPreviewModal(true);
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Chapter Management</h2>
          <p>Create and manage chapters with multimedia content</p>
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
            Add Chapter
          </button>
        </div>
      </div>

      {/* Old filter section removed - using FilterPanel instead */}

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFiltersDirect}
        onClearFilters={clearFilters}
        loading={filterLoading}
        filterConfig={filterConfig}
        masterData={{ courseTypes, courses: filteredCourses, classes: filteredClasses, exams: filteredExams, subjects: subjectLinkages, topics, modules }}
        hasChanges={hasChanges}
      />

      {/* Form Section - Will be added in next part */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>
              {editingId ? 'Edit Chapter (Read-Only)' : 'Add New Chapter'}
              {editingId && (
                <span className="badge badge-warning ml-2">Review Mode</span>
              )}
            </h3>
            <button 
              className="btn btn-outline btn-sm"
              onClick={resetForm}
              disabled={loading}
            >
              ✕ Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Chapter Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`form-input ${errors.name && touched.name ? 'error' : ''}`}
                  required
                  placeholder="Enter chapter name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="displayOrder">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', e.target.value)}
                  onBlur={() => handleBlur('displayOrder')}
                  className={`form-input ${errors.displayOrder && touched.displayOrder ? 'error' : ''}`}
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
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  className={`form-input ${errors.description && touched.description ? 'error' : ''}`}
                  rows={3}
                  placeholder="Describe the chapter content and learning objectives"
                />
              </div>
            </div>

            {/* Hierarchical Selection - Same as Module Management */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="courseTypeId">Course Type *</label>
                <select
                  id="courseTypeId"
                  name="courseTypeId"
                  value={formData.courseTypeId}
                  onChange={(e) => handleInputChange('courseTypeId', e.target.value)}
                  onBlur={() => handleBlur('courseTypeId')}
                  className={`form-input ${errors.courseTypeId && touched.courseTypeId ? 'error' : ''}`}
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

              <div className="form-group">
                <label htmlFor="courseId">Course *</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  onBlur={() => handleBlur('courseId')}
                  className={`form-input ${errors.courseId && touched.courseId ? 'error' : ''}`}
                  required
                  disabled={!formData.courseTypeId}
                >
                  <option value="">Select Course</option>
                  {formFilteredCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class/Exam Selection */}
            {(isAcademicCourseType(formData.courseTypeId) || isCompetitiveCourseType(formData.courseTypeId)) && (
              <div className="form-row">
                {isAcademicCourseType(formData.courseTypeId) && (
                  <div className="form-group">
                    <label htmlFor="classId">Class *</label>
                    <select
                      id="classId"
                      name="classId"
                      value={formData.classId || ''}
                      onChange={(e) => handleInputChange('classId', e.target.value)}
                      onBlur={() => handleBlur('classId')}
                      className={`form-input ${errors.classId && touched.classId ? 'error' : ''}`}
                      required
                      disabled={!formData.courseId}
                    >
                      <option value="">Select Class</option>
                      {formFilteredClasses.map(classItem => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isCompetitiveCourseType(formData.courseTypeId) && (
                  <div className="form-group">
                    <label htmlFor="examId">Exam *</label>
                    <select
                      id="examId"
                      name="examId"
                      value={formData.examId || ''}
                      onChange={(e) => handleInputChange('examId', e.target.value)}
                      onBlur={() => handleBlur('examId')}
                      className={`form-input ${errors.examId && touched.examId ? 'error' : ''}`}
                      required
                      disabled={!formData.courseId}
                    >
                      <option value="">Select Exam</option>
                      {formFilteredExams.map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {exam.name}
                        </option>
                      ))}
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
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  onBlur={() => handleBlur('subjectId')}
                  className={`form-input ${errors.subjectId && touched.subjectId ? 'error' : ''}`}
                  required
                  disabled={
                    !formData.courseId || 
                    (isAcademicCourseType(formData.courseTypeId) && !formData.classId) ||
                    (isCompetitiveCourseType(formData.courseTypeId) && !formData.examId)
                  }
                >
                  <option value="">Select Subject</option>
                  {formFilteredSubjects.map(subject => (
                    <option key={subject.id} value={subject.linkageId || subject.id}>
                      {getSubjectDisplayText(subject, formData.courseTypeId)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="topicId">Topic *</label>
                <select
                  id="topicId"
                  name="topicId"
                  value={formData.topicId}
                  onChange={(e) => handleInputChange('topicId', e.target.value)}
                  onBlur={() => handleBlur('topicId')}
                  className={`form-input ${errors.topicId && touched.topicId ? 'error' : ''}`}
                  required
                  disabled={
                    !formData.subjectId || 
                    (isAcademicCourseType(formData.courseTypeId) && !formData.classId) ||
                    (isCompetitiveCourseType(formData.courseTypeId) && !formData.examId)
                  }
                >
                  <option value="">Select Topic</option>
                  {formFilteredTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Module Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="moduleId">Module *</label>
                <select
                  id="moduleId"
                  name="moduleId"
                  value={formData.moduleId}
                  onChange={(e) => handleInputChange('moduleId', e.target.value)}
                  onBlur={() => handleBlur('moduleId')}
                  className={`form-input ${errors.moduleId && touched.moduleId ? 'error' : ''}`}
                  required
                  disabled={
                    !formData.topicId || 
                    (isAcademicCourseType(formData.courseTypeId) && !formData.classId) ||
                    (isCompetitiveCourseType(formData.courseTypeId) && !formData.examId)
                  }
                >
                  <option value="">Select Module</option>
                  {formFilteredModules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
                {formData.topicId && formFilteredModules.length === 0 && (
                  <small className="form-help">No modules available for this topic</small>
                )}
              </div>
            </div>

            {/* Simplified YouTube Links Section */}
            <div className="form-section youtube-section">
              <h4>📺 YouTube Video Links</h4>
              
              {/* Simple Add Link Input */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="youtube-link">Add YouTube Link</label>
                  <div className="simple-input-group">
                    <input
                      type="url"
                      id="youtube-link"
                      value={youtubeLinkInput}
                      onChange={handleYoutubeLinkInputChange}
                      onKeyPress={handleYoutubeLinkInputKeyPress}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={`form-input ${youtubeLinkError ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={addYoutubeLink}
                      className="btn btn-outline btn-sm"
                      disabled={!youtubeLinkInput.trim() || !!youtubeLinkError}
                    >
                      Add
                    </button>
                  </div>
                  {youtubeLinkError && (
                    <small className="form-error">{youtubeLinkError}</small>
                  )}
                </div>
              </div>
              
              {/* Simple Video List */}
              {formData.youtubeLinks && formData.youtubeLinks.length > 0 && (
                <div className="simple-video-list">
                  <h5>Added Videos ({formData.youtubeLinks.length})</h5>
                  {formData.youtubeLinks.map((link, index) => (
                    <div key={`${link}-${index}`} className="simple-video-item">
                      <div className="video-thumbnail-small" onClick={() => openVideoPreview(getYouTubeEmbedUrl(getYouTubeVideoId(link)), link)}>
                        <img 
                          src={getYouTubeThumbnail(getYouTubeVideoId(link), 'default')} 
                          alt={`Video ${index + 1}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="play-overlay-small">
                          <span>▶️</span>
                        </div>
                      </div>
                      <div className="video-info-small">
                        <div className="video-url-small" title={link}>{link}</div>
                        <div className="video-actions-small">
                          <button 
                            type="button"
                            onClick={() => openVideoPreview(getYouTubeEmbedUrl(getYouTubeVideoId(link)), link)}
                            className="btn btn-outline btn-xs"
                            title="Preview video"
                          >
                            Preview
                          </button>
                          <button 
                            type="button"
                            onClick={() => editYoutubeLink(index, link)}
                            className="btn btn-outline btn-xs"
                            title="Edit URL"
                          >
                            Edit
                          </button>
                          <button 
                            type="button"
                            onClick={() => removeYoutubeLink(index)}
                            className="btn btn-danger btn-xs"
                            title="Remove video"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Document Upload Section */}
            <div className="form-section document-section">
              <h4>📕 PDF Documents</h4>
              
              {/* Clean PDF Upload Interface */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Upload PDF Document</label>
                  <div className="pdf-upload-container">
                    <input
                      type="file"
                      id="pdf-upload"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const validation = validateFileType(file.name, ['pdf']);
                          
                          if (!validation.isValid) {
                            setFileInputError(validation.error);
                            return;
                          }
                          
                          setFileInputError('');
                          
                          // Add file to the uploadedFiles array
                          const currentFiles = formData.uploadedFiles || [];
                          const newFiles = [...currentFiles, file.name];
                          handleInputChange('uploadedFiles', newFiles);
                          
                          // Store the actual file object for preview
                          setUploadedFileObjects(prev => ({
                            ...prev,
                            [file.name]: file
                          }));
                          
                          // Reset the input
                          e.target.value = '';
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('pdf-upload').click()}
                      className="btn btn-primary pdf-upload-btn"
                      disabled={loading}
                    >
                      Choose PDF File
                    </button>
                    <span className="upload-hint">or drag and drop PDF here</span>
                  </div>
                  {fileInputError && (
                    <small className="form-error">{fileInputError}</small>
                  )}
                  <small className="form-help">
                    Only PDF files are supported. Maximum file size: 10MB
                  </small>
                </div>
              </div>
              
              {/* PDF Documents List */}
              {formData.uploadedFiles && formData.uploadedFiles.length > 0 && (
                <div className="simple-document-list">
                  <h5>📕 PDF Documents ({formData.uploadedFiles.length})</h5>
                  {formData.uploadedFiles.map((fileName, index) => (
                    <DocumentPreviewCard
                      key={`${fileName}-${index}`}
                      fileName={fileName}
                      index={index}
                      onRemove={removeUploadedFile}
                      onPreview={openDocumentPreview}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    onBlur={() => handleBlur('isActive')}
                    className={`form-input ${errors.isActive && touched.isActive ? 'error' : ''}`}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || editingId}
                title={editingId ? 'Edit functionality temporarily disabled - pending team decision' : ''}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Chapter (Disabled)' : 'Create Chapter')}
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
              {editingId && (
                <div className="form-warning">
                  <small className="text-warning">
                    ⚠️ Edit functionality is temporarily disabled. All values are populated for review, but changes cannot be saved until the team decides on the proper strategy.
                  </small>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Data Section - Card-based layout */}
      <div className="data-section">
        <div className="data-header">
          {(() => {
            const display = combinedChapters.length > 0 ? combinedChapters : chapters;
            return (<h3>Chapters ({display.length})</h3>);
          })()}
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                fetchChapters();
              }}
              disabled={loading}
            >
              Refresh
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={async () => {
                try {
                  setLoading(true);
                  // Old filter variables removed - using new filter system
                  let list = [];
                  if (filters.moduleId || filters.topicId || filters.subjectId || filters.classId || filters.examId || filters.courseId || filters.courseTypeId) {
                    // If any filter is present, try combined-filter (service has internal fallbacks)
                    const data = await getChaptersCombinedFilter(token, filters);
                    list = Array.isArray(data) ? data : (data?.content || data?.data || []);
                  } else {
                    // No ids: avoid combined-filter; load via modules fallback
                    const modulesData = await getModules(token, filters.active, null, null);
                    const modulesList = Array.isArray(modulesData) ? modulesData : (modulesData?.content || modulesData?.data || []);
                    for (const mod of modulesList) {
                      try {
                        const chData = await getChaptersByModule(token, mod.id, filters.active);
                        const chList = Array.isArray(chData) ? chData : (chData?.content || chData?.data || []);
                        list.push(...chList);
                      } catch (_) {}
                    }
                  }
                  setCombinedChapters(list || []);
                  addNotification({ type: 'success', message: `Loaded ${list.length} chapters for filters`, duration: 2500 });
                } catch (e) {
                  console.error('Failed to load chapters (combined-filter):', e);
                  addNotification({ type: 'error', message: 'Failed to load chapters for filters', duration: 4000 });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              Filter
            </button>
          </div>
        </div>

        {(loading || chaptersLoading) ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading chapters...</p>
          </div>
        ) : (combinedChapters.length === 0 && chapters.length === 0) ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h4>No Chapters Found</h4>
            <p>No chapters match your current filters. Try adjusting your filter criteria or create a new chapter.</p>
          </div>
        ) : (
          <div className="chapters-container">
            {(() => {
              const displayChapters = combinedChapters.length > 0 ? combinedChapters : chapters;
              
              
              // Group chapters by course type
              const academicChapters = displayChapters.filter(chapter => {
                const courseTypeId = chapter.courseTypeId || chapter.module?.topic?.subject?.course?.courseType?.id;
                return courseTypeId === 1 || courseTypeId === '1';
              });

              const competitiveChapters = displayChapters.filter(chapter => {
                const courseTypeId = chapter.courseTypeId || chapter.module?.topic?.subject?.course?.courseType?.id;
                return courseTypeId === 2 || courseTypeId === '2';
              });

              const professionalChapters = displayChapters.filter(chapter => {
                const courseTypeId = chapter.courseTypeId || chapter.module?.topic?.subject?.course?.courseType?.id;
                return courseTypeId === 3 || courseTypeId === '3';
              });
              

              const renderChapterCard = (chapter) => (
                <ChapterListCard
                  key={chapter.id}
                  chapter={chapter}
                  onEdit={handleEditChapter}
                  onDelete={handleDeleteChapter}
                  onPreviewVideo={handlePreviewVideoFromList}
                  onPreviewDocument={handlePreviewDocumentFromList}
                />
              );

              return (
                <Fragment>
                  {/* Academic Chapters Section */}
                  {academicChapters.length > 0 && (
                    <div className="chapter-section">
                      <div className="section-header">
                        <h3>Academic Course Chapters</h3>
                        <span className="section-count">({academicChapters.length} chapters)</span>
                      </div>
                      <div className="data-grid">
                        {academicChapters.map(renderChapterCard)}
                      </div>
                    </div>
                  )}

                  {/* Competitive Chapters Section */}
                  {competitiveChapters.length > 0 && (
                    <div className="chapter-section">
                      <div className="section-header">
                        <h3>Competitive Course Chapters</h3>
                        <span className="section-count">({competitiveChapters.length} chapters)</span>
                      </div>
                      <div className="data-grid">
                        {competitiveChapters.map(renderChapterCard)}
                      </div>
                    </div>
                  )}

                  {/* Professional Chapters Section */}
                  {professionalChapters.length > 0 && (
                    <div className="chapter-section">
                      <div className="section-header">
                        <h3>Professional Course Chapters</h3>
                        <span className="section-count">({professionalChapters.length} chapters)</span>
                      </div>
                      <div className="data-grid">
                        {professionalChapters.map(renderChapterCard)}
                      </div>
                    </div>
                  )}

                  {/* Show empty state if all sections are empty */}
                  {academicChapters.length === 0 && competitiveChapters.length === 0 && professionalChapters.length === 0 && displayChapters.length > 0 && (
                    <div className="chapter-section">
                      <div className="section-header">
                        <h3>All Chapters</h3>
                        <span className="section-count">({displayChapters.length} chapters)</span>
                      </div>
                      <div className="data-grid">
                        {displayChapters.map(renderChapterCard)}
                      </div>
                    </div>
                  )}
                  
                  {/* Show empty state if no chapters at all */}
                  {displayChapters.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">📚</div>
                      <h4>No Chapters Found</h4>
                      <p>No chapters match your current filters. Try adjusting your filter criteria or create a new chapter.</p>
                    </div>
                  )}
                </Fragment>
              );
            })()}
          </div>
        )}
      </div>
      
      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={videoPreviewModal}
        onClose={closeVideoPreview}
        embedUrl={selectedVideoData?.embedUrl}
        watchUrl={selectedVideoData?.watchUrl}
        videoTitle="Video Preview"
      />
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={documentPreviewModal}
        onClose={closeDocumentPreview}
        fileName={selectedDocumentData?.fileName}
        filePath={selectedDocumentData?.filePath}
        fileObject={selectedDocumentData?.fileObject}
        fileType="Document Preview"
      />
    </div>
  );
};

export default ChapterManagement;