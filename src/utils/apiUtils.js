// API Utility Functions
const API_BASE = 'http://localhost:8080';

/**
 * Creates appropriate headers for API requests
 * Automatically prevents preflight requests by only adding Content-Type for POST/PUT/PATCH requests
 * @param {string} token - Authentication token
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {boolean} includeContentType - Whether to include Content-Type header (defaults to true for POST/PUT/PATCH)
 * @returns {Object} Headers object
 */
export const createApiHeaders = (token, method = 'GET', includeContentType = null) => {
  const headers = {
    'accept': '*/*'
  };

  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only add Content-Type for requests that need it (POST, PUT, PATCH)
  // This prevents preflight requests for GET, DELETE, HEAD, OPTIONS requests
  const shouldIncludeContentType = includeContentType !== null 
    ? includeContentType 
    : ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());

  if (shouldIncludeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

/**
 * Makes an API request with proper headers and error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {string} token - Authentication token
 * @returns {Promise<Response>} Fetch response
 */
export const makeApiRequest = async (endpoint, options = {}, token = null) => {
  const {
    method = 'GET',
    body = null,
    includeContentType = null,
    ...otherOptions
  } = options;

  const headers = createApiHeaders(token, method, includeContentType);

  const requestOptions = {
    method,
    headers,
    ...otherOptions
  };

  // Only add body for requests that support it
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  console.log(`Making ${method} request to:`, fullUrl);
  console.log('Request headers:', headers);
  
  const response = await fetch(fullUrl, requestOptions);
  
  console.log(`Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response;
};

/**
 * Makes a GET request (no preflight)
 * @param {string} endpoint - API endpoint
 * @param {string} token - Authentication token
 * @returns {Promise<Response>} Fetch response
 */
export const apiGet = (endpoint, token) => {
  return makeApiRequest(endpoint, { method: 'GET' }, token);
};

/**
 * Makes a POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {string} token - Authentication token
 * @returns {Promise<Response>} Fetch response
 */
export const apiPost = (endpoint, data, token) => {
  return makeApiRequest(endpoint, { method: 'POST', body: data }, token);
};

/**
 * Makes a PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {string} token - Authentication token
 * @returns {Promise<Response>} Fetch response
 */
export const apiPut = (endpoint, data, token) => {
  return makeApiRequest(endpoint, { method: 'PUT', body: data }, token);
};

/**
 * Makes a DELETE request (no preflight)
 * @param {string} endpoint - API endpoint
 * @param {string} token - Authentication token
 * @returns {Promise<Response>} Fetch response
 */
export const apiDelete = (endpoint, token) => {
  return makeApiRequest(endpoint, { method: 'DELETE' }, token);
};

export { API_BASE };

