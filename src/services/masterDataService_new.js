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
  
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(courseTypeData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update course type failed:', response.status, errorText);
      throw new Error(`Failed to update course type: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Course type updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating course type:', error);
    throw error;
  }
};

export const deleteCourseType = async (token, id) => {
  console.log('Deleting course type with ID:', id);
  
  const endpoint = `/api/admin/master-data/course-types/${id}`;
  
  console.log('Deleting course type at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Course type deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting course type:', error);
    throw error;
  }
};

// Course Management
export const getCourses = async (token) => {
  const endpoint = '/api/admin/master-data/courses';
  
  console.log('Fetching courses from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Courses data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCoursesByCourseType = async (token, courseTypeId) => {
  const endpoint = `/api/admin/master-data/courses/course-type/${courseTypeId}`;
  
  console.log('Fetching courses by course type from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Courses by course type data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching courses by course type:', error);
    throw error;
  }
};

export const createCourse = async (token, courseData) => {
  console.log('Creating course with data:', courseData);
  
  const endpoint = '/api/admin/master-data/courses';
  
  console.log('Creating course at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, courseData, token);
    const data = await response.json();
    console.log('Course created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (token, id, courseData) => {
  const endpoint = `/api/admin/master-data/courses/${id}`;
  
  console.log('Updating course at endpoint:', endpoint);
  console.log('Course data being sent:', courseData);
  
  try {
    const response = await apiPut(endpoint, courseData, token);
    const data = await response.json();
    console.log('Course updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (token, id) => {
  console.log('Deleting course with ID:', id);
  
  const endpoint = `/api/admin/master-data/courses/${id}`;
  
  console.log('Deleting course at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Course deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Class Management
export const getClasses = async (token) => {
  const endpoint = '/api/admin/master-data/classes';
  
  console.log('Fetching classes from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Classes data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

export const createClass = async (token, classData) => {
  console.log('Creating class with data:', classData);
  
  const endpoint = '/api/admin/master-data/classes';
  
  console.log('Creating class at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, classData, token);
    const data = await response.json();
    console.log('Class created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

export const updateClass = async (token, id, classData) => {
  const endpoint = `/api/admin/master-data/classes/${id}`;
  
  console.log('Updating class at endpoint:', endpoint);
  console.log('Class data being sent:', classData);
  
  try {
    const response = await apiPut(endpoint, classData, token);
    const data = await response.json();
    console.log('Class updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

export const deleteClass = async (token, id) => {
  console.log('Deleting class with ID:', id);
  
  const endpoint = `/api/admin/master-data/classes/${id}`;
  
  console.log('Deleting class at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Class deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

// Exam Management
export const getExams = async (token) => {
  const endpoint = '/api/admin/master-data/exams';
  
  console.log('Fetching exams from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Exams data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const createExam = async (token, examData) => {
  console.log('Creating exam with data:', examData);
  
  const endpoint = '/api/admin/master-data/exams';
  
  console.log('Creating exam at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, examData, token);
    const data = await response.json();
    console.log('Exam created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const updateExam = async (token, id, examData) => {
  const endpoint = `/api/admin/master-data/exams/${id}`;
  
  console.log('Updating exam at endpoint:', endpoint);
  console.log('Exam data being sent:', examData);
  
  try {
    const response = await apiPut(endpoint, examData, token);
    const data = await response.json();
    console.log('Exam updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

export const deleteExam = async (token, id) => {
  console.log('Deleting exam with ID:', id);
  
  const endpoint = `/api/admin/master-data/exams/${id}`;
  
  console.log('Deleting exam at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Exam deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

// Subject Management
export const getSubjects = async (token) => {
  const endpoint = '/api/admin/master-data/subjects';
  
  console.log('Fetching subjects from:', endpoint);
  
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

export const getMasterSubjectsByCourseType = async (token, courseTypeId) => {
  const endpoint = `/api/admin/master-data/subjects/course-type/${courseTypeId}`;
  
  console.log('Fetching master subjects by course type from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Master subjects by course type data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching master subjects by course type:', error);
    throw error;
  }
};

export const createSubjectWithAutoLink = async (token, subjectData) => {
  console.log('Creating subject with auto-link with data:', subjectData);
  
  const endpoint = '/api/admin/master-data/subjects';
  
  console.log('Creating subject at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, subjectData, token);
    const data = await response.json();
    console.log('Subject created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (token, id, subjectData) => {
  const endpoint = `/api/admin/master-data/subjects/${id}`;
  
  console.log('Updating subject at endpoint:', endpoint);
  console.log('Subject data being sent:', subjectData);
  
  try {
    const response = await apiPut(endpoint, subjectData, token);
    const data = await response.json();
    console.log('Subject updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (token, id) => {
  console.log('Deleting subject with ID:', id);
  
  const endpoint = `/api/admin/master-data/subjects/${id}`;
  
  console.log('Deleting subject at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Subject deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Topic Management
export const getTopicsByLinkage = async (token, courseTypeId, courseId, classId, examId, subjectId, active = true) => {
  console.log('Fetching topics by linkage with filters:', { courseTypeId, courseId, classId, examId, subjectId, active });
  
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  if (classId) params.append('classId', classId);
  if (examId) params.append('examId', examId);
  if (subjectId) params.append('subjectId', subjectId);
  if (active !== null) params.append('active', active);
  
  const endpoint = `/api/admin/master-data/topics/linkage${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching topics by linkage from endpoint:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Topics by linkage fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching topics by linkage:', error);
    throw error;
  }
};

export const getTopicsWithFilters = async (token, courseTypeId, courseId, classId, examId, subjectId, active = true) => {
  console.log('Fetching topics with filters:', { courseTypeId, courseId, classId, examId, subjectId, active });
  
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  if (classId) params.append('classId', classId);
  if (examId) params.append('examId', examId);
  if (subjectId) params.append('subjectId', subjectId);
  if (active !== null) params.append('active', active);
  
  const endpoint = `/api/admin/master-data/topics${params.toString() ? `?${params.toString()}` : ''}`;
  
  console.log('Fetching topics from endpoint:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Topics fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const createTopic = async (token, topicData) => {
  console.log('Creating topic with data:', topicData);
  
  const endpoint = '/api/admin/master-data/topics';
  
  console.log('Creating topic at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, topicData, token);
    const data = await response.json();
    console.log('Topic created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

export const updateTopic = async (token, id, topicData) => {
  const endpoint = `/api/admin/master-data/topics/${id}`;
  
  console.log('Updating topic at endpoint:', endpoint);
  console.log('Topic data being sent:', topicData);
  
  try {
    const response = await apiPut(endpoint, topicData, token);
    const data = await response.json();
    console.log('Topic updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating topic:', error);
    throw error;
  }
};

export const deleteTopic = async (token, id) => {
  console.log('Deleting topic with ID:', id);
  
  const endpoint = `/api/admin/master-data/topics/${id}`;
  
  console.log('Deleting topic at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Topic deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
};

// Module Management
export const getModules = async (token) => {
  const endpoint = '/api/admin/master-data/modules';
  
  console.log('Fetching modules from:', endpoint);
  
  try {
    const response = await apiGet(endpoint, token);
    const data = await response.json();
    console.log('Modules data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

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
    console.log('Modules by topic fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching modules by topic:', error);
    throw error;
  }
};

export const createModule = async (token, moduleData) => {
  console.log('Creating module with data:', moduleData);
  
  const endpoint = '/api/admin/master-data/modules';
  
  console.log('Creating module at endpoint:', endpoint);
  
  try {
    const response = await apiPost(endpoint, moduleData, token);
    const data = await response.json();
    console.log('Module created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

export const updateModule = async (token, id, moduleData) => {
  const endpoint = `/api/admin/master-data/modules/${id}`;
  
  console.log('Updating module at endpoint:', endpoint);
  console.log('Module data being sent:', moduleData);
  
  try {
    const response = await apiPut(endpoint, moduleData, token);
    const data = await response.json();
    console.log('Module updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

export const deleteModule = async (token, id) => {
  console.log('Deleting module with ID:', id);
  
  const endpoint = `/api/admin/master-data/modules/${id}`;
  
  console.log('Deleting module at endpoint:', endpoint);
  
  try {
    const response = await apiDelete(endpoint, token);
    const data = await response.json();
    console.log('Module deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
};

// Chapter Management Functions - UPDATED FOR MULTIPART
export const createChapter = async (token, chapterData) => {
  console.log('Creating chapter:', chapterData);
  
  const endpoint = '/api/admin/master-data/chapters';
  
  // Create FormData for multipart request
  const formData = new FormData();
  
  // Add chapter data as JSON string
  const chapterJson = {
    name: chapterData.name,
    description: chapterData.description || '',
    moduleId: chapterData.moduleId,
    displayOrder: chapterData.displayOrder || 0,
    isActive: chapterData.isActive,
    youtubeLinks: chapterData.youtubeLinks || []
  };
  
  // Create a Blob for the JSON data
  const chapterBlob = new Blob([JSON.stringify(chapterJson)], { 
    type: 'application/json' 
  });
  formData.append('chapter', chapterBlob);
  
  // Add uploaded files
  if (chapterData.uploadedFiles && chapterData.uploadedFiles.length > 0) {
    // Get file objects from uploadedFileObjects
    const fileObjects = chapterData.uploadedFileObjects || {};
    
    chapterData.uploadedFiles.forEach(fileName => {
      const fileObject = fileObjects[fileName];
      if (fileObject) {
        formData.append('files', fileObject);
        console.log('Added file to FormData:', fileName);
      } else {
        console.warn('File object not found for:', fileName);
      }
    });
  }
  
  console.log('Creating chapter at endpoint:', endpoint);
  console.log('FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Chapter created successfully:', data);
  return data;
};

export const updateChapter = async (token, id, chapterData) => {
  console.log('Updating chapter:', id, chapterData);
  
  const endpoint = `/api/admin/master-data/chapters/${id}`;
  
  // Create FormData for multipart request
  const formData = new FormData();
  
  // Add chapter data as JSON string
  const chapterJson = {
    name: chapterData.name,
    description: chapterData.description || '',
    moduleId: chapterData.moduleId,
    displayOrder: chapterData.displayOrder || 0,
    isActive: chapterData.isActive,
    youtubeLinks: chapterData.youtubeLinks || []
  };
  
  // Create a Blob for the JSON data
  const chapterBlob = new Blob([JSON.stringify(chapterJson)], { 
    type: 'application/json' 
  });
  formData.append('chapter', chapterBlob);
  
  // Add uploaded files
  if (chapterData.uploadedFiles && chapterData.uploadedFiles.length > 0) {
    // Get file objects from uploadedFileObjects
    const fileObjects = chapterData.uploadedFileObjects || {};
    
    chapterData.uploadedFiles.forEach(fileName => {
      const fileObject = fileObjects[fileName];
      if (fileObject) {
        formData.append('files', fileObject);
        console.log('Added file to FormData:', fileName);
      }
    });
  }
  
  console.log('Updating chapter at endpoint:', endpoint);
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Chapter updated successfully:', data);
  return data;
};

export const deleteChapter = async (token, id) => {
  console.log('Deleting chapter:', id);
  
  const endpoint = `/api/admin/master-data/chapters/${id}`;
  
  console.log('Deleting chapter at endpoint:', endpoint);
  
  const response = await apiDelete(endpoint, token);
  const data = await response.json();
  
  console.log('Chapter deleted successfully');
  return data;
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
  } else {
    console.log('Chapters object keys:', Object.keys(data));
  }
  
  return data;
};
