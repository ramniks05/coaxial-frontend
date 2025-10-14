import { API_BASE, apiGet, apiPost } from '../utils/apiUtils';

// Get Course Catalog (Public API - no auth required)
export const getCourseCatalog = async () => {
  const endpoint = `${API_BASE}/api/public/course-catalogue/all`;
  
  console.log('Fetching course catalog from:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    console.log('Course catalog response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Course catalog error:', errorText);
      throw new Error('Failed to fetch course catalog: ' + response.status + ' ' + response.statusText);
    }
    
    const data = await response.json();
    console.log('Course catalog data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching course catalog:', error);
    throw error;
  }
};

// Get Course Catalog with Filters
export const getFilteredCourseCatalog = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.courseTypeId) params.append('courseTypeId', filters.courseTypeId);
  if (filters.search) params.append('search', filters.search);
  if (filters.active !== undefined) params.append('active', filters.active);
  
  const endpoint = `${API_BASE}/api/public/course-catalogue/all?${params.toString()}`;
  
  console.log('Fetching filtered course catalog from:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to fetch filtered course catalog: ' + response.status);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filtered course catalog:', error);
    throw error;
  }
};

// ========================================
// STUDENT TEST SERVICES
// ========================================

// Get available tests for student based on their subscription
export const getStudentAvailableTests = async (token, subscriptionFilters = {}) => {
  const params = new URLSearchParams();
  
  // Add subscription-based filters (priority: classId > examId > courseId)
  if (subscriptionFilters.classId) {
    params.append('classId', subscriptionFilters.classId);
  } else if (subscriptionFilters.examId) {
    params.append('examId', subscriptionFilters.examId);
  } else if (subscriptionFilters.courseId) {
    params.append('courseId', subscriptionFilters.courseId);
  }
  
  const endpoint = `/api/student/dashboard/tests${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching student tests from:', endpoint);
  console.log('Full URL: http://localhost:8080' + endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Student tests data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching student tests:', error);
    throw error;
  }
};

// Start a test and get session
export const startStudentTest = async (token, testId) => {
  const endpoint = `/api/student/tests/${testId}/start`;
  
  // Get user's IP and browser info
  const payload = {
    ipAddress: 'client', // Will be detected by backend
    userAgent: navigator.userAgent
  };
  
  console.log('Starting test:', testId);
  
  try {
    const response = await apiPost(endpoint, payload, token);
    const data = await response.json();
    console.log('Test started with session:', data);
    return data;
  } catch (error) {
    console.error('Error starting test:', error);
    throw error;
  }
};

// Get test questions with session
export const getStudentTestQuestions = async (token, testId, sessionId) => {
  if (!sessionId) {
    throw new Error('SessionId is required to fetch test questions');
  }
  
  const endpoint = `/api/student/tests/${testId}/questions?sessionId=${sessionId}`;
  
  console.log('Fetching test questions from:', endpoint);
  console.log('SessionId:', sessionId);
  console.log('Full URL:', `http://localhost:8080${endpoint}`);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Test questions data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching test questions:', error);
    throw error;
  }
};

