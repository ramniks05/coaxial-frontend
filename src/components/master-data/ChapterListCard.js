import React, { useState } from 'react';
import { getFileIcon } from '../../utils/documentUtils';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, getYouTubeVideoId } from '../../utils/youtubeUtils';
import './ChapterListCard.css';

const ChapterListCard = ({ 
  chapter, 
  onEdit, 
  onDelete, 
  onPreviewVideo,
  onPreviewDocument 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    id,
    name,
    description,
    displayOrder,
    isActive,
    createdAt,
    updatedAt,
    createdByName,
    updatedByName,
    moduleName,
    subjectName,
    videos = [], // New API format: array of video objects
    documents = [], // New API format: array of document objects
    youtubeLinks = [], // Keep for backward compatibility
    uploadedFiles = [] // Keep for backward compatibility
  } = chapter;

  const handleVideoPreview = (video, index) => {
    // Handle both old format (videoUrl string) and new format (video object)
    let videoUrl, videoTitle;
    
    if (typeof video === 'string') {
      // Old format: youtubeLinks array with URL strings
      videoUrl = video;
      videoTitle = `Video ${index + 1}`;
    } else {
      // New format: videos array with video objects
      videoUrl = video.youtubeLink;
      videoTitle = video.videoTitle || `Video ${index + 1}`;
    }
    
    // Clean the URL (remove quotes and whitespace)
    const cleanUrl = videoUrl?.trim().replace(/^["']|["']$/g, '') || '';
    
    // Extract video ID from the cleaned URL
    const videoId = getYouTubeVideoId(cleanUrl);
    
    if (!videoId) {
      console.error('Invalid YouTube URL:', cleanUrl);
      return;
    }
    
    // Generate embed URL using the video ID
    const embedUrl = getYouTubeEmbedUrl(videoId);
    
    console.log('ChapterListCard - Video preview requested:', {
      originalUrl: videoUrl,
      cleanUrl,
      videoId,
      embedUrl,
      videoTitle,
      chapterId: id,
      chapterName: name,
      videoObject: video
    });
    
    onPreviewVideo({
      videoUrl: cleanUrl,
      embedUrl,
      watchUrl: cleanUrl,  // Add watchUrl for the modal
      index,
      title: videoTitle
    });
  };

  const handleDocumentPreview = (document, index) => {
    // Handle both old format (filePath string) and new format (document object)
    let fileName, filePath, documentTitle;
    
    if (typeof document === 'string') {
      // Old format: uploadedFiles array with file paths
      fileName = document.split('/').pop();
      filePath = document;
      documentTitle = fileName;
    } else {
      // New format: documents array with document objects
      fileName = document.fileName || document.filePath?.split('/').pop() || `Document ${index + 1}`;
      filePath = document.filePath || document.fileName;
      documentTitle = document.documentTitle || fileName;
    }
    
    console.log('ChapterListCard - Document preview requested:', {
      fileName,
      filePath,
      documentTitle,
      chapterId: id,
      chapterName: name,
      documentObject: document,
      hasFilePath: !!filePath,
      filePathType: typeof filePath
    });
    
    onPreviewDocument({
      fileName,
      filePath: filePath,
      fileObject: null, // No file object available from API
      index,
      title: documentTitle
    });
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="chapter-list-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title">
          <h4>{name}</h4>
          <div className="card-badges">
            <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            {displayOrder && (
              <span className="order-badge">
                Order: {displayOrder}
              </span>
            )}
          </div>
        </div>
        <div className="card-actions">
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => onEdit(chapter)}
            title="Edit Chapter"
          >
            ✏️ Edit
          </button>
          <button 
            className="btn btn-danger btn-xs"
            onClick={() => onDelete(id)}
            title="Delete Chapter"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        {description && (
          <p className="description">{description}</p>
        )}

        {/* Multimedia Summary */}
        <div className="multimedia-summary">
          <div className="summary-stats">
            {/* Count videos from both old and new formats */}
            {(videos.length > 0 || youtubeLinks.length > 0) && (
              <div className="stat-item">
                <span className="stat-icon">🎬</span>
                <span className="stat-text">Videos ({videos.length || youtubeLinks.length})</span>
              </div>
            )}
            {/* Count documents from both old and new formats */}
            {(documents.length > 0 || uploadedFiles.length > 0) && (
              <div className="stat-item">
                <span className="stat-icon">📄</span>
                <span className="stat-text">Documents ({documents.length || uploadedFiles.length})</span>
              </div>
            )}
          </div>
          
          {/* Show details button if any multimedia content exists */}
          {((videos.length > 0 || youtubeLinks.length > 0) || (documents.length > 0 || uploadedFiles.length > 0)) && (
            <button 
              className="btn btn-link btn-xs"
              onClick={toggleDetails}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>

        {/* Detailed Multimedia Preview */}
        {showDetails && (
          <div className="multimedia-details">
            {/* Video Thumbnails */}
            {(videos.length > 0 || youtubeLinks.length > 0) && (
              <div className="media-section">
                <h5>🎬 YouTube Videos</h5>
                <div className="video-thumbnails">
                  {/* Use videos array if available, otherwise fallback to youtubeLinks */}
                  {(videos.length > 0 ? videos : youtubeLinks).map((video, index) => {
                    let videoUrl, videoTitle;
                    
                    if (typeof video === 'string') {
                      // Old format: youtubeLinks array with URL strings
                      videoUrl = video;
                      videoTitle = `Video ${index + 1}`;
                    } else {
                      // New format: videos array with video objects
                      videoUrl = video.youtubeLink;
                      videoTitle = video.videoTitle || `Video ${index + 1}`;
                    }
                    
                    // Clean the URL (remove quotes and whitespace)
                    const cleanUrl = videoUrl?.trim().replace(/^["']|["']$/g, '') || '';
                    
                    // Extract video ID for thumbnail
                    const videoId = getYouTubeVideoId(cleanUrl);
                    const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : null;
                    
                    return (
                      <div 
                        key={index}
                        className="video-thumbnail"
                        onClick={() => handleVideoPreview(video, index)}
                        title="Click to preview video"
                      >
                        <img 
                          src={thumbnailUrl} 
                          alt={videoTitle}
                          loading="lazy"
                        />
                        <div className="play-overlay">
                          <span>▶️</span>
                        </div>
                        <div className="video-info">
                          <span>{videoTitle}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Document Icons */}
            {(documents.length > 0 || uploadedFiles.length > 0) && (
              <div className="media-section">
                <h5>📄 Documents</h5>
                <div className="document-list">
                  {/* Use documents array if available, otherwise fallback to uploadedFiles */}
                  {(documents.length > 0 ? documents : uploadedFiles).map((document, index) => {
                    let fileName, documentTitle;
                    
                    if (typeof document === 'string') {
                      // Old format: uploadedFiles array with file paths
                      fileName = document.split('/').pop();
                      documentTitle = fileName;
                    } else {
                      // New format: documents array with document objects
                      fileName = document.fileName || document.filePath?.split('/').pop() || `Document ${index + 1}`;
                      documentTitle = document.documentTitle || fileName;
                    }
                    
                    const fileIcon = getFileIcon(fileName);
                    return (
                      <div 
                        key={index}
                        className="document-item"
                        onClick={() => handleDocumentPreview(document, index)}
                        title="Click to preview document"
                      >
                        <div className="document-icon">
                          <span className="file-icon">{fileIcon}</span>
                          <div className="preview-overlay">
                            <span>📄</span>
                          </div>
                        </div>
                        <div className="document-info">
                          <div className="document-name" title={documentTitle}>{fileName}</div>
                          {document.documentTitle && document.documentTitle !== fileName && (
                            <div className="document-title" title={document.documentTitle}>
                              {document.documentTitle}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-info">
          <small className="text-muted">
            Created: {new Date(createdAt).toLocaleDateString()}
            {createdByName && ` by ${createdByName}`}
          </small>
          {updatedAt && updatedAt !== createdAt && (
            <small className="text-muted">
              Updated: {new Date(updatedAt).toLocaleDateString()}
              {updatedByName && ` by ${updatedByName}`}
            </small>
          )}
        </div>
        <div className="footer-meta">
          {moduleName && (
            <small className="meta-item">
              📦 {moduleName}
            </small>
          )}
          {subjectName && (
            <small className="meta-item">
              📚 {subjectName}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterListCard;
