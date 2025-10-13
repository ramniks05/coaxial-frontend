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
  const endpoint = `/api/student/tests/${testId}/questions?sessionId=${sessionId}`;
  
  console.log('Fetching test questions from:', endpoint);
  
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
  
  console.log('Submitting answer for question:', answerData.questionId);
  
  try {
    const response = await apiPost(endpoint, answerData, token);
    const data = await response.json();
    console.log('Answer submitted:', data);
    return data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};

// Submit test (end attempt)
export const submitStudentTest = async (token, testId, sessionId) => {
  const endpoint = `/api/student/tests/${testId}/submit`;
  
  const payload = {
    sessionId: sessionId
  };
  
  console.log('Submitting test:', payload);
  
  try {
    const response = await apiPost(endpoint, payload, token);
    const data = await response.json();
    console.log('Test submitted, result:', data);
    return data;
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
};

// Get student's test attempt history
export const getStudentTestAttempts = async (token) => {
  const endpoint = `/api/student/test-attempts`;
  
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
