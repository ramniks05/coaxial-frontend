import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCourseTypesCached } from '../services/globalApiCache';
import {
    // Standardized endpoints for consistency
    getAllSubjectLinkages,
    getChaptersCombinedFilter,
    getClassesByCourse,
    getCourses,
    getExamsByCourse,
    getMasterSubjectsByCourseType,
    getModulesCombinedFilter,
    getTopicsCombinedFilter
} from '../services/masterDataService';

// Global cache with TTL (Time To Live) - Redis-like behavior
const globalCache = {
  courseTypes: { data: null, timestamp: 0, ttl: 300000 }, // 5 minutes
  courses: new Map(), // key: courseTypeId, value: {data, timestamp, ttl}
  classes: new Map(), // key: courseTypeId|courseId, value: {data, timestamp, ttl}
  exams: new Map(), // key: courseTypeId|courseId, value: {data, timestamp, ttl}
  masterSubjects: new Map(), // key: courseTypeId, value: {data, timestamp, ttl}
  subjectLinkages: new Map(), // key: courseTypeId|courseId|classId|examId, value: {data, timestamp, ttl}
  topics: new Map(), // key: courseTypeId|courseId|classId|examId|subjectId, value: {data, timestamp, ttl}
  modules: new Map(), // key: courseTypeId|courseId|classId|examId|subjectId|topicId, value: {data, timestamp, ttl}
  chapters: new Map(), // key: courseTypeId|courseId|classId|examId|subjectId|topicId|moduleId, value: {data, timestamp, ttl}
  
  // Loading states
  loading: {
    courseTypes: false,
    courses: false,
    classes: false,
    exams: false,
    masterSubjects: false,
    subjectLinkages: false,
    topics: false,
    modules: false,
    chapters: false
  },
  
  // Abort controllers for request cancellation
  abortControllers: {
    courseTypes: null,
    courses: null,
    classes: null,
    exams: null,
    masterSubjects: null,
    subjectLinkages: null,
    topics: null,
    modules: null,
    chapters: null
  },
  
  // Request deduplication
  pendingRequests: new Map()
};

