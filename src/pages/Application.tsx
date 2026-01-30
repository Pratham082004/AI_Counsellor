import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Alert } from '../components';
import {
  CheckCircle,
  Circle,
  MoreHorizontal,
  MapPin,
  Lock,
  Loader2,
  RefreshCw,
  Unlock
} from 'lucide-react';
import * as applicationService from '../services/applicationService';
import { unlockUniversity } from '../services/shortlistService';
import { useApiError } from '../hooks';

// Types matching the service
interface Task {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Financial' | 'Documents' | 'Exams';
  status: 'todo' | 'inProgress' | 'completed';
}

// Internal state types
interface ApplicationData {
  university: {
    name: string;
    country: string;
  } | null;
  tasks: Task[];
  progress: {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    completion_percentage: number;
  };
}

// Default tasks for display when API returns empty
const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'SOP',
    priority: 'High',
    category: 'Documents',
    status: 'todo'
  },
  {
    id: '2',
    title: 'LOR',
    priority: 'High',
    category: 'Documents',
    status: 'todo'
  },
  {
    id: '3',
    title: 'IELTS',
    priority: 'Medium',
    category: 'Exams',
    status: 'todo'
  },
  {
    id: '4',
    title: 'TOEFL',
    priority: 'Medium',
    category: 'Exams',
    status: 'todo'
  }
];

