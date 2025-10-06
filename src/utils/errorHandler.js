// Error code to user-friendly message mapping
export const ERROR_MESSAGES = {
  // Authentication Errors
  USER_NOT_FOUND: "Username not found. Please check your username and try again.",
  INVALID_CREDENTIALS: "Invalid password. Please check your password and try again.",
  USER_DISABLED: "Your account has been disabled. Please contact support for assistance.",
  BAD_CREDENTIALS: "Login failed. Please check your credentials and try again.",
  ACCOUNT_DISABLED: "Your account has been disabled. Please contact support for assistance.",
  
  // Validation Errors
  VALIDATION_ERROR: "Please check your input and try again.",
  EMAIL_ALREADY_EXISTS: "This email address is already registered",
  USERNAME_ALREADY_EXISTS: "This username is already taken",
  INVALID_EMAIL_FORMAT: "Please enter a valid email address",
  
  // Network Errors
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  
  // Generic Errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again."
};

// HTTP Status code to error type mapping
export const STATUS_CODE_MAPPING = {
  400: 'VALIDATION_ERROR',
  401: 'BAD_CREDENTIALS',
  403: 'ACCOUNT_DISABLED',
  404: 'USER_NOT_FOUND',
  408: 'TIMEOUT_ERROR',
  500: 'SERVER_ERROR',
  502: 'SERVER_ERROR',
  503: 'SERVER_ERROR',
  504: 'TIMEOUT_ERROR'
};

// Function to extract error information from API response
export const extractErrorInfo = (response, errorData) => {
  let errorCode = 'UNKNOWN_ERROR';
  let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
  
  // Check if response has specific error code
  if (errorData && errorData.code) {
    errorCode = errorData.code;
    errorMessage = ERROR_MESSAGES[errorCode] || errorData.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  // Check if response has error message
  else if (errorData && errorData.message) {
    errorMessage = errorData.message;
  }
  // Map HTTP status code to error
  else if (response && response.status) {
    errorCode = STATUS_CODE_MAPPING[response.status] || 'UNKNOWN_ERROR';
    errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  return {
    code: errorCode,
    message: errorMessage,
    status: response?.status,
    originalError: errorData
  };
};

// Function to determine if error is retryable
export const isRetryableError = (errorCode) => {
  const retryableErrors = [
    'NETWORK_ERROR',
    'SERVER_ERROR',
    'TIMEOUT_ERROR'
  ];
  return retryableErrors.includes(errorCode);
};

// Function to get error severity level
export const getErrorSeverity = (errorCode) => {
  const severityMap = {
    'USER_NOT_FOUND': 'warning',
    'INVALID_CREDENTIALS': 'warning',
    'VALIDATION_ERROR': 'warning',
    'EMAIL_ALREADY_EXISTS': 'warning',
    'USERNAME_ALREADY_EXISTS': 'warning',
    'INVALID_EMAIL_FORMAT': 'warning',
    'USER_DISABLED': 'error',
    'ACCOUNT_DISABLED': 'error',
    'BAD_CREDENTIALS': 'error',
    'NETWORK_ERROR': 'error',
    'SERVER_ERROR': 'error',
    'TIMEOUT_ERROR': 'error',
    'UNKNOWN_ERROR': 'error'
  };
  return severityMap[errorCode] || 'error';
};
