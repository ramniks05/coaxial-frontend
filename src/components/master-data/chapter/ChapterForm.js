import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useMasterData } from '../../../hooks/useMasterData';
import { useMasterDataForm } from '../../../hooks/useMasterDataForm';
import { getCourseTypesCached } from '../../../services/globalApiCache';
import { validateFileType } from '../../../utils/documentUtils';
import {
    getYouTubeEmbedUrl,
    getYouTubeThumbnail,
    getYouTubeVideoId,
    isValidYouTubeUrl,
    normalizeYouTubeUrl
} from '../../../utils/youtubeUtils';
import DocumentPreviewModal from '../DocumentPreviewModal';
import '../MasterDataComponent.css';
import VideoPreviewModal from '../VideoPreviewModal';

/**
 * Chapter Form Component
 * Handles the form UI and logic for creating/editing chapters
 */
const ChapterForm = ({ 
  onSubmit, 
  onCancel, 
  editingChapter = null, 
  loading = false 
}) => {
  const { token, addNotification } = useApp();
  const { getCourseTypeName } = useMasterData();
  const [courseTypes, setCourseTypes] = useState([]);
  
  // YouTube link management
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');
  const [youtubeLinkError, setYoutubeLinkError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Document upload management
  const [fileInputs, setFileInputs] = useState([]);
  const [fileInputError, setFileInputError] = useState('');
  const [uploadedFileObjects, setUploadedFileObjects] = useState({});
  
  // Preview modals
  const [videoPreviewModal, setVideoPreviewModal] = useState(false);
  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [documentPreviewModal, setDocumentPreviewModal] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] = useState(null);

  // Form configuration
  const initialFormData = {
    name: '',
    description: '',
    displayOrder: '',
    isActive: true,
    courseTypeId: '',
    courseId: '',
    classId: '',
    examId: '',
    subjectId: '',
    topicId: '',
    moduleId: '',
    youtubeLinks: [],
    youtubeTitles: [],
    uploadedFiles: [],
    uploadedFileTitles: [],
    uploadedFilePaths: []
  };

  const validationRules = {
    name: (value) => !value ? 'Name is required' : '',
    description: (value) => !value ? 'Description is required' : '',
    courseTypeId: (value) => !value ? 'Course Type is required' : '',
    subjectId: (value) => !value ? 'Subject is required' : '',
    topicId: (value) => !value ? 'Topic is required' : '',
    moduleId: (value) => !value ? 'Module is required' : ''
  };

  // Use the master data form hook
  const {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
    formFilteredCourses,
    formFilteredClasses,
    formFilteredExams,
    formFilteredSubjects,
    formFilteredTopics,
    formFilteredModules,
    formLoadingStates,
    isAcademicCourseType,
    isCompetitiveCourseType,
    setFormData,
    resetForm
  } = useMasterDataForm(initialFormData, validationRules, onSubmit);

  // Load course types on mount
  useEffect(() => {
    const loadCourseTypes = async () => {
      if (!token) return;
      try {
        const data = await getCourseTypesCached(token);
        console.log('Raw courseTypes API response (ChapterForm):', data);
        console.log('CourseTypes data type:', typeof data);
        console.log('CourseTypes is array:', Array.isArray(data));
        
        // Handle different response formats
        let courseTypesArray = [];
        if (Array.isArray(data)) {
          courseTypesArray = data;
        } else if (data && Array.isArray(data.content)) {
          // Handle paginated response
          courseTypesArray = data.content;
        } else if (data && Array.isArray(data.data)) {
          // Handle wrapped response
          courseTypesArray = data.data;
        } else if (data && data.courseTypes && Array.isArray(data.courseTypes)) {
          // Handle nested response
          courseTypesArray = data.courseTypes;
        } else {
          console.warn('Unexpected courseTypes data format (ChapterForm):', data);
          courseTypesArray = [];
        }
        
        console.log('Processed courseTypes array (ChapterForm):', courseTypesArray);
        setCourseTypes(courseTypesArray);
      } catch (error) {
        console.error('Error loading course types:', error);
      }
    };
    loadCourseTypes();
  }, [token]);

  // Populate form when editing
  useEffect(() => {
    if (editingChapter) {
      console.log('Editing chapter:', editingChapter);
      
      // Reset form first to clear any existing data
      console.log('ChapterForm - Resetting form before populating with editing data');
      resetForm();
      
      // Extract videos data
      const youtubeLinks = [];
      const youtubeTitles = [];
      if (editingChapter.videos && Array.isArray(editingChapter.videos)) {
        console.log('ChapterForm - Extracting videos from editingChapter.videos:', editingChapter.videos);
        editingChapter.videos.forEach((video, index) => {
          console.log(`Video ${index}:`, video);
          youtubeLinks.push(video.youtubeLink || '');
          youtubeTitles.push(video.videoTitle || '');
        });
      } else if (editingChapter.youtubeLinks && Array.isArray(editingChapter.youtubeLinks)) {
        console.log('ChapterForm - Using legacy youtubeLinks:', editingChapter.youtubeLinks);
        editingChapter.youtubeLinks.forEach((link, index) => {
          youtubeLinks.push(link);
          youtubeTitles.push(editingChapter.youtubeTitles?.[index] || `Video ${index + 1}`);
        });
      }
      
      console.log('ChapterForm - Extracted youtubeLinks:', youtubeLinks);
      console.log('ChapterForm - Extracted youtubeTitles:', youtubeTitles);

      // Extract documents data
      const uploadedFiles = [];
      const uploadedFileTitles = [];
      const uploadedFilePaths = [];
      if (editingChapter.documents && Array.isArray(editingChapter.documents)) {
        editingChapter.documents.forEach(doc => {
          uploadedFiles.push(doc.fileName || '');
          uploadedFileTitles.push(doc.documentTitle || '');
          uploadedFilePaths.push(doc.filePath || '');
        });
      }

      // Populate form with chapter data
      setFormData({
        name: editingChapter.name || '',
        description: editingChapter.description || '',
        displayOrder: editingChapter.displayOrder || '',
        isActive: editingChapter.isActive !== undefined ? editingChapter.isActive : true,
        courseTypeId: editingChapter.topic?.subject?.courseTypeId || editingChapter.module?.topic?.subject?.courseTypeId || '',
        courseId: editingChapter.topic?.subject?.courseId || editingChapter.module?.topic?.subject?.courseId || '',
        classId: editingChapter.topic?.subject?.classId || editingChapter.module?.topic?.subject?.classId || '',
        examId: editingChapter.topic?.subject?.examId || editingChapter.module?.topic?.subject?.examId || '',
        subjectId: editingChapter.topic?.subject?.subjectId || editingChapter.module?.topic?.subject?.id || '',
        topicId: editingChapter.topic?.id || editingChapter.module?.topic?.id || '',
        moduleId: editingChapter.moduleId || '',
        youtubeLinks: youtubeLinks,
        youtubeTitles: youtubeTitles,
        uploadedFiles: uploadedFiles,
        uploadedFileTitles: uploadedFileTitles,
        uploadedFilePaths: uploadedFilePaths
      });

      // Note: Errors and touched state will be cleared automatically when user interacts with form
    }
  }, [editingChapter]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Merge uploadedFileObjects with the form data
    const formDataWithFiles = {
      ...formData,
      uploadedFileObjects: uploadedFileObjects
    };
    
    // Call the parent's onSubmit with the complete form data
    await onSubmit(formDataWithFiles);
  };

  // YouTube Link Management Functions
  const addYoutubeLink = () => {
    const url = youtubeLinkInput.trim();
    if (!url) {
      setYoutubeLinkError('YouTube link cannot be empty');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setYoutubeLinkError('Invalid YouTube URL format');
      return;
    }

    const normalizedUrl = normalizeYouTubeUrl(url);
    const currentLinks = formData.youtubeLinks || [];
    const currentTitles = formData.youtubeTitles || [];
    
    console.log('ChapterForm - Adding YouTube link:', {
      url,
      normalizedUrl,
      currentLinks,
      currentTitles,
      editingChapter: !!editingChapter
    });
    
    // Check for duplicates
    if (currentLinks.some(link => normalizeYouTubeUrl(link) === normalizedUrl)) {
      setYoutubeLinkError('This video is already added');
      console.log('ChapterForm - Duplicate video detected:', normalizedUrl);
      return;
    }

    // Get video title from YouTube or use default
    const videoId = getYouTubeVideoId(normalizedUrl);
    const defaultTitle = `Video ${currentLinks.length + 1}`;
    
    handleInputChange('youtubeLinks', [...currentLinks, normalizedUrl]);
    handleInputChange('youtubeTitles', [...currentTitles, defaultTitle]);
    setYoutubeLinkInput('');
    setYoutubeLinkError('');
  };

  const removeYoutubeLink = (index) => {
    const currentLinks = formData.youtubeLinks || [];
    const currentTitles = formData.youtubeTitles || [];
    handleInputChange('youtubeLinks', currentLinks.filter((_, i) => i !== index));
    handleInputChange('youtubeTitles', currentTitles.filter((_, i) => i !== index));
  };

  const editYoutubeLink = (index, currentUrl) => {
    const newUrl = prompt('Edit YouTube URL:', currentUrl);
    if (newUrl && newUrl.trim() && isValidYouTubeUrl(newUrl.trim())) {
      const normalizedUrl = normalizeYouTubeUrl(newUrl.trim());
      const currentLinks = formData.youtubeLinks || [];
      
      // Check for duplicates (excluding the current index)
      const otherLinks = currentLinks.filter((_, i) => i !== index);
      if (otherLinks.some(link => normalizeYouTubeUrl(link) === normalizedUrl)) {
        setYoutubeLinkError('This video is already added');
        return;
      }
      
      setYoutubeLinkError('');
      const newLinks = [...currentLinks];
      newLinks[index] = normalizedUrl;
      handleInputChange('youtubeLinks', newLinks);
    }
  };

  const editYoutubeTitle = (index, currentTitle) => {
    const newTitle = prompt('Edit Video Title:', currentTitle);
    if (newTitle && newTitle.trim()) {
      const currentTitles = formData.youtubeTitles || [];
      const newTitles = [...currentTitles];
      newTitles[index] = newTitle.trim();
      handleInputChange('youtubeTitles', newTitles);
    }
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
    }
  };

  const handleYoutubeLinkInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addYoutubeLink();
    }
  };

  const openVideoPreview = (embedUrl, originalUrl, videoTitle = null) => {
    const videoId = getYouTubeVideoId(originalUrl);
    setSelectedVideoData({
      videoId,
      videoUrl: originalUrl,
      embedUrl,
      title: videoTitle || `Video Preview`
    });
    setVideoPreviewModal(true);
  };

  // Document Upload Management Functions
  const addFileInput = () => {
    setFileInputs(prev => [...prev, { id: Date.now(), file: null }]);
  };

  const handleFileChange = (inputId, file) => {
    if (!file) return;

    const validation = validateFileType(file.name);
    if (!validation.isValid) {
      setFileInputError(validation.error);
      return;
    }

    // Check for duplicate file names
    const currentFiles = formData.uploadedFiles || [];
    if (currentFiles.includes(file.name)) {
      setFileInputError(`File "${file.name}" is already uploaded`);
      return;
    }

    setFileInputError('');
    
    // Add file to the uploadedFiles array
    const currentTitles = formData.uploadedFileTitles || [];
    const currentPaths = formData.uploadedFilePaths || [];
    const newFiles = [...currentFiles, file.name];
    const defaultTitle = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
    const newTitles = [...currentTitles, defaultTitle];
    const newPaths = [...currentPaths, '']; // Empty path for new uploads
    
    handleInputChange('uploadedFiles', newFiles);
    handleInputChange('uploadedFileTitles', newTitles);
    handleInputChange('uploadedFilePaths', newPaths);
    
    // Store the actual file object for preview
    setUploadedFileObjects(prev => ({
      ...prev,
      [file.name]: file
    }));
    
    // Update file input state
    setFileInputs(prev => prev.map(input => 
      input.id === inputId ? { ...input, file } : input
    ));
  };

  const removeFileInput = (inputId) => {
    setFileInputs(prev => prev.filter(input => input.id !== inputId));
  };

  const removeUploadedFile = (index) => {
    const currentFiles = formData.uploadedFiles || [];
    const currentTitles = formData.uploadedFileTitles || [];
    const currentPaths = formData.uploadedFilePaths || [];
    const fileNameToRemove = currentFiles[index];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    const newTitles = currentTitles.filter((_, i) => i !== index);
    const newPaths = currentPaths.filter((_, i) => i !== index);
    
    handleInputChange('uploadedFiles', newFiles);
    handleInputChange('uploadedFileTitles', newTitles);
    handleInputChange('uploadedFilePaths', newPaths);
    
    // Remove the file object as well
    setUploadedFileObjects(prev => {
      const newObjects = { ...prev };
      delete newObjects[fileNameToRemove];
      return newObjects;
    });
  };

  const editUploadedFileTitle = (index, currentTitle) => {
    const newTitle = prompt('Edit Document Title:', currentTitle);
    if (newTitle && newTitle.trim()) {
      const currentTitles = formData.uploadedFileTitles || [];
      const newTitles = [...currentTitles];
      newTitles[index] = newTitle.trim();
      handleInputChange('uploadedFileTitles', newTitles);
    }
  };

  const openDocumentPreview = (fileName, index = null) => {
    let filePath = null;
    
    // If editing existing chapter, get file path from form data
    if (editingChapter && formData.uploadedFilePaths && formData.uploadedFilePaths[index]) {
      filePath = formData.uploadedFilePaths[index];
    }
    
    // Get the actual file object if available (for new uploads)
    const fileObject = uploadedFileObjects[fileName];
    
    setSelectedDocumentData({ fileName, filePath, fileObject });
    setDocumentPreviewModal(true);
  };

  const closeVideoPreview = () => {
    setVideoPreviewModal(false);
    setSelectedVideoData(null);
  };

  const closeDocumentPreview = () => {
    setDocumentPreviewModal(false);
    setSelectedDocumentData(null);
  };

  return (
    <div className="form-section">
      <div className="form-header">
        <h3>{editingChapter ? 'Edit Chapter' : 'Create New Chapter'}</h3>
        <div className="form-header-actions">
          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="master-data-form">
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
              placeholder="e.g., Introduction to Addition, Advanced Concepts"
            />
            {errors.name && touched.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="displayOrder">Display Order</label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange('displayOrder', e.target.value)}
              className="form-input"
              placeholder="Order in which chapter appears"
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={`form-textarea ${errors.description && touched.description ? 'error' : ''}`}
              required
              rows={3}
              placeholder="Describe what this chapter covers..."
            />
            {errors.description && touched.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
        </div>

        {/* Course Type Selection */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="courseTypeId">Course Type *</label>
            <select
              id="courseTypeId"
              name="courseTypeId"
              value={formData.courseTypeId}
              onChange={(e) => {
                handleInputChange('courseTypeId', e.target.value);
                // Reset dependent fields
                handleInputChange('courseId', '');
                handleInputChange('classId', '');
                handleInputChange('examId', '');
                handleInputChange('subjectId', '');
                handleInputChange('topicId', '');
                handleInputChange('moduleId', '');
              }}
              onBlur={() => handleBlur('courseTypeId')}
              className={`form-select ${errors.courseTypeId && touched.courseTypeId ? 'error' : ''}`}
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
              onChange={(e) => {
                handleInputChange('courseId', e.target.value);
                // Reset dependent fields
                handleInputChange('classId', '');
                handleInputChange('examId', '');
                handleInputChange('subjectId', '');
                handleInputChange('topicId', '');
                handleInputChange('moduleId', '');
              }}
              className={`form-select ${errors.courseId && touched.courseId ? 'error' : ''}`}
              required
              disabled={!formData.courseTypeId || formLoadingStates.courses}
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
        <div className="form-row">
          {isAcademicCourseType(formData.courseTypeId) && (
            <div className="form-group">
              <label htmlFor="classId">Class *</label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={(e) => {
                  handleInputChange('classId', e.target.value);
                  // Reset dependent fields
                  handleInputChange('subjectId', '');
                  handleInputChange('topicId', '');
                  handleInputChange('moduleId', '');
                }}
                className={`form-select ${errors.classId && touched.classId ? 'error' : ''}`}
                required
                disabled={!formData.courseId || formLoadingStates.classes}
              >
                <option value="">Select Class</option>
                {formFilteredClasses.map(classItem => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
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
                value={formData.examId}
                onChange={(e) => {
                  handleInputChange('examId', e.target.value);
                  // Reset dependent fields
                  handleInputChange('subjectId', '');
                  handleInputChange('topicId', '');
                  handleInputChange('moduleId', '');
                }}
                className={`form-select ${errors.examId && touched.examId ? 'error' : ''}`}
                required
                disabled={!formData.courseId || formLoadingStates.exams}
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

        {/* Subject Selection */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subjectId">Subject *</label>
            <select
              id="subjectId"
              name="subjectId"
              value={formData.subjectId}
              onChange={(e) => {
                handleInputChange('subjectId', e.target.value);
                // Reset dependent fields
                handleInputChange('topicId', '');
                handleInputChange('moduleId', '');
              }}
              className={`form-select ${errors.subjectId && touched.subjectId ? 'error' : ''}`}
              required
              disabled={!formData.courseId || formLoadingStates.subjects}
            >
              <option value="">Select Subject</option>
              {formFilteredSubjects.map(subject => (
                <option key={subject.linkageId || subject.id} value={subject.linkageId || subject.id}>
                  {subject.subjectName || subject.name}
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
              onChange={(e) => {
                handleInputChange('topicId', e.target.value);
                // Reset dependent fields
                handleInputChange('moduleId', '');
              }}
              className={`form-select ${errors.topicId && touched.topicId ? 'error' : ''}`}
              required
              disabled={!formData.subjectId || formLoadingStates.topics}
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
              className={`form-select ${errors.moduleId && touched.moduleId ? 'error' : ''}`}
              required
              disabled={!formData.topicId || formLoadingStates.modules}
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

        {/* YouTube Links Section */}
        <div className="form-section youtube-section">
          <h4>📺 YouTube Video Links</h4>
          
          {/* Add Link Input */}
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
          
          {/* Video List */}
          {formData.youtubeLinks && formData.youtubeLinks.length > 0 && (
            <div className="simple-video-list">
              <h5>Added Videos ({formData.youtubeLinks.length})</h5>
              {formData.youtubeLinks.map((link, index) => {
                const currentTitles = formData.youtubeTitles || [];
                const videoTitle = currentTitles[index] || `Video ${index + 1}`;
                return (
                  <div key={`${link}-${index}`} className="simple-video-item">
                    <div className="video-thumbnail-small" onClick={() => openVideoPreview(getYouTubeEmbedUrl(getYouTubeVideoId(link)), link, videoTitle)}>
                      <img 
                        src={getYouTubeThumbnail(getYouTubeVideoId(link), 'default')} 
                        alt={videoTitle}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="play-overlay-small">
                        <span>▶️</span>
                      </div>
                    </div>
                    <div className="video-info-small">
                      <div className="video-title-small">
                        <strong>{videoTitle}</strong>
                      </div>
                      <div className="video-url-small" title={link}>{link}</div>
                      <div className="video-actions-small">
                        <button 
                          type="button"
                          onClick={() => openVideoPreview(getYouTubeEmbedUrl(getYouTubeVideoId(link)), link, videoTitle)}
                          className="btn btn-outline btn-xs"
                          title="Preview video"
                        >
                          Preview
                        </button>
                        <button 
                          type="button"
                          onClick={() => editYoutubeTitle(index, videoTitle)}
                          className="btn btn-outline btn-xs"
                          title="Edit title"
                        >
                          Edit Title
                        </button>
                        <button 
                          type="button"
                          onClick={() => editYoutubeLink(index, link)}
                          className="btn btn-outline btn-xs"
                          title="Edit URL"
                        >
                          Edit URL
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
                );
              })}
            </div>
          )}
        </div>

        {/* Document Upload Section */}
        <div className="form-section document-section">
          <h4>📕 PDF Documents</h4>
          
          {/* PDF Upload Interface */}
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
                      const validation = validateFileType(file.name);
                      
                      if (!validation.isValid) {
                        setFileInputError(validation.error);
                        return;
                      }
                      
                      // Check for duplicate file names
                      const currentFiles = formData.uploadedFiles || [];
                      if (currentFiles.includes(file.name)) {
                        setFileInputError(`File "${file.name}" is already uploaded`);
                        return;
                      }
                      
                      setFileInputError('');
                      
                      // Add file to the uploadedFiles array
                      const currentTitles = formData.uploadedFileTitles || [];
                      const currentPaths = formData.uploadedFilePaths || [];
                      const newFiles = [...currentFiles, file.name];
                      const defaultTitle = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
                      const newTitles = [...currentTitles, defaultTitle];
                      const newPaths = [...currentPaths, '']; // Empty path for new uploads
                      
                      handleInputChange('uploadedFiles', newFiles);
                      handleInputChange('uploadedFileTitles', newTitles);
                      handleInputChange('uploadedFilePaths', newPaths);
                      
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
              {formData.uploadedFiles.map((fileName, index) => {
                const currentTitles = formData.uploadedFileTitles || [];
                const documentTitle = currentTitles[index] || fileName.replace(/\.[^/.]+$/, "");
                return (
                  <div key={`${fileName}-${index}`} className="simple-document-item">
                    <div className="document-icon">📄</div>
                    <div className="document-info-small">
                      <div className="document-title-small">
                        <strong>{documentTitle}</strong>
                      </div>
                      <div className="document-filename-small" title={fileName}>{fileName}</div>
                      <div className="document-actions-small">
                        <button 
                          type="button"
                          onClick={() => openDocumentPreview(fileName, index)}
                          className="btn btn-outline btn-xs"
                          title="Preview document"
                        >
                          Preview
                        </button>
                        <button 
                          type="button"
                          onClick={() => editUploadedFileTitle(index, documentTitle)}
                          className="btn btn-outline btn-xs"
                          title="Edit title"
                        >
                          Edit Title
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeUploadedFile(index)}
                          className="btn btn-danger btn-xs"
                          title="Remove document"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Active</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingChapter ? 'Update Chapter' : 'Create Chapter')}
          </button>
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      
      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={videoPreviewModal}
        onClose={closeVideoPreview}
        embedUrl={selectedVideoData?.embedUrl}
        watchUrl={selectedVideoData?.videoUrl}
        videoTitle={selectedVideoData?.title || 'Video Preview'}
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

export default ChapterForm;
