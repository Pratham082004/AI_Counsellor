/**
 * Constants and configuration for the application
 */

export const APP_CONFIG = {
  // API
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,

  // Auth
  TOKEN_EXPIRY_BUFFER: 60 * 1000, // 1 minute
  REFRESH_TOKEN_ENDPOINT: '/auth/refresh',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // UI
  TOAST_DURATION: 5000,
  DIALOG_ANIMATION_DURATION: 300,

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'png'],

  // Form
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,

  // Validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
};

export const MESSAGES = {
  // Success
  SUCCESS_LOGIN: 'Welcome back! You are now logged in.',
  SUCCESS_SIGNUP: 'Account created successfully! Please verify your email.',
  SUCCESS_UPDATE: 'Changes saved successfully.',
  SUCCESS_DELETE: 'Deleted successfully.',

  // Error
  ERROR_GENERIC: 'An unexpected error occurred. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_UNAUTHORIZED: 'You are not authorized to perform this action.',
  ERROR_NOT_FOUND: 'The requested resource was not found.',
  ERROR_VALIDATION: 'Please check your input and try again.',

  // Warning
  WARNING_UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
};
