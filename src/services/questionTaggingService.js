import { apiGet } from '../utils/apiUtils';

// Master Exams and Years APIs for Question Management
export const getMasterExamsKV = async (token) => {
  try {
    const response = await apiGet('/api/public/master-exams/kv', token);
    return await response.json();
  } catch (error) {
    console.error('Error fetching master exams:', error);
    throw error;
  }
};

export const getYearsKV = async (token) => {
  try {
    const response = await apiGet('/api/public/years/kv', token); // Token required for authentication
    return await response.json();
  } catch (error) {
    console.error('Error fetching years:', error);
    throw error;
  }
};
