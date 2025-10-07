import { API_BASE } from '../utils/apiUtils';

// Set Course Pricing
export const setCoursePricing = async (token, pricingData) => {
  const endpoint = `${API_BASE}/api/admin/pricing/set-course-pricing`;
  
  console.log('Setting course pricing:', pricingData);
  
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(pricingData)
  });
  
  console.log('Set course pricing response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Set course pricing error:', errorText);
    throw new Error(`Failed to set course pricing: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Course pricing set successfully:', data);
  return data;
};

// Set Class Pricing
export const setClassPricing = async (token, pricingData) => {
  const endpoint = `${API_BASE}/api/admin/pricing/set-class-pricing`;
  
  console.log('Setting class pricing:', pricingData);
  
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(pricingData)
  });
  
  console.log('Set class pricing response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Set class pricing error:', errorText);
    throw new Error(`Failed to set class pricing: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Class pricing set successfully:', data);
  return data;
};

// Set Exam Pricing
export const setExamPricing = async (token, pricingData) => {
  const endpoint = `${API_BASE}/api/admin/pricing/set-exam-pricing`;
  
  console.log('Setting exam pricing:', pricingData);
  
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(pricingData)
  });
  
  console.log('Set exam pricing response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Set exam pricing error:', errorText);
    throw new Error(`Failed to set exam pricing: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Exam pricing set successfully:', data);
  return data;
};

// Get dropdown data for courses
export const getCoursesDropdown = async (token) => {
  const endpoint = `${API_BASE}/api/admin/pricing/dropdowns/courses`;
  
  const headers = {
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch courses dropdown: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
};

// Get dropdown data for classes by course
export const getClassesDropdown = async (token, courseId) => {
  const endpoint = `${API_BASE}/api/admin/pricing/dropdowns/classes?courseId=${courseId}`;
  
  const headers = {
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch classes dropdown: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
};

// Get dropdown data for exams
export const getExamsDropdown = async (token) => {
  const endpoint = `${API_BASE}/api/admin/pricing/dropdowns/exams`;
  
  const headers = {
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch exams dropdown: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
  
};

// Bulk Update Discount by Course Type (Global Offer)
export const bulkUpdateDiscountByCourseType = async (token, offerData) => {
  const endpoint = `${API_BASE}/api/admin/pricing/bulk-update-discount-by-course-type`;
  
  console.log('Bulk updating discount by course type:', offerData);
  
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(offerData)
  });
  
  console.log('Bulk update discount response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bulk update discount error:', errorText);
    throw new Error(`Failed to bulk update discount: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Bulk discount update successful:', data);
  return data;
};

// Filter Pricing Configurations
export const filterPricing = async (token, filters) => {
  const params = new URLSearchParams();
  
  if (filters.courseTypeId) params.append('courseTypeId', filters.courseTypeId);
  if (filters.entityType) params.append('entityType', filters.entityType);
  if (filters.courseId) params.append('courseId', filters.courseId);
  if (filters.entityId) params.append('entityId', filters.entityId);
  if (filters.isActive !== null && filters.isActive !== undefined && filters.isActive !== '') {
    params.append('isActive', filters.isActive);
  }
  if (filters.search) params.append('search', filters.search);
  
  const endpoint = `${API_BASE}/api/admin/pricing/filter?${params.toString()}`;
  
  console.log('Filtering pricing:', endpoint);
  
  const headers = {
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, { headers });
  
  console.log('Filter pricing response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Filter pricing error:', errorText);
    throw new Error(`Failed to filter pricing: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Pricing filtered successfully:', data);
  return data;
};
