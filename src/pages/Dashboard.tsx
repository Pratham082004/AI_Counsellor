import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  User,
  Search,
  Target,
  FileCheck,
  BarChart3,
  Star,
  Lock,
  Clock,
  Edit
} from 'lucide-react';
import { getDashboardData } from '../services/profileService';
import { getTasks } from '../services/applicationService';

const ICON_MAP: Record<string, any> = {
  user: User,
  search: Search,
  target: Target,
  filecheck: FileCheck,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (err.response && err.response.status === 404) {
          navigate('/onboarding');
          return;
        }
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data.tasks || []);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        // Tasks might fail if no locked university - that's OK
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchDashboardData();
    fetchTasks();
  }, [navigate]);

  const fallbackSteps = [
    {
      title: 'Building Profile',
      description: 'Complete your academic profile',
      status: 'active',
      icon: User
    },
    {
      title: 'Discovering',
      description: 'Explore and shortlist universities',
      status: 'locked',
      icon: Search
    },
    {
      title: 'Finalizing',
      description: 'Lock your final choices',
      status: 'locked',
      icon: Target
    },
    {
      title: 'Preparing',
      description: 'Complete application tasks',
      status: 'locked',
      icon: FileCheck
    }
  ];

  const journeySteps = (dashboardData?.journey_steps || fallbackSteps).map(
    (step: any) => ({
      ...step,
      icon:
        typeof step.icon === 'string'
          ? ICON_MAP[step.icon.toLowerCase()]
          : step.icon
    })
  );

  const metrics = dashboardData?.metrics ? [
    {
      label: 'Profile Strength',
      value: `${dashboardData.metrics.profile_strength}%`,
      icon: BarChart3
    },
    {
      label: 'Shortlisted',
      value: dashboardData.metrics.shortlisted.toString(),
      icon: Star
    },
    {
      label: 'Locked',
      value: dashboardData.metrics.locked.toString(),
      icon: Lock
    },
    {
      label: 'Pending Tasks',
      value: dashboardData.metrics.pending_tasks.toString(),
      icon: Clock
    }
  ] : [
    {
      label: 'Profile Strength',
      value: '0%',
      icon: BarChart3
    },
    {
      label: 'Shortlisted',
      value: '0',
      icon: Star
    },
    {
      label: 'Locked',
      value: '0',
      icon: Lock
    },
    {
      label: 'Pending Tasks',
      value: '0',
      icon: Clock
    }
  ];

  const profileData = dashboardData?.profile || {
    academic: {
      'Education Level': 'Not specified',
      'Degree / Major': 'Not specified',
      'Graduation Year': 'Not specified',
      'GPA / Percentage': 'Not specified'
    },
    goals: {
      'Intended Degree': 'Not specified',
      'Field of Study': 'Not specified',
      'Target Intake': 'Not specified',
      'Countries': 'Not specified'
    },
    budget: {
      'Budget Range': 'Not specified',
      'Funding Plan': 'Not specified'
    },
    exams: {
      'IELTS / TOEFL': 'Not specified',
      'GRE / GMAT': 'Not specified',
      'SOP': 'Not specified'
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-navy-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-navy-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-navy-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-navy-900 mb-2">Failed to load dashboard</h2>
            <p className="text-navy-600">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Welcome back, {dashboardData?.first_name || dashboardData?.username || 'User'}!
          </h1>
          <p className="text-navy-600">
            Here's an overview of your study abroad journey
          </p>
        </div>

        {/* Journey Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Journey Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {journeySteps.map((step: any, index: number) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'active' ? 'bg-navy-100 text-navy-600' :
                        'bg-navy-100 text-navy-400'
                      }`}>
                        {Icon && <Icon className="w-6 h-6" />}
                      </div>
                      <div className="text-center max-w-24">
                        <p className="text-sm font-medium text-navy-900">{step.title}</p>
                        <p className="text-xs text-navy-500">{step.description}</p>
                      </div>
                    </div>
                    {index < journeySteps.length - 1 && (
                      <div className="w-16 h-0.5 bg-navy-200 mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Metrics Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-navy-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-navy-900">{metric.value}</p>
                      <p className="text-sm text-navy-600">{metric.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Profile Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Profile</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    100% Complete
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/profile/edit')}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Academic Background */}
              <div>
                <h3 className="text-lg font-medium text-navy-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Academic Background
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(profileData.academic).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-navy-600">{label}:</span>
                      <span className="text-sm font-medium text-navy-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Goals */}
              <div>
                <h3 className="text-lg font-medium text-navy-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Study Goals
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(profileData.goals).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-navy-600">{label}:</span>
                      <span className="text-sm font-medium text-navy-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget & Funding */}
              <div>
                <h3 className="text-lg font-medium text-navy-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Budget & Funding
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(profileData.budget).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-navy-600">{label}:</span>
                      <span className="text-sm font-medium text-navy-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Readiness */}
              <div>
                <h3 className="text-lg font-medium text-navy-900 mb-4 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2" />
                  Exam Readiness
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(profileData.exams).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-navy-600">{label}:</span>
                      <span className="text-sm font-medium text-navy-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Tasks</CardTitle>
                <button 
                  onClick={() => navigate('/application')}
                  className="text-sm text-navy-600 hover:text-navy-800"
                >
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-navy-200 rounded"></div>
                  ))}
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task: any, index: number) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        task.completed 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-amber-400 text-white'
                        }`}>
                          {task.completed ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          task.completed ? 'text-green-800 line-through' : 'text-amber-800'
                        }`}>
                          {task.task}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.completed 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-amber-200 text-amber-800'
                      }`}>
                        {task.completed ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  ))}
                  {tasks.length > 5 && (
                    <p className="text-sm text-navy-500 text-center mt-2">
                      +{tasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-navy-400 mx-auto mb-3" />
                  <p className="text-navy-500 mb-2">
                    No pending tasks yet
                  </p>
                  <p className="text-sm text-navy-400">
                    Lock a university to start your application tasks
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/discover')}
                    className="mt-4"
                  >
                    Discover Universities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

