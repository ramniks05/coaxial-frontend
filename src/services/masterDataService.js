// Master Data Management API Service
const API_BASE = 'http://localhost:8080';

// Course Type Management
export const getCourseTypes = async (token) => {
  const endpoint = `${API_BASE}/api/admin/master-data/course-types`;
  
  console.log('Fetching course types from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Get course types response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get course types error:', errorText);
    throw new Error(`Failed to fetch course types: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Course types data:', data);
  return data;
};

export const createCourseType = async (token, courseTypeData) => {
  console.log('Creating course type with data:', courseTypeData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/course-types`;
  
  console.log('Creating course type at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseTypeData)
  });
  
  console.log('Create course type response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create course type error response:', errorText);
    throw new Error(`Failed to create course type: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create course type data:', data);
  return data;
};

export const updateCourseType = async (token, id, courseTypeData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/course-types/${id}`;
  
  console.log('Updating course type at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseTypeData)
  });
  
  console.log('Update course type response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update course type error response:', errorText);
    throw new Error(`Failed to update course type: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update course type data:', data);
  return data;
};

export const deleteCourseType = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/course-types/${id}`;
  
  console.log('Deleting course type at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete course type response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete course type error response:', errorText);
    throw new Error(`Failed to delete course type: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Class Management (Academic)
export const getClasses = async (token, courseTypeId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/classes?${params}`;
  
  console.log('Fetching classes from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
export const getSubjects = async (token, courseTypeId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  
  const url = `${API_BASE}/api/admin/master-data/subjects?${params}`;
  
  console.log('Fetching subjects from URL:', url);
  console.log('Token:', token);
  console.log('Course Type ID:', courseTypeId);
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Subjects response status:', response.status);
  console.log('Subjects response ok:', response.ok);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Subjects error response:', errorText);
    throw new Error(`Failed to fetch subjects: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Subjects data:', data);
  return data;
};

export const createSubject = async (token, subjectData) => {
  console.log('Creating subject with data:', subjectData);
  
  const endpoint = `${API_BASE}/api/admin/master-data/subjects`;
  
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
    throw new Error(`Failed to create subject: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create subject data:', data);
  return data;
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

// Chapter Management
export const getChapters = async (token, subjectId = null, classId = null) => {
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (classId) params.append('classId', classId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/chapters?${params}`;
  
  console.log('Fetching chapters from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Get chapters response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get chapters error:', errorText);
    throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Chapters data:', data);
  return data;
};

export const createChapter = async (token, chapterData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/chapters`;
  
  console.log('Creating chapter at endpoint:', endpoint);
  console.log('Chapter data:', chapterData);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chapterData)
  });
  
  console.log('Create chapter response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create chapter error response:', errorText);
    throw new Error(`Failed to create chapter: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create chapter data:', data);
  return data;
};

export const updateChapter = async (token, id, chapterData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/chapters/${id}`;
  
  console.log('Updating chapter at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chapterData)
  });
  
  console.log('Update chapter response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update chapter error response:', errorText);
    throw new Error(`Failed to update chapter: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Update chapter data:', data);
  return data;
};

export const deleteChapter = async (token, id) => {
  const endpoint = `${API_BASE}/api/admin/master-data/chapters/${id}`;
  
  console.log('Deleting chapter at endpoint:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Delete chapter response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete chapter error response:', errorText);
    throw new Error(`Failed to delete chapter: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.ok;
};

// Topic Management
export const getTopics = async (token, chapterId = null) => {
  const endpoint = chapterId 
    ? `${API_BASE}/api/admin/master-data/topics?chapterId=${chapterId}`
    : `${API_BASE}/api/admin/master-data/topics`;
  
  console.log('Fetching topics from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Get topics response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get topics error:', errorText);
    throw new Error(`Failed to fetch topics: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Topics data:', data);
  return data;
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
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create topic error response:', errorText);
    throw new Error(`Failed to create topic: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Create topic data:', data);
  return data;
};

export const updateTopic = async (token, id, topicData) => {
  const endpoint = `${API_BASE}/api/admin/master-data/topics/${id}`;
  
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
  const endpoint = `${API_BASE}/api/admin/master-data/topics/${id}`;
  
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
