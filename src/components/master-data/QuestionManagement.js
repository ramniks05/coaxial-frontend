import React, { useCallback, useEffect, useState, Fragment } from 'react';
import { useApp } from '../../context/AppContext';
import { useApiManager } from '../../hooks/useApiManager';
import { useFormManager } from '../../hooks/useFormManager';
import { useMasterData } from '../../hooks/useMasterData';
import {
    createQuestion,
    deleteQuestion,
    getQuestions,
    updateQuestion
} from '../../services/masterDataService';
import { getMasterExamsKV, getYearsKV } from '../../services/questionTaggingService';
import '../../styles/design-system.css';
import AdminPageHeader from '../common/AdminPageHeader';
import QuestionListCard from './QuestionListCard';
import QuestionFilters from './filters/QuestionFilters';

const QuestionManagement = ({ onBackToDashboard }) => {
  const { addNotification, token } = useApp();
  const { executeApiCall } = useApiManager();
  
  // Use custom hooks for data management with authentication awareness
  const {
    courseTypes,
    fetchCourses,
    fetchClasses,
    fetchExams,
    fetchSubjects,
    fetchTopicsByLinkage,
    fetchModulesByTopic,
    fetchChaptersByModule,
    isAcademicCourseType,
    isCompetitiveCourseType,
    isProfessionalCourseType,
    isAuthenticated
  } = useMasterData();
  
  // Add isInitialized for compatibility
  const isInitialized = isAuthenticated;
  
  // Form management
  const initialFormData = {
    questionText: '',
    questionType: 'MCQ',
    difficultyLevel: 'EASY',
    marks: 1,
    negativeMarks: 0,
    timeLimitSeconds: 60,
    explanation: '',
    courseTypeId: '',
    relationshipId: 1,
    courseId: '',
    classId: '',
    examId: '',
    subjectId: '',
    topicId: '',
    moduleId: '',
    chapterId: '',
    isActive: true,
    examSuitabilities: [], // Array of exam IDs this question is suitable for
    examHistories: [], // Array of {examId, yearId} objects for exam history
    options: [
      { optionLetter: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
      { optionLetter: 'B', optionText: '', isCorrect: false, displayOrder: 2 },
      { optionLetter: 'C', optionText: '', isCorrect: false, displayOrder: 3 },
      { optionLetter: 'D', optionText: '', isCorrect: false, displayOrder: 4 }
    ]
  };

  const validationRules = {
    questionText: (value) => !value ? 'Question text is required' : '',
    questionType: (value) => !value ? 'Question type is required' : '',
    difficultyLevel: (value) => !value ? 'Difficulty level is required' : '',
    marks: (value) => !value || value < 1 ? 'Marks must be at least 1' : '',
    courseTypeId: (value) => !value ? 'Course Type is required' : '',
    courseId: (value) => !value ? 'Course is required' : '',
    subjectId: (value) => !value ? 'Subject is required' : '',
    topicId: (value) => !value ? 'Topic is required' : '',
    moduleId: (value) => !value ? 'Module is required' : '',
    chapterId: (value) => !value ? 'Chapter is required' : ''
  };

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

  // Component state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useEnhancedFilters, setUseEnhancedFilters] = useState(false);
 // Track which option is focused
  const [showOptionMathToolbars, setShowOptionMathToolbars] = useState(false); // Control math toolbars visibility
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // Filter states
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filtered data states
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);

  // Form filtered data states
  const [formFilteredCourses, setFormFilteredCourses] = useState([]);
  const [formFilteredClasses, setFormFilteredClasses] = useState([]);
  const [formFilteredExams, setFormFilteredExams] = useState([]);
  const [formFilteredSubjects, setFormFilteredSubjects] = useState([]);
  const [formFilteredTopics, setFormFilteredTopics] = useState([]);
  const [formFilteredModules, setFormFilteredModules] = useState([]);
  const [formFilteredChapters, setFormFilteredChapters] = useState([]);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Exam tagging state
  const [masterExams, setMasterExams] = useState([]);
  const [years, setYears] = useState([]);
  const [examTaggingLoading, setExamTaggingLoading] = useState(false);
  
  // Exam history tag state for separate dropdowns
  const [selectedExamForHistory, setSelectedExamForHistory] = useState('');
  const [selectedYearForHistory, setSelectedYearForHistory] = useState('');
  
  // Exam suitability tag state for single dropdown
  const [selectedExamForSuitability, setSelectedExamForSuitability] = useState('');

  // Normalize various API response shapes to arrays


  // Clear year selection when exam selection changes
  useEffect(() => {
    setSelectedYearForHistory('');
  }, [selectedExamForHistory]);

  // Clear exam tagging data when form is closed
  useEffect(() => {
    if (!showForm) {
      setMasterExams([]);
      setYears([]);
      setSelectedExamForHistory('');
      setSelectedYearForHistory('');
      setSelectedExamForSuitability('');
    }
  }, [showForm]);

  // Filter effects - Same as Chapter Management
  useEffect(() => {
    if (selectedCourseType && isInitialized) {
      fetchCourses(selectedCourseType).then(setFilteredCourses);
    } else {
      setFilteredCourses([]);
    }
  }, [selectedCourseType, isInitialized, fetchCourses]);

  useEffect(() => {
    if (selectedCourse && selectedCourseType) {
      if (isAcademicCourseType(selectedCourseType)) {
        Promise.all([
          fetchClasses(selectedCourseType, selectedCourse),
          fetchExams(selectedCourseType, selectedCourse)
        ]).then(([classesData, examsData]) => {
          setFilteredClasses(classesData);
          setFilteredExams(examsData);
        });
      } else if (isCompetitiveCourseType(selectedCourseType)) {
        fetchExams(selectedCourseType, selectedCourse).then(setFilteredExams);
        setFilteredClasses([]);
      } else if (isProfessionalCourseType(selectedCourseType)) {
        setFilteredClasses([]);
        setFilteredExams([]);
      }
    } else {
      setFilteredClasses([]);
      setFilteredExams([]);
    }
  }, [selectedCourse, selectedCourseType, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, fetchClasses, fetchExams]);

  // Consolidated subject fetching effect to prevent multiple API calls
  useEffect(() => {
    if (!selectedCourseType || !selectedCourse) {
      setFilteredSubjects([]);
      return;
    }

    const fetchSubjectsForFilters = async () => {
      try {
        let subjectsData = [];
        
        if (isAcademicCourseType(selectedCourseType) && selectedClass) {
          subjectsData = await fetchSubjects(selectedCourseType, selectedCourse, selectedClass, null, true);
        } else if (isCompetitiveCourseType(selectedCourseType) && selectedExam) {
          subjectsData = await fetchSubjects(selectedCourseType, selectedCourse, null, selectedExam, true);
        } else if (isProfessionalCourseType(selectedCourseType)) {
          subjectsData = await fetchSubjects(selectedCourseType, selectedCourse, null, null, true);
        }
        
        setFilteredSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching subjects for filters:', error);
        setFilteredSubjects([]);
      }
    };

    fetchSubjectsForFilters();
  }, [selectedCourseType, selectedCourse, selectedClass, selectedExam, isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType, fetchSubjects]);

  useEffect(() => {
    if (selectedSubject && selectedCourseType) {
      fetchTopicsByLinkage(selectedCourseType, selectedSubject, true).then(setFilteredTopics);
    } else {
      setFilteredTopics([]);
    }
  }, [selectedSubject, selectedCourseType, fetchTopicsByLinkage]);

  useEffect(() => {
    if (selectedTopic) {
      fetchModulesByTopic(selectedTopic, showActiveOnly).then((modulesData) => {
        setFilteredModules(modulesData);
      });
    } else {
      setFilteredModules([]);
    }
  }, [selectedTopic, showActiveOnly, fetchModulesByTopic]);

  useEffect(() => {
    if (selectedModule) {
      fetchChaptersByModule(selectedModule, showActiveOnly).then((chaptersData) => {
        setFilteredChapters(chaptersData);
      });
    } else {
      setFilteredChapters([]);
    }
  }, [selectedModule, showActiveOnly, fetchChaptersByModule]);

  // Form effects - Same as Chapter Management
  useEffect(() => {
    if (formData.courseTypeId && isInitialized) {
      fetchCourses(formData.courseTypeId).then(setFormFilteredCourses);
    } else {
      setFormFilteredCourses([]);
    }
  }, [formData.courseTypeId, isInitialized, fetchCourses]);

  useEffect(() => {
    if (formData.courseId && formData.courseTypeId) {
      if (isAcademicCourseType(formData.courseTypeId)) {
        Promise.all([
          fetchClasses(formData.courseTypeId, formData.courseId),
          fetchExams(formData.courseTypeId, formData.courseId)
        ]).then(([classesData, examsData]) => {
          setFormFilteredClasses(classesData);
          setFormFilteredExams(examsData);
        });
      } else if (isCompetitiveCourseType(formData.courseTypeId)) {
        fetchExams(formData.courseTypeId, formData.courseId).then(setFormFilteredExams);
        setFormFilteredClasses([]);
      } else if (isProfessionalCourseType(formData.courseTypeId)) {
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

  useEffect(() => {
    if (formData.subjectId && formData.courseTypeId) {
      fetchTopicsByLinkage(formData.courseTypeId, formData.subjectId, true).then(setFormFilteredTopics);
    } else {
      setFormFilteredTopics([]);
    }
  }, [formData.subjectId, formData.courseTypeId, fetchTopicsByLinkage]);

  useEffect(() => {
    if (formData.topicId) {
      fetchModulesByTopic(formData.topicId, showActiveOnly).then((modulesData) => {
        setFormFilteredModules(modulesData);
      });
    } else {
      setFormFilteredModules([]);
    }
  }, [formData.topicId, showActiveOnly, fetchModulesByTopic]);

  useEffect(() => {
    if (formData.moduleId) {
      fetchChaptersByModule(formData.moduleId, showActiveOnly).then((chaptersData) => {
        setFormFilteredChapters(chaptersData);
      });
    } else {
      setFormFilteredChapters([]);
    }
  }, [formData.moduleId, showActiveOnly, fetchChaptersByModule]);

  // Fetch questions
  const fetchQuestionsData = useCallback(async () => {
    if (!token || questionsLoading) return;
    
    setQuestionsLoading(true);
    try {
      const response = await executeApiCall(getQuestions, token);
      console.log('Questions API response:', response);
      
      // Handle different response structures
      if (response) {
        if (Array.isArray(response)) {
          setQuestions(response);
        } else if (response.data && Array.isArray(response.data)) {
          setQuestions(response.data);
        } else {
          console.warn('Unexpected questions response structure:', response);
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch questions',
        duration: 5000
      });
    } finally {
      setQuestionsLoading(false);
    }
  }, [token, executeApiCall, addNotification, questionsLoading]);

  // Handle form submission
  const handleSubmit = async (e) => {
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
        message: 'Please fix form errors',
        duration: 3000
      });
      return;
    }

    // Ensure data is in the correct format for backend
    const normalizedFormData = {
      ...formData,
      questionType: formData.questionType === 'MCQ' ? 'MULTIPLE_CHOICE' : formData.questionType,
      examSuitabilities: formData.examSuitabilities.map(item => 
        typeof item === 'object' && item.examId ? item.examId : item
      ),
      examHistories: formData.examHistories.map(item => ({
        masterExamId: typeof item === 'object' ? (item.examId || item.masterExamId) : item,
        appearedYear: typeof item === 'object' ? (item.yearId || item.appearedYear) : new Date().getFullYear()
      })),
      relationshipId: formData.relationshipId || 1
    };

    // Remove empty string fields that should be null/undefined
    if (normalizedFormData.examId === '') {
      delete normalizedFormData.examId;
    }
    if (normalizedFormData.courseId === '') {
      delete normalizedFormData.courseId;
    }
    if (normalizedFormData.classId === '') {
      delete normalizedFormData.classId;
    }

    // Convert string IDs to integers where needed
    normalizedFormData.courseTypeId = parseInt(normalizedFormData.courseTypeId);
    if (normalizedFormData.courseId) {
      normalizedFormData.courseId = parseInt(normalizedFormData.courseId);
    }
    if (normalizedFormData.classId) {
      normalizedFormData.classId = parseInt(normalizedFormData.classId);
    }
    normalizedFormData.subjectId = parseInt(normalizedFormData.subjectId);
    normalizedFormData.topicId = parseInt(normalizedFormData.topicId);
    normalizedFormData.moduleId = parseInt(normalizedFormData.moduleId);
    normalizedFormData.chapterId = parseInt(normalizedFormData.chapterId);
    normalizedFormData.relationshipId = parseInt(normalizedFormData.relationshipId);

    // Validate options for MCQ
    if (formData.questionType === 'MCQ') {
      const emptyOptions = formData.options.filter(opt => !opt.optionText.trim());
      if (emptyOptions.length > 0) {
        addNotification({
          type: 'error',
          message: 'Please fill all options',
          duration: 3000
        });
        return;
      }
      
      const correctOptions = formData.options.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        addNotification({
          type: 'error',
          message: 'Please select at least one correct answer',
          duration: 3000
        });
        return;
      }
    }

    try {
      setLoading(true);
      
      console.log('Form data being submitted:', normalizedFormData);
      console.log('examSuitabilities in form data:', normalizedFormData.examSuitabilities);
      console.log('examHistories in form data:', normalizedFormData.examHistories);
      console.log('options in form data:', normalizedFormData.options);
      
      if (editingId) {
        await executeApiCall(updateQuestion, token, editingId, normalizedFormData);
        addNotification({
          type: 'success',
          message: 'Question updated successfully',
          duration: 3000
        });
      } else {
        await executeApiCall(createQuestion, token, normalizedFormData);
        addNotification({
          type: 'success',
          message: 'Question created successfully',
          duration: 3000
        });
      }
      
      await fetchQuestionsData();
      resetForm();
      setShowForm(false);
      setEditingId(null);
      
    } catch (error) {
      console.error('Error saving question:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save question',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (question) => {
    setFormData({
      questionText: question.questionText || '',
      questionType: question.questionType === 'MULTIPLE_CHOICE' ? 'MCQ' : (question.questionType || 'MCQ'),
      difficultyLevel: question.difficultyLevel || 'EASY',
      marks: question.marks || 1,
      negativeMarks: question.negativeMarks || 0,
      timeLimitSeconds: question.timeLimitSeconds || 60,
      explanation: question.explanation || '',
      courseTypeId: question.courseTypeId?.toString() || '',
      courseId: question.courseId?.toString() || '',
      classId: question.classId?.toString() || '',
      examId: question.examId?.toString() || '',
      subjectId: question.subjectId?.toString() || '',
      topicId: question.topicId?.toString() || '',
      moduleId: question.moduleId?.toString() || '',
      chapterId: question.chapterId?.toString() || '',
      isActive: question.isActive !== undefined ? question.isActive : true,
      examSuitabilities: question.examSuitabilities ? 
        (Array.isArray(question.examSuitabilities) ? 
          question.examSuitabilities.map(item => 
            typeof item === 'object' && item.examId ? item.examId : item
          ) : []) : [],
      examHistories: question.examHistories ? 
        (Array.isArray(question.examHistories) ? 
          question.examHistories.map(item => ({
            examId: item.masterExamId || item.examId,
            yearId: item.appearedYear || item.yearId
          })) : []) : [],
      relationshipId: question.relationshipId || 1,
      options: question.options || initialFormData.options
    });
    setEditingId(question.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      setLoading(true);
      await executeApiCall(deleteQuestion, token, id);
      addNotification({
        type: 'success',
        message: 'Question deleted successfully',
        duration: 3000
      });
      
      await fetchQuestionsData();

    } catch (error) {
      console.error('Error deleting question:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete question',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [executeApiCall, addNotification, token, fetchQuestionsData]);

  // Modal handlers
  const handleViewDetails = useCallback((question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedQuestion(null);
  }, []);

  // Handle option changes
  const handleOptionChange = (optionLetter, field, value) => {
    const updatedOptions = formData.options.map(option => {
      if (option.optionLetter === optionLetter) {
        if (field === 'isCorrect') {
          return { ...option, isCorrect: true };
        }
        return { ...option, [field]: value };
      }
      if (field === 'isCorrect' && option.isCorrect) {
        return { ...option, isCorrect: false };
      }
      return option;
    });
    handleInputChange('options', updatedOptions);
  };

  // Helper function for displaying subject names with context
  const getSubjectDisplayText = useCallback((subject, courseTypeId) => {
    const subjectName = subject.subjectName || subject.name || 'Unknown Subject';
    if (isAcademicCourseType(courseTypeId)) {
      return `${subjectName} (Class-Subject)`;
    } else if (isCompetitiveCourseType(courseTypeId)) {
      return `${subjectName} (Exam-Subject)`;
    } else if (isProfessionalCourseType(courseTypeId)) {
      return `${subjectName} (Course-Subject)`;
    }
    return subjectName;
  }, [isAcademicCourseType, isCompetitiveCourseType, isProfessionalCourseType]);

  // Exam tagging helper functions

  const addExamHistory = useCallback(() => {
    if (!selectedExamForHistory || !selectedYearForHistory) {
      addNotification({
        type: 'error',
        message: 'Please select both exam and year',
        duration: 3000
      });
      return;
    }

    const examId = parseInt(selectedExamForHistory);
    const yearId = parseInt(selectedYearForHistory);
    const newHistory = { examId, yearId };
    
    const exists = formData.examHistories.some(h => h.examId === examId && h.yearId === yearId);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        examHistories: [...prev.examHistories, newHistory]
      }));
      
      // Clear the selected values
      setSelectedExamForHistory('');
      setSelectedYearForHistory('');
      
      addNotification({
        type: 'success',
        message: 'Exam history tag added successfully',
        duration: 2000
      });
    } else {
      addNotification({
        type: 'error',
        message: 'This exam-year combination already exists',
        duration: 3000
      });
    }
  }, [selectedExamForHistory, selectedYearForHistory, formData.examHistories, addNotification]);

  const removeExamHistory = useCallback((examId, yearId) => {
    setFormData(prev => ({
      ...prev,
      examHistories: prev.examHistories.filter(h => !(h.examId === examId && h.yearId === yearId))
    }));
  }, []);

  const getExamName = useCallback((examId) => {
    if (!Array.isArray(masterExams)) return 'Unknown Exam';
    
    // Try both string and number comparison to handle type mismatches
    let exam = masterExams.find(e => e.id === examId);
    if (!exam) {
      exam = masterExams.find(e => e.id === String(examId));
    }
    if (!exam) {
      exam = masterExams.find(e => e.id === Number(examId));
    }
    
    return exam ? exam.exam : 'Unknown Exam';
  }, [masterExams]);

  const getYearValue = useCallback((yearId) => {
    if (!Array.isArray(years)) return 'Unknown Year';
    const year = years.find(y => y.id === yearId);
    return year ? year.year : 'Unknown Year';
  }, [years]);

  // Math symbols for explanation field
  const mathSymbols = [
    { symbol: '±', name: 'Plus-minus', description: '±' },
    { symbol: '×', name: 'Multiply', description: '×' },
    { symbol: '÷', name: 'Divide', description: '÷' },
    { symbol: '²', name: 'Squared', description: '²' },
    { symbol: '³', name: 'Cubed', description: '³' },
    { symbol: '√', name: 'Square root', description: '√' },
    { symbol: 'π', name: 'Pi', description: 'π' },
    { symbol: '∞', name: 'Infinity', description: '∞' },
    { symbol: '∑', name: 'Sum', description: '∑' },
    { symbol: '∫', name: 'Integral', description: '∫' },
    { symbol: '≤', name: 'Less than or equal', description: '≤' },
    { symbol: '≥', name: 'Greater than or equal', description: '≥' },
    { symbol: '≠', name: 'Not equal', description: '≠' },
    { symbol: '≈', name: 'Approximately equal', description: '≈' },
    { symbol: 'α', name: 'Alpha', description: 'α' },
    { symbol: 'β', name: 'Beta', description: 'β' },
    { symbol: 'γ', name: 'Gamma', description: 'γ' },
    { symbol: 'δ', name: 'Delta', description: 'δ' },
    { symbol: 'θ', name: 'Theta', description: 'θ' },
    { symbol: 'λ', name: 'Lambda', description: 'λ' },
    { symbol: 'μ', name: 'Mu', description: 'μ' },
    { symbol: 'σ', name: 'Sigma', description: 'σ' },
    { symbol: 'φ', name: 'Phi', description: 'φ' },
    { symbol: 'ω', name: 'Omega', description: 'ω' },
    { symbol: '₁', name: 'Subscript 1', description: '₁' },
    { symbol: '₂', name: 'Subscript 2', description: '₂' },
    { symbol: '₃', name: 'Subscript 3', description: '₃' },
    { symbol: '₄', name: 'Subscript 4', description: '₄' },
    { symbol: '₅', name: 'Subscript 5', description: '₅' }
  ];

  // Function to insert math symbol into explanation field
  const insertMathSymbol = useCallback((symbol) => {
    const textarea = document.getElementById('explanation');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.explanation;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      const newText = before + symbol + after;
      handleInputChange('explanation', newText);
      
      // Restore cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  }, [formData.explanation, handleInputChange]);

  // Function to insert math symbol into question text field
  const insertMathSymbolToQuestion = useCallback((symbol) => {
    const textarea = document.getElementById('questionText');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.questionText;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      const newText = before + symbol + after;
      handleInputChange('questionText', newText);
      
      // Restore cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  }, [formData.questionText, handleInputChange]);

  // Function to insert math symbol into option text field

  // Simple function to insert math symbol into specific option
  const insertSymbolToOption = useCallback((symbol, optionLetter) => {
    const input = document.getElementById(`option-${optionLetter}`);
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentOption = formData.options.find(opt => opt.optionLetter === optionLetter);
      
      if (currentOption) {
        const text = currentOption.optionText || '';
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const newText = before + symbol + after;
        
        setFormData(prev => ({
          ...prev,
          options: prev.options.map(option => 
            option.optionLetter === optionLetter 
              ? { ...option, optionText: newText }
              : option
          )
        }));
        
        // Restore cursor position
        requestAnimationFrame(() => {
          input.focus();
          input.setSelectionRange(start + symbol.length, start + symbol.length);
        });
      }
    }
  }, [formData.options, setFormData]);

  // Cascading dropdown clearing effects - Clear dependent fields when parent changes
  useEffect(() => {
    // Clear dependent fields when courseTypeId changes
    if (formData.courseTypeId !== initialFormData.courseTypeId) {
      setFormData(prev => ({
        ...prev,
        courseId: '',
        classId: '',
        examId: '',
        subjectId: '',
        topicId: '',
        moduleId: '',
        chapterId: ''
      }));
    }
  }, [formData.courseTypeId]);

  useEffect(() => {
    // Clear dependent fields when courseId changes
    if (formData.courseId !== initialFormData.courseId) {
      setFormData(prev => ({
        ...prev,
        classId: '',
        examId: '',
        subjectId: '',
        topicId: '',
        moduleId: '',
        chapterId: ''
      }));
    }
  }, [formData.courseId]);

  useEffect(() => {
    // Clear dependent fields when classId or examId changes
    if (formData.classId !== initialFormData.classId || formData.examId !== initialFormData.examId) {
      setFormData(prev => ({
        ...prev,
        subjectId: '',
        topicId: '',
        moduleId: '',
        chapterId: ''
      }));
    }
  }, [formData.classId, formData.examId]);

  useEffect(() => {
    // Clear dependent fields when subjectId changes
    if (formData.subjectId !== initialFormData.subjectId) {
      setFormData(prev => ({
        ...prev,
        topicId: '',
        moduleId: '',
        chapterId: ''
      }));
    }
  }, [formData.subjectId]);

  useEffect(() => {
    // Clear dependent fields when topicId changes
    if (formData.topicId !== initialFormData.topicId) {
      setFormData(prev => ({
        ...prev,
        moduleId: '',
        chapterId: ''
      }));
    }
  }, [formData.topicId]);

  useEffect(() => {
    // Clear dependent fields when moduleId changes
    if (formData.moduleId !== initialFormData.moduleId) {
      setFormData(prev => ({
        ...prev,
        chapterId: ''
      }));
    }
  }, [formData.moduleId]);

  // Load initial data
  useEffect(() => {
    if (isInitialized && token) {
      fetchQuestionsData();
    }
  }, [isInitialized, token]);

  // Fetch master exams and years for exam tagging - only when form is shown
  useEffect(() => {
    const fetchExamTaggingData = async () => {
      console.log('fetchExamTaggingData called:', { showForm, isInitialized, hasToken: !!token });
      
      if (!showForm || !isInitialized || !token) {
        console.log('Skipping exam tagging data fetch:', { showForm, isInitialized, hasToken: !!token });
        return; // Only fetch when form is shown
      }
      
      console.log('Starting to fetch exam tagging data...');
      console.log('Current masterExams state:', masterExams);
      console.log('Current years state:', years);
      setExamTaggingLoading(true);
      
      try {
        console.log('Fetching exam tagging data with token:', !!token);
        
        console.log('Making API calls to:', {
          examsEndpoint: '/api/public/master-exams/kv',
          yearsEndpoint: '/api/public/years/kv'
        });
        
        const [examsData, yearsData] = await Promise.all([
          getMasterExamsKV(token).then(data => {
            console.log('✅ Master exams API success:', data);
            return data;
          }).catch(err => {
            console.error('❌ Failed to fetch master exams:', err);
            console.error('Master exams error details:', err.response?.data || err.message);
            return null;
          }),
          getYearsKV(token).then(data => {
            console.log('✅ Years API success:', data);
            return data;
          }).catch(err => {
            console.error('❌ Failed to fetch years:', err);
            console.error('Years error details:', err.response?.data || err.message);
            console.error('Years error status:', err.response?.status);
            console.error('Years error full:', err);
            return null;
          })
        ]);
        
        console.log('Raw API responses:', { 
          examsData, 
          yearsData,
          examsIsArray: Array.isArray(examsData),
          yearsIsArray: Array.isArray(yearsData),
          examsDataType: typeof examsData,
          yearsDataType: typeof yearsData
        });
        
        // Debug: Check if data is wrapped in response object
        console.log('Detailed API response analysis:', {
          examsDataRaw: examsData,
          yearsDataRaw: yearsData,
          examsDataStringified: JSON.stringify(examsData),
          yearsDataStringified: JSON.stringify(yearsData)
        });
        
        // Simple direct mapping for your exact API response format
        let normalizedExams = Array.isArray(examsData) ? examsData.map(item => ({
          id: Number(item.id),
          exam: item.exam || item.name || item.title || ''
        })) : [];
        
        let normalizedYears = Array.isArray(yearsData) ? yearsData.map(item => ({
          id: Number(item.id),
          year: Number(item.year || item.value || item.name)
        })) : [];
        
        // If either exams or years data is missing, use fallback data
        if (normalizedExams.length === 0 || normalizedYears.length === 0) {
          console.log('⚠️ Some data is missing, using fallback data');
          if (normalizedExams.length === 0) {
            normalizedExams = [
              {"exam":"JEE Main","id":1},
              {"exam":"NEET UG","id":2},
              {"exam":"GATE","id":3},
              {"exam":"UPSC CSE","id":4},
              {"exam":"CAT","id":5}
            ].map(item => ({
              id: Number(item.id),
              exam: item.exam || item.name || item.title || ''
            }));
          }
          if (normalizedYears.length === 0) {
            normalizedYears = [
              {"year":2023,"id":3},
              {"year":2022,"id":2},
              {"year":2021,"id":1}
            ].map(item => ({
              id: Number(item.id),
              year: Number(item.year || item.value || item.name)
            }));
          }
        }

        console.log('Normalized data:', { 
          normalizedExams, 
          normalizedYears,
          examsLength: normalizedExams.length,
          yearsLength: normalizedYears.length,
          firstExam: normalizedExams[0],
          firstYear: normalizedYears[0]
        });

        setMasterExams(normalizedExams);
        setYears(normalizedYears);
        console.log('Exam tagging data loaded successfully:', { 
          examsCount: normalizedExams.length, 
          yearsCount: normalizedYears.length,
          showForm: showForm,
          normalizedExams: normalizedExams,
          normalizedYears: normalizedYears
        });
        
        // Additional debugging
        console.log('Setting masterExams state with:', normalizedExams);
        console.log('Setting years state with:', normalizedYears);
      } catch (error) {
        console.error('Error fetching exam tagging data:', error);
        console.error('Full error object:', error);
        
        // Fallback to your exact API response format if API fails
        console.log('Using fallback sample data due to API error');
        const fallbackExams = [
          {"exam":"JEE Main","id":1},
          {"exam":"NEET UG","id":2},
          {"exam":"GATE","id":3},
          {"exam":"UPSC CSE","id":4},
          {"exam":"CAT","id":5}
        ];
        const fallbackYears = [
          {"year":2023,"id":3},
          {"year":2022,"id":2},
          {"year":2021,"id":1}
        ];
        
        // Process fallback data the same way as API data
        const fallbackNormalizedExams = fallbackExams.map(item => ({
          id: Number(item.id),
          exam: item.exam || item.name || item.title || ''
        }));
        
        const fallbackNormalizedYears = fallbackYears.map(item => ({
          id: Number(item.id),
          year: Number(item.year || item.value || item.name)
        }));
        
        setMasterExams(fallbackNormalizedExams);
        setYears(fallbackNormalizedYears);
      } finally {
        setExamTaggingLoading(false);
      }
    };

    fetchExamTaggingData();
  }, [showForm, isInitialized, token]);

  // Show loading state while waiting for authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading mb-4"></div>
          <p className="text-gray-600">Waiting for authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="master-data-component">
      <AdminPageHeader
        title="Question Management"
        subtitle="Create and manage questions with exam tagging and hierarchical organization"
        onBackToDashboard={onBackToDashboard}
        actions={(
          <>
          {!useEnhancedFilters && (
            <button 
              className="btn btn-secondary"
              onClick={() => setUseEnhancedFilters(true)}
              disabled={loading}
              title="Switch to Advanced Filter"
            >
              Advanced Filter
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => {
              // Ensure we are on standard view before opening the form
              setUseEnhancedFilters(false);
              resetForm();
              setShowForm(true);
            }}
            disabled={loading}
          >
            Add Question
          </button>
          </>
        )}
      />

      {/* Enhanced Filters or Standard Filters */}
      {useEnhancedFilters ? (
        <QuestionFilters onBackToDashboard={onBackToDashboard} onViewDetails={handleViewDetails} />
      ) : (
        <div className="standard-filters-wrapper">
        <div className="filter-section">
        <div className="filter-header">
          <h4>Filter Questions</h4>
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
                setSelectedChapter('');
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
                <option key={subject.id} value={subject.id}>
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

          {/* Chapter Filter */}
          <div className="filter-group">
            <label htmlFor="chapter-filter">7. Chapter:</label>
            <select
              id="chapter-filter"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={!selectedModule}
              className="filter-select"
            >
              <option value="">All Chapters</option>
              {filteredChapters.map(chapter => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

        {/* Form Section */}
        {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Question' : 'Add New Question'}</h3>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                resetForm();
                setShowForm(false);
                setEditingId(null);
              }}
              disabled={loading}
            >
              ✕ Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            {/* Basic Information */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="questionText">Question Text *</label>
                
                {/* Math Symbols Toolbar */}
                <div className="math-symbols-toolbar" style={{
                  marginBottom: '8px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                    Math Symbols (Click to insert):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {mathSymbols.map((mathSymbol, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertMathSymbolToQuestion(mathSymbol.symbol)}
                        className="math-symbol-btn"
                        title={mathSymbol.name}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          minWidth: '32px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#fff';
                        }}
                      >
                        {mathSymbol.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  id="questionText"
                  name="questionText"
                  value={formData.questionText}
                  onChange={(e) => handleInputChange('questionText', e.target.value)}
                  onBlur={() => handleBlur('questionText')}
                  className={`form-input ${errors.questionText && touched.questionText ? 'error' : ''}`}
                  rows={4}
                  required
                  placeholder="Enter your question here... Use the math symbols above to add mathematical expressions."
                />
                {errors.questionText && touched.questionText && (
                  <span className="error-message">{errors.questionText}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="questionType">Question Type *</label>
                <select
                  id="questionType"
                  name="questionType"
                  value={formData.questionType}
                  onChange={(e) => handleInputChange('questionType', e.target.value)}
                  onBlur={() => handleBlur('questionType')}
                  className={`form-input ${errors.questionType && touched.questionType ? 'error' : ''}`}
                  required
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="FILL_BLANK">Fill in the Blank</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
                {errors.questionType && touched.questionType && (
                  <span className="error-message">{errors.questionType}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="difficultyLevel">Difficulty Level *</label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  onBlur={() => handleBlur('difficultyLevel')}
                  className={`form-input ${errors.difficultyLevel && touched.difficultyLevel ? 'error' : ''}`}
                  required
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                {errors.difficultyLevel && touched.difficultyLevel && (
                  <span className="error-message">{errors.difficultyLevel}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="marks">Marks *</label>
                <input
                  type="number"
                  id="marks"
                  name="marks"
                  value={formData.marks}
                  onChange={(e) => handleInputChange('marks', e.target.value)}
                  onBlur={() => handleBlur('marks')}
                  className={`form-input ${errors.marks && touched.marks ? 'error' : ''}`}
                  min="1"
                  required
                />
                {errors.marks && touched.marks && (
                  <span className="error-message">{errors.marks}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="negativeMarks">Negative Marks</label>
                <input
                  type="number"
                  id="negativeMarks"
                  name="negativeMarks"
                  value={formData.negativeMarks}
                  onChange={(e) => handleInputChange('negativeMarks', e.target.value)}
                  min="0"
                  step="0.25"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeLimitSeconds">Time Limit (seconds)</label>
                <input
                  type="number"
                  id="timeLimitSeconds"
                  name="timeLimitSeconds"
                  value={formData.timeLimitSeconds}
                  onChange={(e) => handleInputChange('timeLimitSeconds', e.target.value)}
                  min="30"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  name="isActive"
                  value={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                  className="form-input"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>

            {/* Hierarchical Selection - Same as Chapter Management */}
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
                {errors.courseTypeId && touched.courseTypeId && (
                  <span className="error-message">{errors.courseTypeId}</span>
                )}
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
                {errors.courseId && touched.courseId && (
                  <span className="error-message">{errors.courseId}</span>
                )}
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
                      {formFilteredClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {errors.classId && touched.classId && (
                      <span className="error-message">{errors.classId}</span>
                    )}
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
                    {errors.examId && touched.examId && (
                      <span className="error-message">{errors.examId}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Subject Selection */}
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
                  disabled={!formData.courseId}
                >
                  <option value="">Select Subject</option>
                  {formFilteredSubjects.map(subject => (
                    <option key={subject.id} value={subject.linkageId || subject.id}>
                      {getSubjectDisplayText(subject, formData.courseTypeId)}
                    </option>
                  ))}
                </select>
                {errors.subjectId && touched.subjectId && (
                  <span className="error-message">{errors.subjectId}</span>
                )}
              </div>
            </div>

            {/* Topic Selection */}
            <div className="form-row">
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
                  disabled={!formData.subjectId}
                >
                  <option value="">Select Topic</option>
                  {formFilteredTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {errors.topicId && touched.topicId && (
                  <span className="error-message">{errors.topicId}</span>
                )}
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
                  disabled={!formData.topicId}
                >
                  <option value="">Select Module</option>
                  {formFilteredModules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
                {errors.moduleId && touched.moduleId && (
                  <span className="error-message">{errors.moduleId}</span>
                )}
              </div>
            </div>

            {/* Chapter Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="chapterId">Chapter *</label>
                <select
                  id="chapterId"
                  name="chapterId"
                  value={formData.chapterId}
                  onChange={(e) => handleInputChange('chapterId', e.target.value)}
                  onBlur={() => handleBlur('chapterId')}
                  className={`form-input ${errors.chapterId && touched.chapterId ? 'error' : ''}`}
                  required
                  disabled={!formData.moduleId}
                >
                  <option value="">Select Chapter</option>
                  {formFilteredChapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                {errors.chapterId && touched.chapterId && (
                  <span className="error-message">{errors.chapterId}</span>
                )}
              </div>
            </div>

            {/* MCQ Options */}
            {formData.questionType === 'MCQ' && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Answer Options *</label>
                  
                  {/* Math Symbols Toggle for Options */}
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowOptionMathToolbars(!showOptionMathToolbars)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: showOptionMathToolbars ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {showOptionMathToolbars ? 'Hide Math Symbols' : 'Show Math Symbols'}
                    </button>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Toggle math symbol toolbars for each option
                    </span>
                  </div>

                  {formData.options.map((option) => (
                    <div key={option.optionLetter} className="option-row">
                      <div className="option-label">
                        <strong>{option.optionLetter}</strong>
                      </div>
                      <div className="option-input" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          id={`option-${option.optionLetter}`}
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(option.optionLetter, 'optionText', e.target.value)}
                          placeholder={`Enter option ${option.optionLetter}`}
                          className="form-input"
                          required
                        />
                        
                        {/* Individual Math Toolbar for this option */}
                        {showOptionMathToolbars && (
                          <div style={{
                            padding: '6px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '3px',
                            backgroundColor: '#f8f9fa',
                            fontSize: '11px'
                          }}>
                            <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#555' }}>
                              Math Symbols for Option {option.optionLetter}:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                              {mathSymbols.slice(0, 15).map((mathSymbol, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => insertSymbolToOption(mathSymbol.symbol, option.optionLetter)}
                                  title={mathSymbol.name}
                                  style={{
                                    padding: '2px 6px',
                                    border: '1px solid #ccc',
                                    borderRadius: '2px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    minWidth: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#e9ecef';
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#fff';
                                  }}
                                >
                                  {mathSymbol.symbol}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="option-correct">
                        <label className="option-radio">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={option.isCorrect}
                            onChange={() => handleOptionChange(option.optionLetter, 'isCorrect', true)}
                          />
                          <span>Correct</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="explanation">Explanation</label>
                
                {/* Math Symbols Toolbar */}
                <div className="math-symbols-toolbar" style={{
                  marginBottom: '8px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                    Math Symbols (Click to insert):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {mathSymbols.map((mathSymbol, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertMathSymbol(mathSymbol.symbol)}
                        className="math-symbol-btn"
                        title={mathSymbol.name}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          minWidth: '32px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#fff';
                        }}
                      >
                        {mathSymbol.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  id="explanation"
                  name="explanation"
                  value={formData.explanation}
                  onChange={(e) => handleInputChange('explanation', e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Explain why this is the correct answer... Use the math symbols above to add mathematical expressions."
                />
              </div>
            </div>

            {/* Exam Tagging Section */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Exam Suitability Tags</label>
                <div className="tag-selection">
                      {/* Single Select Dropdown with Add Button */}
                      <div className="single-select-group">
                        <label className="single-select-label">
                          Select exams this question is suitable for:
                        </label>
                        {examTaggingLoading ? (
                          <div className="loading-state">
                            <div className="spinner-small"></div>
                            <span>Loading exams...</span>
                          </div>
                        ) : Array.isArray(masterExams) && masterExams.length > 0 ? (
                          <div className="single-select-container">
                            <div className="dropdown-add-group">
                              <select
                                className="single-select-dropdown"
                                value={selectedExamForSuitability || ''}
                                onChange={(e) => setSelectedExamForSuitability(e.target.value)}
                                disabled={examTaggingLoading}
                              >
                                <option value="">
                                  {examTaggingLoading ? 'Loading exams...' : 'Select Exam...'}
                                </option>
                                {masterExams.map(exam => (
                                  <option key={exam.id} value={exam.id}>
                                    {exam.exam}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm add-exam-btn"
                                onClick={() => {
                                  if (selectedExamForSuitability) {
                                    const examId = parseInt(selectedExamForSuitability);
                                    if (!formData.examSuitabilities.some(item => item.examId === examId)) {
                                      setFormData(prev => ({
                                        ...prev,
                                        examSuitabilities: [...prev.examSuitabilities, {examId}]
                                      }));
                                      setSelectedExamForSuitability('');
                                      addNotification({
                                        type: 'success',
                                        message: 'Exam added successfully',
                                        duration: 2000
                                      });
                                    } else {
                                      addNotification({
                                        type: 'error',
                                        message: 'This exam is already selected',
                                        duration: 3000
                                      });
                                    }
                                  }
                                }}
                                disabled={!selectedExamForSuitability || examTaggingLoading}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="no-data-message">
                            <span>No exams available</span>
                          </div>
                        )}
                      </div>
                  
                  {/* Selected Tags Display */}
                  <div className="exam-history-tags">
                    {Array.isArray(formData.examSuitabilities) && formData.examSuitabilities.length > 0 ? (
                      <div>
                        <div className="selected-tags-header">
                          <span className="selected-tags-label">Selected Exams:</span>
                          <button 
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                examSuitabilities: []
                              }));
                            }}
                            style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              padding: '2px 6px'
                            }}
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="tags-container">
                          {formData.examSuitabilities.map(item => {
                            const exam = Array.isArray(masterExams) ? masterExams.find(e => e.id === item.examId) : null;
                            return (
                              <div key={item.examId} className="history-tag-item">
                                <span className="tag-content">
                                  <span className="tag-exam">{exam ? exam.exam : `Unknown (${item.examId})`}</span>
                                </span>
                                <button 
                                  type="button"
                                  className="tag-remove-btn"
                                  onClick={() => {
                                    const updatedSelection = formData.examSuitabilities.filter(item => item.examId !== exam.id);
                                    setFormData(prev => ({
                                      ...prev,
                                      examSuitabilities: updatedSelection
                                    }));
                                  }}
                                  title="Remove this exam"
                                >
                                  <span>×</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="no-tags-message">
                        <span className="no-tags-icon">🏷️</span>
                        <span>No exam suitability tags added yet</span>
                      </div>
                    )}
                  </div>
                </div>
                    <small className="form-help">
                      Select one exam at a time from the dropdown and click "Add" to include it in the suitability list
                      {examTaggingLoading && <span className="loading-text"> (Loading data...)</span>}
                    </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Exam History Tags</label>
                <div className="exam-history-section">
                  {/* Separate dropdowns for exam and year */}
                  <div className="exam-history-inputs">
                    <div className="dropdown-group">
                      <label htmlFor="exam-history-select">Exam</label>
                      <select 
                        id="exam-history-select"
                        className="form-select"
                        value={selectedExamForHistory}
                        onChange={(e) => {
                          const newExamId = e.target.value;
                          console.log('Exam selection changed:', newExamId);
                          setSelectedExamForHistory(newExamId);
                          // Clear year selection when exam changes
                          setSelectedYearForHistory('');
                          console.log('Year selection cleared due to exam change');
                        }}
                        disabled={examTaggingLoading}
                      >
                        <option value="">
                          {examTaggingLoading ? 'Loading exams...' : 'Select Exam...'}
                        </option>
                        {Array.isArray(masterExams) && masterExams.length > 0 ? masterExams.map(exam => (
                          <option key={exam.id} value={exam.id}>
                            {exam.exam}
                          </option>
                        )) : !examTaggingLoading && (
                          <option value="" disabled>No exams available</option>
                        )}
                      </select>
                    </div>
                    
                    <div className="dropdown-group">
                      <label htmlFor="year-history-select">
                        Year
                        {!selectedExamForHistory && (
                          <span className="required-hint"> (Select exam first)</span>
                        )}
                      </label>
                      <select 
                        id="year-history-select"
                        className="form-select"
                        value={selectedYearForHistory}
                        onChange={(e) => {
                          console.log('Year selection changed:', e.target.value);
                          setSelectedYearForHistory(e.target.value);
                        }}
                        disabled={examTaggingLoading || !selectedExamForHistory}
                        key={`year-select-${selectedExamForHistory}`}
                      >
                        <option value="">
                          {!selectedExamForHistory ? "Select exam first..." : 
                           examTaggingLoading ? "Loading years..." : "Select Year..."}
                        </option>
                          {selectedExamForHistory && Array.isArray(years) && years.length > 0 ? (() => {
                            console.log('Rendering years dropdown with years:', years);
                            return years.map((year, index) => {
                              console.log(`Rendering year ${index}:`, year);
                              return (
                                <option key={year.id} value={year.id}>
                                  {year.year}
                                </option>
                              );
                            });
                          })() : selectedExamForHistory && !examTaggingLoading && (
                          <option value="" disabled>No years available</option>
                        )}
                      </select>
                    </div>
                    
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm add-tag-btn"
                      onClick={addExamHistory}
                      disabled={!selectedExamForHistory || !selectedYearForHistory || examTaggingLoading}
                    >
                      Add Tag
                    </button>
                  </div>
                  
                  {/* Display selected exam history tags */}
                  <div className="exam-history-tags">
                    {Array.isArray(formData.examHistories) && formData.examHistories.length > 0 ? (
                      <div className="tags-container">
                        {formData.examHistories.map((history, index) => (
                          <div key={index} className="history-tag-item">
                            <span className="tag-content">
                              <span className="tag-exam">{getExamName(history.examId)}</span>
                              <span className="tag-separator">-</span>
                              <span className="tag-year">{getYearValue(history.yearId)}</span>
                            </span>
                            <button 
                              type="button"
                              className="tag-remove-btn"
                              onClick={() => removeExamHistory(history.examId, history.yearId)}
                              title="Remove this tag"
                            >
                              <span>×</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-tags-message">
                        <span className="no-tags-icon">🏷️</span>
                        <span>No exam history tags added yet</span>
                      </div>
                    )}
                  </div>
                </div>
                <small className="form-help">
                  Select which exams this question was asked in previously
                  {examTaggingLoading && <span className="loading-text"> (Loading data...)</span>}
                </small>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setEditingId(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Question' : 'Create Question')}
              </button>
            </div>
          </form>
        </div>
        )}
        
        {/* Data Section - Card-based layout */}
        {!useEnhancedFilters && (
        <div className="data-section">
        <div className="data-header">
          <h3>Questions ({questions.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                fetchQuestionsData();
              }}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {questionsLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h4>No Questions Found</h4>
            <p>No questions match your current filters. Try adjusting your filter criteria or create a new question.</p>
          </div>
        ) : (
          <div className="data-grid">
            {questions.map((question) => (
              <QuestionListCard
                key={question.id}
                question={question}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
        </div>
      )}
      </div>
      )}
      
      {/* Question Details Modal */}
      {showModal && selectedQuestion && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Question Details</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Question Text */}
              <div className="detail-section">
                <h4>Question Text</h4>
                <div className="detail-content">
                  {selectedQuestion.questionText}
                </div>
              </div>

              {/* Question Metadata */}
              <div className="detail-section">
                <h4>Question Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedQuestion.questionType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Difficulty:</span>
                    <span className="detail-value">{selectedQuestion.difficultyLevel}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Marks:</span>
                    <span className="detail-value">{selectedQuestion.marks}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Limit:</span>
                    <span className="detail-value">{selectedQuestion.timeLimitSeconds}s</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Negative Marks:</span>
                    <span className="detail-value">{selectedQuestion.negativeMarks}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${selectedQuestion.isActive ? 'active' : 'inactive'}`}>
                      {selectedQuestion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Answer Options */}
              {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                <div className="detail-section">
                  <h4>Answer Options</h4>
                  <div className="options-list">
                    {selectedQuestion.options.map((option, index) => (
                      <div 
                        key={index}
                        className={`option-detail ${option.isCorrect ? 'correct' : ''}`}
                      >
                        <div className="option-header">
                          <span className="option-letter">
                            {option.optionLetter || String.fromCharCode(65 + index)}
                          </span>
                          {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                        </div>
                        <div className="option-text">
                          {option.optionText || option.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {selectedQuestion.explanation && (
                <div className="detail-section">
                  <h4>Explanation</h4>
                  <div className="detail-content">
                    {selectedQuestion.explanation}
                  </div>
                </div>
              )}

              {/* Subject Information */}
              <div className="detail-section">
                <h4>Subject Information</h4>
                <div className="detail-grid">
                  {selectedQuestion.subjectName && (
                    <div className="detail-item">
                      <span className="detail-label">Subject:</span>
                      <span className="detail-value">{selectedQuestion.subjectName}</span>
                    </div>
                  )}
                  {selectedQuestion.topicName && (
                    <div className="detail-item">
                      <span className="detail-label">Topic:</span>
                      <span className="detail-value">{selectedQuestion.topicName}</span>
                    </div>
                  )}
                  {selectedQuestion.moduleName && (
                    <div className="detail-item">
                      <span className="detail-label">Module:</span>
                      <span className="detail-value">{selectedQuestion.moduleName}</span>
                    </div>
                  )}
                  {selectedQuestion.chapterName && (
                    <div className="detail-item">
                      <span className="detail-label">Chapter:</span>
                      <span className="detail-value">{selectedQuestion.chapterName}</span>
                    </div>
                  )}
                  {selectedQuestion.courseTypeName && (
                    <div className="detail-item">
                      <span className="detail-label">Course Type:</span>
                      <span className="detail-value">{selectedQuestion.courseTypeName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exam Tags */}
              {(selectedQuestion.examSuitabilities && selectedQuestion.examSuitabilities.length > 0) || 
               (selectedQuestion.examHistories && selectedQuestion.examHistories.length > 0) ? (
                <div className="detail-section">
                  <h4>Exam Information</h4>
                  {selectedQuestion.examSuitabilities && selectedQuestion.examSuitabilities.length > 0 && (
                    <div className="exam-tags-group">
                      <span className="detail-label">Suitable for:</span>
                      <div className="exam-suitability-list">
                        {selectedQuestion.examSuitabilities.map((suitability, index) => (
                          <div key={index} className="exam-suitability-item">
                            <div className="exam-suitability-header">
                              <span className="exam-name">{suitability.masterExamName || `Exam ${suitability.masterExamId}`}</span>
                              <span className={`suitability-level ${suitability.suitabilityLevel?.toLowerCase()}`}>
                                {suitability.suitabilityLevel || 'MEDIUM'}
                              </span>
                            </div>
                            {suitability.notes && (
                              <div className="exam-notes">
                                <small>Notes: {suitability.notes}</small>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedQuestion.examHistories && selectedQuestion.examHistories.length > 0 && (
                    <div className="exam-tags-group">
                      <span className="detail-label">Previously asked in:</span>
                      <div className="exam-history-list">
                        {selectedQuestion.examHistories.map((history, index) => (
                          <div key={index} className="exam-history-item">
                            <div className="exam-history-header">
                              <span className="exam-name">{history.masterExamName || `Exam ${history.masterExamId}`}</span>
                              <span className="exam-year">{history.appearedYear}</span>
                            </div>
                            <div className="exam-history-details">
                              {history.appearedSession && (
                                <span className="exam-session">Session: {history.appearedSession}</span>
                              )}
                              {history.marksInExam && (
                                <span className="exam-marks">Marks: {history.marksInExam}</span>
                              )}
                              {history.questionNumberInExam && (
                                <span className="exam-question-number">Q#{history.questionNumberInExam}</span>
                              )}
                              {history.difficultyInExam && (
                                <span className="exam-difficulty">Difficulty: {history.difficultyInExam}</span>
                              )}
                            </div>
                            {history.notes && (
                              <div className="exam-notes">
                                <small>Notes: {history.notes}</small>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Timestamps */}
              <div className="detail-section">
                <h4>Timestamps</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(selectedQuestion.createdAt).toLocaleString()}
                      {selectedQuestion.createdByName && ` by ${selectedQuestion.createdByName}`}
                    </span>
                  </div>
                  {selectedQuestion.updatedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Updated:</span>
                      <span className="detail-value">
                        {new Date(selectedQuestion.updatedAt).toLocaleString()}
                        {selectedQuestion.updatedByName && ` by ${selectedQuestion.updatedByName}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleCloseModal();
                  handleEdit(selectedQuestion);
                }}
              >
                Edit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;