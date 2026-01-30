import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
  MapPin,
  DollarSign,
  Check,
  AlertTriangle,
  Lock,
  Trash2,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { getShortlist, removeFromShortlist, lockUniversity, getLockedUniversity } from '../services/shortlistService';

// Types
interface ShortlistedUniversity {
  id: string;
  name: string;
  country: string;
  degree: string;
  field: string;
  estimated_tuition: number;
  difficulty: string;
  shortlisted_at?: string;
  isLocked: boolean;
}

interface LockedUniversity {
  id: string;
  name: string;
  country: string;
  degree: string;
  field: string;
  estimated_tuition: number;
  difficulty: string;
  locked_at?: string;
}

interface ShortlistUniversityCardProps {
  university: ShortlistedUniversity;
  onRemove: (id: string) => void;
  onLock: (id: string) => void;
}

interface ProgressBarProps {
  percentage: number;
}

interface ToastProps {
  message: string;
  onClose: () => void;
}

// Reusable Components
const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${percentage}%` }}
    />
  </div>
);

const Toast: React.FC<ToastProps> = ({ message, onClose }) => (
  <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
    <CheckCircle className="w-5 h-5 text-green-600" />
    <span className="text-sm text-green-800">{message}</span>
    <button
      onClick={onClose}
      className="text-green-600 hover:text-green-800"
    >
      ×
    </button>
  </div>
);

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toUpperCase()) {
    case 'LOW':
      return 'text-green-600 bg-green-100';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100';
    case 'HIGH':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getDifficultyPercentage = (difficulty: string) => {
  switch (difficulty?.toUpperCase()) {
    case 'LOW':
      return 80; // Higher acceptance likelihood
    case 'MEDIUM':
      return 50;
    case 'HIGH':
      return 20; // Lower acceptance likelihood
    default:
      return 50;
  }
};

const ShortlistUniversityCard: React.FC<ShortlistUniversityCardProps> = ({
  university,
  onRemove,
  onLock
}) => {
  const difficultyClass = getDifficultyColor(university.difficulty);
  const acceptancePercentage = getDifficultyPercentage(university.difficulty);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {university.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{university.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${university.estimated_tuition?.toLocaleString()}/year</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyClass}`}>
            {university.difficulty || 'N/A'}
          </span>
        </div>

        {/* Degree and Field */}
        <div className="mb-4 flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {university.degree || 'Degree'}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            <GraduationCap className="w-3 h-3" />
            {university.field || 'Field'}
          </span>
        </div>

        {/* Acceptance Likelihood */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Acceptance Likelihood</span>
            <span className="text-sm font-semibold text-gray-900">{acceptancePercentage}%</span>
          </div>
          <ProgressBar percentage={acceptancePercentage} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => onRemove(university.id)}
            disabled={university.isLocked}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove from shortlist
          </Button>
          <Button
            onClick={() => onLock(university.id)}
            disabled={university.isLocked}
            className="flex items-center gap-2 flex-1"
          >
            <Lock className="w-4 h-4" />
            {university.isLocked ? 'Locked' : 'Lock University'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function ShortlistPage() {
  const [shortlistedUniversities, setShortlistedUniversities] = useState<ShortlistedUniversity[]>([]);
  const [lockedUniversityId, setLockedUniversityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const shortlistedCount = shortlistedUniversities.length;
  const lockedCount = shortlistedUniversities.filter(u => u.isLocked).length;

  useEffect(() => {
    loadShortlist();
    loadLockedUniversity();
  }, []);

  const loadShortlist = async () => {
    try {
      setIsLoading(true);
      const data = await getShortlist();
      // Transform the data to include isLocked property
      const universities = (data.shortlisted_universities || []).map((uni: any) => ({
        ...uni,
        isLocked: false
      }));
      setShortlistedUniversities(universities);
    } catch (err) {
      console.error('Error loading shortlist:', err);
      setShortlistedUniversities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLockedUniversity = async () => {
    try {
      const data = await getLockedUniversity();
      if (data.locked_university) {
        setLockedUniversityId(data.locked_university.id);
        // Update shortlisted universities with lock status
        setShortlistedUniversities(prev => 
          prev.map(uni => ({
            ...uni,
            isLocked: uni.id === data.locked_university!.id
          }))
        );
      }
    } catch (err) {
      console.error('Error loading locked university:', err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromShortlist(id);
      setShortlistedUniversities(prev => prev.filter(u => u.id !== id));
      setToastMessage('University removed from shortlist');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error removing from shortlist:', err);
    }
  };

  const handleLock = async (id: string) => {
    try {
      await lockUniversity(id);
      setShortlistedUniversities(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, isLocked: true }
            : u
        )
      );
      setToastMessage('University locked successfully');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error locking university:', err);
    }
  };

  const handleToastClose = () => {
    setToastMessage(null);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Shortlist
          </h1>
          <p className="text-gray-600">
            {shortlistedCount} universities shortlisted, {lockedCount} locked
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading shortlist...</span>
            </div>
          </div>
        )}

        {/* University Cards */}
        {!isLoading && (
          <>
            <div className="space-y-6">
              {shortlistedUniversities.map((university) => (
                <ShortlistUniversityCard
                  key={university.id}
                  university={university}
                  onRemove={handleRemove}
                  onLock={handleLock}
                />
              ))}
            </div>

            {shortlistedUniversities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No universities in your shortlist yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Go to Discover to add universities to your shortlist.
                </p>
              </div>
            )}
          </>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={handleToastClose} />
        )}
      </div>
    </DashboardLayout>
  );
}
