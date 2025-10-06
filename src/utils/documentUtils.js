/**
 * Document Utility Functions
 * Handles document file validation, preview, and metadata
 */

/**
 * Get file icon based on file extension
 * @param {string} fileName - File name or extension
 * @returns {string} - File icon emoji
 */
export const getFileIcon = (fileName) => {
  if (!fileName) return '📄';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap = {
    // PDF files
    'pdf': '📕',
    
    // Word documents
    'doc': '📘',
    'docx': '📘',
    
    // Excel files
    'xls': '📗',
    'xlsx': '📗',
    
    // PowerPoint files
    'ppt': '📙',
    'pptx': '📙',
    
    // Text files
    'txt': '📄',
    'rtf': '📄',
    
    // Images
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'bmp': '🖼️',
    'svg': '🖼️',
    
    // Archives
    'zip': '🗜️',
    'rar': '🗜️',
    '7z': '🗜️',
    
    // Audio
    'mp3': '🎵',
    'wav': '🎵',
    'm4a': '🎵',
    
    // Video
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬',
    'wmv': '🎬',
    
    // Code files
    'js': '💻',
    'html': '💻',
    'css': '💻',
    'json': '💻',
    'xml': '💻'
  };
  
  return iconMap[extension] || '📄';
};

/**
 * Get file type display name
 * @param {string} fileName - File name
 * @returns {string} - File type display name
 */
export const getFileTypeDisplay = (fileName) => {
  if (!fileName) return 'Unknown';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const typeMap = {
    'pdf': 'PDF Document',
    'doc': 'Word Document',
    'docx': 'Word Document',
    'xls': 'Excel Spreadsheet',
    'xlsx': 'Excel Spreadsheet',
    'ppt': 'PowerPoint Presentation',
    'pptx': 'PowerPoint Presentation',
    'txt': 'Text File',
    'rtf': 'Rich Text File',
    'jpg': 'JPEG Image',
    'jpeg': 'JPEG Image',
    'png': 'PNG Image',
    'gif': 'GIF Image',
    'zip': 'ZIP Archive',
    'rar': 'RAR Archive',
    'mp3': 'MP3 Audio',
    'mp4': 'MP4 Video'
  };
  
  return typeMap[extension] || `${extension?.toUpperCase()} File`;
};

/**
 * Validate file type for upload - PDF only
 * @param {string} fileName - File name
 * @param {Array} allowedTypes - Allowed file extensions (defaults to PDF only)
 * @returns {object} - Validation result
 */
export const validateFileType = (fileName, allowedTypes = ['pdf']) => {
  if (!fileName) {
    return {
      isValid: false,
      error: 'No file selected'
    };
  }
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return {
      isValid: false,
      error: 'Invalid file format'
    };
  }
  
  if (!allowedTypes.includes(extension)) {
    return {
      isValid: false,
      error: `Only PDF files are allowed. Selected file type: .${extension}`
    };
  }
  
  return {
    isValid: true,
    error: null,
    extension,
    type: getFileTypeDisplay(fileName)
  };
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate file preview URL (for supported file types)
 * @param {string} fileName - File name
 * @param {string} filePath - File path (if available)
 * @returns {string|null} - Preview URL or null if not supported
 */
export const getFilePreviewUrl = (fileName, filePath = null) => {
  if (!fileName) return null;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // For now, return null as we'll handle preview differently
  // This could be extended to support actual file preview URLs
  return null;
};

/**
 * Check if file type supports preview - PDF only
 * @param {string} fileName - File name
 * @returns {boolean} - Whether file supports preview
 */
export const supportsPreview = (fileName) => {
  if (!fileName) return false;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'pdf';
};

/**
 * Process PDF document file for form input
 * @param {string} fileName - File name
 * @param {number} fileSize - File size in bytes
 * @param {string} filePath - File path (optional)
 * @returns {object} - Processed file data
 */
export const processDocumentFile = (fileName, fileSize = null, filePath = null) => {
  const validation = validateFileType(fileName, ['pdf']);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      fileName: null,
      fileIcon: '📄',
      fileType: 'Unknown',
      fileSize: null,
      previewUrl: null,
      supportsPreview: false
    };
  }
  
  return {
    isValid: true,
    error: null,
    fileName,
    fileIcon: getFileIcon(fileName),
    fileType: validation.type,
    fileSize: fileSize ? formatFileSize(fileSize) : null,
    previewUrl: getFilePreviewUrl(fileName, filePath),
    supportsPreview: supportsPreview(fileName)
  };
};

/**
 * Generate file download URL
 * @param {string} fileName - File name
 * @param {string} filePath - File path
 * @returns {string} - Download URL
 */
export const getFileDownloadUrl = (fileName, filePath) => {
  if (!fileName) return null;
  
  // This would typically be replaced with your actual file serving endpoint
  return filePath || `/api/files/download/${encodeURIComponent(fileName)}`;
};

/**
 * Validate and process multiple files
 * @param {Array} files - Array of file objects
 * @returns {Array} - Array of processed file data
 */
export const processMultipleFiles = (files) => {
  if (!Array.isArray(files)) return [];
  
  return files.map(file => {
    if (typeof file === 'string') {
      // If it's just a filename string
      return processDocumentFile(file);
    } else if (typeof file === 'object' && file.fileName) {
      // If it's a file object
      return processDocumentFile(file.fileName, file.fileSize, file.filePath);
    }
    
    return {
      isValid: false,
      error: 'Invalid file format',
      fileName: null,
      fileIcon: '📄',
      fileType: 'Unknown',
      fileSize: null,
      previewUrl: null,
      supportsPreview: false
    };
  });
};