// Submit individual answer
export const submitStudentAnswer = async (token, testId, answerData) => {
  const endpoint = `/api/student/tests/${testId}/submit-answer`;
  
  console.log('=== Submitting Answer ===');
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', `http://localhost:8080${endpoint}`);
  console.log('Answer data:', answerData);
  console.log('Validation:', {
    hasSessionId: !!answerData.sessionId,
    hasQuestionId: !!answerData.questionId,
    hasSelectedOptionId: !!answerData.selectedOptionId,
    sessionId: answerData.sessionId,
    questionId: answerData.questionId,
    selectedOptionId: answerData.selectedOptionId
  });
  
  try {
    const response = await apiPost(endpoint, answerData, token);
    const data = await response.json();
    console.log('✅ Answer submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Submit test (end attempt)
export const submitStudentTest = async (token, testId, sessionId) => {
  // sessionId as query parameter, not body
  const endpoint = `/api/student/tests/${testId}/submit?sessionId=${sessionId}`;
  
  console.log('Submitting test with endpoint:', endpoint);
  console.log('Full URL:', `http://localhost:8080${endpoint}`);
  
  try {
    // Empty body since sessionId is in query params
    const response = await apiPost(endpoint, {}, token);
    const data = await response.json();
    console.log('Test submitted, result:', data);
    return data;
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
};

// Get student's test attempt history (all tests)
export const getStudentTestAttempts = async (token) => {
  const endpoint = `/api/student/tests/attempts`;
  
  console.log('Fetching all test attempts from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Student test attempts:', data);
    return data;
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    throw error;
  }
};

// Get attempts for specific test
export const getTestAttempts = async (token, testId) => {
  const endpoint = `/api/student/tests/${testId}/attempts`;
  
  console.log('Fetching attempts for test:', testId);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Test attempts:', data);
    return data;
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    throw error;
  }
};

// Check for active session
export const checkActiveSession = async (token, testId) => {
  const endpoint = `/api/student/tests/${testId}/active-session`;
  
  console.log('Checking active session for test:', testId);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Active session check:', data);
    return data;
  } catch (error) {
    console.error('Error checking active session:', error);
    throw error;
  }
};

// Abandon active test session
export const abandonTestSession = async (token, testId) => {
  const endpoint = `/api/student/tests/${testId}/abandon-session`;
  
  console.log('Abandoning test session for test:', testId);
  
  try {
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to abandon session: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Session abandoned:', data);
    return data;
  } catch (error) {
    console.error('Error abandoning session:', error);
    throw error;
  }
};

// ========================================
// STUDENT QUESTION BANK SERVICES
// ========================================

// Get questions for student (subscription-based access)
export const getStudentQuestions = async (token, filters = {}) => {
  const params = new URLSearchParams();
  
  // Required: courseTypeId (1=Academic, 2=Competitive, 3=Professional)
  if (filters.courseTypeId) params.append('courseTypeId', filters.courseTypeId);
  
  // linkageId is the ClassSubject/ExamSubject/CourseSubject ID (previously called subjectId)
  if (filters.linkageId) params.append('linkageId', filters.linkageId);
  
  // Hierarchy filters
  if (filters.topicId) params.append('topicId', filters.topicId);
  if (filters.moduleId) params.append('moduleId', filters.moduleId);
  if (filters.chapterId) params.append('chapterId', filters.chapterId);
  
  // Basic filters
  if (filters.questionType) params.append('questionType', filters.questionType);
  if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel);
  
  // Pagination and sorting
  if (filters.page !== undefined) params.append('page', filters.page);
  if (filters.size) params.append('size', filters.size);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortDir) params.append('sortDir', filters.sortDir);
  
  const endpoint = `/api/student/questions${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('=== Fetching Student Questions ===');
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', `http://localhost:8080${endpoint}`);
  console.log('Filters applied:', filters);
  console.log('Parameters:', {
    courseTypeId: filters.courseTypeId,
    linkageId: filters.linkageId,
    topicId: filters.topicId,
    moduleId: filters.moduleId,
    chapterId: filters.chapterId,
    questionType: filters.questionType,
    difficultyLevel: filters.difficultyLevel
  });
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Student questions response:', data);
    console.log('Total questions:', data.totalElements);
    return data;
  } catch (error) {
    console.error('Error fetching student questions:', error);
    throw error;
  }
};

// Get specific question by ID
export const getStudentQuestionById = async (token, questionId) => {
  const endpoint = `/api/student/questions/${questionId}`;
  
  console.log('Fetching question by ID:', questionId);
  console.log('Full URL:', `http://localhost:8080${endpoint}`);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Question details:', data);
    return data;
  } catch (error) {
    console.error('Error fetching question details:', error);
    throw error;
  }
};
