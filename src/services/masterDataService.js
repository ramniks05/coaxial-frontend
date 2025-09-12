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
  console.log('Course type data being sent:', courseTypeData);
  
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

// Course Management
export const getCourses = async (token, courseTypeId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/courses?${params}`;
  
  console.log('Fetching courses from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Get courses response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get courses error:', errorText);
    throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Courses data:', data);
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
export const getClasses = async (token, courseId = null) => {
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  
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
export const getSubjects = async (token, courseTypeId = null, courseId = null, classId = null, examId = null, active = null) => {
  const params = new URLSearchParams();
  
  // Add all filter parameters
  if (active !== null) params.append('active', active);
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  if (classId) params.append('classId', classId);
  if (examId) params.append('examId', examId);
  
  const url = `${API_BASE}/api/admin/master-data/subjects?${params}`;
  
  console.log('Fetching subjects from URL:', url);
  console.log('Token:', token);
  console.log('Filters - Active:', active, 'CourseType:', courseTypeId, 'Course:', courseId, 'Class:', classId, 'Exam:', examId);
    
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

// Exam Management
export const getExams = async (token, courseTypeId = null, courseId = null) => {
  const params = new URLSearchParams();
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  
  const endpoint = `${API_BASE}/api/admin/master-data/exams?${params}`;
  
  console.log('Fetching exams from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
    throw new Error(`Failed to create class-subject: ${response.status} ${response.statusText} - ${errorText}`);
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
export const getTopics = async (token, active = null, courseTypeId = null, courseId = null, subjectId = null, classSubjectId = null, examSubjectId = null, courseSubjectId = null, chapterId = null) => {
  const params = new URLSearchParams();
  
  // Add all filter parameters
  if (active !== null) params.append('active', active);
  if (courseTypeId) params.append('courseTypeId', courseTypeId);
  if (courseId) params.append('courseId', courseId);
  if (subjectId) params.append('subjectId', subjectId);
  if (classSubjectId) params.append('classSubjectId', classSubjectId);
  if (examSubjectId) params.append('examSubjectId', examSubjectId);
  if (courseSubjectId) params.append('courseSubjectId', courseSubjectId);
  if (chapterId) params.append('chapterId', chapterId); // Keep backward compatibility
  
  const url = `${API_BASE}/api/admin/master-data/topics?${params}`;
  
  console.log('Fetching topics from URL:', url);
  console.log('Filters - Active:', active, 'CourseType:', courseTypeId, 'Course:', courseId, 'Subject:', subjectId, 'ClassSubject:', classSubjectId, 'ExamSubject:', examSubjectId, 'CourseSubject:', courseSubjectId, 'ChapterId:', chapterId);
    
  const response = await fetch(url, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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

// Get classes by course
export const getClassesByCourse = async (token, courseId) => {
  const endpoint = `${API_BASE}/api/admin/master-data/classes/by-course/${courseId}`;
  
  console.log('Fetching classes by course from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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


export const getTopicById = async (token, topicId) => {
  const endpoint = `${API_BASE}/api/admin/master-data/topics/${topicId}`;
  
  console.log('Fetching topic by ID from:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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

