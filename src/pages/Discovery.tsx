
import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import {
  MapPin,
  DollarSign,
  GraduationCap,
  Search,
  RefreshCw,
  Lock,
  ExternalLink,
  Globe,
  AlertCircle,
  X,
  Target,
} from 'lucide-react';
import { 
  fetchUniversities, 
  refreshUniversities, 
  formatTuition,
  getDifficultyClass,
  getDifficultyLabel
} from '../services/universityService';
import { addToShortlist, getShortlist, getLockedUniversity } from '../services/shortlistService';
import { getProfile } from '../services/profileService';
import { UNIVERSITY_COUNTRIES, DIFFICULTY_LEVELS, formatBudget, University } from '../types/university';

// Types for user profile
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  target_degree: string;
  target_field: string;
  target_country: string;
  budget_range: string;
  education_level: string;
}

// Skeleton loader component
const UniversityCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </CardContent>
  </Card>
);

// Enhanced University Card Component
interface UniversityCardProps {
  university: University;
  onShortlist: (university: University) => void;
  isShortlisted: boolean;
  isLocked: boolean;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university, onShortlist, isShortlisted, isLocked }) => {
  const tuition = parseInt(university.estimated_tuition);
  const budgetRange = university.budget_min !== undefined 
    ? formatBudget(university.budget_min, university.budget_max || 0)
    : formatTuition(tuition);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
              {university.name}
              {isLocked && <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{university.country}</span>
            </div>
          </div>
          <span className={`text-sm font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${getDifficultyClass(university.difficulty)}`}>
            {getDifficultyLabel(university.difficulty)}
          </span>
        </div>

        {/* Budget & Degree Info */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {formatTuition(tuition)}
            </span>
            <span className="text-xs text-gray-500">/year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {university.degree}
            </span>
          </div>
        </div>

        {/* Field/Program */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
            <GraduationCap className="w-3 h-3" />
            {university.field}
          </span>
        </div>

        {/* Budget Range (if available) */}
        {university.budget_min !== undefined && (
          <div className="mb-4 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Budget Range</p>
            <p className="text-sm font-medium text-gray-900">{budgetRange}</p>
          </div>
        )}

        {/* Domains (if available) */}
        {university.domains && university.domains.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Domains</p>
            <div className="flex flex-wrap gap-1">
              {university.domains.slice(0, 3).map((domain, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {domain}
                </span>
              ))}
              {university.domains.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  +{university.domains.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Website Link */}
        {university.web_pages && university.web_pages.length > 0 && (
          <div className="mb-4">
            <a 
              href={university.web_pages[0]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onShortlist(university)}
          disabled={isShortlisted || isLocked}
          className="w-full"
          variant={isShortlisted || isLocked ? "secondary" : "primary"}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </>
          ) : isShortlisted ? (
            <>
              <GraduationCap className="w-4 h-4 mr-2" />
              Added to Shortlist
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4 mr-2" />
              Add to Shortlist
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Profile Criteria Display Component
interface ProfileCriteriaProps {
  profile: UserProfile;
}

const ProfileCriteria: React.FC<ProfileCriteriaProps> = ({ profile }) => {
  // Parse budget range
  const parseBudget = (range: string) => {
    if (!range) return { min: 0, max: 0 };
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(Number);
      return { min, max };
    }
    const value = Number(range);
    return { min: value, max: value };
  };

  const budget = parseBudget(profile.budget_range || '');
  const budgetDisplay = budget.min && budget.max 
    ? `${formatTuition(budget.min)} - ${formatTuition(budget.max)}`
    : profile.budget_range || 'Not specified';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-blue-600" />
        <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
          Your Preferences
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-start gap-2">
          <GraduationCap className="w-4 h-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Degree</p>
            <p className="text-sm font-semibold text-gray-900">{profile.target_degree || 'Not set'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Field</p>
            <p className="text-sm font-semibold text-gray-900">{profile.target_field || 'Not set'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Country</p>
            <p className="text-sm font-semibold text-gray-900">{profile.target_country || 'Not set'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Budget</p>
            <p className="text-sm font-semibold text-gray-900">{budgetDisplay}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Panel Component
interface FilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  selectedDifficulty,
  onDifficultyChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchQuery || selectedCountry !== 'All Countries' || selectedDifficulty !== 'All Difficulty';

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, country, or field..."
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Country Filter */}
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            selectedCountry !== 'All Countries' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          {UNIVERSITY_COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            selectedDifficulty !== 'All Difficulty' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          {DIFFICULTY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh, isRefreshing }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      <GraduationCap className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No universities found</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      We couldn't find universities matching your profile criteria. Try adjusting your preferences or refresh to see more options.
    </p>
    <Button
      onClick={onRefresh}
      disabled={isRefreshing}
      variant="primary"
      className="flex items-center gap-2 mx-auto"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Results'}
    </Button>
  </div>
);

// Error State Component
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isRetrying }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      {error || 'We encountered an error while loading universities. Please try again.'}
    </p>
    <Button
      onClick={onRetry}
      disabled={isRetrying}
      variant="primary"
      className="flex items-center gap-2 mx-auto"
    >
      <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Retrying...' : 'Try Again'}
    </Button>
  </div>
);

// Main Discovery Page Component
export default function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulty');
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [lockedUniversityId, setLockedUniversityId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile
  const loadProfile = async () => {
    try {
      const data = await getProfile();
      const profileData = data.profile;
      
      if (profileData) {
        setUserProfile({
          id: profileData.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          target_degree: profileData.target_degree,
          target_field: profileData.target_field,
          target_country: profileData.target_country,
          budget_range: profileData.budget_range,
          education_level: profileData.education_level
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadUniversities = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const data = isRefresh ? await refreshUniversities() : await fetchUniversities();
      setUniversities(data);
    } catch (err: any) {
      console.error('Error fetching universities:', err);
      setError(err.response?.data?.detail || 'Failed to load universities');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsRetrying(false);
    }
  };

  const loadShortlist = async () => {
    try {
      const data = await getShortlist();
      const ids = new Set((data.shortlisted_universities || []).map((uni: any) => uni.id));
      setShortlistedIds(ids);
    } catch (err) {
      console.error('Error loading shortlist:', err);
    }
  };

  const loadLockedUniversity = async () => {
    try {
      const data = await getLockedUniversity();
      if (data.locked_university) {
        setLockedUniversityId(data.locked_university.id);
      }
    } catch (err) {
      console.error('Error loading locked university:', err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadUniversities();
    loadShortlist();
    loadLockedUniversity();
  }, []);

  const filteredUniversities = useMemo(() => {
    if (!Array.isArray(universities)) return [];
    return universities.filter(university => {
      const matchesSearch = 
        university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        university.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        university.field.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'All Countries' || university.country === selectedCountry;
      const matchesDifficulty = selectedDifficulty === 'All Difficulty' || university.difficulty === selectedDifficulty;
      return matchesSearch && matchesCountry && matchesDifficulty;
    });
  }, [universities, searchQuery, selectedCountry, selectedDifficulty]);

  const handleShortlist = async (university: University) => {
    try {
      await addToShortlist(university.id);
      setShortlistedIds(prev => new Set(prev).add(university.id));
    } catch (err) {
      console.error('Error adding to shortlist:', err);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    loadUniversities();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All Countries');
    setSelectedDifficulty('All Difficulty');
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Discover Universities
              </h1>
              <p className="text-gray-600">
                Universities matched to your profile and preferences
              </p>
            </div>
            <Button
              onClick={() => loadUniversities(true)}
              disabled={isRefreshing}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Results'}
            </Button>
          </div>
        </div>

        {/* User Profile Criteria */}
        {userProfile && (
          <ProfileCriteria profile={userProfile} />
        )}

        {/* Filter Panel */}
        <FilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          onClearFilters={handleClearFilters}
        />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredUniversities.length}</span> matching universities
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <UniversityCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState
            error={error}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredUniversities.length === 0 && (
          <EmptyState
            onRefresh={() => loadUniversities(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {/* University Grid */}
        {!isLoading && !error && filteredUniversities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
                onShortlist={handleShortlist}
                isShortlisted={shortlistedIds.has(university.id)}
                isLocked={lockedUniversityId === university.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

