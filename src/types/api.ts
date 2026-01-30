/**
 * Environment variables with type safety
 */
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_SENTRY: import.meta.env.VITE_ENABLE_SENTRY === 'true',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AI Counsellor',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * API error response format
 */
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
}

/**
 * Common response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
