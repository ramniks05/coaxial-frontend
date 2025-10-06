import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useFormManager } from './useFormManager';
import { useMasterData } from './useMasterData';

/**
 * Custom hook for managing master data forms with cascading dropdowns
 * Provides consistent form behavior across all master data components
 */
export const useMasterDataForm = (initialFormData, validationRules, onSubmit) => {
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

  // Form management
  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    validateForm,
    resetForm,
    setFormData
  } = useFormManager(initialFormData, validationRules);

  // Form-specific filtered data
  const [formFilteredCourses, setFormFilteredCourses] = useState([]);
  const [formFilteredClasses, setFormFilteredClasses] = useState([]);
  const [formFilteredExams, setFormFilteredExams] = useState([]);
  const [formFilteredSubjects, setFormFilteredSubjects] = useState([]);
  const [formFilteredTopics, setFormFilteredTopics] = useState([]);
  const [formFilteredModules, setFormFilteredModules] = useState([]);
  const [formFilteredChapters, setFormFilteredChapters] = useState([]);

  // Form loading states
  const [formLoadingStates, setFormLoadingStates] = useState({
    courses: false,
    classes: false,
    exams: false,
    subjects: false,
    topics: false,
    modules: false,
    chapters: false
  });

  // Deduplication refs for form
  const formLastFetchRef = useRef({
    courses: { key: '', timestamp: 0 },
    classes: { key: '', timestamp: 0 },
    exams: { key: '', timestamp: 0 },
    subjects: { key: '', timestamp: 0 },
    topics: { key: '', timestamp: 0 },
    modules: { key: '', timestamp: 0 },
    chapters: { key: '', timestamp: 0 }
  });

  // Abort controllers for form
  const formAbortControllersRef = useRef({});

  // Helper to create cache key
  const createCacheKey = useCallback((...args) => {
    return args.filter(Boolean).join('|');
  }, []);

  // Helper to check if request should be skipped
  const shouldSkipRequest = useCallback((type, key) => {
    const lastFetch = formLastFetchRef.current[type];
    const now = Date.now();
    return lastFetch.key === key && (now - lastFetch.timestamp) < 1000; // 1 second deduplication
  }, []);

  // Helper to update loading state
  const updateFormLoadingState = useCallback((type, isLoading) => {
    setFormLoadingStates(prev => ({ ...prev, [type]: isLoading }));
  }, []);

  // Helper to abort previous request
  const abortFormPreviousRequest = useCallback((type) => {
    if (formAbortControllersRef.current[type]) {
      formAbortControllersRef.current[type].abort();
    }
    formAbortControllersRef.current[type] = new AbortController();
  }, []);

  // Fetch courses for form
  const fetchFormCourses = useCallback(async (courseTypeId) => {
    if (!courseTypeId) {
      setFormFilteredCourses([]);
      return;
    }

    const key = createCacheKey('form-courses', courseTypeId);
    if (shouldSkipRequest('courses', key)) return;

    try {
      abortFormPreviousRequest('courses');
      updateFormLoadingState('courses', true);

      const data = await fetchCourses(courseTypeId);
      setFormFilteredCourses(data || []);
      
      formLastFetchRef.current.courses = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching form courses:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch courses',
          duration: 3000
        });
        setFormFilteredCourses([]);
      }
    } finally {
      updateFormLoadingState('courses', false);
    }
  }, [fetchCourses, createCacheKey, shouldSkipRequest, abortFormPreviousRequest, updateFormLoadingState, addNotification]);

  // Fetch classes and exams for form
  const fetchFormClassesAndExams = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFormFilteredClasses([]);
      setFormFilteredExams([]);
      return;
    }

    const promises = [];
    
    if (isAcademicCourseType(courseTypeId)) {
      const classKey = createCacheKey('form-classes', courseTypeId, courseId);
      if (!shouldSkipRequest('classes', classKey)) {
        promises.push(
          fetchClasses(courseTypeId, courseId).then(data => {
            setFormFilteredClasses(data || []);
            formLastFetchRef.current.classes = { key: classKey, timestamp: Date.now() };
          }).catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Error fetching form classes:', error);
              setFormFilteredClasses([]);
            }
          })
        );
      }
    }

    if (isCompetitiveCourseType(courseTypeId)) {
      const examKey = createCacheKey('form-exams', courseTypeId, courseId);
      if (!shouldSkipRequest('exams', examKey)) {
        promises.push(
          fetchExams(courseTypeId, courseId).then(data => {
            setFormFilteredExams(data || []);
            formLastFetchRef.current.exams = { key: examKey, timestamp: Date.now() };
          }).catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Error fetching form exams:', error);
              setFormFilteredExams([]);
            }
          })
        );
      }
    }

    if (promises.length > 0) {
      updateFormLoadingState('classes', true);
      updateFormLoadingState('exams', true);
      
      try {
        await Promise.all(promises);
      } finally {
        updateFormLoadingState('classes', false);
        updateFormLoadingState('exams', false);
      }
    }
  }, [fetchClasses, fetchExams, isAcademicCourseType, isCompetitiveCourseType, createCacheKey, shouldSkipRequest, updateFormLoadingState]);

  // Fetch subjects for form
  const fetchFormSubjects = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId) {
      setFormFilteredSubjects([]);
      return;
    }

    const key = createCacheKey('form-subjects', courseTypeId, courseId, classId, examId);
    if (shouldSkipRequest('subjects', key)) return;

    try {
      abortFormPreviousRequest('subjects');
      updateFormLoadingState('subjects', true);

      let data = [];
      
      if (isAcademicCourseType(courseTypeId) && classId) {
        data = await fetchSubjects(courseTypeId, courseId, classId, null, true);
      } else if (isCompetitiveCourseType(courseTypeId) && examId) {
        data = await fetchSubjects(courseTypeId, courseId, null, examId, true);
      } else if (isProfessionalCourseType(courseTypeId)) {
        data = await fetchSubjects(courseTypeId, courseId, null, null, true);
      }

      setFormFilteredSubjects(data || []);
      formLastFetchRef.current.subjects = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching form subjects:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch subjects',
          duration: 3000
        });
        setFormFilteredSubjects([]);
      }
    } finally {
      updateFormLoadingState('subjects', false);
    }
  }, [fetchSubjects, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, createCacheKey, shouldSkipRequest, abortFormPreviousRequest, updateFormLoadingState, addNotification]);

  // Fetch topics for form
  const fetchFormTopics = useCallback(async (courseTypeId, subjectId) => {
    if (!courseTypeId || !subjectId) {
      setFormFilteredTopics([]);
      return;
    }

    const key = createCacheKey('form-topics', courseTypeId, subjectId);
    if (shouldSkipRequest('topics', key)) return;

    try {
      abortFormPreviousRequest('topics');
      updateFormLoadingState('topics', true);

      const data = await fetchTopicsByLinkage(parseInt(courseTypeId), parseInt(subjectId));
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      
      setFormFilteredTopics(list || []);
      formLastFetchRef.current.topics = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching form topics:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch topics',
          duration: 3000
        });
        setFormFilteredTopics([]);
      }
    } finally {
      updateFormLoadingState('topics', false);
    }
  }, [fetchTopicsByLinkage, createCacheKey, shouldSkipRequest, abortFormPreviousRequest, updateFormLoadingState, addNotification]);

  // Fetch modules for form
  const fetchFormModules = useCallback(async (topicId) => {
    if (!topicId) {
      setFormFilteredModules([]);
      return;
    }

    const key = createCacheKey('form-modules', topicId);
    if (shouldSkipRequest('modules', key)) return;

    try {
      abortFormPreviousRequest('modules');
      updateFormLoadingState('modules', true);

      const data = await fetchModulesByTopic(topicId, true);
      setFormFilteredModules(data || []);
      
      formLastFetchRef.current.modules = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching form modules:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch modules',
          duration: 3000
        });
        setFormFilteredModules([]);
      }
    } finally {
      updateFormLoadingState('modules', false);
    }
  }, [fetchModulesByTopic, createCacheKey, shouldSkipRequest, abortFormPreviousRequest, updateFormLoadingState, addNotification]);

  // Fetch chapters for form
  const fetchFormChapters = useCallback(async (moduleId) => {
    if (!moduleId) {
      setFormFilteredChapters([]);
      return;
    }

    const key = createCacheKey('form-chapters', moduleId);
    if (shouldSkipRequest('chapters', key)) return;

    try {
      abortFormPreviousRequest('chapters');
      updateFormLoadingState('chapters', true);

      const data = await fetchChaptersByModule(moduleId, true);
      setFormFilteredChapters(data || []);
      
      formLastFetchRef.current.chapters = { key, timestamp: Date.now() };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching form chapters:', error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch chapters',
          duration: 3000
        });
        setFormFilteredChapters([]);
      }
    } finally {
      updateFormLoadingState('chapters', false);
    }
  }, [fetchChaptersByModule, createCacheKey, shouldSkipRequest, abortFormPreviousRequest, updateFormLoadingState, addNotification]);

  // Enhanced form submission with validation
  const handleFormSubmit = useCallback(async (e) => {
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

    // Call the provided onSubmit function
    if (onSubmit) {
      await onSubmit(formData);
    }
  }, [formData, formFilteredSubjects.length, validateForm, addNotification, isAcademicCourseType, isCompetitiveCourseType, onSubmit]);

  // Reset form and all dependent data
  const resetFormWithData = useCallback(() => {
    resetForm();
    setFormFilteredCourses([]);
    setFormFilteredClasses([]);
    setFormFilteredExams([]);
    setFormFilteredSubjects([]);
    setFormFilteredTopics([]);
    setFormFilteredModules([]);
    setFormFilteredChapters([]);
  }, [resetForm]);

  // Effects for cascading form data loading
  useEffect(() => {
    fetchFormCourses(formData.courseTypeId);
  }, [formData.courseTypeId, fetchFormCourses]);

  useEffect(() => {
    fetchFormClassesAndExams(formData.courseTypeId, formData.courseId);
  }, [formData.courseTypeId, formData.courseId, fetchFormClassesAndExams]);

  useEffect(() => {
    fetchFormSubjects(formData.courseTypeId, formData.courseId, formData.classId, formData.examId);
  }, [formData.courseTypeId, formData.courseId, formData.classId, formData.examId, fetchFormSubjects]);

  useEffect(() => {
    fetchFormTopics(formData.courseTypeId, formData.subjectId);
  }, [formData.courseTypeId, formData.subjectId, fetchFormTopics]);

  useEffect(() => {
    fetchFormModules(formData.topicId);
  }, [formData.topicId, fetchFormModules]);

  useEffect(() => {
    fetchFormChapters(formData.moduleId);
  }, [formData.moduleId, fetchFormChapters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(formAbortControllersRef.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);

  return {
    // Form state
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    validateForm,
    resetForm: resetFormWithData,
    setFormData,
    handleSubmit: handleFormSubmit,
    
    // Form filtered data
    formFilteredCourses,
    formFilteredClasses,
    formFilteredExams,
    formFilteredSubjects,
    formFilteredTopics,
    formFilteredModules,
    formFilteredChapters,
    
    // Form loading states
    formLoadingStates,
    
    // Helpers
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType
  };
};
