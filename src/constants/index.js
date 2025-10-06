// ===== COAXIAL ACADEMY CONSTANTS =====
// Centralized constants for the entire application

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  // Master Data
  MASTER_DATA: '/api/master-data',
  QUESTIONS: '/api/questions',
  SUBJECTS: '/api/subjects',
  TOPICS: '/api/topics',
  DIFFICULTY_LEVELS: '/api/difficulty-levels',
  QUESTION_TYPES: '/api/question-types',
  
  // User Management
  USERS: '/api/users',
  AUTH: '/api/auth',
  PROFILE: '/api/profile',
  
  // Reports
  REPORTS: '/api/reports',
  ANALYTICS: '/api/analytics',
  
  // File Upload
  UPLOAD: '/api/upload',
  EXPORT: '/api/export'
};

// ===== QUESTION MANAGEMENT =====
export const QUESTION_TYPES = {
  MCQ: 'MCQ',
  DESCRIPTIVE: 'DESCRIPTIVE',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_BLANKS: 'FILL_BLANKS',
  MATCHING: 'MATCHING',
  SEQUENCE: 'SEQUENCE'
};

export const DIFFICULTY_LEVELS = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

export const QUESTION_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED'
};

// ===== NOTIFICATION SYSTEM =====
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
};

// ===== FORM VALIDATION =====
export const FORM_VALIDATION = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (min) => `Minimum length is ${min} characters`,
  MAX_LENGTH: (max) => `Maximum length is ${max} characters`,
  MIN_VALUE: (min) => `Minimum value is ${min}`,
  MAX_VALUE: (max) => `Maximum value is ${max}`,
  PATTERN: 'Please enter a valid format',
  UNIQUE: 'This value already exists'
};

// ===== PAGINATION =====
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
};

// ===== SORTING =====
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
};

export const DEFAULT_SORT = {
  field: 'createdAt',
  order: SORT_ORDERS.DESC
};

// ===== FILTERS =====
export const FILTER_OPERATORS = {
  EQUALS: 'equals',
  CONTAINS: 'contains',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  GREATER_THAN: 'gt',
  LESS_THAN: 'lt',
  GREATER_EQUAL: 'gte',
  LESS_EQUAL: 'lte',
  IN: 'in',
  NOT_IN: 'notIn',
  IS_NULL: 'isNull',
  IS_NOT_NULL: 'isNotNull'
};

// ===== USER ROLES =====
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  GUEST: 'GUEST'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: ['*'],
  [USER_ROLES.ADMIN]: [
    'questions:read', 'questions:write', 'questions:delete',
    'subjects:read', 'subjects:write', 'subjects:delete',
    'topics:read', 'topics:write', 'topics:delete',
    'users:read', 'users:write',
    'reports:read'
  ],
  [USER_ROLES.TEACHER]: [
    'questions:read', 'questions:write',
    'subjects:read', 'topics:read',
    'reports:read'
  ],
  [USER_ROLES.STUDENT]: [
    'questions:read',
    'subjects:read', 'topics:read'
  ],
  [USER_ROLES.GUEST]: [
    'questions:read'
  ]
};

// ===== THEME CONFIGURATION =====
export const THEME = {
  COLORS: {
    PRIMARY: '#6366f1',
    SECONDARY: '#a855f7',
    SUCCESS: '#22c55e',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  }
};

// ===== LOCAL STORAGE KEYS =====
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'coaxial_auth_token',
  USER_DATA: 'coaxial_user_data',
  THEME_PREFERENCE: 'coaxial_theme',
  LANGUAGE: 'coaxial_language',
  SIDEBAR_STATE: 'coaxial_sidebar_state',
  FILTERS: 'coaxial_filters',
  CACHE: 'coaxial_cache'
};

// ===== CACHE CONFIGURATION =====
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 30 * 60 * 1000,   // 30 minutes
  SHORT_TTL: 1 * 60 * 1000,   // 1 minute
  MAX_CACHE_SIZE: 100,
  CACHE_PREFIX: 'coaxial_cache_'
};

// ===== DEBOUNCE DELAYS =====
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  API_CALL: 1000,
  RESIZE: 250
};

// ===== FILE UPLOAD =====
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  },
  UPLOAD_PATH: '/uploads'
};

// ===== EXPORT FORMATS =====
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json'
};

// ===== DATE FORMATS =====
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// ===== REGEX PATTERNS =====
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// ===== SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
  SAVED: 'Data saved successfully.',
  UPDATED: 'Data updated successfully.',
  DELETED: 'Data deleted successfully.',
  CREATED: 'Data created successfully.',
  UPLOADED: 'File uploaded successfully.',
  EXPORTED: 'Data exported successfully.',
  IMPORTED: 'Data imported successfully.'
};

// ===== LOADING STATES =====
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// ===== MODAL SIZES =====
export const MODAL_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl'
};

// ===== TABLE CONFIGURATION =====
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  STICKY_HEADER: true,
  HOVER_EFFECT: true,
  SELECTABLE: true,
  SORTABLE: true,
  FILTERABLE: true
};

// ===== CHART COLORS =====
export const CHART_COLORS = [
  '#6366f1', '#a855f7', '#22c55e', '#ef4444', '#f59e0b',
  '#3b82f6', '#ec4899', '#10b981', '#f97316', '#8b5cf6'
];

// ===== ANIMATION DURATIONS =====
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350
};

// ===== Z-INDEX SCALE =====
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// ===== FEATURE FLAGS =====
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CACHING: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PWA: false
};

// ===== API CONFIGURATION =====
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ===== ROUTE PATHS =====
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  QUESTIONS: '/questions',
  SUBJECTS: '/subjects',
  TOPICS: '/topics',
  USERS: '/users',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile'
};

// ===== COMPONENT SIZES =====
export const COMPONENT_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg'
};

// ===== ICON SIZES =====
export const ICON_SIZES = {
  XS: '12px',
  SM: '16px',
  MD: '20px',
  LG: '24px',
  XL: '32px'
};

// ===== DEFAULT VALUES =====
export const DEFAULTS = {
  AVATAR: '/images/default-avatar.png',
  LOGO: '/images/logo.png',
  FAVICON: '/favicon.ico',
  TITLE: 'Coaxial Academy',
  DESCRIPTION: 'Educational Management System'
};
