import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMasterData } from './useMasterData';

// Shared state across all components to prevent duplicate API calls
const sharedFilterState = {
  // Cache for API responses
  cache: {
    courses: new Map(),
    classes: new Map(),
    exams: new Map(),
    subjects: new Map(),
    topics: new Map(),
    modules: new Map(),
    chapters: new Map()
  },
  
  // Loading states
  loading: {
    courses: false,
    classes: false,
    exams: false,
    subjects: false,
    topics: false,
    modules: false,
    chapters: false
  },
  
  // Last fetch timestamps for deduplication
  lastFetch: {
    courses: new Map(),
    classes: new Map(),
    exams: new Map(),
    subjects: new Map(),
    topics: new Map(),
    modules: new Map(),
    chapters: new Map()
  },
  
  // Abort controllers
  abortControllers: {
    courses: null,
    classes: null,
    exams: null,
    subjects: null,
    topics: null,
    modules: null,
    chapters: null
  }
};

/**
 * Shared Master Data Filters Hook
 * Prevents duplicate API calls across all master data components
 * Uses shared global state and intelligent caching
 */
export const useSharedMasterDataFilters = () => {
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

  // Local filter states (each component maintains its own UI state)
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Local state for filtered data (populated from shared cache)
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);

  // Debounce ref
  const debounceRef = useRef(null);

  // Helper to create cache key
  const createCacheKey = useCallback((...args) => {
    return args.filter(Boolean).join('|');
  }, []);

  // Helper to check if request should be skipped (deduplication)
  const shouldSkipRequest = useCallback((type, key) => {
    const lastFetch = sharedFilterState.lastFetch[type].get(key);
    const now = Date.now();
    return lastFetch && (now - lastFetch) < 2000; // 2 second deduplication window
  }, []);

  // Helper to get cached data
  const getCachedData = useCallback((type, key) => {
    return sharedFilterState.cache[type].get(key) || [];
  }, []);

  // Helper to set cached data
  const setCachedData = useCallback((type, key, data) => {
    sharedFilterState.cache[type].set(key, data);
    sharedFilterState.lastFetch[type].set(key, Date.now());
  }, []);

  // Helper to abort previous request
  const abortPreviousRequest = useCallback((type) => {
    const controller = sharedFilterState.abortControllers[type];
    if (controller) {
      controller.abort();
    }
    sharedFilterState.abortControllers[type] = new AbortController();
  }, []);

  // Shared fetch courses function
  const fetchCoursesShared = useCallback(async (courseTypeId) => {
    if (!courseTypeId) {
      setFilteredCourses([]);
      return [];
    }

    const key = createCacheKey('courses', courseTypeId);
    
    // Check cache first
    const cached = getCachedData('courses', key);
    if (cached.length > 0) {
      setFilteredCourses(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('courses', key)) {
      return [];
    }

    try {
      abortPreviousRequest('courses');
      sharedFilterState.loading.courses = true;

      const data = await fetchCourses(courseTypeId);
      const result = data || [];
      
      setCachedData('courses', key, result);
      setFilteredCourses(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching courses:', error);
      }
      setFilteredCourses([]);
      return [];
    } finally {
      sharedFilterState.loading.courses = false;
    }
  }, [fetchCourses, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Shared fetch classes function
  const fetchClassesShared = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      return [];
    }

    const key = createCacheKey('classes', courseTypeId, courseId);
    
    // Check cache first
    const cached = getCachedData('classes', key);
    if (cached.length > 0) {
      setFilteredClasses(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('classes', key)) {
      return [];
    }

    try {
      abortPreviousRequest('classes');
      sharedFilterState.loading.classes = true;

      const data = await fetchClasses(courseTypeId, courseId);
      const result = data || [];
      
      setCachedData('classes', key, result);
      setFilteredClasses(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching classes:', error);
      }
      setFilteredClasses([]);
      return [];
    } finally {
      sharedFilterState.loading.classes = false;
    }
  }, [fetchClasses, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Shared fetch exams function
  const fetchExamsShared = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredExams([]);
      return [];
    }

    const key = createCacheKey('exams', courseTypeId, courseId);
    
    // Check cache first
    const cached = getCachedData('exams', key);
    if (cached.length > 0) {
      setFilteredExams(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('exams', key)) {
      return [];
    }

    try {
      abortPreviousRequest('exams');
      sharedFilterState.loading.exams = true;

      const data = await fetchExams(courseTypeId, courseId);
      const result = data || [];
      
      setCachedData('exams', key, result);
      setFilteredExams(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching exams:', error);
      }
      setFilteredExams([]);
      return [];
    } finally {
      sharedFilterState.loading.exams = false;
    }
  }, [fetchExams, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Shared fetch subjects function
  const fetchSubjectsShared = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) {
      setFilteredSubjects([]);
      return [];
    }

    const key = createCacheKey('subjects', courseTypeId, courseId, classId, examId);
    
    // Check cache first
    const cached = getCachedData('subjects', key);
    if (cached.length > 0) {
      setFilteredSubjects(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('subjects', key)) {
      return [];
    }

    try {
      abortPreviousRequest('subjects');
      sharedFilterState.loading.subjects = true;

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
      setFilteredSubjects(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching subjects:', error);
      }
      setFilteredSubjects([]);
      return [];
    } finally {
      sharedFilterState.loading.subjects = false;
    }
  }, [fetchSubjects, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Shared fetch topics function
  const fetchTopicsShared = useCallback(async (courseTypeId, subjectId) => {
    if (!courseTypeId || !subjectId) {
      setFilteredTopics([]);
      return [];
    }

    const key = createCacheKey('topics', courseTypeId, subjectId);
    
    // Check cache first
    const cached = getCachedData('topics', key);
    if (cached.length > 0) {
      setFilteredTopics(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('topics', key)) {
      return [];
    }

    try {
      abortPreviousRequest('topics');
      sharedFilterState.loading.topics = true;

      const data = await fetchTopicsByLinkage(parseInt(courseTypeId), parseInt(subjectId));
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      const result = list || [];
      
      setCachedData('topics', key, result);
      setFilteredTopics(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching topics:', error);
      }
      setFilteredTopics([]);
      return [];
    } finally {
      sharedFilterState.loading.topics = false;
    }
  }, [fetchTopicsByLinkage, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Shared fetch modules function
  const fetchModulesShared = useCallback(async (topicId) => {
    if (!topicId) {
      setFilteredModules([]);
      return [];
    }

    const key = createCacheKey('modules', topicId, showActiveOnly);
    
    // Check cache first
    const cached = getCachedData('modules', key);
    if (cached.length > 0) {
      setFilteredModules(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('modules', key)) {
      return [];
    }

    try {
      abortPreviousRequest('modules');
      sharedFilterState.loading.modules = true;

      const data = await fetchModulesByTopic(topicId, showActiveOnly);
      const result = data || [];
      
      setCachedData('modules', key, result);
      setFilteredModules(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching modules:', error);
      }
      setFilteredModules([]);
      return [];
    } finally {
      sharedFilterState.loading.modules = false;
    }
  }, [fetchModulesByTopic, showActiveOnly, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Shared fetch chapters function
  const fetchChaptersShared = useCallback(async (moduleId) => {
    if (!moduleId) {
      setFilteredChapters([]);
      return [];
    }

    const key = createCacheKey('chapters', moduleId, showActiveOnly);
    
    // Check cache first
    const cached = getCachedData('chapters', key);
    if (cached.length > 0) {
      setFilteredChapters(cached);
      return cached;
    }

    // Check if request should be skipped
    if (shouldSkipRequest('chapters', key)) {
      return [];
    }

    try {
      abortPreviousRequest('chapters');
      sharedFilterState.loading.chapters = true;

      const data = await fetchChaptersByModule(moduleId, showActiveOnly);
      const result = data || [];
      
      setCachedData('chapters', key, result);
      setFilteredChapters(result);
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching chapters:', error);
      }
      setFilteredChapters([]);
      return [];
    } finally {
      sharedFilterState.loading.chapters = false;
    }
  }, [fetchChaptersByModule, showActiveOnly, createCacheKey, getCachedData, shouldSkipRequest, abortPreviousRequest, setCachedData]);

  // Consolidated filter effect with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced execution
    debounceRef.current = setTimeout(async () => {
      console.log('🌍 Shared filter effect triggered:', {
        courseType: selectedCourseType,
        course: selectedCourse,
        class: selectedClass,
        exam: selectedExam,
        subject: selectedSubject,
        topic: selectedTopic,
        module: selectedModule
      });

      try {
        // Sequential loading with shared cache
        if (selectedCourseType) {
          await fetchCoursesShared(selectedCourseType);
        }

        if (selectedCourseType && selectedCourse) {
          if (isAcademicCourseType(selectedCourseType)) {
            await fetchClassesShared(selectedCourseType, selectedCourse);
          }
          if (isCompetitiveCourseType(selectedCourseType)) {
            await fetchExamsShared(selectedCourseType, selectedCourse);
          }
        }

        if (selectedCourseType && selectedCourse) {
          await fetchSubjectsShared(selectedCourseType, selectedCourse, selectedClass, selectedExam);
        }

        if (selectedCourseType && selectedSubject) {
          await fetchTopicsShared(selectedCourseType, selectedSubject);
        }

        if (selectedTopic) {
          await fetchModulesShared(selectedTopic);
        }

        if (selectedModule) {
          await fetchChaptersShared(selectedModule);
        }

        console.log('✅ Shared filter data loaded successfully');
      } catch (error) {
        console.error('❌ Error in shared filter effect:', error);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
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
    fetchCoursesShared,
    fetchClassesShared,
    fetchExamsShared,
    fetchSubjectsShared,
    fetchTopicsShared,
    fetchModulesShared,
    fetchChaptersShared,
    isAcademicCourseType,
    isCompetitiveCourseType
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedCourseType('');
    setSelectedCourse('');
    setSelectedClass('');
    setSelectedExam('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedModule('');
    
    // Clear local filtered data
    setFilteredCourses([]);
    setFilteredClasses([]);
    setFilteredExams([]);
    setFilteredSubjects([]);
    setFilteredTopics([]);
    setFilteredModules([]);
    setFilteredChapters([]);
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
    
    // Filtered data
    filteredCourses,
    filteredClasses,
    filteredExams,
    filteredSubjects,
    filteredTopics,
    filteredModules,
    filteredChapters,
    
    // Loading states
    loadingStates: {
      courses: sharedFilterState.loading.courses,
      classes: sharedFilterState.loading.classes,
      exams: sharedFilterState.loading.exams,
      subjects: sharedFilterState.loading.subjects,
      topics: sharedFilterState.loading.topics,
      modules: sharedFilterState.loading.modules,
      chapters: sharedFilterState.loading.chapters
    },
    
    // Actions
    resetFilters,
    
    // Helpers
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType
  };
};