// Priority color mapping
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Category color mapping
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Financial': return 'bg-blue-100 text-blue-800';
    case 'Documents': return 'bg-purple-100 text-purple-800';
    case 'Exams': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Task Card Component
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const handleCheckboxClick = () => {
    if (task.status === 'todo') {
      onStatusChange(task.id, 'inProgress');
    } else if (task.status === 'inProgress') {
      onStatusChange(task.id, 'completed');
    } else {
      onStatusChange(task.id, 'todo');
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={handleCheckboxClick}
            className="mt-0.5 flex-shrink-0"
            aria-label={`Change status for ${task.title}`}
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium text-gray-900 ${
              task.status === 'completed' ? 'line-through text-gray-500' : ''
            }`}>
              {task.title}
            </h4>

            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
            </div>
          </div>

          <button className="flex-shrink-0" aria-label="More options">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// Task Column Component
interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  emptyMessage: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, tasks, onStatusChange, emptyMessage }) => (
  <div className="flex-1 min-w-0">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
        {title}
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {tasks.length}
        </span>
      </h3>
    </div>

    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
          />
        ))
      )}
    </div>
  </div>
);

// University Summary Card Component
interface UniversitySummaryCardProps {
  university: {
    name: string;
    country: string;
  } | null;
  loading: boolean;
  onUnlock: () => void;
  isUnlocking: boolean;
}

const UniversitySummaryCard: React.FC<UniversitySummaryCardProps> = ({ university, loading, onUnlock, isUnlocking }) => {
  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!university) {
    return (
      <Card className="border border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Unlock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No University Locked</h3>
              <p className="text-sm text-gray-600">
                Lock a university from your shortlist to start your application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{university.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{university.country}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Locked
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={onUnlock}
              disabled={isUnlocking}
              className="flex items-center gap-2"
            >
              {isUnlocking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              {isUnlocking ? 'Unlocking...' : 'Change University'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function ApplicationPage() {
  const { handleError } = useApiError();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [data, setData] = useState<ApplicationData>({
    university: null,
    tasks: DEFAULT_TASKS,
    progress: {
      total: 0,
      pending: 0,
      submitted: 0,
      approved: 0,
      completion_percentage: 0
    }
  });

  // Handle unlock university
  const handleUnlock = async () => {
    console.log('[ApplicationPage] Unlocking university...');
    setIsUnlocking(true);
    setError(null);

    try {
      await unlockUniversity();
      console.log('[ApplicationPage] University unlocked successfully');
      
      // Clear the university data to show "No University Locked" state
      setData(prev => ({
        ...prev,
        university: null,
        tasks: DEFAULT_TASKS,
        progress: {
          total: 0,
          pending: 0,
          submitted: 0,
          approved: 0,
          completion_percentage: 0
        }
      }));
    } catch (err: any) {
      console.error('[ApplicationPage] Failed to unlock university:', err);
      setError(handleError(err));
    } finally {
      setIsUnlocking(false);
    }
  };

  // Fetch application data from API
  const fetchApplicationData = useCallback(async () => {
    console.log('[ApplicationPage] Fetching application data...');
    setLoading(true);
    setError(null);

    try {
      // Fetch checklist and tasks in parallel
      const [checklistRes, tasksRes] = await Promise.all([
        applicationService.getApplicationChecklist(),
        applicationService.getTasks()
      ]);

      console.log('[ApplicationPage] Checklist data:', checklistRes);
      console.log('[ApplicationPage] Tasks data:', tasksRes);

      // Transform tasks from API format to UI format
      const transformedTasks: Task[] = tasksRes.tasks.map((apiTask, index) => {
        let priority: 'Low' | 'Medium' | 'High' = 'Medium';
        let category: 'Financial' | 'Documents' | 'Exams' = 'Documents';
        
        // Assign priority based on task type
        if (apiTask.task === 'SOP' || apiTask.task === 'LOR') {
          priority = 'High';
          category = 'Documents';
        } else if (apiTask.task === 'IELTS' || apiTask.task === 'TOEFL') {
          priority = 'Medium';
          category = 'Exams';
        }

        return {
          id: String(index + 1),
          title: apiTask.task,
          priority,
          category,
          status: apiTask.completed ? 'completed' : 'todo'
        };
      });

      setData({
        university: checklistRes.locked_university ? {
          name: checklistRes.locked_university.name,
          country: checklistRes.locked_university.country
        } : null,
        tasks: transformedTasks.length > 0 ? transformedTasks : DEFAULT_TASKS,
        progress: checklistRes.progress
      });

      console.log('[ApplicationPage] Application data loaded successfully');
    } catch (err: any) {
      console.error('[ApplicationPage] Error fetching application data:', err);
      const errorMessage = handleError(err);
      
      // Handle specific error cases
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('No locked university')) {
        // User hasn't locked a university yet - this is not a critical error
        setData(prev => ({
          ...prev,
          university: null
        }));
      } else if (err.response?.status === 403 && err.response?.data?.detail?.includes('not in application flow')) {
        // User is not in the right stage - show a message
        setError('Please complete the onboarding process and lock a university to access application preparation.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Initial data fetch
  useEffect(() => {
    fetchApplicationData();
  }, [fetchApplicationData]);

  // Handle task status change with API call
  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    console.log(`[ApplicationPage] Task "${task.title}" status changing to ${newStatus}`);

    // Optimistic update
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    }));

    // If completing a task, call the API
    if (newStatus === 'completed' || newStatus === 'inProgress') {
      try {
        await applicationService.completeTask(task.title);
        console.log(`[ApplicationPage] Task "${task.title}" completed successfully`);
      } catch (err: any) {
        console.error(`[ApplicationPage] Failed to complete task "${task.title}":`, err);
        
        // Revert on error
        setData(prevData => ({
          ...prevData,
          tasks: prevData.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus === 'completed' ? 'inProgress' : 'todo' } : t
          )
        }));
        
        setError(handleError(err));
      }
    }
  };

  // Filter tasks by status
  const todoTasks = data.tasks.filter(task => task.status === 'todo');
  const inProgressTasks = data.tasks.filter(task => task.status === 'inProgress');
  const completedTasks = data.tasks.filter(task => task.status === 'completed');

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Preparation
          </h1>
          <p className="text-gray-600">
            Track your tasks for your locked university
          </p>
          {data.progress.completion_percentage > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{data.progress.completion_percentage}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.progress.completion_percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Alert type="error" title="Error">
              {error}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={fetchApplicationData}
                className="mt-2 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </Alert>
          </div>
        )}

        {/* Loading State */}
        {loading && !data.university ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading application data...</span>
          </div>
        ) : (
          <>
            {/* Locked University Summary */}
            <div className="mb-8">
              <UniversitySummaryCard 
                university={data.university} 
                loading={loading}
                onUnlock={handleUnlock}
                isUnlocking={isUnlocking}
              />
            </div>

            {/* Task Board */}
            {data.university && (
              <div className="flex gap-6 overflow-x-auto pb-4">
                <TaskColumn
                  title="To Do"
                  tasks={todoTasks}
                  onStatusChange={handleStatusChange}
                  emptyMessage="All tasks completed!"
                />

                <TaskColumn
                  title="In Progress"
                  tasks={inProgressTasks}
                  onStatusChange={handleStatusChange}
                  emptyMessage="No tasks in progress"
                />

                <TaskColumn
                  title="Completed"
                  tasks={completedTasks}
                  onStatusChange={handleStatusChange}
                  emptyMessage="No completed tasks yet"
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

