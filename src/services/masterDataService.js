// Master Data Management API Service
const API_BASE = 'http://localhost:8080';

// Course Type Management
export const getCourseTypes = async (token) => {
  // Try both possible endpoints
  const endpoints = [
    `${API_BASE}/api/master-data/course-types`,
    `${API_BASE}/api/admin/master-data/course-types`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('Fetching course types from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Get course types response status:', response.status);
      
      if (response.ok) {
        return response.json();
      } else {
        const errorText = await response.text();
        console.error('Get course types error from', endpoint, ':', errorText);
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Last endpoint, throw error
          throw new Error(`Failed to fetch course types: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Continue to next endpoint
      }
    } catch (error) {
      console.error('Error with endpoint', endpoint, ':', error);
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw error;
      }
      // Continue to next endpoint
    }
  }
};

export const createCourseType = async (token, courseTypeData) => {
  console.log('Creating course type with data:', courseTypeData);
  
  // Try both possible endpoints
  const endpoints = [
    `${API_BASE}/api/master-data/course-types`,
    `${API_BASE}/api/admin/master-data/course-types`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('Trying endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseTypeData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        return response.json();
      } else {
        const errorText = await response.text();
        console.error('Error response from', endpoint, ':', errorText);
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Last endpoint, throw error
          throw new Error(`Failed to create course type: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Continue to next endpoint
      }
    } catch (error) {
      console.error('Error with endpoint', endpoint, ':', error);
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw error;
      }
      // Continue to next endpoint
    }
  }
};

export const updateCourseType = async (token, id, courseTypeData) => {
  const response = await fetch(`${API_BASE}/api/master-data/course-types/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseTypeData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update course type: ${response.statusText}`);
  }
  
  return response.json();
};

export const deleteCourseType = async (token, id) => {
  const response = await fetch(`${API_BASE}/api/master-data/course-types/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete course type: ${response.statusText}`);
  }
  
  return response.ok;
};

// Class Management (Academic)
export const getClasses = async (token, courseTypeId = null) => {
  // Try both possible endpoints
  const endpoints = [
    courseTypeId 
      ? `${API_BASE}/api/master-data/classes?courseTypeId=${courseTypeId}`
      : `${API_BASE}/api/master-data/classes`,
    courseTypeId 
      ? `${API_BASE}/api/admin/master-data/classes?courseTypeId=${courseTypeId}`
      : `${API_BASE}/api/admin/master-data/classes`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('Fetching classes from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Get classes response status:', response.status);
      
      if (response.ok) {
        return response.json();
      } else {
        const errorText = await response.text();
        console.error('Get classes error from', endpoint, ':', errorText);
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Last endpoint, throw error
          throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Continue to next endpoint
      }
    } catch (error) {
      console.error('Error with endpoint', endpoint, ':', error);
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw error;
      }
      // Continue to next endpoint
    }
  }
};

export const createClass = async (token, classData) => {
  console.log('Creating class with data:', classData);
  
  // Try both possible endpoints
  const endpoints = [
    `${API_BASE}/api/master-data/classes`,
    `${API_BASE}/api/admin/master-data/classes`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('Trying endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        return response.json();
      } else {
        const errorText = await response.text();
        console.error('Error response from', endpoint, ':', errorText);
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Last endpoint, throw error
          throw new Error(`Failed to create class: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Continue to next endpoint
      }
    } catch (error) {
      console.error('Error with endpoint', endpoint, ':', error);
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw error;
      }
      // Continue to next endpoint
    }
  }
};

export const updateClass = async (token, id, classData) => {
  const response = await fetch(`${API_BASE}/api/master-data/classes/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(classData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update class: ${response.statusText}`);
  }
  
  return response.json();
};

export const deleteClass = async (token, id) => {
  const response = await fetch(`${API_BASE}/api/master-data/classes/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete class: ${response.statusText}`);
  }
  
  return response.ok;
};

// Subject Management
export const getSubjects = async (token, courseTypeId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  
  const url = `${API_BASE}/api/master-data/subjects?${params}`;
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subjects: ${response.statusText}`);
  }
  
  return response.json();
};

export const createSubject = async (token, subjectData) => {
  console.log('Creating subject with data:', subjectData);
  
  // Try both possible endpoints
  const endpoints = [
    `${API_BASE}/api/master-data/subjects`,
    `${API_BASE}/api/admin/master-data/subjects`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('Trying endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subjectData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        return response.json();
      } else {
        const errorText = await response.text();
        console.error('Error response from', endpoint, ':', errorText);
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Last endpoint, throw error
          throw new Error(`Failed to create subject: ${response.status} ${response.statusText} - ${errorText}`);
        }
        // Continue to next endpoint
      }
    } catch (error) {
      console.error('Error with endpoint', endpoint, ':', error);
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw error;
      }
      // Continue to next endpoint
    }
  }
};

export const updateSubject = async (token, id, subjectData) => {
  const response = await fetch(`${API_BASE}/api/master-data/subjects/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subjectData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update subject: ${response.statusText}`);
  }
  
  return response.json();
};

export const deleteSubject = async (token, id) => {
  const response = await fetch(`${API_BASE}/api/master-data/subjects/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete subject: ${response.statusText}`);
  }
  
  return response.ok;
};

// Chapter Management
export const getChapters = async (token, subjectId = null, classId = null) => {
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (classId) params.append('classId', classId);
  
  const url = `${API_BASE}/api/master-data/chapters?${params}`;
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chapters: ${response.statusText}`);
  }
  
  return response.json();
};

export const createChapter = async (token, chapterData) => {
  const response = await fetch(`${API_BASE}/api/master-data/chapters`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chapterData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create chapter: ${response.statusText}`);
  }
  
  return response.json();
};

export const updateChapter = async (token, id, chapterData) => {
  const response = await fetch(`${API_BASE}/api/master-data/chapters/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(chapterData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update chapter: ${response.statusText}`);
  }
  
  return response.json();
};

export const deleteChapter = async (token, id) => {
  const response = await fetch(`${API_BASE}/api/master-data/chapters/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete chapter: ${response.statusText}`);
  }
  
  return response.ok;
};

// Topic Management
export const getTopics = async (token, chapterId = null) => {
  const url = chapterId 
    ? `${API_BASE}/api/admin/master-data/topics?chapterId=${chapterId}`
    : `${API_BASE}/api/admin/master-data/topics`;
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch topics: ${response.statusText}`);
  }
  
  return response.json();
};

export const createTopic = async (token, topicData) => {
  const response = await fetch(`${API_BASE}/api/admin/master-data/topics`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topicData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create topic: ${response.statusText}`);
  }
  
  return response.json();
};

export const updateTopic = async (token, id, topicData) => {
  const response = await fetch(`${API_BASE}/api/admin/master-data/topics/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(topicData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update topic: ${response.statusText}`);
  }
  
  return response.json();
};

export const deleteTopic = async (token, id) => {
  const response = await fetch(`${API_BASE}/api/admin/master-data/topics/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete topic: ${response.statusText}`);
  }
  
  return response.ok;
};
