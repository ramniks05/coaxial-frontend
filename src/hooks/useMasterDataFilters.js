import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMasterData } from './useMasterData';

/**
 * Custom hook for managing master data filters with deduplication and caching
 * Prevents API loops and provides consistent filter behavior across components
 */
export const useMasterDataFilters = () => {
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

  // Filter states
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filtered data states
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    classes: false,
    exams: false,
    subjects: false,
    topics: false,
    modules: false,
    chapters: false
  });

  // Deduplication refs
  const lastFetchRef = useRef({
    courses: { key: '', timestamp: 0 },
    classes: { key: '', timestamp: 0 },
    exams: { key: '', timestamp: 0 },
    subjects: { key: '', timestamp: 0 },
    topics: { key: '', timestamp: 0 },
    modules: { key: '', timestamp: 0 },
    chapters: { key: '', timestamp: 0 }
  });

  // Abort controllers
  const abortControllersRef = useRef({});

  // Helper to create cache key
  const createCacheKey = useCallback((...args) => {
    return args.filter(Boolean).join('|');
  }, []);

  // Helper to check if request should be skipped
  const shouldSkipRequest = useCallback((type, key) => {
    const lastFetch = lastFetchRef.current[type];
    const now = Date.now();
    return lastFetch.key === key && (now - lastFetch.timestamp) < 1000; // 1 second deduplication
  }, []);

  // Helper to update loading state
  const updateLoadingState = useCallback((type, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [type]: isLoading }));
  }, []);

  // Helper to abort previous request
  const abortPreviousRequest = useCallback((type) => {
    if (abortControllersRef.current[type]) {
      abortControllersRef.current[type].abort();
    }
    abortControllersRef.current[type] = new AbortController();
  }, []);

  // Fetch courses based on course type
  const fetchCoursesForFilters = useCallback(async (courseTypeId) => {
    if (!courseTypeId) {
      setFilteredCourses([]);
      return;
    }

    const key = createCacheKey('courses', courseTypeId);
    if (shouldSkipRequest('courses', key)) return;

    try {
      abortPreviousRequest('courses');
      updateLoadingState('courses', true);

      const data = await fetchCourses(courseTypeId);
      setFilteredCourses(data || []);
      
      lastFetchRef.current.courses = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching courses:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch courses',
          duration: 3000
        });
      }
    } finally {
      updateLoadingState('courses', false);
    }
  }, [fetchCourses, createCacheKey, shouldSkipRequest, abortPreviousRequest, updateLoadingState, addNotification]);

  // Fetch classes and exams based on course type and course
  const fetchClassesAndExams = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      setFilteredExams([]);
      return;
    }

    const promises = [];
    
    if (isAcademicCourseType(courseTypeId)) {
      const classKey = createCacheKey('classes', courseTypeId, courseId);
      if (!shouldSkipRequest('classes', classKey)) {
        promises.push(
          fetchClasses(courseTypeId, courseId).then(data => {
            setFilteredClasses(data || []);
            lastFetchRef.current.classes = { key: classKey, timestamp: Date.now() };
          }).catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Error fetching classes:', error);
              setFilteredClasses([]);
            }
          })
        );
      }
    }

    if (isCompetitiveCourseType(courseTypeId)) {
      const examKey = createCacheKey('exams', courseTypeId, courseId);
      if (!shouldSkipRequest('exams', examKey)) {
        promises.push(
          fetchExams(courseTypeId, courseId).then(data => {
            setFilteredExams(data || []);
            lastFetchRef.current.exams = { key: examKey, timestamp: Date.now() };
          }).catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Error fetching exams:', error);
              setFilteredExams([]);
            }
          })
        );
      }
    }

    if (promises.length > 0) {
      updateLoadingState('classes', true);
      updateLoadingState('exams', true);
      
      try {
        await Promise.all(promises);
      } finally {
        updateLoadingState('classes', false);
        updateLoadingState('exams', false);
      }
    }
  }, [fetchClasses, fetchExams, isAcademicCourseType, isCompetitiveCourseType, createCacheKey, shouldSkipRequest, updateLoadingState]);

  // Fetch subjects based on course type, course, class/exam
  const fetchSubjectsForFilters = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) {
      setFilteredSubjects([]);
      return;
    }

    const key = createCacheKey('subjects', courseTypeId, courseId, classId, examId);
    if (shouldSkipRequest('subjects', key)) return;

    try {
      abortPreviousRequest('subjects');
      updateLoadingState('subjects', true);

      let data = [];
      
      if (isAcademicCourseType(courseTypeId) && classId) {
        data = await fetchSubjects(courseTypeId, courseId, classId, null, true);
      } else if (isCompetitiveCourseType(courseTypeId) && examId) {
        data = await fetchSubjects(courseTypeId, courseId, null, examId, true);
      } else if (isProfessionalCourseType(courseTypeId)) {
        data = await fetchSubjects(courseTypeId, courseId, null, null, true);
      }

      setFilteredSubjects(data || []);
      lastFetchRef.current.subjects = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching subjects:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch subjects',
          duration: 3000
        });
        setFilteredSubjects([]);
      }
    } finally {
      updateLoadingState('subjects', false);
    }
  }, [fetchSubjects, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, createCacheKey, shouldSkipRequest, abortPreviousRequest, updateLoadingState, addNotification]);

  // Fetch topics based on subject linkage
  const fetchTopicsForFilters = useCallback(async (courseTypeId, subjectId) => {
    if (!courseTypeId || !subjectId) {
      setFilteredTopics([]);
      return;
    }

    const key = createCacheKey('topics', courseTypeId, subjectId);
    if (shouldSkipRequest('topics', key)) return;

    try {
      abortPreviousRequest('topics');
      updateLoadingState('topics', true);

      const data = await fetchTopicsByLinkage(parseInt(courseTypeId), parseInt(subjectId));
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      
      setFilteredTopics(list || []);
      lastFetchRef.current.topics = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching topics:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch topics',
          duration: 3000
        });
        setFilteredTopics([]);
      }
    } finally {
      updateLoadingState('topics', false);
    }
  }, [fetchTopicsByLinkage, createCacheKey, shouldSkipRequest, abortPreviousRequest, updateLoadingState, addNotification]);

  // Fetch modules based on topic
  const fetchModulesForFilters = useCallback(async (topicId) => {
    if (!topicId) {
      setFilteredModules([]);
      return;
    }

    const key = createCacheKey('modules', topicId, showActiveOnly);
    if (shouldSkipRequest('modules', key)) return;

    try {
      abortPreviousRequest('modules');
      updateLoadingState('modules', true);

      const data = await fetchModulesByTopic(topicId, showActiveOnly);
      setFilteredModules(data || []);
      
      lastFetchRef.current.modules = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching modules:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch modules',
          duration: 3000
        });
        setFilteredModules([]);
      }
    } finally {
      updateLoadingState('modules', false);
    }
  }, [fetchModulesByTopic, showActiveOnly, createCacheKey, shouldSkipRequest, abortPreviousRequest, updateLoadingState, addNotification]);

  // Fetch chapters based on module
  const fetchChaptersForFilters = useCallback(async (moduleId) => {
    if (!moduleId) {
      setFilteredChapters([]);
      return;
    }

    const key = createCacheKey('chapters', moduleId, showActiveOnly);
    if (shouldSkipRequest('chapters', key)) return;

    try {
      abortPreviousRequest('chapters');
      updateLoadingState('chapters', true);

      const data = await fetchChaptersByModule(moduleId, showActiveOnly);
      setFilteredChapters(data || []);
      
      lastFetchRef.current.chapters = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching chapters:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch chapters',
          duration: 3000
        });
        setFilteredChapters([]);
      }
    } finally {
      updateLoadingState('chapters', false);
    }
  }, [fetchChaptersByModule, showActiveOnly, createCacheKey, shouldSkipRequest, abortPreviousRequest, updateLoadingState, addNotification]);

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
    setFilteredSubjects([]);
    setFilteredTopics([]);
    setFilteredModules([]);
    setFilteredChapters([]);
  }, []);

  // Debounce ref for consolidated effect
  const debounceRef = useRef(null);

  // Single consolidated effect with debouncing to prevent cascading API calls
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced execution
    debounceRef.current = setTimeout(async () => {
      console.log('🔄 Consolidated filter effect triggered:', {
        courseType: selectedCourseType,
        course: selectedCourse,
        class: selectedClass,
        exam: selectedExam,
        subject: selectedSubject,
        topic: selectedTopic,
        module: selectedModule
      });

      try {
        // Step 1: Fetch courses when course type changes
        if (selectedCourseType) {
          await fetchCoursesForFilters(selectedCourseType);
        }

        // Step 2: Fetch classes/exams when course type and course are selected
        if (selectedCourseType && selectedCourse) {
          await fetchClassesAndExams(selectedCourseType, selectedCourse);
        }

        // Step 3: Fetch subjects when we have the required dependencies
        if (selectedCourseType && selectedCourse) {
          await fetchSubjectsForFilters(selectedCourseType, selectedCourse, selectedClass, selectedExam);
        }

        // Step 4: Fetch topics when we have subject selected
        if (selectedCourseType && selectedSubject) {
          await fetchTopicsForFilters(selectedCourseType, selectedSubject);
        }

        // Step 5: Fetch modules when we have topic selected
        if (selectedTopic) {
          await fetchModulesForFilters(selectedTopic);
        }

        // Step 6: Fetch chapters when we have module selected
        if (selectedModule) {
          await fetchChaptersForFilters(selectedModule);
        }

        console.log('✅ All filter data loaded successfully');
      } catch (error) {
        console.error('❌ Error in consolidated filter effect:', error);
      }
    }, 400); // 400ms debounce to prevent rapid API calls

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
    fetchCoursesForFilters,
    fetchClassesAndExams,
    fetchSubjectsForFilters,
    fetchTopicsForFilters,
    fetchModulesForFilters,
    fetchChaptersForFilters
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear debounce timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // Abort all pending requests
      Object.values(abortControllersRef.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
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
    loadingStates,
    
    // Actions
    resetFilters,
    
    // Helpers
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType
  };
};
