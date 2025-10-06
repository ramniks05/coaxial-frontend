import React, { useEffect, useRef } from 'react';

const VideoPreviewModal = ({ 
  isOpen, 
  onClose, 
  embedUrl, 
  watchUrl, 
  videoTitle = 'Video Preview' 
}) => {
  const modalRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Add CSS override to prevent global hover effects
      const style = document.createElement('style');
      style.id = 'video-modal-override';
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
      
      // Set iframe source
      if (iframeRef.current && embedUrl) {
        iframeRef.current.src = embedUrl;
      }
    } else {
      // Re-enable body scroll
      document.body.style.overflow = '';
      
      // Remove CSS override
      const existingStyle = document.getElementById('video-modal-override');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Clear iframe source
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      const existingStyle = document.getElementById('video-modal-override');
      if (existingStyle) {
        existingStyle.remove();
      }
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
    };
  }, [isOpen, embedUrl]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Inline styles to prevent any external CSS interference
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px',
    boxSizing: 'border-box'
  };

  const containerStyle = {
    background: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    borderRadius: '4px'
  };

  const bodyStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingBottom: '56.25%',
    background: '#000',
    flexShrink: 0
  };

  const iframeStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none'
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb'
  };

  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500
  };

  const buttonStyle = {
    padding: '8px 16px',
    background: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer'
  };

  return (
    <div style={overlayStyle}>
      <div style={containerStyle} ref={modalRef}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{videoTitle}</h3>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            type="button"
            aria-label="Close video preview"
          >
            ×
          </button>
        </div>
        
        <div style={bodyStyle}>
          <div style={wrapperStyle}>
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={iframeStyle}
            />
          </div>
          
          <div style={footerStyle}>
            <a 
              href={watchUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={linkStyle}
            >
              🔗 Open in YouTube
            </a>
            <button 
              style={buttonStyle}
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;