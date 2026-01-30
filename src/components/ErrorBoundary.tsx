import React, { ReactNode } from 'react';
import { Alert } from '../components';

// Logo Component - Same as in AuthLayout, Landing, and DashboardLayout
const LogoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle React errors
 */
export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center shadow-lg">
                <LogoIcon className="w-7 h-7 text-white" />
              </div>
            </div>

            <Alert type="error" title="Oops! Something went wrong">
              <p className="text-sm text-navy-700">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer font-semibold text-navy-700">Error Details</summary>
                  <pre className="mt-2 p-2 bg-navy-100 rounded overflow-auto text-navy-800">
                    {this.state.error?.message}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
              >
                Refresh Page
              </button>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

