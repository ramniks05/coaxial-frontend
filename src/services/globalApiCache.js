// Global API Cache Service
// Prevents duplicate API calls across all components

import { getCourseTypes, getCourses } from './masterDataService';

// Global cache for course types
const courseTypesCache = {
  data: null,
  loading: false,
  error: null,
  timestamp: 0,
  promise: null
};

// Global cache for courses
const coursesCache = {
  data: null,
  loading: false,
  error: null,
  timestamp: 0,
  promise: null,
  params: null // Store the parameters used for the last request
};

/**
 * Get course types with global caching
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} Course types data
 */
export const getCourseTypesCached = async (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  // If already loading, wait for the existing promise
  if (courseTypesCache.loading && courseTypesCache.promise) {
    try {
      await courseTypesCache.promise;
      return courseTypesCache.data;
    } catch (error) {
      throw error;
    }
  }

  // Check if we have recent data (within 5 seconds)
  const now = Date.now();
  if (courseTypesCache.data && (now - courseTypesCache.timestamp) < 5000) {
    return courseTypesCache.data;
  }

  // Make new request
  courseTypesCache.loading = true;
  courseTypesCache.error = null;

  const promise = getCourseTypes(token)
    .then(data => {
      courseTypesCache.data = data;
      courseTypesCache.loading = false;
      courseTypesCache.error = null;
      courseTypesCache.timestamp = now;
      courseTypesCache.promise = null;
      return data;
    })
    .catch(error => {
      courseTypesCache.loading = false;
      courseTypesCache.error = error;
      courseTypesCache.promise = null;
      throw error;
    });

  courseTypesCache.promise = promise;
  return promise;
};

/**
 * Clear the course types cache (useful after create/update/delete operations)
 */
export const clearCourseTypesCache = () => {
  courseTypesCache.data = null;
  courseTypesCache.loading = false;
  courseTypesCache.error = null;
  courseTypesCache.timestamp = 0;
  courseTypesCache.promise = null;
};

/**
 * Get courses with global caching
 * @param {string} token - Authentication token
 * @param {string} courseTypeId - Course type ID (optional)
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 10)
 * @param {string} sortBy - Sort field (default: 'createdAt')
 * @param {string} sortDir - Sort direction (default: 'desc')
 * @returns {Promise<Array>} Courses data
 */
export const getCoursesCached = async (token, courseTypeId = null, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  // Create a cache key based on parameters
  const cacheKey = JSON.stringify({ courseTypeId, page, size, sortBy, sortDir });
  
  // If already loading with the same parameters, wait for the existing promise
  if (coursesCache.loading && coursesCache.promise && coursesCache.params === cacheKey) {
    try {
      await coursesCache.promise;
      return coursesCache.data;
    } catch (error) {
      throw error;
    }
  }

  // Check if we have recent data with the same parameters (within 5 seconds)
  const now = Date.now();
  if (coursesCache.data && coursesCache.params === cacheKey && (now - coursesCache.timestamp) < 5000) {
    return coursesCache.data;
  }

  // Make new request
  coursesCache.loading = true;
  coursesCache.error = null;
  coursesCache.params = cacheKey;

  const promise = getCourses(token, courseTypeId, page, size, sortBy, sortDir)
    .then(data => {
      coursesCache.data = data;
      coursesCache.loading = false;
      coursesCache.error = null;
      coursesCache.timestamp = now;
      coursesCache.promise = null;
      return data;
    })
    .catch(error => {
      coursesCache.loading = false;
      coursesCache.error = error;
      coursesCache.promise = null;
      throw error;
    });

  coursesCache.promise = promise;
  return promise;
};

/**
 * Clear the courses cache (useful after create/update/delete operations)
 */
export const clearCoursesCache = () => {
  coursesCache.data = null;
  coursesCache.loading = false;
  coursesCache.error = null;
  coursesCache.timestamp = 0;
  coursesCache.promise = null;
  coursesCache.params = null;
};

/**
 * Get current cache status
 */
export const getCourseTypesCacheStatus = () => ({
  hasData: !!courseTypesCache.data,
  isLoading: courseTypesCache.loading,
  hasError: !!courseTypesCache.error,
  timestamp: courseTypesCache.timestamp,
  age: Date.now() - courseTypesCache.timestamp
});
