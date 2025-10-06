import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DocumentPreviewModal.css';

const DocumentPreviewModal = ({ 
  isOpen, 
  onClose, 
  fileName, 
  filePath,
  fileObject,
  fileType = 'Document Preview' 
}) => {
  const modalRef = useRef(null);
  const serverBlobUrlRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [serverBlobUrl, setServerBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    const handleFullscreenToggle = (e) => {
      // F11 or Ctrl+F for fullscreen toggle
      if (e.key === 'F11' || (e.ctrlKey && e.key === 'f')) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    const handleClickOutside = (e) => {
      if (!isFullscreen && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFullscreenToggle);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      
      // Add CSS override to prevent global hover effects
      const style = document.createElement('style');
      style.id = 'document-modal-override';
      style.textContent = `
        body * {
          transform: none !important;
          transition: none !important;
        }
        body *:hover {
          transform: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFullscreenToggle);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
      
      // Remove CSS override
      const existingStyle = document.getElementById('document-modal-override');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isOpen, onClose, isFullscreen]);

  // Fetch server file and create blob URL (same as data entry form)
  useEffect(() => {
    if (isOpen && fileName && filePath && !fileObject) {
      const fetchServerFile = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Construct the server URL
          let serverUrl;
          if (filePath.startsWith('/uploads/')) {
            serverUrl = `http://localhost:8080${filePath}`;
          } else if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            serverUrl = filePath;
          } else {
            serverUrl = `http://localhost:8080${filePath}`;
          }
          
          console.log('Fetching server file from:', serverUrl);
          
          // Fetch the file from server
          const response = await fetch(serverUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Create blob from response
          const blob = await response.blob();
          console.log('Server file fetched successfully, blob size:', blob.size);
          
          // Create blob URL (same as data entry form)
          const blobUrl = URL.createObjectURL(blob);
          
          // Clean up previous blob URL if exists
          if (serverBlobUrlRef.current) {
            URL.revokeObjectURL(serverBlobUrlRef.current);
          }
          
          serverBlobUrlRef.current = blobUrl;
          setServerBlobUrl(blobUrl);
          console.log('Created blob URL for server file:', blobUrl);
          
        } catch (err) {
          console.error('Error fetching server file:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchServerFile();
    }
    
    // Cleanup blob URL when component unmounts or file changes
    return () => {
      if (serverBlobUrlRef.current) {
        URL.revokeObjectURL(serverBlobUrlRef.current);
        serverBlobUrlRef.current = null;
        setServerBlobUrl(null);
      }
    };
  }, [isOpen, fileName, filePath, fileObject]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Memoize the PDF URL to prevent re-creation on every render
  const pdfUrl = useMemo(() => {
    if (!fileName || !isOpen) return null;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    console.log('DocumentPreviewModal - File details:', { fileName, extension, fileObject, filePath, serverBlobUrl });
    
    if (extension === 'pdf') {
      // Priority 1: Use file object (from data entry form)
      if (fileObject) {
        console.log('Using file object for preview (data entry form)');
        return URL.createObjectURL(fileObject);
      }
      
      // Priority 2: Use server blob URL (from chapter list)
      if (serverBlobUrl) {
        console.log('Using server blob URL for preview (chapter list)');
        return serverBlobUrl;
      }
      
      // Priority 3: Direct server URL (fallback)
      if (filePath) {
        console.log('Using direct server URL for preview (fallback)');
        if (filePath.startsWith('/uploads/')) {
          return `http://localhost:8080${filePath}`;
        } else if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
          return filePath;
        } else {
          return `http://localhost:8080${filePath}`;
        }
      }
      
      console.log('No file object, blob URL, or path available');
      return null;
    }
    console.log('File is not PDF, extension:', extension);
    return null;
  }, [fileName, fileObject, filePath, serverBlobUrl, isOpen]);

  // Cleanup object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (pdfUrl && fileObject) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl, fileObject]);

  // Cleanup server blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (serverBlobUrlRef.current) {
        URL.revokeObjectURL(serverBlobUrlRef.current);
        serverBlobUrlRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const renderPreview = () => {
    if (!fileName) return null;

    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      if (loading) {
        return (
          <div className="loading-preview">
            <div className="loading-spinner">⏳</div>
            <h3>Loading Document...</h3>
            <p>Fetching file from server...</p>
          </div>
        );
      }
      
      if (error) {
        return (
          <div className="error-preview">
            <div className="error-icon">❌</div>
            <h3>Error Loading Document</h3>
            <p>{error}</p>
            <div className="preview-actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  let testUrl;
                  if (filePath && filePath.startsWith('/uploads/')) {
                    testUrl = `http://localhost:8080${filePath}`;
                  } else {
                    testUrl = `http://localhost:8080/api/admin/master-data/chapters/files/${encodeURIComponent(fileName)}`;
                  }
                  window.open(testUrl, '_blank');
                }}
              >
                🔗 Try Direct Link
              </button>
              <button 
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        );
      }
      
      if (pdfUrl) {
        console.log('Rendering PDF iframe with URL:', pdfUrl);
        console.log('Current window location:', window.location.href);
        console.log('Expected backend URL should be on port 8080');
        
        // Enhanced PDF URL for better readability in fullscreen
        const enhancedPdfUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&view=FitH`;
        
        return (
          <iframe
            src={enhancedPdfUrl}
            width="100%"
            height="100%"
            style={{ 
              border: "none",
              backgroundColor: isFullscreen ? "#ffffff" : "#f5f5f5",
              width: isFullscreen ? "100vw" : "100%",
              height: isFullscreen ? "calc(100vh - 80px)" : "100%",
              position: isFullscreen ? "absolute" : "relative",
              top: isFullscreen ? "0" : "auto",
              left: isFullscreen ? "0" : "auto"
            }}
            title={fileName}
            key={pdfUrl} // Force re-render when URL changes
            loading="lazy"
            onLoad={() => console.log('PDF iframe loaded successfully from:', enhancedPdfUrl)}
            onError={(e) => console.error('PDF iframe failed to load from:', enhancedPdfUrl, 'Error:', e)}
          />
        );
      } else {
        // No preview available - show message with options
        return (
          <div className="no-preview-available">
            <div className="no-preview-icon">📄</div>
            <h3>Preview Not Available</h3>
            <p>File preview is not available. Debug info:</p>
            <div className="debug-info">
              <p><strong>File:</strong> {fileName}</p>
              <p><strong>File Object:</strong> {fileObject ? 'Available' : 'Not available'}</p>
              <p><strong>File Path:</strong> {filePath || 'Not available'}</p>
              <p><strong>Server Blob:</strong> {serverBlobUrl ? 'Available' : 'Not available'}</p>
              <p><strong>Extension:</strong> {extension}</p>
            </div>
            <div className="preview-options">
              <p>To preview this document, you can:</p>
              <ul>
                <li>📝 Edit the chapter and use the preview function in the form</li>
                <li>💾 Download the file (if available on server)</li>
                <li>🔄 Check browser console for detailed error logs</li>
              </ul>
            </div>
            <div className="preview-actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  // Try to open the file in a new tab first
                  let testUrl;
                  if (filePath && filePath.startsWith('/uploads/')) {
                    // Use the actual file path from API
                    testUrl = `http://localhost:8080${filePath}`;
                  } else {
                    // Fallback to API endpoint
                    testUrl = `http://localhost:8080/api/admin/master-data/chapters/files/${encodeURIComponent(fileName)}`;
                  }
                  console.log('Testing file URL in new tab:', testUrl);
                  window.open(testUrl, '_blank');
                }}
              >
                🔗 Test URL in New Tab
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  // Try to download the file
                  let downloadUrl;
                  if (filePath && filePath.startsWith('/uploads/')) {
                    // Use the actual file path from API
                    downloadUrl = `http://localhost:8080${filePath}`;
                  } else {
                    // Fallback to API endpoint
                    downloadUrl = `http://localhost:8080/api/admin/master-data/chapters/files/${encodeURIComponent(fileName)}`;
                  }
                  console.log('Attempting download from URL:', downloadUrl);
                  window.open(downloadUrl, '_blank');
                }}
              >
                💾 Try Download
              </button>
              <button 
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        );
      }
    }
    
    // For non-PDF files, show unsupported message
    return (
      <div className="unsupported-preview">
        <div className="unsupported-icon">📄</div>
        <h3>Preview Not Available</h3>
        <p>Only PDF files are supported for preview.</p>
        <p>File: <strong>{fileName}</strong></p>
      </div>
    );
  };

  return (
    <div className={`document-preview-modal-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className={`document-preview-modal ${isFullscreen ? 'fullscreen' : ''}`} ref={modalRef}>
        <div className="modal-header">
          <h3 className="modal-title">{fileName || 'Document Preview'}</h3>
          <div className="modal-controls">
            <button 
              className="modal-fullscreen-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen (F11)" : "Enter fullscreen (F11)"}
            >
              {isFullscreen ? '⤓' : '⤢'}
            </button>
            <button 
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close document preview"
              title="Close (Esc)"
            >
              <span>✕</span>
            </button>
          </div>
        </div>
        
        <div className="modal-content">
          <div className="document-container">
            {renderPreview()}
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn btn-secondary"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Minimize' : 'Fullscreen'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
