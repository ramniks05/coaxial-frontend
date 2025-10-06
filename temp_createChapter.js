export const createChapter = async (token, chapterData) => {
  console.log('Creating chapter:', chapterData);
  
  const endpoint = '/api/admin/master-data/chapters';
  
  // Create FormData for multipart request
  const formData = new FormData();
  
  // Add chapter data as JSON string
  const chapterJson = {
    name: chapterData.name,
    description: chapterData.description || '',
    moduleId: chapterData.moduleId,
    displayOrder: chapterData.displayOrder || 0,
    isActive: chapterData.isActive,
    youtubeLinks: chapterData.youtubeLinks || []
  };
  
  // Create a Blob for the JSON data
  const chapterBlob = new Blob([JSON.stringify(chapterJson)], { 
    type: 'application/json' 
  });
  formData.append('chapter', chapterBlob);
  
  // Add uploaded files
  if (chapterData.uploadedFiles && chapterData.uploadedFiles.length > 0) {
    // Get file objects from uploadedFileObjects
    const fileObjects = chapterData.uploadedFileObjects || {};
    
    chapterData.uploadedFiles.forEach(fileName => {
      const fileObject = fileObjects[fileName];
      if (fileObject) {
        formData.append('files', fileObject);
        console.log('Added file to FormData:', fileName);
      } else {
        console.warn('File object not found for:', fileName);
      }
    });
  }
  
  console.log('Creating chapter at endpoint:', endpoint);
  console.log('FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Chapter created successfully:', data);
  return data;
};
