import React, { useState, useEffect } from 'react';
import { 
  getYouTubeVideoId, 
  getYouTubeThumbnail, 
  normalizeYouTubeUrl,
  processYouTubeUrl 
} from '../../utils/youtubeUtils';
import './VideoPreviewCard.css';

const VideoPreviewCard = ({ 
  videoUrl, 
  onRemove, 
  onEdit, 
  onPreview,
  index,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processVideo = () => {
      setLoading(true);
      setError(null);
      
      const result = processYouTubeUrl(videoUrl);
      
      if (!result.isValid) {
        setError(result.error);
        setLoading(false);
        return;
      }
      
      setVideoData({
        videoId: result.videoId,
        normalizedUrl: result.normalizedUrl,
        thumbnail: result.thumbnail,
        embedUrl: result.embedUrl,
        title: `Video ${index + 1}`, // Fallback title
        duration: 'Unknown'
      });
      
      setLoading(false);
    };

    processVideo();
  }, [videoUrl, index]);

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(index);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(index, videoUrl);
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    if (videoData && videoData.embedUrl) {
      onPreview(videoData.embedUrl, videoData.normalizedUrl);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(e, index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (draggedIndex !== index) {
      onDrop?.(draggedIndex, index);
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  if (loading) {
    return (
      <div className="video-preview-card loading">
        <div className="video-thumbnail-placeholder">
          <div className="loading-spinner"></div>
        </div>
        <div className="video-info">
          <div className="video-title-placeholder"></div>
          <div className="video-duration-placeholder"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-preview-card error">
        <div className="video-thumbnail-placeholder error">
          <span className="error-icon">⚠️</span>
        </div>
        <div className="video-info">
          <div className="video-title error">{error}</div>
          <div className="video-url">{videoUrl}</div>
        </div>
        <div className="video-actions">
          <button 
            className="btn btn-outline btn-xs"
            onClick={handleEdit}
            title="Edit URL"
          >
            Edit
          </button>
          <button 
            className="btn btn-danger btn-xs"
            onClick={handleRemove}
            title="Remove video"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`video-preview-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      <div className="video-thumbnail" onClick={handlePreview}>
        <img 
          src={videoData.thumbnail} 
          alt={`Video ${index + 1} thumbnail`}
          onError={(e) => {
            e.target.src = getYouTubeThumbnail(videoData.videoId, 'default');
          }}
        />
        <div className="play-overlay">
          <div className="play-button">
            <span>▶️</span>
          </div>
        </div>
        <div className="video-duration-badge">
          {videoData.duration}
        </div>
      </div>
      
      <div className="video-info">
        <div className="video-title" title={videoData.title}>
          {videoData.title}
        </div>
        <div className="video-url" title={videoData.normalizedUrl}>
          {videoData.normalizedUrl}
        </div>
      </div>
      
      <div className="video-actions">
        <button 
          className="btn btn-outline btn-xs"
          onClick={handlePreview}
          title="Preview video"
        >
          Preview
        </button>
        <button 
          className="btn btn-outline btn-xs"
          onClick={handleEdit}
          title="Edit URL"
        >
          Edit
        </button>
        <button 
          className="btn btn-danger btn-xs"
          onClick={handleRemove}
          title="Remove video"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default VideoPreviewCard;
