import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function useApiError() {
  const { logout } = useAuth();

  const handleError = useCallback((error: any) => {
    // Handle 401 Unauthorized
    if (error?.response?.status === 401) {
      console.warn('Token expired or invalid');
      logout();
      return 'Your session has expired. Please log in again.';
    }

    // Handle 403 Forbidden
    if (error?.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    // Handle 404 Not Found
    if (error?.response?.status === 404) {
      return 'The requested resource was not found.';
    }

    // Handle 400-499 Client Errors
    if (error?.response?.status && error.response.status < 500) {
      const detail = error?.response?.data?.detail;
      // If backend returned a list of validation errors (FastAPI/Pydantic), format it
      if (Array.isArray(detail)) {
        try {
          const parts = detail.map((d: any) => {
            const loc = Array.isArray(d.loc) ? d.loc.join('.') : String(d.loc || '')
            const msg = d.msg || d.message || JSON.stringify(d)
            return `${loc}: ${msg}`
          })
          return parts.join(' | ')
        } catch (e) {
          return JSON.stringify(detail)
        }
      }

      if (typeof detail === 'object' && detail !== null) {
        return JSON.stringify(detail)
      }

      return detail || 'An error occurred. Please try again.';
    }

    // Handle 500+ Server Errors
    if (error?.response?.status && error.response.status >= 500) {
      return 'Server error. Please try again later.';
    }

    // Handle network errors
    if (error?.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }

    return 'An unexpected error occurred. Please try again.';
  }, [logout]);

  return { handleError };
}
