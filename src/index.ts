/**
 * Application entry point for easy imports
 * Use: import { Button, useAuth } from '@/index'
 */

// Components
export { Layout, AuthLayout } from './components/layout';
export { Button } from './components/ui/Button';
export { Input } from './components/ui/Input';
export { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './components/ui/Card';
export { Alert } from './components/ui/Alert';
export { Skeleton, SkeletonCard } from './components/ui/Skeleton';
export { ErrorBoundary } from './components/ErrorBoundary';
export { LoadingSpinner, PageLoader } from './components/Loaders';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useApiError } from './hooks/useApiError';

// Utils
export { cn } from './lib/utils';
export { getToken, getUserFromToken, isAuthenticated, logout, setToken } from './utils/auth';
export {
  formatCurrency,
  formatDate,
  truncateText,
  isValidEmail,
  generateId,
  debounce,
  throttle,
} from './utils/formatters';
export { LocalStorage, storageKeys } from './utils/storage';
export { logger } from './utils/logger';

// Types
export type { DecodedToken } from './hooks/useAuth';
export type { ApiError, ApiResponse, PaginationOptions, PaginatedResponse } from './types/api';

// Services
export * from './services/auth.service';
export { default as apiClient } from './services/apiClient';

// Schemas
export { loginSchema, signupSchema, otpSchema, onboardingSchema, profileUpdateSchema } from './schemas/validation';
export type {
  LoginFormData,
  SignupFormData,
  OtpFormData,
  OnboardingFormData,
  ProfileUpdateData,
} from './schemas/validation';

// Constants
export { STAGE } from './constants/stages';
export { APP_CONFIG, MESSAGES } from './constants/config';

// Router
export { router } from './router';
