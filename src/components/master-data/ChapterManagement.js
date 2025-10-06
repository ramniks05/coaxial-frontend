import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  
  // Filter states
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filtered data states (for filter form)
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);

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
  const courseTypesCacheRef = useRef(null);
  const didMountCourseType = useRef(false);
  const didMountCourse = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const didMountClass = useRef(false);
  const didMountExam = useRef(false);
  const didMountActive = useRef(false);

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

  // API fetch functions
  const fetchData = useCallback(async () => {
    try {
      const data = await getCourseTypesCached(token);
      setCourseTypes(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching course types:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load course types',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  const fetchCoursesByCourseType = useCallback(async (courseTypeId) => {
    if (!courseTypeId) {
      setFilteredCourses([]);
      return;
    }

    try {
      const data = await getCourses(token, {
        courseTypeId,
        page: 0,
        size: 100,
        sortBy: 'name',
        sortDir: 'asc'
      });
      setFilteredCourses(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching courses:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load courses',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  const fetchClassesAndExamsByCourse = useCallback(async (courseTypeId, courseId) => {
    if (!courseTypeId || !courseId) {
      setFilteredClasses([]);
      setFilteredExams([]);
      return;
    }

    try {
      if (isAcademicCourseType(courseTypeId)) {
        const classesData = await getClassesByCourse(token, {
          courseId,
          page: 0,
          size: 100,
          sortBy: 'name',
          sortDir: 'asc'
        });
        setFilteredClasses(Array.isArray(classesData) ? classesData : (classesData?.content || classesData?.data || []));
      }

      if (isCompetitiveCourseType(courseTypeId)) {
        const examsData = await getExamsByCourse(token, {
          courseId,
          page: 0,
          size: 100,
          sortBy: 'name',
          sortDir: 'asc'
        });
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
      setFilteredSubjects([]);
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
      setFilteredSubjects(Array.isArray(data) ? data : (data?.content || data?.data || []));
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
      setFilteredTopics([]);
      return;
    }

    try {
      const relationshipId = parseInt(subjectId);
      const data = await getTopicsByLinkage(token, courseTypeId, relationshipId);
      setFilteredTopics(Array.isArray(data) ? data : (data?.content || data?.data || []));
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
      setFilteredModules([]);
      return;
    }

    try {
      const data = await getModulesByTopic(token, topicId, true);
      setFilteredModules(Array.isArray(data) ? data : (data?.content || data?.data || []));
    } catch (error) {
      console.error('Error fetching modules:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load modules',
        duration: 3000
      });
    }
  }, [token, addNotification]);

  const fetchChaptersData = useCallback(async () => {
    try {
      console.log('=== FETCHING CHAPTERS ===');
      console.log('Filters:', {
        active: showActiveOnly,
        courseTypeId: selectedCourseType,
        courseId: selectedCourse,
        classId: selectedClass,
        examId: selectedExam,
        subjectId: selectedSubject,
        topicId: selectedTopic,
        moduleId: selectedModule
      });

      const filters = {
        active: showActiveOnly,
        courseTypeId: selectedCourseType ? parseInt(selectedCourseType) : null,
        courseId: selectedCourse ? parseInt(selectedCourse) : null,
        classId: selectedClass ? parseInt(selectedClass) : null,
        examId: selectedExam ? parseInt(selectedExam) : null,
        subjectId: selectedSubject ? parseInt(selectedSubject) : null,
        topicId: selectedTopic ? parseInt(selectedTopic) : null,
        moduleId: selectedModule ? parseInt(selectedModule) : null,
        page: 0,
        size: 100,
        sortBy: 'createdAt',
        sortDir: 'desc'
      };

      console.log('Processed filters:', filters);

      let list = [];
      if (filters.moduleId || filters.topicId || filters.subjectId || filters.classId || filters.examId || filters.courseId || filters.courseTypeId) {
        console.log('Calling getChaptersCombinedFilter with filters...');
        const data = await getChaptersCombinedFilter(token, filters);
        console.log('Raw API response:', data);
        list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      } else {
        console.log('No filters, loading all chapters...');
        const data = await getChaptersCombinedFilter(token, { active: showActiveOnly, page: 0, size: 100 });
        console.log('Raw API response (no filters):', data);
        list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      }

      console.log('Final chapters list:', list.length, 'items');
      console.log('Chapters data:', list);
      setCombinedChapters(list || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load chapters',
        duration: 3000
      });
    }
  }, [selectedCourseType, selectedCourse, selectedClass, selectedExam, selectedSubject, selectedTopic, selectedModule, showActiveOnly, token]);
  
  // Chapters list states
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const initialChaptersLoadDoneRef = useRef(false);

  // Initial load effect
  useEffect(() => {
    if (initialLoadDoneRef.current) {
      console.log('Initial load already done, skipping...');
      return;
    }
    
    console.log('=== INITIAL LOAD START ===');
    console.log('Component mounted, starting initial data fetch...');
    
    const initializeData = async () => {
      try {
        initialLoadDoneRef.current = true;
        
        // Fetch course types
        console.log('Step 1: Fetching course types...');
        const courseTypesData = await getCourseTypesCached(token);
        const courseTypesList = Array.isArray(courseTypesData) ? courseTypesData : (courseTypesData?.content || courseTypesData?.data || []);
        setCourseTypes(courseTypesList);
        console.log('Course types loaded:', courseTypesList.length, 'items');
        
        // Fetch chapters with initial filters (no filters = load all)
        console.log('Step 2: Fetching chapters on initial load...');
        console.log('Calling getChaptersCombinedFilter with params:', {
          active: true, 
          page: 0, 
          size: 100,
          sortBy: 'createdAt',
          sortDir: 'desc'
        });
        
        const chaptersData = await getChaptersCombinedFilter(token, { 
          active: true, 
          page: 0, 
          size: 100,
          sortBy: 'createdAt',
          sortDir: 'desc'
        });
        
        console.log('Raw chapters API response:', chaptersData);
        const chaptersList = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.content || chaptersData?.data || []);
        console.log('Initial chapters loaded:', chaptersList.length, 'items');
        console.log('Chapters data:', chaptersList);
        setCombinedChapters(chaptersList || []);
        
        console.log('=== INITIAL LOAD COMPLETE ===');
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

  // Filter effects - only fetch chapters when filters change, not when functions change
  useEffect(() => {
    if (selectedCourseType) {
      fetchCoursesByCourseType(selectedCourseType);
    }
    fetchChaptersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseType]);

  useEffect(() => {
    if (selectedCourse && selectedCourseType) {
      fetchClassesAndExamsByCourse(selectedCourseType, selectedCourse);
    }
    fetchChaptersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedCourseType]);

  useEffect(() => {
    if (selectedCourse && selectedCourseType) {
      fetchSubjectLinkages(selectedCourseType, selectedCourse, selectedClass, selectedExam);
    }
    fetchChaptersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedExam, selectedCourse, selectedCourseType]);

  useEffect(() => {
    if (selectedSubject && selectedCourseType) {
      fetchTopicsBySubject(selectedSubject, selectedCourseType);
    }
    fetchChaptersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedCourseType]);

  useEffect(() => {
    if (selectedTopic) {
      fetchModulesByTopic(selectedTopic);
    }
    fetchChaptersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  useEffect(() => {
    fetchChaptersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, showActiveOnly]);

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
    fetchTopicsByLinkage(courseTypeIdNum, relationshipIdNum)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setFormFilteredTopics(list || []);
        lastFormTopicKeyRef.current = key;
      })
      .finally(() => {
        formTopicsLoadingRef.current = false;
      });
  }, [formData.subjectId, formData.courseTypeId, fetchTopicsByLinkage]);

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
      
      // Refresh chapters if module is selected
      if (selectedModule) {
        fetchChaptersByModule(selectedModule, showActiveOnly);
      }

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
  }, [formData, editingId, validateForm, executeApiCall, addNotification, resetForm, selectedModule, showActiveOnly, fetchChaptersByModule, token]);

  const handleEdit = (chapter) => {
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
      courseTypeId: chapter.topic?.subject?.courseTypeId || chapter.module?.topic?.subject?.courseTypeId || '',
      courseId: chapter.topic?.subject?.courseId || chapter.module?.topic?.subject?.courseId || '',
      classId: chapter.topic?.subject?.classId || chapter.module?.topic?.subject?.classId || '',
      examId: chapter.topic?.subject?.examId || chapter.module?.topic?.subject?.examId || '',
      subjectId: chapter.topic?.subject?.subjectId || chapter.module?.topic?.subject?.id || '',
      topicId: chapter.topic?.id || chapter.module?.topic?.id || '',
      moduleId: chapter.moduleId || '',
      youtubeLinks: youtubeLinks,
      youtubeTitles: youtubeTitles,
      uploadedFiles: uploadedFiles,
      uploadedFileTitles: uploadedFileTitles
    });
    setEditingId(chapter.id);
    setShowForm(true);
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
      
      // Refresh chapters if module is selected
      if (selectedModule) {
        await fetchChaptersByModule(selectedModule, showActiveOnly);
      }

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
  }, [executeApiCall, addNotification, selectedModule, showActiveOnly, fetchChaptersByModule, token]);


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

  // Fetch chapters when module changes
  useEffect(() => {
    if (selectedModule) {
      setChaptersLoading(true);
      fetchChaptersByModule(selectedModule, showActiveOnly).finally(() => {
        setChaptersLoading(false);
      });
    }
  }, [selectedModule, showActiveOnly, fetchChaptersByModule]);

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
        fetchChaptersByModule(selectedModule, showActiveOnly); // Refresh the list
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
    console.log('ChapterManagement - Document preview data received:', documentData);
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

      {/* Filter Section - Same as Module Management */}
      <div className="filter-section">
        <div className="filter-header">
          <h4>Filter Chapters</h4>
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
                setSelectedModule('');
              }}
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
              onChange={(e) => setSelectedCourseType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Course Types</option>
              {courseTypes.map(courseType => (
                <option key={courseType.id} value={courseType.id}>
                  {courseType.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="filter-group">
            <label htmlFor="course-filter">2. Course:</label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedCourseType}
              className="filter-select"
            >
              <option value="">All Courses</option>
              {filteredCourses.map(course => (
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
                disabled={!selectedCourse}
                className="filter-select"
              >
                <option value="">All Classes</option>
                {filteredClasses.map(cls => (
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
                disabled={!selectedCourse}
                className="filter-select"
              >
                <option value="">All Exams</option>
                {filteredExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          <div className="filter-group">
            <label htmlFor="subject-filter">4. Subject:</label>
            <select
              id="subject-filter"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedCourse}
              className="filter-select"
            >
              <option value="">All Subjects</option>
              {filteredSubjects.map(subject => (
                <option key={subject.id} value={subject.linkageId || subject.id}>
                  {getSubjectDisplayText(subject, selectedCourseType)}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div className="filter-group">
            <label htmlFor="topic-filter">5. Topic:</label>
            <select
              id="topic-filter"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="filter-select"
            >
              <option value="">All Topics</option>
              {filteredTopics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="filter-group">
            <label htmlFor="module-filter">6. Module:</label>
            <select
              id="module-filter"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              disabled={!selectedTopic}
              className="filter-select"
            >
              <option value="">All Modules</option>
              {filteredModules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Section - Will be added in next part */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h3>
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
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Chapter' : 'Create Chapter')}
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
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
                  const filters = {
                    active: showActiveOnly,
                    courseTypeId: selectedCourseType ? parseInt(selectedCourseType) : null,
                    courseId: selectedCourse ? parseInt(selectedCourse) : null,
                    classId: selectedClass ? parseInt(selectedClass) : null,
                    examId: selectedExam ? parseInt(selectedExam) : null,
                    subjectId: selectedSubject ? parseInt(selectedSubject) : null,
                    topicId: selectedTopic ? parseInt(selectedTopic) : null,
                    moduleId: selectedModule ? parseInt(selectedModule) : null,
                    page: 0,
                    size: 100,
                    sortBy: 'createdAt',
                    sortDir: 'desc'
                  };
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
                  {academicChapters.length === 0 && competitiveChapters.length === 0 && professionalChapters.length === 0 && (
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