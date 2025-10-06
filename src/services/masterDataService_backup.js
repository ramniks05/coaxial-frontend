// Master Data Management API Service
import { API_BASE, apiDelete, apiGet, apiPost, apiPut } from '../utils/apiUtils';

// Course Type Management
export const getCourseTypes = async (token) => {
  const endpoint = '/api/admin/master-data/course-types';
  
  console.log('Fetching course types from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Course types data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching course types:', error);
    throw error;
  }
};

export const createCourseType = async (token, courseTypeData) => {
  console.log('Creating course type with data:', courseTypeData);
  
  const endpoint = '/api/admin/master-data/course-types';
  
  console.log('Creating course type at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, courseTypeData, token);
    const data = await response.json();
    console.log('Course type created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating course type:', error);
    throw error;
  }
};

export const updateCourseType = async (token, id, courseTypeData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/course-types/${id}`;
  
  console.log('Updating course type at endpoint:', endpoint);
  console.log('Course type data being sent:', courseTypeData);
  
  const headers = {
    'accept': '*/*'
  };
  
  // Add authorization header only if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(courseTypeData)
  });
  
  console.log('Update course type response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update course type error response:', errorText);
    console.error('Request data that caused error:', courseTypeData);
    throw new Error(`Failed to update course type: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update course type data:', data);
  return data;
};

export const deleteCourseType = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/course-types/${id}`;
  
  console.log('Deleting course type at endpoint:', endpoint);
  
  const headers = {
    'accept': '*/*'
  };
  
  // Add authorization header only if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers
  });
  
  console.log('Delete course type response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete course type error response:', errorText);
    throw new Error(`Failed to delete course type: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Course Management
export const getCourses = async (token, courseTypeId = null, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    const params = new URLSearchParams();
    if (courseTypeId) params.append('courseTypeId', courseTypeId);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    
    const endpoint = `${API_BASE}/api/admin/master-data/courses?${params}`;
    
    console.log('Fetching courses from:', endpoint);
    
    const headers = {
      'accept': '*/*'
    };
    
    // Add authorization header only if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(endpoint, {
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Get courses response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get courses error:', errorText);
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Courses data:', data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Backend is taking too long to respond');
    }
    throw error;
  }
};

