import React, { useCallback, useEffect, useState } from 'react';
import { useFormManager } from '../../hooks/useFormManager';
import { useMasterData } from '../../hooks/useMasterData';
import { useApiManager } from '../../hooks/useApiManager';
import { createChapter, updateChapter, deleteChapter, getChapters } from '../../services/masterDataService';
import {
  getCourseTypes, 
  getCourses, 
  getClasses, 
  getExams, 
  getSubjects, 
  getTopics, 
  getModules 
} from '../../services/masterDataService';
import { 
  isValidYouTubeUrl, 
  getYouTubeVideoId, 
  getYouTubeThumbnail, 
  getYouTubeEmbedUrl, 
  normalizeYouTubeUrl 
} from '../../utils/youtubeUtils';
import { validateFileType } from '../../utils/documentUtils';
import VideoPreviewCard from './VideoPreviewCard';
import VideoPreviewModal from './VideoPreviewModal';
import DocumentPreviewCard from './DocumentPreviewCard';
import DocumentPreviewModal from './DocumentPreviewModal';
import './MasterDataComponent.css';

const ChapterManagement = () => {
  const {
    formData,
    setFormData,
    handleInputChange,
    resetForm,
    errors,
    setErrors,
    validateForm
  } = useFormManager({
    name: '',
    description: '',
    moduleId: '',
    displayOrder: 0,
    isActive: true,
    youtubeLinks: [],
    uploadedFiles: []
  });

  const {
    data: chapters,
    loading,
    error,
    refreshData,
    setError
  } = useMasterData(getChapters, 'chapters');

  const {
    showNotification,
    addNotification
  } = useApiManager();

  // Master data for dropdowns
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  
  // Filter states
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // YouTube video management
  const [youtubeLinkInput, setYoutubeLinkInput] = useState('');
  const [videoPreviewModal, setVideoPreviewModal] = useState(false);
  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [youtubeLinkError, setYoutubeLinkError] = useState('');

  // Document file management
  const [fileInputs, setFileInputs] = useState([]);
  const [documentPreviewModal, setDocumentPreviewModal] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] = useState(null);
  const [fileInputError, setFileInputError] = useState('');

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [courseTypesData, coursesData, classesData, examsData, subjectsData, topicsData, modulesData] = await Promise.all([
          getCourseTypes(token),
          getCourses(token),
          getClasses(token),
          getExams(token),
          getSubjects(token),
          getTopics(token),
          getModules(token)
        ]);

        setCourseTypes(courseTypesData || []);
        setCourses(coursesData || []);
        setClasses(classesData || []);
        setExams(examsData || []);
        setSubjects(subjectsData || []);
        setTopics(topicsData || []);
        setModules(modulesData || []);
      } catch (error) {
        console.error('Error loading master data:', error);
        addNotification({
          type: 'error',
          message: 'Failed to load master data'
        });
      }
    };

    loadMasterData();
  }, [addNotification]);

  // YouTube video management functions
  const addYoutubeLink = () => {
    if (!youtubeLinkInput.trim()) {
      setYoutubeLinkError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(youtubeLinkInput.trim())) {
      setYoutubeLinkError('Please enter a valid YouTube URL');
      return;
    }

    const normalizedUrl = normalizeYouTubeUrl(youtubeLinkInput.trim());
    const videoId = getYouTubeVideoId(normalizedUrl);
    const thumbnail = getYouTubeThumbnail(videoId);
    const embedUrl = getYouTubeEmbedUrl(videoId);

    const newLink = {
      url: normalizedUrl,
      videoId,
      thumbnail,
      embedUrl,
      watchUrl: normalizedUrl
    };

    handleInputChange('youtubeLinks', [...(formData.youtubeLinks || []), newLink]);
    setYoutubeLinkInput('');
    setYoutubeLinkError('');
  };

  const removeYoutubeLink = (index) => {
    const updatedLinks = (formData.youtubeLinks || []).filter((_, i) => i !== index);
    handleInputChange('youtubeLinks', updatedLinks);
  };

  const editYoutubeLink = (index, currentUrl) => {
    const newUrl = prompt('Edit YouTube URL:', currentUrl);
    if (newUrl && newUrl.trim() && isValidYouTubeUrl(newUrl.trim())) {
      const normalizedUrl = normalizeYouTubeUrl(newUrl.trim());
      const videoId = getYouTubeVideoId(normalizedUrl);
      const thumbnail = getYouTubeThumbnail(videoId);
      const embedUrl = getYouTubeEmbedUrl(videoId);

      const updatedLinks = [...(formData.youtubeLinks || [])];
      updatedLinks[index] = {
        url: normalizedUrl,
        videoId,
        thumbnail,
        embedUrl,
        watchUrl: normalizedUrl
      };
      handleInputChange('youtubeLinks', updatedLinks);
    }
  };

  const openVideoPreview = (videoData) => {
    setSelectedVideoData(videoData);
    setVideoPreviewModal(true);
  };

  const closeVideoPreview = () => {
    setVideoPreviewModal(false);
    setSelectedVideoData(null);
  };

  const handleYoutubeLinkInputChange = (e) => {
    setYoutubeLinkInput(e.target.value);
    if (youtubeLinkError) {
      setYoutubeLinkError('');
    }
  };

  const handleYoutubeLinkInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addYoutubeLink();
    }
  };

  // File upload management
  const addFileInput = () => {
    setFileInputs(prev => [...(prev || []), { id: Date.now(), file: null }]);
  };

  const handleFileChange = (inputId, file) => {
    if (file) {
      const validation = validateFileType(file.name, ['pdf']);
      
      if (!validation.isValid) {
        setFileInputError(validation.error);
        return;
      }

      setFileInputError('');
      const currentFiles = formData.uploadedFiles || [];
      const newFiles = [...currentFiles, file.name];
      handleInputChange('uploadedFiles', newFiles);

      // Remove the input after successful file addition
      setFileInputs(prev => (prev || []).filter(input => input.id !== inputId));
    }
  };

  const removeUploadedFile = (index) => {
    const currentFiles = formData.uploadedFiles || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    handleInputChange('uploadedFiles', newFiles);
  };

  const editUploadedFile = (index, currentFileName) => {
    const newFileName = prompt('Edit filename:', currentFileName);
    if (newFileName && newFileName.trim()) {
      const validation = validateFileType(newFileName, ['pdf']);
      
      if (!validation.isValid) {
        addNotification({
          type: 'error',
          message: validation.error,
          duration: 5000
        });
        return;
      }

      const currentFiles = formData.uploadedFiles || [];
      const updatedFiles = [...currentFiles];
      updatedFiles[index] = newFileName.trim();
      handleInputChange('uploadedFiles', updatedFiles);
    }
  };

  const openDocumentPreview = (fileName, filePath, fileSize) => {
    setSelectedDocumentData({
      fileName,
      filePath,
      fileSize
    });
    setDocumentPreviewModal(true);
  };

  const closeDocumentPreview = () => {
    setDocumentPreviewModal(false);
    setSelectedDocumentData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        message: 'Please fix the validation errors',
        duration: 5000
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingChapter) {
        await updateChapter(token, editingChapter.id, formData);
        addNotification({
          type: 'success',
          message: 'Chapter updated successfully'
        });
      } else {
        await createChapter(token, formData);
        addNotification({
          type: 'success',
          message: 'Chapter created successfully'
        });
      }

      await refreshData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving chapter:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to save chapter'
      });
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      name: chapter.name || '',
      description: chapter.description || '',
      moduleId: chapter.moduleId || '',
      displayOrder: chapter.displayOrder || 0,
      isActive: chapter.isActive !== undefined ? chapter.isActive : true,
      youtubeLinks: chapter.youtubeLinks || [],
      uploadedFiles: chapter.uploadedFiles || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await deleteChapter(token, id);
      addNotification({
        type: 'success',
        message: 'Chapter deleted successfully'
      });
      await refreshData();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to delete chapter'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChapter(null);
    resetForm();
      setYoutubeLinkInput('');
    setYoutubeLinkError('');
    setFileInputError('');
    setFileInputs([]);
  };

  const handleAddNew = () => {
    setEditingChapter(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Filter chapters based on search and selected filters
  // FIXED: Added null check for chapters
  const filteredChapters = (chapters || []).filter(chapter => {
    const matchesSearch = chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Find the module for this chapter to apply filters
    const module = (modules || []).find(m => m.id === chapter.moduleId);
    if (!module) return matchesSearch;

    const topic = (topics || []).find(t => t.id === module.topicId);
    if (!topic) return matchesSearch;

    const subject = (subjects || []).find(s => s.id === topic.subjectId);
    if (!subject) return matchesSearch;

    const classExam = (classes || []).find(c => c.id === subject.classId) || (exams || []).find(e => e.id === subject.examId);
    if (!classExam) return matchesSearch;

    const course = (courses || []).find(c => c.id === classExam.courseId);
    if (!course) return matchesSearch;

    const courseType = (courseTypes || []).find(ct => ct.id === course.courseTypeId);
    if (!courseType) return matchesSearch;

    const matchesFilters = 
      (!selectedCourseType || courseType.id.toString() === selectedCourseType) &&
      (!selectedCourse || course.id.toString() === selectedCourse) &&
      (!selectedClass || (classExam.type === 'class' && classExam.id.toString() === selectedClass)) &&
      (!selectedExam || (classExam.type === 'exam' && classExam.id.toString() === selectedExam)) &&
      (!selectedSubject || subject.id.toString() === selectedSubject) &&
      (!selectedTopic || topic.id.toString() === selectedTopic);

    return matchesSearch && matchesFilters;
  });

  // Sort chapters
  const sortedChapters = [...(filteredChapters || [])].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil((sortedChapters || []).length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChapters = (sortedChapters || []).slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
  return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chapters...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Chapters</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="btn btn-primary">
          Retry
          </button>
        </div>
    );
  }

  return (
    <div className="master-data-management">
      <div className="page-header">
        <h2>Chapter Management</h2>
        <button onClick={handleAddNew} className="btn btn-primary">
          Add New Chapter
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search:</label>
              <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chapters..."
              className="form-input"
            />
        </div>
        
          <div className="filter-group">
            <label>Course Type:</label>
            <select
              value={selectedCourseType}
              onChange={(e) => setSelectedCourseType(e.target.value)}
              className="form-select"
            >
              <option value="">All Course Types</option>
              {(courseTypes || []).map(ct => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-select"
              disabled={!selectedCourseType}
            >
              <option value="">All Courses</option>
              {(courses || [])
                .filter(c => c.courseTypeId.toString() === selectedCourseType)
                .map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          </div>

        <div className="filter-row">
            <div className="filter-group">
            <label>Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
                disabled={!selectedCourse}
              >
                <option value="">All Classes</option>
              {(classes || [])
                .filter(c => c.courseId.toString() === selectedCourse)
                .map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
            <label>Exam:</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              className="form-select"
                disabled={!selectedCourse}
              >
                <option value="">All Exams</option>
              {(exams || [])
                .filter(e => e.courseId.toString() === selectedCourse)
                .map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>

          <div className="filter-group">
            <label>Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select"
              disabled={!selectedClass && !selectedExam}
            >
              <option value="">All Subjects</option>
              {(subjects || [])
                .filter(s => (selectedClass && s.classId.toString() === selectedClass) ||
                           (selectedExam && s.examId.toString() === selectedExam))
                .map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="form-select"
              disabled={!selectedSubject}
            >
              <option value="">All Topics</option>
              {(topics || [])
                .filter(t => t.subjectId.toString() === selectedSubject)
                .map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="name">Name</option>
              <option value="displayOrder">Display Order</option>
              <option value="isActive">Status</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {(paginatedChapters || []).length} of {(sortedChapters || []).length} chapters</p>
        <div className="pagination-controls">
            <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
              className="btn btn-outline btn-sm"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline btn-sm"
          >
            Next
            </button>
          </div>
              </div>
              
      {/* Chapters List */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Module</th>
              <th>Display Order</th>
              <th>Status</th>
              <th>YouTube Links</th>
              <th>PDF Files</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(paginatedChapters || []).map(chapter => {
              const module = (modules || []).find(m => m.id === chapter.moduleId);
              const topic = (topics || []).find(t => t.id === module?.topicId);
              const subject = (subjects || []).find(s => s.id === topic?.subjectId);
              const classExam = (classes || []).find(c => c.id === subject?.classId) || (exams || []).find(e => e.id === subject?.examId);
              const course = (courses || []).find(c => c.id === classExam?.courseId);
              const courseType = (courseTypes || []).find(ct => ct.id === course?.courseTypeId);

              return (
                <tr key={chapter.id}>
                  <td>{chapter.name}</td>
                  <td className="description-cell">
                    {chapter.description ? (
                      chapter.description.length > 50 
                        ? `${chapter.description.substring(0, 50)}...`
                        : chapter.description
                    ) : '-'}
                  </td>
                  <td>
                    {module ? (
                      <div className="hierarchy-path">
                        <span className="course-type">{courseType?.name}</span>
                        <span className="separator">→</span>
                        <span className="course">{course?.name}</span>
                        <span className="separator">→</span>
                        <span className="class-exam">{classExam?.name}</span>
                        <span className="separator">→</span>
                        <span className="subject">{subject?.name}</span>
                        <span className="separator">→</span>
                        <span className="topic">{topic?.name}</span>
                        <span className="separator">→</span>
                        <span className="module">{module.name}</span>
              </div>
                    ) : 'Unknown Module'}
                  </td>
                  <td>{chapter.displayOrder}</td>
                  <td>
                    <span className={`status-badge ${chapter.isActive ? 'active' : 'inactive'}`}>
                      {chapter.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className="count-badge">
                      {chapter.youtubeLinks?.length || 0} videos
                    </span>
                  </td>
                  <td>
                    <span className="count-badge">
                      {chapter.uploadedFiles?.length || 0} files
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(chapter)}
                        className="btn btn-outline btn-sm"
                        title="Edit chapter"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(chapter.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete chapter"
                      >
                        Delete
                      </button>
              </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(paginatedChapters || []).length === 0 && (
          <div className="no-data">
            <p>No chapters found matching your criteria.</p>
              </div>
        )}
            </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</h3>
              <button onClick={handleCloseModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-content">
              <div className="form-row">
                  <div className="form-group">
                  <label htmlFor="name">Chapter Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                      required
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                  <label htmlFor="moduleId">Module *</label>
                    <select
                    id="moduleId"
                    value={formData.moduleId}
                    onChange={(e) => handleInputChange('moduleId', e.target.value)}
                    className={`form-select ${errors.moduleId ? 'error' : ''}`}
                      required
                  >
                    <option value="">Select Module</option>
                    {(modules || [])
                      .filter(module => {
                        if (!selectedTopic) return true;
                        return module.topicId.toString() === selectedTopic;
                      })
                      .map(module => {
                        const topic = (topics || []).find(t => t.id === module.topicId);
                        const subject = (subjects || []).find(s => s.id === topic?.subjectId);
                        const classExam = (classes || []).find(c => c.id === subject?.classId) || (exams || []).find(e => e.id === subject?.examId);
                        const course = (courses || []).find(c => c.id === classExam?.courseId);
                        const courseType = (courseTypes || []).find(ct => ct.id === course?.courseTypeId);

                        return (
                          <option key={module.id} value={module.id}>
                            {courseType?.name} → {course?.name} → {classExam?.name} → {subject?.name} → {topic?.name} → {module.name}
                        </option>
                        );
                      })}
                    </select>
                  {errors.moduleId && <span className="error-message">{errors.moduleId}</span>}
                  </div>
              </div>

            <div className="form-row">
              <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="form-textarea"
                    rows="3"
                  />
              </div>

              <div className="form-group">
                  <label htmlFor="displayOrder">Display Order</label>
                  <input
                    type="number"
                    id="displayOrder"
                    value={formData.displayOrder}
                    onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                  />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    Active
                  </label>
              </div>
            </div>

            {/* YouTube Links Section */}
            <div className="form-section">
                <h4>YouTube Videos</h4>
                <div className="youtube-section">
                  <div className="simple-input-group">
                    <input
                      type="url"
                      value={youtubeLinkInput}
                      onChange={handleYoutubeLinkInputChange}
                      onKeyPress={handleYoutubeLinkInputKeyPress}
                      placeholder="Enter YouTube URL..."
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={addYoutubeLink}
                      className="btn btn-primary"
                    >
                      Add Video
                    </button>
                  </div>
                  {youtubeLinkError && (
                    <small className="form-error">{youtubeLinkError}</small>
                  )}
                  <small className="form-help">
                    Enter YouTube URLs to add video content to this chapter
                  </small>
              </div>
              
                {/* Simple Video List */}
                {formData.youtubeLinks && formData.youtubeLinks.length > 0 && (
                  <div className="simple-video-list">
                    <h5>Added Videos ({formData.youtubeLinks.length})</h5>
                    {(formData.youtubeLinks || []).map((video, index) => (
                      <VideoPreviewCard
                        key={`${video.videoId}-${index}`}
                        video={video}
                        index={index}
                        onRemove={removeYoutubeLink}
                        onEdit={editYoutubeLink}
                        onPreview={openVideoPreview}
                      />
                  ))}
                </div>
              )}
            </div>

              {/* PDF Files Section */}
            <div className="form-section">
                <h4>PDF Documents</h4>
                <div className="document-section">
                  <div className="simple-input-group">
                  <input
                    type="file"
                      id="file-upload"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const validation = validateFileType(file.name, ['pdf']);
                          
                          if (!validation.isValid) {
                            setFileInputError(validation.error);
                            return;
                          }

                          setFileInputError('');
                          const currentFiles = formData.uploadedFiles || [];
                          const newFiles = [...currentFiles, file.name];
                          handleInputChange('uploadedFiles', newFiles);
                        }
                      }}
                      className="form-input"
                  />
                  <button
                    type="button"
                      onClick={addFileInput}
                      className="btn btn-primary"
                  >
                      Add PDF
                  </button>
                </div>
                  {fileInputError && (
                    <small className="form-error">{fileInputError}</small>
                  )}
                  <small className="form-help">
                    Supported formats: PDF only
                  </small>
            </div>
            
                {/* Simple Document List */}
                {formData.uploadedFiles && formData.uploadedFiles.length > 0 && (
                  <div className="simple-document-list">
                    <h5>Added Documents ({formData.uploadedFiles.length})</h5>
                    {(formData.uploadedFiles || []).map((fileName, index) => (
                      <DocumentPreviewCard
                        key={`${fileName}-${index}`}
                        fileName={fileName}
                        fileSize={null} // File size would come from actual file upload
                        index={index}
                        onRemove={removeUploadedFile}
                        onEdit={editUploadedFile}
                        onPreview={openDocumentPreview}
                      />
                    ))}
              </div>
                )}
            </div>
            
              <div className="form-row">
            <div className="form-actions">
                  <button type="button" onClick={handleCloseModal} className="btn btn-outline">
                Cancel
              </button>
                  <button type="submit" className="btn btn-primary">
                    {editingChapter ? 'Update Chapter' : 'Create Chapter'}
            </button>
          </div>
        </div>
            </form>
          </div>
          </div>
      )}

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={videoPreviewModal}
        onClose={closeVideoPreview}
        thumbnail={selectedVideoData?.thumbnail}
        embedUrl={selectedVideoData?.embedUrl}
        watchUrl={selectedVideoData?.watchUrl}
        videoTitle="Video Preview"
      />
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={documentPreviewModal}
        onClose={closeDocumentPreview}
        fileName={selectedDocumentData?.fileName}
        filePath={selectedDocumentData?.filePath}
        fileSize={selectedDocumentData?.fileSize}
        fileType="PDF Preview"
      />
    </div>
  );
};

export default ChapterManagement;