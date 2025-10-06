import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useApiCall } from '../../../hooks/useApiCall';
import { useMasterData } from '../../../hooks/useMasterData';
import {
    createChapter,
    deleteChapter,
    getChaptersByModule,
    updateChapter
} from '../../../services/masterDataService';
import DocumentPreviewModal from '../DocumentPreviewModal';
import '../MasterDataComponent.css';
import VideoPreviewModal from '../VideoPreviewModal';
import ChapterFilters from './ChapterFilters';
import ChapterForm from './ChapterForm';
import ChapterList from './ChapterList';

/**
 * New Chapter Management Component
 * Refactored version using modular components and reusable hooks
 * Prevents API loops and provides better performance
 */
const ChapterManagementNew = () => {
  const { token, addNotification } = useApp();
  const { getCourseTypeName } = useMasterData();
  const { executeApiCall } = useApiCall();

  // Component state
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Preview modals
  const [videoPreviewModal, setVideoPreviewModal] = useState(false);
  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [documentPreviewModal, setDocumentPreviewModal] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] = useState(null);

  // Load chapters based on current filters
  const loadChapters = useCallback(async (currentFilters = {}) => {
    if (!token) return;

    try {
      setLoading(true);
      console.log('=== LOADING CHAPTERS ===');
      console.log('Filters:', currentFilters);
      
      let data;
      
      // If module is selected, load chapters for that module
      if (currentFilters.module) {
        console.log('Loading chapters for module:', currentFilters.module);
        data = await executeApiCall(
          getChaptersByModule,
          { 
            moduleId: currentFilters.module,
            showActiveOnly: currentFilters.showActiveOnly !== false
          },
          { 
            useCache: true, 
            cacheTTL: 30000,
            errorMessage: 'Failed to load chapters'
          }
        );
      } else {
        // No module selected - load all chapters using combined filter
        console.log('Loading all chapters (no module filter)');
        const { getChaptersCombinedFilter } = await import('../../../services/masterDataService');
        data = await executeApiCall(
          getChaptersCombinedFilter,
          { 
            active: currentFilters.showActiveOnly !== false,
            page: 0,
            size: 100,
            sortBy: 'createdAt',
            sortDir: 'desc'
          },
          { 
            useCache: true, 
            cacheTTL: 30000,
            errorMessage: 'Failed to load chapters'
          }
        );
      }

      if (data) {
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        console.log('Chapters loaded:', list.length, 'items');
        setChapters(list || []);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [token, executeApiCall]);

  // Initial load - load all chapters when component mounts
  useEffect(() => {
    console.log('ChapterManagementNew mounted - loading all chapters');
    loadChapters({ showActiveOnly: true });
  }, [loadChapters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    loadChapters(newFilters);
  }, [loadChapters]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    if (!token) return;

    try {
      setLoading(true);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        moduleId: parseInt(formData.moduleId),
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null,
        isActive: formData.isActive !== false,
        youtubeLinks: formData.youtubeLinks || [],
        youtubeTitles: formData.youtubeTitles || [],
        uploadedFiles: formData.uploadedFiles || [],
        uploadedFileTitles: formData.uploadedFileTitles || []
      };

      // Add file objects for multipart upload if they exist
      if (formData.uploadedFileObjects && Object.keys(formData.uploadedFileObjects).length > 0) {
        submitData.uploadedFileObjects = formData.uploadedFileObjects;
      }

      console.log('Submit data for update:', submitData);
      console.log('Editing chapter:', editingChapter);

      let response;
      if (editingChapter) {
        // Create a wrapper function that matches useApiCall's expected signature
        const updateChapterWrapper = async (token, params) => {
          return await updateChapter(token, params.id, params.chapterData);
        };
        
        response = await executeApiCall(
          updateChapterWrapper,
          { id: editingChapter.id, chapterData: submitData },
          { errorMessage: 'Failed to update chapter' }
        );
        addNotification({
          type: 'success',
          message: 'Chapter updated successfully',
          duration: 3000
        });
      } else {
        response = await executeApiCall(
          createChapter,
          submitData,
          { errorMessage: 'Failed to create chapter' }
        );
        addNotification({
          type: 'success',
          message: 'Chapter created successfully',
          duration: 3000
        });
      }

      if (response) {
        setShowForm(false);
        setEditingChapter(null);
        // Reload chapters with current filters
        loadChapters(filters);
      }
    } catch (error) {
      console.error('Error submitting chapter:', error);
      // Error notification is handled by executeApiCall
    } finally {
      setLoading(false);
    }
  }, [token, editingChapter, executeApiCall, addNotification, loadChapters, filters]);

  // Handle edit
  const handleEdit = useCallback((chapter) => {
    setEditingChapter(chapter);
    setShowForm(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (chapter) => {
    if (!token) return;
    
    if (!window.confirm(`Are you sure you want to delete the chapter "${chapter.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      
      await executeApiCall(
        deleteChapter,
        { id: chapter.id },
        { errorMessage: 'Failed to delete chapter' }
      );

      addNotification({
        type: 'success',
        message: 'Chapter deleted successfully',
        duration: 3000
      });

      // Reload chapters with current filters
      loadChapters(filters);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      // Error notification is handled by executeApiCall
    } finally {
      setLoading(false);
    }
  }, [token, executeApiCall, addNotification, loadChapters, filters]);

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingChapter(null);
  }, []);

  // Handle create new
  const handleCreateNew = useCallback(() => {
    setEditingChapter(null);
    setShowForm(true);
  }, []);

  // Handle video preview
  const handlePreviewVideo = useCallback((videoData) => {
    console.log('Preview video:', videoData);
    setSelectedVideoData(videoData);
    setVideoPreviewModal(true);
  }, []);

  // Handle document preview
  const handlePreviewDocument = useCallback((documentData) => {
    console.log('ChapterManagementNew - Preview document called with:', documentData);
    console.log('Document preview data details:', {
      fileName: documentData?.fileName,
      filePath: documentData?.filePath,
      fileObject: documentData?.fileObject,
      title: documentData?.title,
      hasFilePath: !!documentData?.filePath,
      filePathType: typeof documentData?.filePath
    });
    setSelectedDocumentData(documentData);
    setDocumentPreviewModal(true);
  }, []);

  // Close video preview
  const closeVideoPreview = useCallback(() => {
    setVideoPreviewModal(false);
    setSelectedVideoData(null);
  }, []);

  // Close document preview
  const closeDocumentPreview = useCallback(() => {
    setDocumentPreviewModal(false);
    setSelectedDocumentData(null);
  }, []);

  return (
    <div className="chapter-management">
      <div className="component-header">
        <div className="header-content">
          <h2>Chapter Management</h2>
          <p>Manage chapters for your courses, organized by modules</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateNew}
            disabled={loading}
          >
            Create Chapter
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <ChapterFilters 
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {/* Form Section */}
      {showForm && (
        <ChapterForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          editingChapter={editingChapter}
          loading={loading}
        />
      )}

      {/* List Section */}
      <ChapterList
        filters={filters}
        chapters={chapters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreviewVideo={handlePreviewVideo}
        onPreviewDocument={handlePreviewDocument}
        loading={loading}
      />

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={videoPreviewModal}
        onClose={closeVideoPreview}
        embedUrl={selectedVideoData?.embedUrl}
        watchUrl={selectedVideoData?.watchUrl}
        videoTitle={selectedVideoData?.title}
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

export default ChapterManagementNew;
