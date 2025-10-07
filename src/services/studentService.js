import { API_BASE } from '../utils/apiUtils';

// Get Course Catalog (Public API - no auth required)
export const getCourseCatalog = async () => {
  const endpoint = `${API_BASE}/api/public/course-catalogue/all`;
  
  console.log('Fetching course catalog from:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    console.log('Course catalog response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Course catalog error:', errorText);
      throw new Error('Failed to fetch course catalog: ' + response.status + ' ' + response.statusText);
    }
    
    const data = await response.json();
    console.log('Course catalog data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching course catalog:', error);
    throw error;
  }
};

// Get Course Catalog with Filters
export const getFilteredCourseCatalog = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.courseTypeId) params.append('courseTypeId', filters.courseTypeId);
  if (filters.search) params.append('search', filters.search);
  if (filters.active !== undefined) params.append('active', filters.active);
  
  const endpoint = `${API_BASE}/api/public/course-catalogue/all?${params.toString()}`;
  
  console.log('Fetching filtered course catalog from:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to fetch filtered course catalog: ' + response.status);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filtered course catalog:', error);
    throw error;
  }
};