// Helper functions
const createCacheKey = (...args) => args.filter(Boolean).join('|');
const isExpired = (timestamp, ttl) => Date.now() - timestamp > ttl;
const getCachedData = (type, key, ttl = 300000) => {
  if (type === 'courseTypes') {
    return !isExpired(globalCache.courseTypes.timestamp, ttl) ? globalCache.courseTypes.data : null;
  }
  const cache = globalCache[type];
  if (!cache || !cache.has(key)) return null;
  const item = cache.get(key);
  return !isExpired(item.timestamp, ttl) ? item.data : null;
};
const setCachedData = (type, key, data, ttl = 300000) => {
  if (type === 'courseTypes') {
    globalCache.courseTypes = { data, timestamp: Date.now(), ttl };
    return;
  }
  const cache = globalCache[type];
  if (!cache) return;
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

/**
 * Unified Master Data Hook
 * Single source of truth for all master data management
 * 
 * Features:
 * - Global caching with TTL (Redis-like)
 * - Request deduplication (prevents duplicate calls)
 * - Proper debouncing (300ms)
 * - Abort controller support
 * - Consistent API endpoints
 * - Handles both Master Subjects and Subject Linkages
 * - Performance optimized
 */
export const useUnifiedMasterData = () => {
  const { token, addNotification } = useApp();
  
  // Local state for each component instance
  const [courseTypes, setCourseTypes] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [subjectLinkages, setSubjectLinkages] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    courseTypes: false,
    courses: false,
    classes: false,
    exams: false,
    masterSubjects: false,
    subjectLinkages: false,
    topics: false,
    modules: false,
    chapters: false
  });
  
  // Filter states
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Refs for debouncing and preventing duplicate calls
  const debounceRefs = useRef({});
  const isInitialMountRef = useRef(true);
  
  // Helper functions for course type logic
  const isAcademicCourseType = useCallback((courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  }, [courseTypes]);
  
  const isCompetitiveCourseType = useCallback((courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('competitive');
  }, [courseTypes]);
  
  const isProfessionalCourseType = useCallback((courseTypeId) => {
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('professional');
  }, [courseTypes]);
  
  // Generic fetch function with caching and deduplication
  const fetchWithCache = useCallback(async (
    type,
    key,
    fetchFunction,
    setStateFunction,
    loadingKey,
    ttl = 300000
  ) => {
    if (!token) return null;
    
    // Check cache first
    const cached = getCachedData(type, key, ttl);
    if (cached) {
      setStateFunction(cached);
      return cached;
    }
    
    // Check if request is already pending (deduplication)
    const requestKey = `${type}|${key}`;
    if (globalCache.pendingRequests.has(requestKey)) {
      try {
        const result = await globalCache.pendingRequests.get(requestKey);
        setStateFunction(result);
        return result;
      } catch (error) {
        console.warn(`Pending request failed for ${requestKey}:`, error);
      }
    }
    
    // Abort previous request
    if (globalCache.abortControllers[type]) {
      globalCache.abortControllers[type].abort();
    }
    globalCache.abortControllers[type] = new AbortController();
    
    // Set loading state
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    globalCache.loading[loadingKey] = true;
    
    try {
      // Create promise for deduplication
      const fetchPromise = fetchFunction(globalCache.abortControllers[type].signal);
      globalCache.pendingRequests.set(requestKey, fetchPromise);
      
      const result = await fetchPromise;
      
      // Cache the result
      setCachedData(type, key, result, ttl);
      setStateFunction(result);
      
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Error fetching ${type}:`, error);
        addNotification({
          type: 'error',
          message: `Failed to fetch ${type}`,
          duration: 5000
        });
      }
      setStateFunction([]);
      return [];
    } finally {
      // Clean up
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      globalCache.loading[loadingKey] = false;
      globalCache.pendingRequests.delete(requestKey);
    }
  }, [token, addNotification]);
  
  // Specific fetch functions
  const fetchCourseTypes = useCallback(async () => {
    const key = 'all';
    return fetchWithCache(
      'courseTypes',
      key,
      async (signal) => {
        const data = await getCourseTypesCached(token);
        console.log('Raw course types data from cache:', data);
        
        // Robust array handling for various response formats
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
        return courseTypesArray;
      },
      (data) => {
        console.log('🔄 setCourseTypes called with:', data);
        setCourseTypes(data);
      },
      'courseTypes',
      300000 // 5 minutes
    );
  }, [token, fetchWithCache]);
  
  const fetchCourses = useCallback(async (courseTypeId) => {
    console.log('🔄 fetchCourses called with courseTypeId:', courseTypeId);
    
    if (!courseTypeId) {
      console.log('🔄 No courseTypeId, clearing courses');
      setFilteredCourses([]);
      return [];
    }
    
    const key = courseTypeId.toString();
    console.log('🔄 Calling fetchWithCache for courses with key:', key);
    
    return fetchWithCache(
      'courses',
      key,
      async (signal) => {
        console.log('🔄 Inside fetchWithCache for courses, calling API...');
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
        return coursesArray;
      },
      (data) => {
        console.log('🔄 setFilteredCourses called with:', data);
        setFilteredCourses(data);
      },
      'courses'
    );
  }, [token, fetchWithCache]);
  
  const fetchClasses = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, courseId);
    return fetchWithCache(
      'classes',
      key,
      async (signal) => {
        const data = await getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc');
        console.log('Raw classes data from API:', data);
        
        // Robust array handling for various response formats
        let classesArray = [];
        if (Array.isArray(data)) {
          classesArray = data;
        } else if (data && Array.isArray(data.content)) {
          classesArray = data.content;
        } else if (data && Array.isArray(data.data)) {
          classesArray = data.data;
        } else if (data && data.classes && Array.isArray(data.classes)) {
          classesArray = data.classes;
        } else {
          console.warn('Unexpected classes data format:', data);
          classesArray = [];
        }
        
        console.log('Normalized classes array:', classesArray);
        return classesArray;
      },
      setFilteredClasses,
      'classes'
    );
  }, [token, fetchWithCache]);
  
  const fetchExams = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredExams([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, courseId);
    return fetchWithCache(
      'exams',
      key,
      async (signal) => {
        const data = await getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc');
        console.log('Raw exams data from API:', data);
        
        // Robust array handling for various response formats
        let examsArray = [];
        if (Array.isArray(data)) {
          examsArray = data;
        } else if (data && Array.isArray(data.content)) {
          examsArray = data.content;
        } else if (data && Array.isArray(data.data)) {
          examsArray = data.data;
        } else if (data && data.exams && Array.isArray(data.exams)) {
          examsArray = data.exams;
        } else {
          console.warn('Unexpected exams data format:', data);
          examsArray = [];
        }
        
        console.log('Normalized exams array:', examsArray);
        return examsArray;
      },
      setFilteredExams,
      'exams'
    );
  }, [token, fetchWithCache]);
  
  // Fetch Master Subjects (for form dropdowns)
  const fetchMasterSubjects = useCallback(async (courseTypeId) => {
    if (!courseTypeId) {
      setMasterSubjects([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, showActiveOnly);
    return fetchWithCache(
      'masterSubjects',
      key,
      async (signal) => {
        const data = await getMasterSubjectsByCourseType(token, courseTypeId, { active: showActiveOnly });
        const subjectsArray = Array.isArray(data) ? data : (data?.content || data || []);
        // Normalize for dropdown display
        return subjectsArray.map(subject => ({
          id: subject.id,
          label: subject.name,
          description: subject.description || '',
          name: subject.name
        }));
      },
      setMasterSubjects,
      'masterSubjects'
    );
  }, [token, fetchWithCache, showActiveOnly]);
  
  // Fetch Subject Linkages (for filtering and data display)
  const fetchSubjectLinkages = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) {
      setSubjectLinkages([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, courseId, classId, examId, showActiveOnly);
    return fetchWithCache(
      'subjectLinkages',
      key,
      async (signal) => {
        const data = await getAllSubjectLinkages(token, {
          courseTypeId,
          courseId,
          classId,
          examId,
          active: showActiveOnly
        });
        console.log('Raw subject linkages data from API:', data);
        
        // Robust array handling for various response formats
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
          console.warn('Unexpected subject linkages data format:', data);
          subjectsArray = [];
        }
        
        console.log('Normalized subject linkages array:', subjectsArray);
        return subjectsArray;
      },
      setSubjectLinkages,
      'subjectLinkages'
    );
  }, [token, fetchWithCache, showActiveOnly]);
  
  const fetchTopics = useCallback(async (courseTypeId, courseId, classId, examId, subjectId) => {
    if (!courseTypeId || !courseId) {
      setFilteredTopics([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, courseId, classId, examId, subjectId, showActiveOnly);
    return fetchWithCache(
      'topics',
      key,
      async (signal) => {
        const data = await getTopicsCombinedFilter(token, {
          courseTypeId,
          courseId,
          classId,
          examId,
          subjectId,
          active: showActiveOnly
        });
        return Array.isArray(data) ? data : (data?.content || data?.data || []);
      },
      setFilteredTopics,
      'topics'
    );
  }, [token, fetchWithCache, showActiveOnly]);
  
  const fetchModules = useCallback(async (courseTypeId, courseId, classId, examId, subjectId, topicId) => {
    if (!courseTypeId || !courseId) {
      setFilteredModules([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, courseId, classId, examId, subjectId, topicId, showActiveOnly);
    return fetchWithCache(
      'modules',
      key,
      async (signal) => {
        const data = await getModulesCombinedFilter(token, {
          courseTypeId,
          courseId,
          classId,
          examId,
          subjectId,
          topicId,
          active: showActiveOnly
        });
        return Array.isArray(data) ? data : (data?.content || data?.data || []);
      },
      setFilteredModules,
      'modules'
    );
  }, [token, fetchWithCache, showActiveOnly]);
  
  const fetchChapters = useCallback(async (courseTypeId, courseId, classId, examId, subjectId, topicId, moduleId) => {
    if (!courseTypeId || !courseId) {
      setFilteredChapters([]);
      return [];
    }
    
    const key = createCacheKey(courseTypeId, courseId, classId, examId, subjectId, topicId, moduleId, showActiveOnly);
    return fetchWithCache(
      'chapters',
      key,
      async (signal) => {
        const data = await getChaptersCombinedFilter(token, {
          courseTypeId,
          courseId,
          classId,
          examId,
          subjectId,
          topicId,
          moduleId,
          active: showActiveOnly
        });
        return Array.isArray(data) ? data : (data?.content || data?.data || []);
      },
      setFilteredChapters,
      'chapters'
    );
  }, [token, fetchWithCache, showActiveOnly]);
  
  // Debounced filter effects
  const debouncedFetch = useCallback((fetchFunction, delay = 300) => {
    return (...args) => {
      const functionName = fetchFunction.name || 'unknown';
      console.log('🔄 Debounced fetch called for:', functionName, 'with args:', args);
      
      if (debounceRefs.current[functionName]) {
        console.log('🔄 Clearing existing timeout for:', functionName);
        clearTimeout(debounceRefs.current[functionName]);
      }
      
      debounceRefs.current[functionName] = setTimeout(() => {
        console.log('🔄 Executing debounced function:', functionName, 'with args:', args);
        fetchFunction(...args);
      }, delay);
    };
  }, []);
  
  // Filter change handlers
  const handleCourseTypeChange = useCallback((courseTypeId) => {
    console.log('🔄 Course type change triggered:', courseTypeId);
    setSelectedCourseType(courseTypeId);
    setSelectedCourse('');
    setSelectedClass('');
    setSelectedExam('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
    
    if (courseTypeId) {
      console.log('🔄 Calling fetchCourses and fetchMasterSubjects for courseTypeId:', courseTypeId);
      debouncedFetch(fetchCourses)(courseTypeId);
      debouncedFetch(fetchMasterSubjects)(courseTypeId);
    } else {
      console.log('🔄 Clearing all filter data');
      setFilteredCourses([]);
      setFilteredClasses([]);
      setFilteredExams([]);
      setMasterSubjects([]);
      setSubjectLinkages([]);
      setFilteredTopics([]);
      setFilteredModules([]);
      setFilteredChapters([]);
    }
  }, [fetchCourses, fetchMasterSubjects, debouncedFetch]);
  
  const handleCourseChange = useCallback((courseId) => {
    setSelectedCourse(courseId);
    setSelectedClass('');
    setSelectedExam('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
    
    if (courseId && selectedCourseType) {
      const courseTypeId = parseInt(selectedCourseType);
      debouncedFetch(fetchClasses)(courseTypeId, courseId);
      debouncedFetch(fetchExams)(courseTypeId, courseId);
      debouncedFetch(fetchSubjectLinkages)(courseTypeId, courseId, null, null);
    } else {
      setFilteredClasses([]);
      setFilteredExams([]);
      setSubjectLinkages([]);
      setFilteredTopics([]);
      setFilteredModules([]);
      setFilteredChapters([]);
    }
  }, [selectedCourseType, fetchClasses, fetchExams, fetchSubjectLinkages, debouncedFetch]);
  
  const handleClassChange = useCallback((classId) => {
    setSelectedClass(classId);
    setSelectedExam('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
    
    if (classId && selectedCourseType && selectedCourse) {
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      debouncedFetch(fetchSubjectLinkages)(courseTypeId, courseId, classId, null);
    } else {
      setSubjectLinkages([]);
      setFilteredTopics([]);
      setFilteredModules([]);
      setFilteredChapters([]);
    }
  }, [selectedCourseType, selectedCourse, fetchSubjectLinkages, debouncedFetch]);
  
  const handleExamChange = useCallback((examId) => {
    setSelectedExam(examId);
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
    
    if (examId && selectedCourseType && selectedCourse) {
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      debouncedFetch(fetchSubjectLinkages)(courseTypeId, courseId, null, examId);
    } else {
      setSubjectLinkages([]);
      setFilteredTopics([]);
      setFilteredModules([]);
      setFilteredChapters([]);
    }
  }, [selectedCourseType, selectedCourse, fetchSubjectLinkages, debouncedFetch]);
  
  const handleSubjectChange = useCallback((subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedTopic('');
    setSelectedModule('');
    
    if (subjectId && selectedCourseType && selectedCourse) {
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      const classId = selectedClass ? parseInt(selectedClass) : null;
      const examId = selectedExam ? parseInt(selectedExam) : null;
      debouncedFetch(fetchTopics)(courseTypeId, courseId, classId, examId, subjectId);
    } else {
      setFilteredTopics([]);
      setFilteredModules([]);
      setFilteredChapters([]);
    }
  }, [selectedCourseType, selectedCourse, selectedClass, selectedExam, fetchTopics, debouncedFetch]);
  
  const handleTopicChange = useCallback((topicId) => {
    setSelectedTopic(topicId);
    setSelectedModule('');
    
    if (topicId && selectedCourseType && selectedCourse) {
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      const classId = selectedClass ? parseInt(selectedClass) : null;
      const examId = selectedExam ? parseInt(selectedExam) : null;
      const subjectId = selectedSubject ? parseInt(selectedSubject) : null;
      debouncedFetch(fetchModules)(courseTypeId, courseId, classId, examId, subjectId, topicId);
    } else {
      setFilteredModules([]);
      setFilteredChapters([]);
    }
  }, [selectedCourseType, selectedCourse, selectedClass, selectedExam, selectedSubject, fetchModules, debouncedFetch]);
  
  const handleModuleChange = useCallback((moduleId) => {
    setSelectedModule(moduleId);
    
    if (moduleId && selectedCourseType && selectedCourse) {
      const courseTypeId = parseInt(selectedCourseType);
      const courseId = parseInt(selectedCourse);
      const classId = selectedClass ? parseInt(selectedClass) : null;
      const examId = selectedExam ? parseInt(selectedExam) : null;
      const subjectId = selectedSubject ? parseInt(selectedSubject) : null;
      const topicId = selectedTopic ? parseInt(selectedTopic) : null;
      debouncedFetch(fetchChapters)(courseTypeId, courseId, classId, examId, subjectId, topicId, moduleId);
    } else {
      setFilteredChapters([]);
    }
  }, [selectedCourseType, selectedCourse, selectedClass, selectedExam, selectedSubject, selectedTopic, fetchChapters, debouncedFetch]);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedCourseType('');
    setSelectedCourse('');
    setSelectedClass('');
    setSelectedExam('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
    
    setFilteredCourses([]);
    setFilteredClasses([]);
    setFilteredExams([]);
    setMasterSubjects([]);
    setSubjectLinkages([]);
    setFilteredTopics([]);
    setFilteredModules([]);
    setFilteredChapters([]);
  }, []);
  
  // Load course types on mount
  useEffect(() => {
    if (token && isInitialMountRef.current) {
      isInitialMountRef.current = false;
      fetchCourseTypes();
    }
  }, [token, fetchCourseTypes]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all debounce timeouts
      Object.values(debounceRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      
      // Abort all pending requests
      Object.values(globalCache.abortControllers).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);
  
  return {
    // Data
    courseTypes,
    filteredCourses,
    filteredClasses,
    filteredExams,
    masterSubjects, // For form dropdowns
    subjectLinkages, // For filtering and data display
    filteredTopics,
    filteredModules,
    filteredChapters,
    
    // Filter states
    selectedCourseType,
    selectedCourse,
    selectedClass,
    selectedExam,
    selectedSubject,
    selectedTopic,
    selectedModule,
    showActiveOnly,
    
    // Setters
    setSelectedCourseType,
    setSelectedCourse,
    setSelectedClass,
    setSelectedExam,
    setSelectedSubject,
    setSelectedTopic,
    setSelectedModule,
    setShowActiveOnly,
    
    // Handlers
    handleCourseTypeChange,
    handleCourseChange,
    handleClassChange,
    handleExamChange,
    handleSubjectChange,
    handleTopicChange,
    handleModuleChange,
    
    // Actions
    resetFilters,
    fetchCourseTypes,
    fetchCourses,
    fetchClasses,
    fetchExams,
    fetchMasterSubjects,
    fetchSubjectLinkages,
    fetchTopics,
    fetchModules,
    fetchChapters,
    
    // Loading states
    loadingStates,
    
    // Helpers
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType
  };
};
