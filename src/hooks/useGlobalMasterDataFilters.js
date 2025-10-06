import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMasterData } from './useMasterData';

// Global state to prevent duplicate API calls across components
const globalFilterCache = {
  courses: new Map(),
  classes: new Map(),
  exams: new Map(),
  subjects: new Map(),
  topics: new Map(),
  modules: new Map(),
  chapters: new Map(),
  lastFetch: new Map(),
  loading: new Map()
};

// Global abort controllers
const globalAbortControllers = new Map();

/**
 * Global Master Data Filters Hook
 * Prevents duplicate API calls across all master data components
 * Uses global cache and shared state
 */
export const useGlobalMasterDataFilters = () => {
  const { token, addNotification } = useApp();
  const {
    fetchCourses,
    fetchClasses,
    fetchExams,
    fetchSubjects,
    fetchTopicsByLinkage,
    fetchModulesByTopic,
    fetchChaptersByModule,
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType
  } = useMasterData();

  // Local filter states (each component maintains its own)
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Global debounce ref
  const globalDebounceRef = useRef(null);

  // Helper to create cache key
  const createCacheKey = useCallback((...args) => {
    return args.filter(Boolean).join('|');
  }, []);

  // Helper to check if request should be skipped
  const shouldSkipRequest = useCallback((type, key) => {
    const lastFetch = globalFilterCache.lastFetch.get(type);
    const now = Date.now();
    return lastFetch && lastFetch.key === key && (now - lastFetch.timestamp) < 1000; // 1 second deduplication
  }, []);

  // Helper to get cached data
  const getCachedData = useCallback((type, key) => {
    return globalFilterCache[type].get(key) || [];
  }, []);

  // Helper to set cached data
  const setCachedData = useCallback((type, key, data) => {
    globalFilterCache[type].set(key, data);
    globalFilterCache.lastFetch.set(type, { key, timestamp: Date.now() });
  }, []);

  // Helper to abort previous request
  const abortPreviousRequest = useCallback((type) => {
    const controller = globalAbortControllers.get(type);
    if (controller) {
      controller.abort();
    }
    globalAbortControllers.set(type, new AbortController());
  }, []);

  // Global fetch courses function
  const fetchCoursesGlobal = useCallback(async (courseTypeId) => {
    if (!courseTypeId) return [];

    const key = createCacheKey('courses', courseTypeId);
    
    // Check cache first
    const cached = getCachedData('courses', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('courses', key)) return [];

    try {
      abortPreviousRequest('courses');
      globalFilterCache.loading.set('courses', true);

      const data = await fetchCourses(courseTypeId);
      const result = data || [];
      
      setCachedData('courses', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching courses:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('courses', false);
    }
  }, [fetchCourses, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global fetch classes function
  const fetchClassesGlobal = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) return [];

    const key = createCacheKey('classes', courseTypeId, courseId);
    
    // Check cache first
    const cached = getCachedData('classes', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('classes', key)) return [];

    try {
      abortPreviousRequest('classes');
      globalFilterCache.loading.set('classes', true);

      const data = await fetchClasses(courseTypeId, courseId);
      const result = data || [];
      
      setCachedData('classes', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching classes:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('classes', false);
    }
  }, [fetchClasses, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global fetch exams function
  const fetchExamsGlobal = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) return [];

    const key = createCacheKey('exams', courseTypeId, courseId);
    
    // Check cache first
    const cached = getCachedData('exams', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('exams', key)) return [];

    try {
      abortPreviousRequest('exams');
      globalFilterCache.loading.set('exams', true);

      const data = await fetchExams(courseTypeId, courseId);
      const result = data || [];
      
      setCachedData('exams', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching exams:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('exams', false);
    }
  }, [fetchExams, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global fetch subjects function
  const fetchSubjectsGlobal = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) return [];

    const key = createCacheKey('subjects', courseTypeId, courseId, classId, examId);
    
    // Check cache first
    const cached = getCachedData('subjects', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('subjects', key)) return [];

    try {
      abortPreviousRequest('subjects');
      globalFilterCache.loading.set('subjects', true);

      let data = [];
      
      if (isAcademicCourseType(courseTypeId) && classId) {
        data = await fetchSubjects(courseTypeId, courseId, classId, null, true);
      } else if (isCompetitiveCourseType(courseTypeId) && examId) {
        data = await fetchSubjects(courseTypeId, courseId, null, examId, true);
      } else if (isProfessionalCourseType(courseTypeId)) {
        data = await fetchSubjects(courseTypeId, courseId, null, null, true);
      }

      const result = data || [];
      setCachedData('subjects', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching subjects:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('subjects', false);
    }
  }, [fetchSubjects, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global fetch topics function
  const fetchTopicsGlobal = useCallback(async (courseTypeId, subjectId) => {
    if (!courseTypeId || !subjectId) return [];

    const key = createCacheKey('topics', courseTypeId, subjectId);
    
    // Check cache first
    const cached = getCachedData('topics', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('topics', key)) return [];

    try {
      abortPreviousRequest('topics');
      globalFilterCache.loading.set('topics', true);

      const data = await fetchTopicsByLinkage(parseInt(courseTypeId), parseInt(subjectId));
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      const result = list || [];
      
      setCachedData('topics', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching topics:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('topics', false);
    }
  }, [fetchTopicsByLinkage, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global fetch modules function
  const fetchModulesGlobal = useCallback(async (topicId) => {
    if (!topicId) return [];

    const key = createCacheKey('modules', topicId, showActiveOnly);
    
    // Check cache first
    const cached = getCachedData('modules', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('modules', key)) return [];

    try {
      abortPreviousRequest('modules');
      globalFilterCache.loading.set('modules', true);

      const data = await fetchModulesByTopic(topicId, showActiveOnly);
      const result = data || [];
      
      setCachedData('modules', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching modules:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('modules', false);
    }
  }, [fetchModulesByTopic, showActiveOnly, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global fetch chapters function
  const fetchChaptersGlobal = useCallback(async (moduleId) => {
    if (!moduleId) return [];

    const key = createCacheKey('chapters', moduleId, showActiveOnly);
    
    // Check cache first
    const cached = getCachedData('chapters', key);
    if (cached.length > 0) return cached;

    // Check if request should be skipped
    if (shouldSkipRequest('chapters', key)) return [];

    try {
      abortPreviousRequest('chapters');
      globalFilterCache.loading.set('chapters', true);

      const data = await fetchChaptersByModule(moduleId, showActiveOnly);
      const result = data || [];
      
      setCachedData('chapters', key, result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching chapters:', error);
      }
      return [];
    } finally {
      globalFilterCache.loading.set('chapters', false);
    }
  }, [fetchChaptersByModule, showActiveOnly, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Global consolidated filter effect
  useEffect(() => {
    // Clear previous timeout
    if (globalDebounceRef.current) {
      clearTimeout(globalDebounceRef.current);
    }

    // Set new timeout for debounced execution
    globalDebounceRef.current = setTimeout(async () => {
      console.log('🌍 Global filter effect triggered:', {
        courseType: selectedCourseType,
        course: selectedCourse,
        class: selectedClass,
        exam: selectedExam,
        subject: selectedSubject,
        topic: selectedTopic,
        module: selectedModule
      });

      try {
        // Sequential loading with global cache
        if (selectedCourseType) {
          await fetchCoursesGlobal(selectedCourseType);
        }

        if (selectedCourseType && selectedCourse) {
          if (isAcademicCourseType(selectedCourseType)) {
            await fetchClassesGlobal(selectedCourseType, selectedCourse);
          }
          if (isCompetitiveCourseType(selectedCourseType)) {
            await fetchExamsGlobal(selectedCourseType, selectedCourse);
          }
        }

        if (selectedCourseType && selectedCourse) {
          await fetchSubjectsGlobal(selectedCourseType, selectedCourse, selectedClass, selectedExam);
        }

        if (selectedCourseType && selectedSubject) {
          await fetchTopicsGlobal(selectedCourseType, selectedSubject);
        }

        if (selectedTopic) {
          await fetchModulesGlobal(selectedTopic);
        }

        if (selectedModule) {
          await fetchChaptersGlobal(selectedModule);
        }

        console.log('✅ Global filter data loaded successfully');
      } catch (error) {
        console.error('❌ Error in global filter effect:', error);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (globalDebounceRef.current) {
        clearTimeout(globalDebounceRef.current);
      }
    };
  }, [
    selectedCourseType,
    selectedCourse,
    selectedClass,
    selectedExam,
    selectedSubject,
    selectedTopic,
    selectedModule,
    fetchCoursesGlobal,
    fetchClassesGlobal,
    fetchExamsGlobal,
    fetchSubjectsGlobal,
    fetchTopicsGlobal,
    fetchModulesGlobal,
    fetchChaptersGlobal,
    isAcademicCourseType,
    isCompetitiveCourseType
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (globalDebounceRef.current) {
        clearTimeout(globalDebounceRef.current);
      }
    };
  }, []);

  // Get cached data for current selections
  const getFilteredCourses = () => {
    if (!selectedCourseType) return [];
    const key = createCacheKey('courses', selectedCourseType);
    return getCachedData('courses', key);
  };

  const getFilteredClasses = () => {
    if (!selectedCourseType || !selectedCourse) return [];
    const key = createCacheKey('classes', selectedCourseType, selectedCourse);
    return getCachedData('classes', key);
  };

  const getFilteredExams = () => {
    if (!selectedCourseType || !selectedCourse) return [];
    const key = createCacheKey('exams', selectedCourseType, selectedCourse);
    return getCachedData('exams', key);
  };

  const getFilteredSubjects = () => {
    if (!selectedCourseType || !selectedCourse) return [];
    const key = createCacheKey('subjects', selectedCourseType, selectedCourse, selectedClass, selectedExam);
    return getCachedData('subjects', key);
  };

  const getFilteredTopics = () => {
    if (!selectedCourseType || !selectedSubject) return [];
    const key = createCacheKey('topics', selectedCourseType, selectedSubject);
    return getCachedData('topics', key);
  };

  const getFilteredModules = () => {
    if (!selectedTopic) return [];
    const key = createCacheKey('modules', selectedTopic, showActiveOnly);
    return getCachedData('modules', key);
  };

  const getFilteredChapters = () => {
    if (!selectedModule) return [];
    const key = createCacheKey('chapters', selectedModule, showActiveOnly);
    return getCachedData('chapters', key);
  };

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedCourseType('');
    setSelectedCourse('');
    setSelectedClass('');
    setSelectedExam('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
  }, []);

  return {
    // Filter states
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
    
    // Cached filtered data
    filteredCourses: getFilteredCourses(),
    filteredClasses: getFilteredClasses(),
    filteredExams: getFilteredExams(),
    filteredSubjects: getFilteredSubjects(),
    filteredTopics: getFilteredTopics(),
    filteredModules: getFilteredModules(),
    filteredChapters: getFilteredChapters(),
    
    // Loading states
    loadingStates: {
      courses: globalFilterCache.loading.get('courses') || false,
      classes: globalFilterCache.loading.get('classes') || false,
      exams: globalFilterCache.loading.get('exams') || false,
      subjects: globalFilterCache.loading.get('subjects') || false,
      topics: globalFilterCache.loading.get('topics') || false,
      modules: globalFilterCache.loading.get('modules') || false,
      chapters: globalFilterCache.loading.get('chapters') || false
    },
    
    // Actions
    resetFilters,
    
    // Helpers
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType
  };
};