// Get courses by course type ID
export const getCoursesByCourseType = async (token, courseTypeId) => {
  if (!courseTypeId) {
    throw new Error('Course type ID is required');
  }
  
  const endpoint = `${API_BASE}/api/admin/master-data/courses/course-type/${courseTypeId}`;
  
  console.log('Fetching courses by course type from:', endpoint);
  
  const headers = {
    'accept': '*/*'
  };
  
  // Add authorization header only if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    headers
  });
  
  console.log('Get courses by course type response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get courses by course type error:', errorText);
    throw new Error(`Failed to fetch courses by course type: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Courses by course type data:', data);
  return data;
};

export const createCourse = async (token, courseData) => {
  console.log('Creating course with data:', courseData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/courses`;
  
  console.log('Creating course at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseData)
  });
  
  console.log('Create course response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create course error response:', errorText);
    throw new Error(`Failed to create course: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create course data:', data);
  return data;
};

export const updateCourse = async (token, id, courseData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/courses/${id}`;
  
  console.log('Updating course at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseData)
  });
  
  console.log('Update course response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update course error response:', errorText);
    throw new Error(`Failed to update course: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update course data:', data);
  return data;
};

export const deleteCourse = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/courses/${id}`;
  
  console.log('Deleting course at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete course response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete course error response:', errorText);
    throw new Error(`Failed to delete course: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Class Management (Academic)
export const getClasses = async (token, courseTypeId = null, courseId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/classes?${params}`;
  
  console.log('Fetching classes from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Get classes response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get classes error:', errorText);
    throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Classes data:', data);
  return data;
};

export const createClass = async (token, classData) => {
  console.log('Creating class with data:', classData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/classes`;
  
  console.log('Creating class at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(classData)
  });
  
  console.log('Create class response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create class error response:', errorText);
    throw new Error(`Failed to create class: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create class data:', data);
  return data;
};

export const updateClass = async (token, id, classData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/classes/${id}`;
  
  console.log('Updating class at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(classData)
  });
  
  console.log('Update class response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update class error response:', errorText);
    throw new Error(`Failed to update class: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update class data:', data);
  return data;
};

export const deleteClass = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/classes/${id}`;
  
  console.log('Deleting class at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete class response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete class error response:', errorText);
    throw new Error(`Failed to delete class: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Subject Management
export const getSubjects = async (token, courseTypeId = null, courseId = null, classId = null, examId = null, active = null) => {
  // Use the unified endpoint with query parameters based on course type
  const params = new URLSearchParams();
  
  // Always include courseTypeId and active if provided
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (active !== null) params.append('active', active);
  
  // Add specific parameters based on what's provided (following the API specification)
  if (classId) {
    // Academic courses - only classId with courseTypeId
    params.append('classId', classId);
  } else if (examId) {
    // Competitive courses - only examId with courseTypeId
    params.append('examId', examId);
  } else if (courseId) {
    // Professional courses - only courseId with courseTypeId
    params.append('courseId', courseId);
  }
  
  const endpoint = `/api/admin/subjects?${params}`;
  
  console.log('Fetching subjects from URL:', endpoint);
  console.log('Token:', token);
  console.log('Filters - Active:', active, 'CourseType:', courseTypeId, 'Course:', courseId, 'Class:', classId, 'Exam:', examId);
    
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Subjects data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

// Get master subjects by course type ID
export const getMasterSubjectsByCourseType = async (token, courseTypeId) => {
  if (!courseTypeId) {
    throw new Error('Course type ID is required');
  }
  
  const endpoint = `${API_BASE}/api/admin/subjects/course-type/${courseTypeId}`;
  
  console.log('Fetching master subjects from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Master subjects response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Master subjects error:', errorText);
    throw new Error(`Failed to fetch master subjects: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Master subjects data:', data);
  return data;
};

export const createSubject = async (token, subjectData) => {
  console.log('Creating subject with data:', subjectData);
  
  const endpoint = `${API_BASE}/api/admin/subjects`;
  
  console.log('Creating subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subjectData)
  });
  
  console.log('Create subject response status:', response.status);
  console.log('Create subject response ok:', response.ok);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create subject error response:', errorText);
    
    // Try to parse the error response as JSON to extract the actual error message
    let errorMessage = errorText;
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.error || errorObj.message || errorText;
    } catch (parseError) {
      // If not JSON, use the raw text
      errorMessage = errorText;
    }
    
    throw new Error(`Failed to create subject: ${response.status} ${response.statusText} - ${errorMessage}`);
  }
  
  const data = await response.json();
  console.log('Create subject data:', data);
  return data;
};

// Link existing Subject to a Class (Academic)
export const createClassSubjectLink = async (token, payload) => {
  // payload: { subjectId, classId, displayOrder, isActive }
  const endpoint = `${API_BASE}/api/admin/master-data/class-subjects`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create class-subject link error response:', errorText);
    
    // Try to parse the error response as JSON to extract the actual error message
    let errorMessage = errorText;
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.error || errorObj.message || errorText;
    } catch (parseError) {
      // If not JSON, use the raw text
      errorMessage = errorText;
    }
    
    throw new Error(`Failed to link subject to class: ${response.status} ${response.statusText} - ${errorMessage}`);
  }
  return response.json();
};

// Link existing Subject to an Exam (Competitive)
export const createExamSubjectLink = async (token, payload) => {
  // payload: { subjectId, examId, displayOrder, weightage }
  const endpoint = `${API_BASE}/api/admin/master-data/exam-subjects`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create exam-subject link error response:', errorText);
    
    // Try to parse the error response as JSON to extract the actual error message
    let errorMessage = errorText;
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.error || errorObj.message || errorText;
    } catch (parseError) {
      // If not JSON, use the raw text
      errorMessage = errorText;
    }
    
    throw new Error(`Failed to link subject to exam: ${response.status} ${response.statusText} - ${errorMessage}`);
  }
  return response.json();
};

// Link existing Subject to a Course (Professional)
export const createCourseSubjectLink = async (token, payload) => {
  // payload: { subjectId, courseId, displayOrder, isCompulsory }
  const endpoint = `${API_BASE}/api/admin/master-data/course-subjects`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create course-subject link error response:', errorText);
    
    // Try to parse the error response as JSON to extract the actual error message
    let errorMessage = errorText;
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.error || errorObj.message || errorText;
    } catch (parseError) {
      // If not JSON, use the raw text
      errorMessage = errorText;
    }
    
    throw new Error(`Failed to link subject to course: ${response.status} ${response.statusText} - ${errorMessage}`);
  }
  return response.json();
};

export const updateSubject = async (token, id, subjectData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/subjects/${id}`;
  
  console.log('Updating subject at endpoint:', endpoint);
  console.log('Update subject data:', subjectData);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subjectData)
  });
  
  console.log('Update subject response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update subject error response:', errorText);
    throw new Error(`Failed to update subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update subject data:', data);
  return data;
};

export const deleteSubject = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/subjects/${id}`;
  
  console.log('Deleting subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete subject response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete subject error response:', errorText);
    throw new Error(`Failed to delete subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};


// Exam Management
export const getExams = async (token, courseTypeId = null, courseId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/exams?${params}`;
  
  console.log('Fetching exams from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Get exams response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get exams error:', errorText);
    throw new Error(`Failed to fetch exams: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
};

export const createExam = async (token, examData) => {
  console.log('Creating exam with data:', examData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/exams`;
  
  console.log('Creating exam at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(examData)
  });
  
  console.log('Create exam response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create exam error response:', errorText);
    throw new Error(`Failed to create exam: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create exam data:', data);
  return data;
};

export const updateExam = async (token, id, examData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/exams/${id}`;
  
  console.log('Updating exam at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(examData)
  });
  
  console.log('Update exam response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update exam error response:', errorText);
    throw new Error(`Failed to update exam: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update exam data:', data);
  return data;
};

export const deleteExam = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/exams/${id}`;
  
  console.log('Deleting exam at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete exam response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete exam error response:', errorText);
    throw new Error(`Failed to delete exam: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Class-Subject Mapping (Academic)
export const getClassSubjects = async (token, classId = null) => {
  const params = new URLSearchParams();
  if (classId) params.append('classId', classId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/class-subjects?${params}`;
  
  console.log('Fetching class-subjects from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Get class-subjects response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get class-subjects error:', errorText);
    throw new Error(`Failed to fetch class-subjects: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Class-subjects data:', data);
  return data;
};

export const createClassSubject = async (token, classSubjectData) => {
  console.log('Creating class-subject with data:', classSubjectData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/class-subjects`;
  
  console.log('Creating class-subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(classSubjectData)
  });
  
  console.log('Create class-subject response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create class-subject error response:', errorText);
    
    // Try to parse the error response as JSON to extract the actual error message
    let errorMessage = errorText;
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.error || errorObj.message || errorText;
    } catch (parseError) {
      // If not JSON, use the raw text
      errorMessage = errorText;
    }
    
    throw new Error(`Failed to create class-subject: ${response.status} ${response.statusText} - ${errorMessage}`);
  }
  
  const data = await response.json();
  console.log('Create class-subject data:', data);
  return data;
};

export const deleteClassSubject = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/class-subjects/${id}`;
  
  console.log('Deleting class-subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete class-subject response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete class-subject error response:', errorText);
    throw new Error(`Failed to delete class-subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Exam-Subject Mapping (Competitive)
export const getExamSubjects = async (token, examId = null) => {
  const params = new URLSearchParams();
  if (examId) params.append('examId', examId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/exam-subjects?${params}`;
  
  console.log('Fetching exam-subjects from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Get exam-subjects response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get exam-subjects error:', errorText);
    throw new Error(`Failed to fetch exam-subjects: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Exam-subjects data:', data);
  return data;
};

export const createExamSubject = async (token, examSubjectData) => {
  console.log('Creating exam-subject with data:', examSubjectData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/exam-subjects`;
  
  console.log('Creating exam-subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(examSubjectData)
  });
  
  console.log('Create exam-subject response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create exam-subject error response:', errorText);
    throw new Error(`Failed to create exam-subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create exam-subject data:', data);
  return data;
};

export const deleteExamSubject = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/exam-subjects/${id}`;
  
  console.log('Deleting exam-subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete exam-subject response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete exam-subject error response:', errorText);
    throw new Error(`Failed to delete exam-subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Topic Management
export const getTopics = async (token, classSubjectId = null, examSubjectId = null, courseSubjectId = null, isActive = null) => {
  const params = new URLSearchParams();
  
  // Add filter parameters based on backend API
  if (classSubjectId) params.append('classSubjectId', classSubjectId);
  if (examSubjectId) params.append('examSubjectId', examSubjectId);
  if (courseSubjectId) params.append('courseSubjectId', courseSubjectId);
  if (isActive !== null) params.append('active', isActive);
  
  const url = `${API_BASE}/api/admin/master-data/topics?${params}`;
  
  console.log('Fetching topics from URL:', url);
  console.log('Filters - ClassSubject:', classSubjectId, 'ExamSubject:', examSubjectId, 'CourseSubject:', courseSubjectId, 'IsActive:', isActive);
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Topics response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Topics error response:', errorText);
    throw new Error(`Failed to fetch topics: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topics data:', data);
  return data;
};

// Get Topics with Advanced Filters (for the additional filtering options you mentioned)
export const getTopicsWithFilters = async (token, active = null, name = null, subjectId = null, courseTypeId = null, createdAfter = null) => {
  const params = new URLSearchParams();
  
  // Add filter parameters based on backend API
  if (active !== null) params.append('active', active);
  if (name) params.append('name', name);
  if (subjectId) params.append('subjectId', subjectId);
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (createdAfter) params.append('createdAfter', createdAfter);
  
  const url = `${API_BASE}/api/admin/master-data/topics?${params}`;
  
  console.log('Fetching topics with filters from URL:', url);
  console.log('Filters - Active:', active, 'Name:', name, 'SubjectId:', subjectId, 'CourseTypeId:', courseTypeId, 'CreatedAfter:', createdAfter);
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Topics with filters response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Topics with filters error response:', errorText);
    throw new Error(`Failed to fetch topics with filters: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topics with filters data:', data);
  console.log('Topics data type:', typeof data);
  console.log('Topics data structure:', Array.isArray(data) ? 'Array' : 'Object');
  if (Array.isArray(data)) {
    console.log('Topics array length:', data.length);
  } else if (data && typeof data === 'object') {
    console.log('Topics object keys:', Object.keys(data));
  }
  return data;
};

// Get Topics with Pagination
export const getTopicsPaginated = async (token, page = 0, size = 10, sortBy = 'name', sortDirection = 'asc', active = null, name = null, subjectId = null, courseTypeId = null, createdAfter = null) => {
  const params = new URLSearchParams();
  
  // Add pagination parameters
  params.append('page', page);
  params.append('size', size);
  params.append('sortBy', sortBy);
  params.append('sortDirection', sortDirection);
  
  // Add filter parameters
  if (active !== null) params.append('active', active);
  if (name) params.append('name', name);
  if (subjectId) params.append('subjectId', subjectId);
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (createdAfter) params.append('createdAfter', createdAfter);
  
  const url = `${API_BASE}/api/admin/master-data/topics/paginated?${params}`;
  
  console.log('Fetching paginated topics from URL:', url);
  console.log('Pagination - Page:', page, 'Size:', size, 'SortBy:', sortBy, 'SortDirection:', sortDirection);
  console.log('Filters - Active:', active, 'Name:', name, 'SubjectId:', subjectId, 'CourseTypeId:', courseTypeId, 'CreatedAfter:', createdAfter);
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Paginated topics response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Paginated topics error response:', errorText);
    throw new Error(`Failed to fetch paginated topics: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Paginated topics data:', data);
  return data;
};

// Get topics by linkage (class-subject, exam-subject, course-subject)
export const getTopicsByLinkage = async (token, courseTypeId, relationshipId, active = true) => {
  if (!courseTypeId || !relationshipId) {
    throw new Error('Course type ID and relationship ID are required');
  }
  
  const params = new URLSearchParams();
  params.append('courseTypeId', courseTypeId);
  params.append('relationshipId', relationshipId);
  if (active !== null) params.append('active', active);
  
  const url = `${API_BASE}/api/admin/master-data/topics/by-linkage?${params}`;
  
  console.log('Fetching topics by linkage from URL:', url);
  console.log('Filters - CourseType:', courseTypeId, 'RelationshipId:', relationshipId, 'Active:', active);
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Topics by linkage response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Topics by linkage error response:', errorText);
    throw new Error(`Failed to fetch topics by linkage: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topics by linkage data:', data);
  return data;
};

// Get topics with combined filters
export const getTopicsCombinedFilter = async (token, filters = {}, usePublicEndpoint = false) => {
  const {
    courseTypeId = null,
    courseId = null,
    classId = null,
    examId = null,
    subjectId = null,
    active = null,
    search = null
  } = filters;
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (courseTypeId !== null && courseTypeId !== '') {
    queryParams.append('courseTypeId', courseTypeId);
  }
  if (courseId !== null && courseId !== '') {
    queryParams.append('courseId', courseId);
  }
  if (classId !== null && classId !== '') {
    queryParams.append('classId', classId);
  }
  if (examId !== null && examId !== '') {
    queryParams.append('examId', examId);
  }
  if (subjectId !== null && subjectId !== '') {
    queryParams.append('subjectId', subjectId);
  }
  if (active !== null && active !== '') {
    queryParams.append('active', active);
  }
  if (search !== null && search !== '') {
    queryParams.append('search', search);
  }
  
  // Choose endpoint based on usePublicEndpoint flag
  const baseEndpoint = usePublicEndpoint 
    ? `${API_BASE}/api/admin/master-data/topics/public/combined-filter`
    : `${API_BASE}/api/admin/master-data/topics/combined-filter`;
    
  const endpoint = `${baseEndpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  console.log('Fetching topics with combined filter at endpoint:', endpoint);
  console.log('Filter parameters:', filters);
  console.log('Using public endpoint:', usePublicEndpoint);
  
  // Prepare headers - public endpoint doesn't require authentication
  const headers = {};
  
  if (!usePublicEndpoint && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: headers
  });
  
  console.log('Combined filter topics response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Combined filter topics error response:', errorText);
    throw new Error(`Failed to fetch topics with combined filter: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Combined filter topics data:', data);
  
  // Handle different response structures
  if (Array.isArray(data)) {
    return data;
  } else if (data.content && Array.isArray(data.content)) {
    return data.content;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.warn('Unexpected response structure for combined filter topics:', data);
    return [];
  }
};

export const createTopic = async (token, topicData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/topics`;
  
  console.log('Creating topic at endpoint:', endpoint);
  console.log('Topic data:', topicData);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topicData)
  });
  
  console.log('Create topic response status:', response.status);
  console.log('Create topic response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create topic error response:', errorText);
    console.error('Request details:', {
      endpoint: endpoint,
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token ? 'TOKEN_PRESENT' : 'NO_TOKEN'}`,
        'Content-Type': 'application/json'
      },
      body: topicData
    });
    throw new Error(`Failed to create topic: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create topic data:', data);
  return data;
};

export const updateTopic = async (token, id, topicData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/topics/create/${id}`;
  
  console.log('Updating topic at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topicData)
  });
  
  console.log('Update topic response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update topic error response:', errorText);
    throw new Error(`Failed to update topic: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update topic data:', data);
  return data;
};

export const deleteTopic = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/topics/create/${id}`;
  
  console.log('Deleting topic at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete topic response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete topic error response:', errorText);
    throw new Error(`Failed to delete topic: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Get classes by course
export const getClassesByCourse = async (token, courseId) => {
  const endpoint = `${API_BASE}/api/admin/master-data/classes/by-course/${courseId}`;
  
  console.log('Fetching classes by course from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Get classes by course response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get classes by course error:', errorText);
    throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Classes by course data:', data);
  return data;
};

// Get exams by course
export const getExamsByCourse = async (token, courseId) => {
  // Use the existing working endpoint with query parameters instead of path parameters
  const params = new URLSearchParams();
  params.append('courseId', courseId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/exams?${params}`;
  
  console.log('Fetching exams by course from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Get exams by course response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get exams by course error:', errorText);
    throw new Error(`Failed to fetch exams: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Exams by course data:', data);
  return data;
};

// Create subject with linking
export const createSubjectWithLinking = async (token, subjectData) => {
  console.log('Creating subject with linking:', subjectData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/subjects/create-with-linking`;
  
  console.log('Creating subject at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subjectData)
  });
  
  console.log('Create subject with linking response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create subject with linking error response:', errorText);
    throw new Error(`Failed to create subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create subject with linking data:', data);
  return data;
};

// Create subject with class link (Academic)
export const createSubjectWithClassLink = async (token, subjectData) => {
  console.log('Creating subject with class link:', subjectData);
  
  // Build request body for class link creation
  const requestBody = {
    name: subjectData.name,
    description: subjectData.description || '',
    displayOrder: subjectData.displayOrder || 0,
    isActive: subjectData.isActive,
    classId: subjectData.classId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/subjects/create-with-class-link`;
  
  console.log('Creating subject with class link at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Create subject with class link response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create subject with class link error response:', errorText);
    throw new Error(`Failed to create subject with class link: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create subject with class link data:', data);
  return data;
};

// Create subject with exam link (Competitive)
export const createSubjectWithExamLink = async (token, subjectData) => {
  console.log('Creating subject with exam link:', subjectData);
  
  // Build request body for exam link creation
  const requestBody = {
    name: subjectData.name,
    description: subjectData.description || '',
    displayOrder: subjectData.displayOrder || 0,
    isActive: subjectData.isActive,
    examId: subjectData.examId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/subjects/create-with-exam-link`;
  
  console.log('Creating subject with exam link at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Create subject with exam link response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create subject with exam link error response:', errorText);
    throw new Error(`Failed to create subject with exam link: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create subject with exam link data:', data);
  return data;
};

// Create subject with course link (Direct)
export const createSubjectWithCourseLink = async (token, subjectData) => {
  console.log('Creating subject with course link:', subjectData);
  
  // Build request body for course link creation
  const requestBody = {
    name: subjectData.name,
    description: subjectData.description || '',
    displayOrder: subjectData.displayOrder || 0,
    isActive: subjectData.isActive,
    courseId: subjectData.courseId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/subjects/create-with-course-link`;
  
  console.log('Creating subject with course link at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Create subject with course link response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create subject with course link error response:', errorText);
    throw new Error(`Failed to create subject with course link: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create subject with course link data:', data);
  return data;
};

// Create subject with auto-link (unified endpoint for all course types)
export const createSubjectWithAutoLink = async (token, linkRequest) => {
  // Updated: link existing subject only (no creation)
  // linkRequest should include subjectId and exactly one of classId | examId | courseId
  if (!linkRequest || !linkRequest.subjectId) {
    throw new Error('subjectId is required');
  }
  const endpoint = `${API_BASE}/api/admin/subjects/create-with-auto-link`;
  console.log('Auto-link subject via endpoint:', endpoint, linkRequest);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(linkRequest)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Auto-link error response:', errorText);
    
    // Try to parse the error response as JSON to extract the actual error message
    let errorMessage = errorText;
    try {
      const errorObj = JSON.parse(errorText);
      errorMessage = errorObj.error || errorObj.message || errorText;
    } catch (parseError) {
      // If not JSON, use the raw text
      errorMessage = errorText;
    }
    
    throw new Error(`Failed to link subject: ${response.status} ${response.statusText} - ${errorMessage}`);
  }
  return response.json();
};


export const getTopicById = async (token, topicId) => {
  const endpoint = `${API_BASE}/api/admin/master-data/topics/${topicId}`;
  
  console.log('Fetching topic by ID from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get topic by ID error:', errorText);
    throw new Error(`Failed to fetch topic: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topic data:', data);
  return data;
};


// Create topic with ClassSubject link (Academic)
export const createTopicWithClassSubjectLink = async (token, topicData) => {
  console.log('Creating topic with class subject link:', topicData);
  
  const requestBody = {
    name: topicData.name,
    description: topicData.description || '',
    displayOrder: topicData.displayOrder || 0,
    isActive: topicData.isActive,
    classSubjectId: topicData.classSubjectId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/topics/create-with-class-subject-link`;
  
  console.log('Creating topic with class subject link at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Create topic with class subject link response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create topic with class subject link error response:', errorText);
    throw new Error(`Failed to create topic with class subject link: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topic with class subject link created successfully:', data);
  return data;
};

// Create topic with ExamSubject link (Competitive)
export const createTopicWithExamSubjectLink = async (token, topicData) => {
  console.log('Creating topic with exam subject link:', topicData);
  
  const requestBody = {
    name: topicData.name,
    description: topicData.description || '',
    displayOrder: topicData.displayOrder || 0,
    isActive: topicData.isActive,
    examSubjectId: topicData.examSubjectId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/topics/create-with-exam-subject-link`;
  
  console.log('Creating topic with exam subject link at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Create topic with exam subject link response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create topic with exam subject link error response:', errorText);
    throw new Error(`Failed to create topic with exam subject link: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topic with exam subject link created successfully:', data);
  return data;
};

// Create topic with CourseSubject link (Direct)
export const createTopicWithCourseSubjectLink = async (token, topicData) => {
  console.log('Creating topic with course subject link:', topicData);
  
  const requestBody = {
    name: topicData.name,
    description: topicData.description || '',
    displayOrder: topicData.displayOrder || 0,
    isActive: topicData.isActive,
    courseSubjectId: topicData.courseSubjectId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/topics/create-with-course-subject-link`;
  
  console.log('Creating topic with course subject link at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Create topic with course subject link response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create topic with course subject link error response:', errorText);
    throw new Error(`Failed to create topic with course subject link: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topic with course subject link created successfully:', data);
  return data;
};

// Get modules by topic
export const getModulesByTopic = async (token, topicId, active = true) => {
  if (!topicId) {
    throw new Error('Topic ID is required');
  }
  
  const params = new URLSearchParams();
  if (active !== null) params.append('active', active);
  
  const endpoint = `/api/admin/master-data/modules/topic/${topicId}${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching modules by topic from endpoint:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Modules by topic data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching modules by topic:', error);
    throw error;
  }
};

// Module Management Functions
export const getModules = async (token, active = null, subjectId = null, topicId = null) => {
  console.log('Fetching modules with filters:', { active, subjectId, topicId });
  
  const params = new URLSearchParams();
  if (active !== null) params.append('active', active);
  if (subjectId) params.append('subjectId', subjectId);
  if (topicId) params.append('topicId', topicId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/modules${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching modules from endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to fetch modules: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Modules fetched successfully:', data);
  console.log('Modules data type:', typeof data);
  console.log('Modules data structure:', Array.isArray(data) ? 'Array' : 'Object');
  if (Array.isArray(data)) {
    console.log('Modules array length:', data.length);
  } else if (data && typeof data === 'object') {
    console.log('Modules object keys:', Object.keys(data));
  }
  return data;
};

export const createModule = async (token, moduleData) => {
  console.log('Creating module:', moduleData);
  
  const requestBody = {
    name: moduleData.name,
    description: moduleData.description || '',
    displayOrder: moduleData.displayOrder || 0,
    isActive: moduleData.isActive,
    topicId: moduleData.topicId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/modules`;
  
  console.log('Creating module at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to create module: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Module created successfully:', data);
  return data;
};

export const updateModule = async (token, id, moduleData) => {
  console.log('Updating module:', id, moduleData);
  
  const requestBody = {
    name: moduleData.name,
    description: moduleData.description || '',
    displayOrder: moduleData.displayOrder || 0,
    isActive: moduleData.isActive,
    topicId: moduleData.topicId
  };
  
  const endpoint = `${API_BASE}/api/admin/master-data/modules/${id}`;
  
  console.log('Updating module at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to update module: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Module updated successfully:', data);
  return data;
};

// Chapter Management Functions
export const getChapters = async (token, active = null, subjectId = null, topicId = null, moduleId = null) => {
  console.log('Fetching chapters with filters:', { active, subjectId, topicId, moduleId });
  
  const params = new URLSearchParams();
  if (active !== null) params.append('active', active);
  if (subjectId) params.append('subjectId', subjectId);
  if (topicId) params.append('topicId', topicId);
  if (moduleId) params.append('moduleId', moduleId);
  
  const endpoint = `/api/admin/master-data/chapters${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching chapters from endpoint:', endpoint);
  
  const response = await apiGet(endpoint, token);
  const data = await response.json();
  
  console.log('Chapters fetched successfully:', data);
  console.log('Chapters data type:', typeof data);
  console.log('Chapters data structure:', Array.isArray(data) ? 'Array' : 'Object');
  if (Array.isArray(data)) {
    console.log('Chapters array length:', data.length);
  } else if (data && typeof data === 'object') {
    console.log('Chapters object keys:', Object.keys(data));
  }
  return data;
};

export const createChapter = async (token, chapterData) => {
  console.log('Creating chapter:', chapterData);
  
  const requestBody = {
    name: chapterData.name,
    description: chapterData.description || '',
    moduleId: chapterData.moduleId,
    displayOrder: chapterData.displayOrder || 0,
    isActive: chapterData.isActive,
    youtubeLinks: chapterData.youtubeLinks || [],
    uploadedFiles: chapterData.uploadedFiles || []
  };
  
  const endpoint = '/api/admin/master-data/chapters';
  
  console.log('Creating chapter at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await apiPost(endpoint, requestBody, token);
  const data = await response.json();
  
  console.log('Chapter created successfully:', data);
  return data;
};

export const updateChapter = async (token, id, chapterData) => {
  console.log('Updating chapter:', id, chapterData);
  
  const requestBody = {
    name: chapterData.name,
    description: chapterData.description || '',
    moduleId: chapterData.moduleId,
    displayOrder: chapterData.displayOrder || 0,
    isActive: chapterData.isActive,
    youtubeLinks: chapterData.youtubeLinks || [],
    uploadedFiles: chapterData.uploadedFiles || []
  };
  
  const endpoint = `/api/admin/master-data/chapters/${id}`;
  
  console.log('Updating chapter at endpoint:', endpoint);
  console.log('Request body:', requestBody);
  
  const response = await apiPut(endpoint, requestBody, token);
  const data = await response.json();
  
  console.log('Chapter updated successfully:', data);
  return data;
};

export const deleteChapter = async (token, id) => {
  console.log('Deleting chapter:', id);
  
  const endpoint = `/api/admin/master-data/chapters/${id}`;
  
  console.log('Deleting chapter at endpoint:', endpoint);
  
  const response = await apiDelete(endpoint, token);
  
  console.log('Chapter deleted successfully');
  return true;
};

export const getChaptersByModule = async (token, moduleId, active = true) => {
  if (!moduleId) {
    throw new Error('Module ID is required');
  }
  const params = new URLSearchParams();
  if (active !== null) params.append('active', active);
  const endpoint = `/api/admin/master-data/chapters/module/${moduleId}${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching chapters by module from endpoint:', endpoint);
  
  const response = await apiGet(endpoint, token);
  const data = await response.json();
  
  console.log('Chapters by module fetched successfully:', data);
  return data;
};

export const deleteModule = async (token, id) => {
  console.log('Deleting module:', id);
  
  const endpoint = `${API_BASE}/api/admin/master-data/modules/${id}`;
  
  console.log('Deleting module at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to delete module: ${response.status} ${response.statusText}`);
  }
  
  console.log('Module deleted successfully');
  return true;
};

