import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    getChaptersByModule,
    getClasses,
    getCourseTypes,
    getCourses,
    getExams,
    getModulesByTopic,
    getSubjects,
    getTopicsByLinkage,
    getTopicsWithFilters
} from '../services/masterDataService';

// Global cache for course types to prevent duplicate calls across multiple useMasterData instances
const globalCourseTypesCache = {
  data: null,
  loading: false,
  error: null,
  timestamp: 0,
  promise: null
};

/**
 * Optimized Master Data Hook with Authentication Management
 * Prevents API calls before authentication is ready
 */
export const useMasterData = () => {
  const { addNotification, token, isAuthenticated } = useApp();
  
  // Global course types state using global cache
  const [courseTypesData, setCourseTypesData] = useState(globalCourseTypesCache.data);
  const [courseTypesLoading, setCourseTypesLoading] = useState(globalCourseTypesCache.loading);
  const [courseTypesError, setCourseTypesError] = useState(globalCourseTypesCache.error);
  
  // Custom refetch function for course types
  const refetchCourseTypes = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    
    // If already loading, wait for the existing promise
    if (globalCourseTypesCache.loading && globalCourseTypesCache.promise) {
      try {
        await globalCourseTypesCache.promise;
        setCourseTypesData(globalCourseTypesCache.data);
        setCourseTypesLoading(globalCourseTypesCache.loading);
        setCourseTypesError(globalCourseTypesCache.error);
      } catch (error) {
        setCourseTypesError(error);
      }
      return;
    }
    
    // Check if we have recent data (within 5 seconds)
    const now = Date.now();
    if (globalCourseTypesCache.data && (now - globalCourseTypesCache.timestamp) < 5000) {
      setCourseTypesData(globalCourseTypesCache.data);
      setCourseTypesLoading(false);
      setCourseTypesError(null);
      return;
    }
    
    // Make new request
    globalCourseTypesCache.loading = true;
    setCourseTypesLoading(true);
    setCourseTypesError(null);
    
    const promise = getCourseTypes(token)
      .then(data => {
        globalCourseTypesCache.data = data;
        globalCourseTypesCache.loading = false;
        globalCourseTypesCache.error = null;
        globalCourseTypesCache.timestamp = now;
        globalCourseTypesCache.promise = null;
        
        setCourseTypesData(data);
        setCourseTypesLoading(false);
        setCourseTypesError(null);
        
        return data;
      })
      .catch(error => {
        globalCourseTypesCache.loading = false;
        globalCourseTypesCache.error = error;
        globalCourseTypesCache.promise = null;
        
        setCourseTypesLoading(false);
        setCourseTypesError(error);
        
        throw error;
      });
    
    globalCourseTypesCache.promise = promise;
    return promise;
  }, [token, isAuthenticated]);
  
  // Auto-fetch course types when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      refetchCourseTypes();
    }
  }, [isAuthenticated, token, refetchCourseTypes]);
  
  // State management
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Dedup, abort, and cache controls for Courses
  const coursesAbortRef = useRef(null);
  const coursesCacheRef = useRef(new Map()); // key: courseTypeId -> { data, ts }
  const lastCoursesKeyRef = useRef('');
  const lastCoursesAtRef = useRef(0);

  // Dedup, abort, and cache controls for Classes
  const classesAbortRef = useRef(null);
  const classesCacheRef = useRef(new Map()); // key: courseTypeId|courseId -> { data, ts }
  const lastClassesKeyRef = useRef('');
  const lastClassesAtRef = useRef(0);

  // Update course types when data is loaded
  useEffect(() => {
    if (courseTypesData) {
      const processedData = Array.isArray(courseTypesData) 
        ? courseTypesData 
        : (courseTypesData?.content || courseTypesData?.data || []);
      setCourseTypes(processedData);
    }
  }, [courseTypesData]);

  // Show error notification
  useEffect(() => {
    if (courseTypesError) {
      addNotification({
        type: 'error',
        message: 'Failed to load course types',
        duration: 5000
      });
    }
  }, [courseTypesError, addNotification]);

  // Fetch courses by course type
  const fetchCourses = useCallback(async (courseTypeId) => {
    if (!courseTypeId) return [];
    
    try {
      const key = String(courseTypeId);
      const now = Date.now();
      const cached = coursesCacheRef.current.get(key);
      if (cached && now - cached.ts < 5000) {
        setCourses(cached.data || []);
        return cached.data || [];
      }

      // Dedup quick repeats
      if (key === lastCoursesKeyRef.current && now - lastCoursesAtRef.current < 1500) {
        return courses;
      }

      // Abort inflight
      if (coursesAbortRef.current) {
        try { coursesAbortRef.current.abort(); } catch (_) {}
      }
      coursesAbortRef.current = new AbortController();

      // Use non-blocked endpoint with auth token
      const data = await getCourses(token, courseTypeId, 0, 100, coursesAbortRef.current.signal);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setCourses(processedData);
      coursesCacheRef.current.set(key, { data: processedData, ts: now });
      lastCoursesKeyRef.current = key;
      lastCoursesAtRef.current = now;
      return processedData;
    } catch (error) {
      if (error?.name === 'AbortError') {
        return courses;
      }
      console.error('Error fetching courses:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load courses',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, courses, token]);

  // Fetch classes for a course
  const fetchClasses = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) return [];
    
    try {
      const key = `${courseTypeId}|${courseId}`;
      const now = Date.now();
      const cached = classesCacheRef.current.get(key);
      if (cached && now - cached.ts < 5000) {
        setClasses(cached.data || []);
        return cached.data || [];
      }

      if (key === lastClassesKeyRef.current && now - lastClassesAtRef.current < 1500) {
        return classes;
      }

      if (classesAbortRef.current) {
        try { classesAbortRef.current.abort(); } catch (_) {}
      }
      classesAbortRef.current = new AbortController();

      const data = await getClasses(token, courseTypeId, courseId, classesAbortRef.current.signal);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setClasses(processedData);
      classesCacheRef.current.set(key, { data: processedData, ts: now });
      lastClassesKeyRef.current = key;
      lastClassesAtRef.current = now;
      return processedData;
    } catch (error) {
      if (error?.name === 'AbortError') {
        return classes;
      }
      console.error('Error fetching classes:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load classes',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, classes, token]);

  // Fetch exams for a course
  const fetchExams = useCallback(async (courseTypeId, courseId, classId) => {
    if (!courseTypeId || !courseId) return [];
    
    try {
      const data = await getExams(token, courseTypeId, courseId, classId);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setExams(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching exams:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load exams',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch subjects (supports filters like Topic module)
  const fetchSubjects = useCallback(async (
    courseTypeId,
    courseId,
    classId,
    examId,
    activeOnly
  ) => {
    try {
      const data = await getSubjects(token, courseTypeId, courseId, classId, examId, activeOnly);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setSubjects(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load subjects',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch modules by topic
  const fetchModules = useCallback(async (topicId) => {
    if (!topicId) return [];
    
    try {
      const data = await getModulesByTopic(token, topicId);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setModules(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching modules:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load modules',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch topics with filters
  const fetchTopics = useCallback(async (filters = {}) => {
    try {
      const data = await getTopicsWithFilters(token, filters);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setTopics(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching topics:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load topics',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch chapters by module
  const fetchChapters = useCallback(async (moduleId) => {
    if (!moduleId) return [];
    
    try {
      const data = await getChaptersByModule(token, moduleId);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setChapters(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load chapters',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch topics by linkage (for compatibility)
  const fetchTopicsByLinkage = useCallback(async (courseTypeId, relationshipId) => {
    if (!courseTypeId || !relationshipId) return [];
    
    try {
      const data = await getTopicsByLinkage(token, courseTypeId, relationshipId);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setTopics(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching topics by linkage:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load topics',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch modules by topic (for compatibility)
  const fetchModulesByTopic = useCallback(async (topicId) => {
    if (!topicId) return [];
    
    try {
      const data = await getModulesByTopic(token, topicId);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setModules(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching modules by topic:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load modules',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Fetch chapters by module (for compatibility)
  const fetchChaptersByModule = useCallback(async (moduleId) => {
    if (!moduleId) return [];
    
    try {
      const data = await getChaptersByModule(token, moduleId);
      const processedData = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setChapters(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching chapters by module:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load chapters',
        duration: 5000
      });
      return [];
    }
  }, [addNotification, token]);

  // Helper functions
  const isAcademicCourseType = useCallback((courseTypeId) => {
    if (!Array.isArray(courseTypes)) return false;
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('academic');
  }, [courseTypes]);

  const isCompetitiveCourseType = useCallback((courseTypeId) => {
    if (!Array.isArray(courseTypes)) return false;
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('competitive');
  }, [courseTypes]);

  const isProfessionalCourseType = useCallback((courseTypeId) => {
    if (!Array.isArray(courseTypes)) return false;
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType && courseType.name && courseType.name.toLowerCase().includes('professional');
  }, [courseTypes]);

  const getCourseTypeName = useCallback((courseTypeId) => {
    if (!courseTypeId) return 'Unknown';
    const courseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));
    return courseType ? courseType.name : 'Unknown';
  }, [courseTypes]);

  const getCourseName = useCallback((courseId) => {
    if (!courseId) return 'Unknown';
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? course.name : 'Unknown';
  }, [courses]);

  return {
    // Data
    courseTypes,
    courses,
    classes,
    exams,
    subjects,
    modules,
    topics,
    chapters,
    
    // Loading states
    courseTypesLoading,
    
    // Functions
    fetchCourses,
    fetchClasses,
    fetchExams,
    fetchSubjects,
    fetchModules,
    fetchTopics,
    fetchChapters,
    fetchTopicsByLinkage,
    fetchModulesByTopic,
    fetchChaptersByModule,
    refetchCourseTypes,
    
    // Helpers
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType,
    getCourseTypeName,
    getCourseName,
    
    // Status
    isAuthenticated
  };
};
