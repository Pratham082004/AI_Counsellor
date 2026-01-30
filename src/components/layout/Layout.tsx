import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button } from '../ui/Button';
import apiClient from '../../services/apiClient';
import { STAGE } from '../../constants/stages';

// Logo Component - Same as in AuthLayout, Landing, DashboardLayout, and ErrorBoundary
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

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
}) => {
  const navigate = useNavigate();
  const { logout, getUser } = useAuth();
  const user = getUser();
  const [lockedUniversity, setLockedUniversity] = useState<null | { id: string; name: string }>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLocked = async () => {
      if (!isMounted) return;

      try {
        const res = await apiClient.get('/shortlist/lock/');
        if (res.data?.locked_university && isMounted) {
          setLockedUniversity({ id: res.data.locked_university.id, name: res.data.locked_university.name });
        }
      } catch (e) {
        // ignore - not all users have locked university
      }
    };

    if (user && (user.stage === STAGE.LOCKED || user.stage === STAGE.APPLICATION) && !lockedUniversity) {
      fetchLocked();
    }

    return () => {
      isMounted = false;
    };
  }, [user, lockedUniversity]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy-50">
      {showHeader && (
        <header className="border-b border-navy-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center shadow-lg">
                  <LogoIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-navy-900">AI Counsellor</h1>
              </div>

              {user && (
                <div className="flex items-center gap-6">
                  <nav className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/discover')}
                      className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
                    >
                      Discover Universities
                    </button>

                    {/* Shortlist button - available from DISCOVERY onwards */}
                    {(user.stage === STAGE.DISCOVERY || user.stage === STAGE.SHORTLISTING || user.stage === STAGE.LOCKED || user.stage === STAGE.APPLICATION) && (
                      <button
                        onClick={() => navigate('/shortlist')}
                        className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
                      >
                        ⭐ Shortlist
                      </button>
                    )}

                    {/* Application button - available from LOCKED onwards */}
                    {(user.stage === STAGE.LOCKED || user.stage === STAGE.APPLICATION) && (
                      <button
                        onClick={() => navigate('/application')}
                        className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
                      >
                        📋 Application
                      </button>
                    )}
                  </nav>

                  <div className="text-sm border-l border-navy-200 pl-4">
                    <p className="font-medium text-navy-900">{user.email}</p>
                    <p className="text-xs text-navy-500 capitalize">{user.stage.replace(/_/g, ' ')}</p>
                    {lockedUniversity && (
                      <p className="text-xs text-navy-700 font-medium">Locked: {lockedUniversity.name}</p>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer className="border-t border-navy-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-navy-500">
              © {new Date().getFullYear()} AI Counsellor. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

