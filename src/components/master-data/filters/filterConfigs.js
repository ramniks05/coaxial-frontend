/**
 * Filter Configuration Helper
 * Provides standardized filter configurations for different master data components
 */

/**
 * Get filter configuration for CourseTypeManagement
 */
export const getCourseTypeFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search course types...',
    options: null
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for CourseManagement
 */
export const getCourseFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search courses...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for ClassManagement
 */
export const getClassFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search classes...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'courseId',
    type: 'select',
    label: 'Course',
    placeholder: 'All Courses',
    options: masterData.courses?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for ExamManagement
 */
export const getExamFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search exams...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'courseId',
    type: 'select',
    label: 'Course',
    placeholder: 'All Courses',
    options: masterData.courses?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for SubjectManagement
 */
export const getSubjectFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search subjects...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'courseId',
    type: 'select',
    label: 'Course',
    placeholder: 'All Courses',
    options: masterData.courses?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'classId',
    type: 'select',
    label: 'Class',
    placeholder: 'All Classes',
    options: masterData.classes?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'examId',
    type: 'select',
    label: 'Exam',
    placeholder: 'All Exams',
    options: masterData.exams?.map(e => ({
      value: e.id,
      label: e.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for TopicManagement
 */
export const getTopicFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search topics...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'courseId',
    type: 'select',
    label: 'Course',
    placeholder: 'All Courses',
    options: masterData.courses?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'classId',
    type: 'select',
    label: 'Class',
    placeholder: 'All Classes',
    options: masterData.classes?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'examId',
    type: 'select',
    label: 'Exam',
    placeholder: 'All Exams',
    options: masterData.exams?.map(e => ({
      value: e.id,
      label: e.name
    })) || []
  },
  {
    field: 'subjectId',
    type: 'select',
    label: 'Subject',
    placeholder: 'All Subjects',
    options: masterData.subjects?.map(s => ({
      value: s.id,
      label: s.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for ModuleManagement
 */
export const getModuleFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search modules...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'courseId',
    type: 'select',
    label: 'Course',
    placeholder: 'All Courses',
    options: masterData.courses?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'classId',
    type: 'select',
    label: 'Class',
    placeholder: 'All Classes',
    options: masterData.classes?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'examId',
    type: 'select',
    label: 'Exam',
    placeholder: 'All Exams',
    options: masterData.exams?.map(e => ({
      value: e.id,
      label: e.name
    })) || []
  },
  {
    field: 'subjectId',
    type: 'select',
    label: 'Subject',
    placeholder: 'All Subjects',
    options: masterData.subjects?.map(s => ({
      value: s.id,
      label: s.name
    })) || []
  },
  {
    field: 'topicId',
    type: 'select',
    label: 'Topic',
    placeholder: 'All Topics',
    options: masterData.topics?.map(t => ({
      value: t.id,
      label: t.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get filter configuration for ChapterManagement
 */
export const getChapterFilterConfig = (masterData = {}) => [
  {
    field: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search chapters...',
    options: null
  },
  {
    field: 'courseTypeId',
    type: 'select',
    label: 'Course Type',
    placeholder: 'All Course Types',
    options: masterData.courseTypes?.map(ct => ({
      value: ct.id,
      label: ct.name
    })) || []
  },
  {
    field: 'courseId',
    type: 'select',
    label: 'Course',
    placeholder: 'All Courses',
    options: masterData.courses?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'classId',
    type: 'select',
    label: 'Class',
    placeholder: 'All Classes',
    options: masterData.classes?.map(c => ({
      value: c.id,
      label: c.name
    })) || []
  },
  {
    field: 'examId',
    type: 'select',
    label: 'Exam',
    placeholder: 'All Exams',
    options: masterData.exams?.map(e => ({
      value: e.id,
      label: e.name
    })) || []
  },
  {
    field: 'subjectId',
    type: 'select',
    label: 'Subject',
    placeholder: 'All Subjects',
    options: masterData.subjects?.map(s => ({
      value: s.id,
      label: s.name
    })) || []
  },
  {
    field: 'topicId',
    type: 'select',
    label: 'Topic',
    placeholder: 'All Topics',
    options: masterData.topics?.map(t => ({
      value: t.id,
      label: t.name
    })) || []
  },
  {
    field: 'moduleId',
    type: 'select',
    label: 'Module',
    placeholder: 'All Modules',
    options: masterData.modules?.map(m => ({
      value: m.id,
      label: m.name
    })) || []
  },
  {
    field: 'isActive',
    type: 'toggle',
    label: 'Show Active Only',
    defaultValue: true
  }
];

/**
 * Get initial filter state for a component
 */
export const getInitialFilters = (componentType) => {
  const baseFilters = {
    search: '',
    isActive: true
  };

  switch (componentType) {
    case 'courseType':
      return baseFilters;
    
    case 'course':
      return { ...baseFilters, courseTypeId: '' };
    
    case 'class':
      return { ...baseFilters, courseTypeId: '', courseId: '' };
    
    case 'exam':
      return { ...baseFilters, courseTypeId: '', courseId: '' };
    
    case 'subject':
      return { 
        ...baseFilters, 
        courseTypeId: '', 
        courseId: '', 
        classId: '', 
        examId: '' 
      };
    
    case 'topic':
      return { 
        ...baseFilters, 
        courseTypeId: '', 
        courseId: '', 
        classId: '', 
        examId: '', 
        subjectId: '' 
      };
    
    case 'module':
      return { 
        ...baseFilters, 
        courseTypeId: '', 
        courseId: '', 
        classId: '', 
        examId: '', 
        subjectId: '', 
        topicId: '' 
      };
    
    case 'chapter':
      return { 
        ...baseFilters, 
        courseTypeId: '', 
        courseId: '', 
        classId: '', 
        examId: '', 
        subjectId: '', 
        topicId: '', 
        moduleId: '' 
      };
    
    default:
      return baseFilters;
  }
};
