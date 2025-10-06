import React from 'react';
import { 
  getFileIcon, 
  getFileTypeDisplay, 
  formatFileSize,
  supportsPreview 
} from '../../utils/documentUtils';
import './DocumentPreviewCard.css';

const DocumentPreviewCard = ({ 
  fileName, 
  fileSize = null,
  filePath = null,
  index,
  onRemove, 
  onPreview
}) => {
  const fileIcon = getFileIcon(fileName);
  const fileType = getFileTypeDisplay(fileName);
  const canPreview = supportsPreview(fileName);
  const displaySize = fileSize ? formatFileSize(fileSize) : 'Unknown size';

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(index);
  };


  const handlePreview = (e) => {
    e.stopPropagation();
    if (canPreview) {
      onPreview(fileName, filePath);
    }
  };

  return (
    <div className="simple-document-item">
      <div className="document-icon" onClick={handlePreview}>
        <span className="file-icon">{fileIcon}</span>
        {canPreview && (
          <div className="preview-overlay-small">
            <span>👁️</span>
          </div>
        )}
      </div>
      
      <div className="document-info-small">
        <div className="document-name-small" title={fileName}>
          {fileName}
        </div>
        <div className="document-meta-small">
          <span className="file-type">{fileType}</span>
          {fileSize && <span className="file-size">({displaySize})</span>}
        </div>
        <div className="document-actions-small">
          {canPreview && (
            <button 
              type="button"
              onClick={handlePreview}
              className="btn btn-primary btn-xs"
              title="Preview PDF"
            >
              👁️ Preview
            </button>
          )}
          <button 
            type="button"
            onClick={handleRemove}
            className="btn btn-danger btn-xs"
            title="Remove PDF"
          >
            🗑️ Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewCard;
