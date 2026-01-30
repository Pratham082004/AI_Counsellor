import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  Star,
  FileText,
  LogOut
} from 'lucide-react';

// Logo Component - Same as in AuthLayout and Landing
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getUser } = useAuth();
  const user = getUser();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard'
    },
    {
      name: 'AI Counsellor',
      path: '/ai-counsellor',
      icon: Bot,
      active: location.pathname === '/ai-counsellor'
    },
    {
      name: 'Universities',
      path: '/discover',
      icon: GraduationCap,
      active: location.pathname === '/discover'
    },
    {
      name: 'Shortlist',
      path: '/shortlist',
      icon: Star,
      active: location.pathname === '/shortlist'
    },
    {
      name: 'Applications',
      path: '/application',
      icon: FileText,
      active: location.pathname === '/application'
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-navy-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-navy-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-5 border-b border-navy-200">
            <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center shadow-lg">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-navy-900">AI Counsellor</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    item.active
                      ? 'bg-navy-100 text-navy-900 border-r-2 border-navy-900'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="px-4 py-6 border-t border-navy-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

