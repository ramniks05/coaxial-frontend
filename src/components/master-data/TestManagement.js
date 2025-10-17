import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useApiManager } from '../../hooks/useApiManager';
import { useFormManager } from '../../hooks/useFormManager';
import { getCourseTypesCached } from '../../services/globalApiCache';
import {
    addQuestionToTest,
    createTest,
    deleteTest,
    getChaptersByModule,
    getClasses,
    getCourses,
    getExams,
    getModulesByTopic,
    getSubjects,
    getTests,
    getTopicsByLinkage,
    publishTest,
    unpublishTest,
    updateTest
} from '../../services/masterDataService';
import { getMasterExamsKV } from '../../services/questionTaggingService';
import AdminPageHeader from '../common/AdminPageHeader';
import './MasterDataComponent.css';
import QuestionSelectionModal from './QuestionSelectionModal';
import TestAnalytics from './TestAnalytics';
import TestListCard from './TestListCard';
import TestQuestionManager from './TestQuestionManager';
import TestTemplates from './TestTemplates';

const TestManagement = ({ onBackToDashboard }) => {
  console.log('=== TestManagement component rendering ===');
  const { token, addNotification } = useApp();
  console.log('Token available:', !!token);
  console.log('Token length:', token ? token.length : 0);
  const { executeApiCall } = useApiManager();
  console.log('executeApiCall function:', typeof executeApiCall);
  
  // State for master exams
  const [masterExams, setMasterExams] = useState([]);
  
  // State for content hierarchy (mock data)
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Form management
  const initialFormData = {
    testName: '',
    description: '',
    instructions: '',
    timeLimitMinutes: '',
    totalMarks: '',
    passingMarks: '',
    negativeMarking: false,
    negativeMarkPercentage: 0,
    maxAttempts: 1,
    isPublished: false,
    startDate: '',
    endDate: '',
    masterExamId: '',
    testType: 'PRACTICE', // PRACTICE, MOCK, FINAL, QUIZ
    allowReview: true,
    showCorrectAnswers: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    allowSkip: true,
    timePerQuestion: 0, // 0 = use total time limit
    
    // NEW: Test Creation Mode and Content Linkage
    testCreationMode: 'EXAM_BASED', // EXAM_BASED (default) or CONTENT_BASED
    testLevel: 'CLASS_EXAM', // CLASS_EXAM, SUBJECT, MODULE, CHAPTER (for CONTENT_BASED only)
    courseTypeId: '',
    courseId: '',
    classId: '',
    examId: '',
    subjectLinkageId: '',
    topicId: '',
    moduleId: '',
    chapterId: ''
  };

  const validationRules = {
    testName: (value) => {
      if (!value) return 'Test name is required';
      if (value.length < 5) return 'Test name must be at least 5 characters';
      if (value.length > 100) return 'Test name must be less than 100 characters';
      return '';
    },
    timeLimitMinutes: (value) => {
      if (!value) return 'Time limit is required';
      if (value < 1) return 'Time limit must be at least 1 minute';
      if (value > 480) return 'Time limit cannot exceed 8 hours';
      return '';
    },
    totalMarks: (value) => {
      if (!value) return 'Total marks is required';
      if (value < 1) return 'Total marks must be at least 1';
      if (value > 1000) return 'Total marks cannot exceed 1000';
      return '';
    },
    passingMarks: (value, formData) => {
      if (!value) return 'Passing marks is required';
      if (value < 1) return 'Passing marks must be at least 1';
      if (formData.totalMarks && value > formData.totalMarks) {
        return 'Passing marks cannot exceed total marks';
      }
      return '';
    },
    masterExamId: (value, formData) => {
      if (formData.testCreationMode === 'EXAM_BASED' && !value) {
        return 'Master exam is required for exam-based tests';
      }
      return '';
    },
    maxAttempts: (value) => {
      if (value < 1) return 'Max attempts must be at least 1';
      if (value > 10) return 'Max attempts cannot exceed 10';
      return '';
    },
    // NEW: Content-based test validation
    courseTypeId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && !value) {
        return 'Course type is required for content-based tests';
      }
      return '';
    },
    courseId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && !value) {
        return 'Course is required for content-based tests';
      }
      return '';
    },
    classId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && 
          parseInt(formData.courseTypeId) === 1 && 
          !value) {
        return 'Class is required for academic courses';
      }
      return '';
    },
    examId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && 
          parseInt(formData.courseTypeId) === 2 && 
          !value) {
        return 'Exam is required for competitive courses';
      }
      return '';
    },
    subjectLinkageId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && 
          (formData.testLevel === 'SUBJECT' || formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') && 
          !value) {
        return 'Subject is required for this test level';
      }
      return '';
    },
    topicId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && 
          (formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') && 
          !value) {
        return 'Topic is required for this test level';
      }
      return '';
    },
    moduleId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && 
          (formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') && 
          !value) {
        return 'Module is required for this test level';
      }
      return '';
    },
    chapterId: (value, formData) => {
      if (formData.testCreationMode === 'CONTENT_BASED' && 
          formData.testLevel === 'CHAPTER' && 
          !value) {
        return 'Chapter is required for chapter-level tests';
      }
      return '';
    }
  };

  const {
    formData,
    errors,
    touched,
    handleInputChange: originalHandleInputChange,
    handleBlur: originalHandleBlur,
    validateForm,
    resetForm,
    setFormData
  } = useFormManager(initialFormData, validationRules);

  // Wrapper functions to handle event objects
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Clear dependent fields when parent fields change
    if (name === 'testCreationMode') {
      // Clear all content fields when switching modes
      originalHandleInputChange('courseTypeId', '');
      originalHandleInputChange('courseId', '');
      originalHandleInputChange('classId', '');
      originalHandleInputChange('examId', '');
      originalHandleInputChange('subjectLinkageId', '');
      originalHandleInputChange('topicId', '');
      originalHandleInputChange('moduleId', '');
      originalHandleInputChange('chapterId', '');
    } else if (name === 'courseTypeId') {
      // Clear courses and all dependent fields
      originalHandleInputChange('courseId', '');
      originalHandleInputChange('classId', '');
      originalHandleInputChange('examId', '');
      originalHandleInputChange('subjectLinkageId', '');
      originalHandleInputChange('topicId', '');
      originalHandleInputChange('moduleId', '');
      originalHandleInputChange('chapterId', '');
    } else if (name === 'courseId') {
      // Clear classes/exams and dependent fields
      originalHandleInputChange('classId', '');
      originalHandleInputChange('examId', '');
      originalHandleInputChange('subjectLinkageId', '');
      originalHandleInputChange('topicId', '');
      originalHandleInputChange('moduleId', '');
      originalHandleInputChange('chapterId', '');
    } else if (name === 'classId' || name === 'examId') {
      // Clear subjects and dependent fields
      originalHandleInputChange('subjectLinkageId', '');
      originalHandleInputChange('topicId', '');
      originalHandleInputChange('moduleId', '');
      originalHandleInputChange('chapterId', '');
    } else if (name === 'subjectLinkageId') {
      // Clear topics and dependent fields
      originalHandleInputChange('topicId', '');
      originalHandleInputChange('moduleId', '');
      originalHandleInputChange('chapterId', '');
    } else if (name === 'topicId') {
      // Clear modules and dependent fields
      originalHandleInputChange('moduleId', '');
      originalHandleInputChange('chapterId', '');
    } else if (name === 'moduleId') {
      // Clear chapters
      originalHandleInputChange('chapterId', '');
    }
    
    originalHandleInputChange(name, fieldValue);
  }, [originalHandleInputChange]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    originalHandleBlur(name);
  }, [originalHandleBlur]);

  // Component state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Advanced UI states
  const [activeTab, setActiveTab] = useState('tests'); // tests, analytics, templates
  const [showQuestionSelection, setShowQuestionSelection] = useState(false);
  const [showTestQuestionManager, setShowTestQuestionManager] = useState(false);
  const [showTestAnalytics, setShowTestAnalytics] = useState(false);
  const [showTestTemplates, setShowTestTemplates] = useState(false);
  
  // Filter states
  const [selectedMasterExam, setSelectedMasterExam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Bulk operations state
  const [selectedTests, setSelectedTests] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch master exams
  const fetchMasterExams = useCallback(async () => {
    try {
      const data = await executeApiCall(getMasterExamsKV, token);
      if (data) {
        setMasterExams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching master exams:', error);
      addNotification({ 
        message: 'Failed to fetch master exams', 
        type: 'error' 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Removed executeApiCall and addNotification

  // Load course types from API
  const loadCourseTypes = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getCourseTypesCached(token);
      console.log('Raw courseTypes API response:', data);
      console.log('CourseTypes data type:', typeof data);
      console.log('CourseTypes is array:', Array.isArray(data));
      
      // Handle different response formats
      let courseTypesArray = [];
      if (Array.isArray(data)) {
        courseTypesArray = data;
      } else if (data && Array.isArray(data.content)) {
        // Handle paginated response
        courseTypesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        // Handle wrapped response
        courseTypesArray = data.data;
      } else if (data && data.courseTypes && Array.isArray(data.courseTypes)) {
        // Handle nested response
        courseTypesArray = data.courseTypes;
      } else {
        console.warn('Unexpected courseTypes data format:', data);
        courseTypesArray = [];
      }
      
      console.log('Processed courseTypes array:', courseTypesArray);
      setCourseTypes(courseTypesArray);
    } catch (error) {
      console.error('Error loading course types:', error);
      addNotification({ 
        message: 'Failed to load course types', 
        type: 'error' 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Removed addNotification

  // Load courses based on courseTypeId
  const loadCourses = useCallback(async (courseTypeId) => {
    if (!courseTypeId || !token) {
      setCourses([]);
      return;
    }
    try {
      const data = await getCourses(token, courseTypeId);
      console.log('Courses API response:', data);
      
      // Handle different response formats
      let coursesArray = [];
      if (Array.isArray(data)) {
        coursesArray = data;
      } else if (data && Array.isArray(data.content)) {
        coursesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        coursesArray = data.data;
      }
      
      console.log('Processed courses array:', coursesArray);
      setCourses(coursesArray);
    } catch (error) {
      console.error('Error loading courses:', error);
      addNotification({ 
        message: 'Failed to load courses', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);

  // Load classes (Academic) based on courseId
  const loadClasses = useCallback(async (courseTypeId, courseId) => {
    if (!courseId || parseInt(courseTypeId) !== 1 || !token) {
      setClasses([]);
      return;
    }
    try {
      const data = await getClasses(token, courseTypeId, courseId);
      console.log('Classes API response:', data);
      
      // Handle different response formats
      let classesArray = [];
      if (Array.isArray(data)) {
        classesArray = data;
      } else if (data && Array.isArray(data.content)) {
        classesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        classesArray = data.data;
      }
      
      console.log('Processed classes array:', classesArray);
      setClasses(classesArray);
    } catch (error) {
      console.error('Error loading classes:', error);
      addNotification({ 
        message: 'Failed to load classes', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);

  // Load exams (Competitive) based on courseId
  const loadExams = useCallback(async (courseTypeId, courseId) => {
    if (!courseId || parseInt(courseTypeId) !== 2 || !token) {
      setExams([]);
      return;
    }
    try {
      const data = await getExams(token, courseTypeId, courseId);
      console.log('Exams API response:', data);
      
      // Handle different response formats
      let examsArray = [];
      if (Array.isArray(data)) {
        examsArray = data;
      } else if (data && Array.isArray(data.content)) {
        examsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        examsArray = data.data;
      }
      
      console.log('Processed exams array:', examsArray);
      setExams(examsArray);
    } catch (error) {
      console.error('Error loading exams:', error);
      addNotification({ 
        message: 'Failed to load exams', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);

  // Load subjects based on class or exam (using getSubjects like ChapterForm)
  const loadSubjects = useCallback(async (courseTypeId, courseId, classId, examId) => {
    if (!courseTypeId || !courseId || !token) {
      setSubjects([]);
      return;
    }
    try {
      // Use getSubjects which internally calls getAllSubjectLinkages
      const data = await getSubjects(token, courseTypeId, courseId, classId, examId, true);
      console.log('Subjects API response:', data);
      
      // Handle different response formats
      let subjectsArray = [];
      if (Array.isArray(data)) {
        subjectsArray = data;
      } else if (data && Array.isArray(data.content)) {
        subjectsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        subjectsArray = data.data;
      }
      
      console.log('Processed subjects array:', subjectsArray);
      setSubjects(subjectsArray);
    } catch (error) {
      console.error('Error loading subjects:', error);
      addNotification({ 
        message: 'Failed to load subjects', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);

  // Load topics based on subject linkage
  const loadTopics = useCallback(async (subjectLinkageId, courseTypeId) => {
    if (!subjectLinkageId || !courseTypeId || !token) {
      setTopics([]);
      return;
    }
    try {
      const data = await getTopicsByLinkage(token, courseTypeId, subjectLinkageId);
      console.log('Topics API response:', data);
      
      // Handle different response formats
      let topicsArray = [];
      if (Array.isArray(data)) {
        topicsArray = data;
      } else if (data && Array.isArray(data.content)) {
        topicsArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        topicsArray = data.data;
      }
      
      const mappedTopics = topicsArray.map(t => ({
        ...t,
        id: t.id || t.topicId,
        name: t.name || t.topicName
      }));
      
      console.log('Processed topics array:', mappedTopics);
      setTopics(mappedTopics);
    } catch (error) {
      console.error('Error loading topics:', error);
      addNotification({ 
        message: 'Failed to load topics', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);

  // Load modules based on topic
  const loadModulesForForm = useCallback(async (topicId) => {
    if (!topicId || !token) {
      setModules([]);
      return;
    }
    try {
      const data = await getModulesByTopic(token, topicId);
      console.log('Modules API response:', data);
      
      // Handle different response formats
      let modulesArray = [];
      if (Array.isArray(data)) {
        modulesArray = data;
      } else if (data && Array.isArray(data.content)) {
        modulesArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        modulesArray = data.data;
      }
      
      const mappedModules = modulesArray.map(m => ({
        ...m,
        id: m.id || m.moduleId,
        name: m.name || m.moduleName
      }));
      
      console.log('Processed modules array:', mappedModules);
      setModules(mappedModules);
    } catch (error) {
      console.error('Error loading modules:', error);
      addNotification({ 
        message: 'Failed to load modules', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);

  // Load chapters based on module
  const loadChaptersForForm = useCallback(async (moduleId) => {
    if (!moduleId || !token) {
      setChapters([]);
      return;
    }
    try {
      const data = await getChaptersByModule(token, moduleId);
      console.log('Chapters API response:', data);
      
      // Handle different response formats
      let chaptersArray = [];
      if (Array.isArray(data)) {
        chaptersArray = data;
      } else if (data && Array.isArray(data.content)) {
        chaptersArray = data.content;
      } else if (data && Array.isArray(data.data)) {
        chaptersArray = data.data;
      }
      
      const mappedChapters = chaptersArray.map(ch => ({
        ...ch,
        id: ch.id || ch.chapterId,
        name: ch.name || ch.chapterName
      }));
      
      console.log('Processed chapters array:', mappedChapters);
      setChapters(mappedChapters);
    } catch (error) {
      console.error('Error loading chapters:', error);
      addNotification({ 
        message: 'Failed to load chapters', 
        type: 'error' 
      });
    }
  }, [token, addNotification]);


  // Initialize master exams and course types on component mount
  useEffect(() => {
    if (token) {
      fetchMasterExams();
      loadCourseTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only run when token changes

  // Cascading: Load courses when courseTypeId changes
  useEffect(() => {
    if (formData.courseTypeId && formData.testCreationMode === 'CONTENT_BASED') {
      loadCourses(formData.courseTypeId);
    }
  }, [formData.courseTypeId, formData.testCreationMode, loadCourses]);

  // Cascading: Load classes or exams when courseId changes
  useEffect(() => {
    if (formData.courseId && formData.testCreationMode === 'CONTENT_BASED') {
      if (parseInt(formData.courseTypeId) === 1) {
        loadClasses(formData.courseTypeId, formData.courseId);
      } else if (parseInt(formData.courseTypeId) === 2) {
        loadExams(formData.courseTypeId, formData.courseId);
      }
    }
  }, [formData.courseId, formData.courseTypeId, formData.testCreationMode, loadClasses, loadExams]);

  // Cascading: Load subjects when class or exam changes
  useEffect(() => {
    if (formData.testCreationMode === 'CONTENT_BASED' && 
        formData.courseTypeId && 
        formData.courseId && 
        (formData.classId || formData.examId)) {
      loadSubjects(formData.courseTypeId, formData.courseId, formData.classId, formData.examId);
    }
  }, [formData.classId, formData.examId, formData.courseTypeId, formData.courseId, formData.testCreationMode, loadSubjects]);

  // Cascading: Load topics when subject changes
  useEffect(() => {
    if (formData.subjectLinkageId && formData.courseTypeId && formData.testCreationMode === 'CONTENT_BASED') {
      loadTopics(formData.subjectLinkageId, formData.courseTypeId);
    }
  }, [formData.subjectLinkageId, formData.courseTypeId, formData.testCreationMode, loadTopics]);

  // Cascading: Load modules when topic changes
  useEffect(() => {
    if (formData.topicId && formData.testCreationMode === 'CONTENT_BASED') {
      loadModulesForForm(formData.topicId);
    }
  }, [formData.topicId, formData.testCreationMode, loadModulesForForm]);

  // Cascading: Load chapters when module changes
  useEffect(() => {
    if (formData.moduleId && formData.testCreationMode === 'CONTENT_BASED') {
      loadChaptersForForm(formData.moduleId);
    }
  }, [formData.moduleId, formData.testCreationMode, loadChaptersForForm]);

  // Fetch tests data when component mounts or filters change
  useEffect(() => {
    console.log('=== useEffect for fetchTestsData triggered ===');
    console.log('Token available:', !!token);
    console.log('Token value:', token);
    console.log('Current filter values:', { selectedMasterExam, selectedStatus, searchTerm, showActiveOnly });
    console.log('executeApiCall available:', !!executeApiCall);
    console.log('addNotification available:', !!addNotification);
    
    if (!token) {
      console.log('No token available, skipping fetchTestsData');
      return;
    }
    
    console.log('Token is available, proceeding with API call...');
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters = {
          active: showActiveOnly,
          masterExamId: selectedMasterExam || undefined,
          status: selectedStatus || undefined,
          search: searchTerm || undefined
        };

        console.log('About to call getTests API with:', { token: !!token, filters });
        console.log('API endpoint will be: /api/admin/master-data/tests');
        
        const result = await executeApiCall(getTests, token, filters);

        console.log('Tests API result:', result);
        if (result) {
          const testsArray = Array.isArray(result) ? result : result.data || [];
          console.log('Setting tests array:', testsArray);
          setTests(testsArray);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
        addNotification({ 
          message: 'Failed to fetch tests', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedMasterExam, selectedStatus, searchTerm, showActiveOnly]); // Removed executeApiCall and addNotification to prevent infinite loops

  // Function to manually trigger data refresh
  const refreshTests = useCallback(async () => {
    console.log('Manually refreshing tests...');
    if (!token) return;
    
    setLoading(true);
    try {
      const filters = {
        active: showActiveOnly,
        masterExamId: selectedMasterExam || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined
      };

      console.log('Manually fetching tests with filters:', filters);
      const result = await executeApiCall(getTests, token, filters);

      if (result) {
        const testsArray = Array.isArray(result) ? result : result.data || [];
        setTests(testsArray);
      }
    } catch (error) {
      console.error('Error refreshing tests:', error);
      addNotification({ 
        message: 'Failed to refresh tests', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedMasterExam, selectedStatus, searchTerm, showActiveOnly]); // Removed executeApiCall and addNotification

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({ 
        message: 'Please fix the validation errors', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare base payload with common fields
      const basePayload = {
        testName: formData.testName,
        description: formData.description,
        instructions: formData.instructions,
        timeLimitMinutes: parseInt(formData.timeLimitMinutes),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        negativeMarking: formData.negativeMarking,
        negativeMarkPercentage: formData.negativeMarking ? parseFloat(formData.negativeMarkPercentage) : 0,
        maxAttempts: parseInt(formData.maxAttempts),
        isPublished: formData.isPublished,
        startDate: formData.startDate,
        endDate: formData.endDate,
        testType: formData.testType,
        allowReview: formData.allowReview,
        showCorrectAnswers: formData.showCorrectAnswers,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleOptions: formData.shuffleOptions,
        allowSkip: formData.allowSkip,
        timePerQuestion: parseInt(formData.timePerQuestion) || 0,
        testCreationMode: formData.testCreationMode
      };

      // Add mode-specific fields
      if (formData.testCreationMode === 'EXAM_BASED') {
        // EXAM_BASED: Only masterExamId
        basePayload.masterExamId = parseInt(formData.masterExamId);
        // Explicitly set content fields to null
        basePayload.testLevel = null;
        basePayload.courseTypeId = null;
        basePayload.courseId = null;
        basePayload.classId = null;
        basePayload.examId = null;
        basePayload.subjectLinkageId = null;
        basePayload.topicId = null;
        basePayload.moduleId = null;
        basePayload.chapterId = null;
      } else if (formData.testCreationMode === 'CONTENT_BASED') {
        // CONTENT_BASED: Add content hierarchy based on testLevel
        basePayload.testLevel = formData.testLevel;
        basePayload.masterExamId = formData.masterExamId ? parseInt(formData.masterExamId) : null;
        basePayload.courseTypeId = parseInt(formData.courseTypeId);
        basePayload.courseId = parseInt(formData.courseId);
        
        // Add class or exam based on courseType
        if (parseInt(formData.courseTypeId) === 1 && formData.classId) {
          basePayload.classId = parseInt(formData.classId);
          basePayload.examId = null;
        } else if (parseInt(formData.courseTypeId) === 2 && formData.examId) {
          basePayload.examId = parseInt(formData.examId);
          basePayload.classId = null;
        }
        
        // Add subject/topic/module/chapter based on testLevel
        if (formData.testLevel === 'SUBJECT' || formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') {
          basePayload.subjectLinkageId = formData.subjectLinkageId ? parseInt(formData.subjectLinkageId) : null;
        } else {
          basePayload.subjectLinkageId = null;
        }
        
        if (formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') {
          basePayload.topicId = formData.topicId ? parseInt(formData.topicId) : null;
          basePayload.moduleId = formData.moduleId ? parseInt(formData.moduleId) : null;
        } else {
          basePayload.topicId = null;
          basePayload.moduleId = null;
        }
        
        if (formData.testLevel === 'CHAPTER') {
          basePayload.chapterId = formData.chapterId ? parseInt(formData.chapterId) : null;
        } else {
          basePayload.chapterId = null;
        }
      }

      console.log('Submitting test payload:', basePayload);

      if (editingId) {
        const result = await executeApiCall(updateTest, token, editingId, basePayload);
        if (result) {
          addNotification({ 
            message: 'Test updated successfully', 
            type: 'success' 
          });
          handleCancel();
          refreshTests();
        }
      } else {
        const result = await executeApiCall(createTest, token, basePayload);
        if (result) {
          addNotification({ 
            message: 'Test created successfully', 
            type: 'success' 
          });
          handleCancel();
          refreshTests();
        }
      }
    } catch (error) {
      console.error('Error saving test:', error);
      addNotification({ 
        message: 'Failed to save test', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (test) => {
    setEditingId(test.id);
    setFormData({
      testName: test.testName || '',
      description: test.description || '',
      instructions: test.instructions || '',
      timeLimitMinutes: test.timeLimitMinutes || '',
      totalMarks: test.totalMarks || '',
      passingMarks: test.passingMarks || '',
      negativeMarking: test.negativeMarking || false,
      negativeMarkPercentage: test.negativeMarkPercentage || 0,
      maxAttempts: test.maxAttempts || 1,
      isPublished: test.isPublished || false,
      startDate: test.startDate || '',
      endDate: test.endDate || '',
      masterExamId: test.masterExamId || '',
      testType: test.testType || 'PRACTICE',
      allowReview: test.allowReview !== undefined ? test.allowReview : true,
      showCorrectAnswers: test.showCorrectAnswers || false,
      shuffleQuestions: test.shuffleQuestions || false,
      shuffleOptions: test.shuffleOptions || false,
      allowSkip: test.allowSkip !== undefined ? test.allowSkip : true,
      timePerQuestion: test.timePerQuestion || 0,
      
      // NEW: Content linkage fields
      testCreationMode: test.testCreationMode || 'EXAM_BASED',
      testLevel: test.testLevel || 'CLASS_EXAM',
      courseTypeId: test.courseTypeId || '',
      courseId: test.courseId || '',
      classId: test.classId || '',
      examId: test.examId || '',
      subjectLinkageId: test.subjectLinkageId || '',
      topicId: test.topicId || '',
      moduleId: test.moduleId || '',
      chapterId: test.chapterId || ''
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await executeApiCall(deleteTest, token, testId);
      if (result) {
        addNotification({ 
          message: 'Test deleted successfully', 
          type: 'success' 
        });
        refreshTests();
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      addNotification({ 
        message: 'Failed to delete test', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle publish/unpublish
  const handlePublishToggle = async (test) => {
    setLoading(true);
    try {
      const result = test.isPublished 
        ? await executeApiCall(unpublishTest, token, test.id)
        : await executeApiCall(publishTest, token, test.id);
      
      if (result) {
        addNotification(
          test.isPublished ? 'Test unpublished successfully' : 'Test published successfully',
          'success'
        );
        refreshTests();
      }
    } catch (error) {
      console.error('Error toggling test status:', error);
      addNotification({ 
        message: 'Failed to update test status', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Advanced question management
  const handleManageQuestions = async (test) => {
    setSelectedTest(test);
    setShowTestQuestionManager(true);
  };

  const handleQuestionSelectionComplete = async (selectedQuestions) => {
    if (!selectedTest) return;

    setLoading(true);
    try {
      // Add questions to test with proper ordering
      for (let i = 0; i < selectedQuestions.length; i++) {
        const question = selectedQuestions[i];
        const testQuestionData = {
          questionId: question.id,
          questionOrder: i + 1,
          marks: question.marks || 4, // Default marks
          negativeMarks: 0
        };
        
        await addQuestionToTest(token, selectedTest.id, testQuestionData);
      }

      addNotification({ 
        message: `Added ${selectedQuestions.length} questions to test`, 
        type: 'success' 
      });
      setShowQuestionSelection(false);
      setSelectedTest(null);
      refreshTests();
    } catch (error) {
      console.error('Error adding questions to test:', error);
      addNotification({ 
        message: 'Failed to add questions to test', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation) => {
    if (selectedTests.length === 0) {
      addNotification({ 
        message: 'Please select tests to perform bulk operation', 
        type: 'warning' 
      });
      return;
    }

    const confirmMessage = `Are you sure you want to ${operation.toLowerCase()} ${selectedTests.length} test(s)?`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const promises = selectedTests.map(testId => {
        switch (operation) {
          case 'PUBLISH':
            return publishTest(token, testId);
          case 'UNPUBLISH':
            return unpublishTest(token, testId);
          case 'DELETE':
            return deleteTest(token, testId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      addNotification({ 
        message: `Bulk ${operation.toLowerCase()} completed successfully`, 
        type: 'success' 
      });
      setSelectedTests([]);
      setShowBulkActions(false);
      refreshTests();
    } catch (error) {
      console.error('Error in bulk operation:', error);
      addNotification({ 
        message: 'Bulk operation failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  // Helper function to get exam display name
  const getExamDisplayName = (exam) => {
    if (!exam) return 'Unknown Exam';
    return exam.exam || exam.examName || exam.name || `Exam ${exam.id}`;
  };


  // Filter tests based on current filters
  const filteredTests = useMemo(() => {
    let filtered = tests;

    if (selectedMasterExam) {
      filtered = filtered.filter(test => 
        test.masterExamId === parseInt(selectedMasterExam)
      );
    }

    if (selectedStatus) {
      if (selectedStatus === 'PUBLISHED') {
        filtered = filtered.filter(test => test.isPublished);
      } else if (selectedStatus === 'DRAFT') {
        filtered = filtered.filter(test => !test.isPublished && test.status === 'DRAFT');
      } else {
        filtered = filtered.filter(test => test.status === selectedStatus);
      }
    }

    if (selectedTestType) {
      filtered = filtered.filter(test => test.testType === selectedTestType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(test =>
        test.testName?.toLowerCase().includes(term) ||
        test.description?.toLowerCase().includes(term) ||
        getExamDisplayName(test.masterExam).toLowerCase().includes(term)
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(test => 
        new Date(test.createdAt) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(test => 
        new Date(test.createdAt) <= new Date(dateRange.end)
      );
    }

    return filtered;
  }, [tests, selectedMasterExam, selectedStatus, selectedTestType, searchTerm, dateRange]);

  return (
    <div className="master-data-management advanced-test-management">
      <AdminPageHeader
        title="🚀 Advanced Test Management"
        subtitle="Enterprise-grade test creation and management system"
        onBackToDashboard={onBackToDashboard}
      />

      {/* Enhanced Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          📝 Tests ({filteredTests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates
        </button>
      </div>

      {/* Enhanced Filters */}
      {activeTab === 'tests' && (
      <div className="filters-section">
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
          <button 
            className="btn btn-primary"
            onClick={handleAddNew}
            disabled={loading}
          >
            ➕ Create Test
          </button>
        </div>
        <div className="section-title">
          <span className="icon">🔍</span>
          <span>Filter Tests</span>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Master Exam</label>
            <select 
              value={selectedMasterExam}
              onChange={(e) => setSelectedMasterExam(e.target.value)}
              className="form-input"
            >
              <option value="">All Exams</option>
              {masterExams?.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {getExamDisplayName(exam)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Test Type</label>
            <select 
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="PRACTICE">Practice</option>
              <option value="MOCK">Mock Test</option>
              <option value="FINAL">Final Exam</option>
              <option value="QUIZ">Quiz</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tests..."
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              Active Only
            </label>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              Active Only
            </label>
          </div>

          <div className="filter-group">
            <button 
              className="btn btn-outline"
              onClick={() => {
                setSelectedMasterExam('');
                setSelectedStatus('');
                setSelectedTestType('');
                setSearchTerm('');
                setShowActiveOnly(true);
                setDateRange({ start: '', end: '' });
              }}
            >
              🔄 Clear All
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTests.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-info">
              <span>{selectedTests.length} test(s) selected</span>
            </div>
            <div className="bulk-buttons">
              <button 
                className="btn btn-success btn-sm"
                onClick={() => handleBulkOperation('PUBLISH')}
              >
                📢 Publish
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => handleBulkOperation('UNPUBLISH')}
              >
                🔒 Unpublish
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleBulkOperation('DELETE')}
              >
                🗑️ Delete
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedTests([])}
              >
                ✕ Clear
              </button>
            </div>
          </div>
        )}

        <div className="filter-actions">
          <button 
            className="btn btn-primary"
            onClick={refreshTests}
            disabled={loading}
          >
            Apply Filters
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              console.log('Manual test API call triggered');
              refreshTests();
            }}
            disabled={loading}
          >
            🔄 Test API Call
          </button>
        </div>
      </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <TestAnalytics onClose={() => setActiveTab('tests')} />
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="templates-section">
          <TestTemplates onClose={() => setActiveTab('tests')} />
        </div>
      )}

      {/* Test Form */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Test' : 'Add New Test'}</h3>
            <button 
              className="btn btn-link"
              onClick={handleCancel}
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="test-form">
            {/* Basic Information Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">📋</span>
                <span>Basic Information</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="required">Test Name</label>
                  <input
                    type="text"
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.testName && touched.testName ? 'error' : ''}`}
                    placeholder="Enter test name"
                  />
                  {errors.testName && touched.testName && (
                    <span className="error-message">{errors.testName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Test Type</label>
                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                  >
                    <option value="PRACTICE">Practice Test</option>
                    <option value="MOCK">Mock Test</option>
                    <option value="FINAL">Final Exam</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="form-input"
                  rows="3"
                  placeholder="Enter test description"
                />
              </div>

              <div className="form-group full-width">
                <label>Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="form-input"
                  rows="4"
                  placeholder="Enter test instructions for students"
                />
              </div>
            </div>

            {/* NEW: Test Creation Mode and Content Linkage Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">🎯</span>
                <span>Test Scope & Content Linkage</span>
              </div>

              {/* Test Creation Mode Toggle */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="required">Test Creation Mode</label>
                  <div className="mode-toggle-group">
                    <label className={`mode-toggle ${formData.testCreationMode === 'EXAM_BASED' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="testCreationMode"
                        value="EXAM_BASED"
                        checked={formData.testCreationMode === 'EXAM_BASED'}
                        onChange={handleInputChange}
                      />
                      <div className="mode-content">
                        <span className="mode-icon">📝</span>
                        <div>
                          <strong>Exam-Based Test</strong>
                          <p>General competitive exam test (SSC, UPSC, etc.) - uses question examSuitabilities</p>
                        </div>
                      </div>
                    </label>
                    <label className={`mode-toggle ${formData.testCreationMode === 'CONTENT_BASED' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="testCreationMode"
                        value="CONTENT_BASED"
                        checked={formData.testCreationMode === 'CONTENT_BASED'}
                        onChange={handleInputChange}
                      />
                      <div className="mode-content">
                        <span className="mode-icon">📚</span>
                        <div>
                          <strong>Content-Based Test</strong>
                          <p>Linked to specific course content (Class, Subject, Chapter, etc.)</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* EXAM_BASED MODE: Show Master Exam Selection */}
              {formData.testCreationMode === 'EXAM_BASED' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="required">Master Exam</label>
                    <select
                      name="masterExamId"
                      value={formData.masterExamId}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`form-input ${errors.masterExamId && touched.masterExamId ? 'error' : ''}`}
                    >
                      <option value="">Select Master Exam</option>
                      {masterExams?.map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {getExamDisplayName(exam)}
                        </option>
                      ))}
                    </select>
                    {errors.masterExamId && touched.masterExamId && (
                      <span className="error-message">{errors.masterExamId}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Show Content Hierarchy only for CONTENT_BASED mode */}
              {formData.testCreationMode === 'CONTENT_BASED' && (
                <>
                  {/* Test Level Selection */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="required">Test Level</label>
                      <select
                        name="testLevel"
                        value={formData.testLevel}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="CLASS_EXAM">Class/Exam Level</option>
                        <option value="SUBJECT">Subject Level</option>
                        <option value="MODULE">Module Level</option>
                        <option value="CHAPTER">Chapter Level</option>
                      </select>
                      <small className="form-help">
                        {formData.testLevel === 'CLASS_EXAM' && 'Test covering entire class/exam syllabus'}
                        {formData.testLevel === 'SUBJECT' && 'Test for specific subject'}
                        {formData.testLevel === 'MODULE' && 'Test for specific module'}
                        {formData.testLevel === 'CHAPTER' && 'Test for specific chapter'}
                      </small>
                    </div>
                  </div>

                  {/* Course Type and Course */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="required">Course Type</label>
                      <select
                        name="courseTypeId"
                        value={formData.courseTypeId}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select Course Type</option>
                        {courseTypes.map(ct => (
                          <option key={ct.id} value={ct.id}>{ct.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="required">Course</label>
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!formData.courseTypeId}
                      >
                        <option value="">Select Course</option>
                        {courses
                          .filter(c => c.courseTypeId === parseInt(formData.courseTypeId))
                          .map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Class or Exam Selection */}
                  {formData.courseTypeId && (
                    <div className="form-row">
                      {/* Show Class for Academic (courseTypeId = 1) */}
                      {parseInt(formData.courseTypeId) === 1 && (
                        <div className="form-group">
                          <label className="required">Class</label>
                          <select
                            name="classId"
                            value={formData.classId}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!formData.courseId}
                          >
                            <option value="">Select Class</option>
                            {classes
                              .filter(c => c.courseId === parseInt(formData.courseId))
                              .map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                              ))}
                          </select>
                        </div>
                      )}

                      {/* Show Exam for Competitive (courseTypeId = 2) */}
                      {parseInt(formData.courseTypeId) === 2 && (
                        <div className="form-group">
                          <label className="required">Exam</label>
                          <select
                            name="examId"
                            value={formData.examId}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!formData.courseId}
                          >
                            <option value="">Select Exam</option>
                            {exams
                              .filter(e => e.courseId === parseInt(formData.courseId))
                              .map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subject, Topic, Module, Chapter - based on testLevel */}
                  {(formData.testLevel === 'SUBJECT' || formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="required">Subject</label>
                        <select
                          name="subjectLinkageId"
                          value={formData.subjectLinkageId}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled={!formData.classId && !formData.examId}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject.linkageId || subject.id} value={subject.linkageId || subject.id}>
                              {subject.subjectName || subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {(formData.testLevel === 'MODULE' || formData.testLevel === 'CHAPTER') && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="required">Topic</label>
                        <select
                          name="topicId"
                          value={formData.topicId}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled={!formData.subjectLinkageId}
                        >
                          <option value="">Select Topic</option>
                          {topics.map(topic => (
                            <option key={topic.id} value={topic.id}>{topic.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="required">Module</label>
                        <select
                          name="moduleId"
                          value={formData.moduleId}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled={!formData.topicId}
                        >
                          <option value="">Select Module</option>
                          {modules.map(module => (
                            <option key={module.id} value={module.id}>{module.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.testLevel === 'CHAPTER' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="required">Chapter</label>
                        <select
                          name="chapterId"
                          value={formData.chapterId}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled={!formData.moduleId}
                        >
                          <option value="">Select Chapter</option>
                          {chapters.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Info Alert based on selection */}
                  {formData.testLevel && formData.courseTypeId && (
                    <div className="info-alert">
                      <span className="info-icon">ℹ️</span>
                      <div>
                        <strong>Test Scope:</strong>
                        {formData.testLevel === 'CLASS_EXAM' && formData.classId && ` This test will be available for all subjects in ${classes.find(c => c.id === parseInt(formData.classId))?.name}.`}
                        {formData.testLevel === 'CLASS_EXAM' && formData.examId && ` This test will be available for all subjects in ${exams.find(e => e.id === parseInt(formData.examId))?.name}.`}
                        {formData.testLevel === 'SUBJECT' && formData.subjectLinkageId && ` This test will be available for ${subjects.find(s => s.linkageId === parseInt(formData.subjectLinkageId))?.name} subject.`}
                        {formData.testLevel === 'MODULE' && formData.moduleId && ` This test will be available for ${modules.find(m => m.id === parseInt(formData.moduleId))?.name} module.`}
                        {formData.testLevel === 'CHAPTER' && formData.chapterId && ` This test will be available for ${chapters.find(ch => ch.id === parseInt(formData.chapterId))?.name} chapter.`}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Info for EXAM_BASED mode */}
              {formData.testCreationMode === 'EXAM_BASED' && formData.masterExamId && (
                <div className="info-alert">
                  <span className="info-icon">ℹ️</span>
                  <div>
                    <strong>Exam-Based Test:</strong> Questions will be filtered using the selected Master Exam's examSuitabilities. No course content linkage needed - perfect for general competitive exam practice!
                  </div>
                </div>
              )}
            </div>

            {/* Test Configuration Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">⚙️</span>
                <span>Test Configuration</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="required">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={formData.timeLimitMinutes}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.timeLimitMinutes && touched.timeLimitMinutes ? 'error' : ''}`}
                    placeholder="180"
                    min="1"
                  />
                  {errors.timeLimitMinutes && touched.timeLimitMinutes && (
                    <span className="error-message">{errors.timeLimitMinutes}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="required">Total Marks</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.totalMarks && touched.totalMarks ? 'error' : ''}`}
                    placeholder="300"
                    min="1"
                  />
                  {errors.totalMarks && touched.totalMarks && (
                    <span className="error-message">{errors.totalMarks}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="required">Passing Marks</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.passingMarks && touched.passingMarks ? 'error' : ''}`}
                    placeholder="120"
                    min="1"
                  />
                  {errors.passingMarks && touched.passingMarks && (
                    <span className="error-message">{errors.passingMarks}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Attempts</label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={formData.maxAttempts}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="negativeMarking"
                        checked={formData.negativeMarking}
                        onChange={handleInputChange}
                      />
                      Enable Negative Marking
                    </label>
                  </div>
                </div>

                {formData.negativeMarking && (
                  <div className="form-group">
                    <label>Negative Mark Percentage</label>
                    <input
                      type="number"
                      name="negativeMarkPercentage"
                      value={formData.negativeMarkPercentage}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="form-input"
                      placeholder="25"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="allowReview"
                        checked={formData.allowReview}
                        onChange={handleInputChange}
                      />
                      Allow Review
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="showCorrectAnswers"
                        checked={formData.showCorrectAnswers}
                        onChange={handleInputChange}
                      />
                      Show Correct Answers
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="shuffleQuestions"
                        checked={formData.shuffleQuestions}
                        onChange={handleInputChange}
                      />
                      Shuffle Questions
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="shuffleOptions"
                        checked={formData.shuffleOptions}
                        onChange={handleInputChange}
                      />
                      Shuffle Options
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="allowSkip"
                        checked={formData.allowSkip}
                        onChange={handleInputChange}
                      />
                      Allow Skip
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Per Question (seconds)</label>
                  <input
                    type="number"
                    name="timePerQuestion"
                    value={formData.timePerQuestion}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="0 (use total time limit)"
                    min="0"
                  />
                  <small className="form-text">0 = use total time limit</small>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">🕐</span>
                <span>Availability</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                      />
                      Publish Test
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Test' : 'Create Test')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tests List */}
      {activeTab === 'tests' && (
        <div className="tests-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">No Tests</div>
              <h3>No tests found</h3>
              <p>Create your first test to get started with the advanced test management system.</p>
              <button 
                className="btn btn-primary"
                onClick={handleAddNew}
              >
                Create Test
              </button>
            </div>
          ) : loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading tests...</p>
            </div>
          ) : (
            <div className="tests-grid">
              {filteredTests.length === 0 ? (
                <div className="no-data-message">
                  <div className="no-data-icon">📝</div>
                  <h3>No Tests Found</h3>
                  <p>Create your first test to get started with test management.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddNew}
                  >
                    Create Test
                  </button>
                </div>
              ) : (
                filteredTests.map(test => (
                  <TestListCard
                    key={test.id}
                    test={test}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPublishToggle={handlePublishToggle}
                    onManageQuestions={handleManageQuestions}
                    onSelect={(testId) => {
                      setSelectedTests(prev => 
                        prev.includes(testId) 
                          ? prev.filter(id => id !== testId)
                          : [...prev, testId]
                      );
                    }}
                    isSelected={selectedTests.includes(test.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced Components */}
      {showQuestionSelection && (
        <QuestionSelectionModal
          isOpen={showQuestionSelection}
          onClose={() => setShowQuestionSelection(false)}
          onSelectQuestions={handleQuestionSelectionComplete}
        />
      )}

      {showTestQuestionManager && selectedTest && (
        <TestQuestionManager
          test={selectedTest}
          onClose={() => {
            setShowTestQuestionManager(false);
            setSelectedTest(null);
          }}
        />
      )}

      {showTestAnalytics && (
        <TestAnalytics
          onClose={() => setShowTestAnalytics(false)}
        />
      )}

      {showTestTemplates && (
        <TestTemplates
          onClose={() => setShowTestTemplates(false)}
        />
      )}
    </div>
  );
};

export default TestManagement;