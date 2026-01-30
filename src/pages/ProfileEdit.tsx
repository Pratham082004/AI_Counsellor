import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '../components/layout';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Alert, Skeleton } from '../components';
import { profileEditSchema, type ProfileEditData } from '../schemas/validation';
import apiClient from '../services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks';
import { useApiError } from '../hooks';
import { User, GraduationCap, FileCheck, Target, DollarSign, ArrowLeft } from 'lucide-react';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { getUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const user = getUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ProfileEditData>({
    resolver: zodResolver(profileEditSchema),
  });

  // Fetch profile data using React Query
  const { data: profile, isLoading: isProfileLoading, error: fetchError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const r = await apiClient.get('/auth/me');
      return r.data?.profile;
    },
    enabled: !!user,
    retry: false,
  });

  // Prefill form when profile data is available
  React.useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        mobile_number: profile.mobile_number || '',
        education_level: profile.education_level || '',
        major: profile.major || '',
        graduation_year: Number(profile.graduation_year) || new Date().getFullYear(),
        ielts_score: profile.ielts_score || undefined,
        toefl_score: profile.toefl_score || undefined,
        sop_status: profile.sop_status || 'NOT_STARTED',
        lor_status: profile.lor_status || 'NOT_STARTED',
        target_degree: profile.target_degree || '',
        target_field: profile.target_field || '',
        target_country: profile.target_country || '',
        budget_range: profile.budget_range || '',
      });
    }
  }, [profile, reset]);

  // Handle fetch error
  React.useEffect(() => {
    if (fetchError) {
      const errorMessage = handleError(fetchError);
      setError('root', { message: errorMessage });
    }
  }, [fetchError, handleError, setError]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: ProfileEditData) => {
    setIsSaving(true);

    try {
      await apiClient.put('/onboarding/profile/', {
        ...data,
        graduation_year: Number(data.graduation_year),
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const errorMessage = handleError(err);
      setError('root', { message: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (!user || isProfileLoading) {
    return (
      <Layout showHeader={false} showFooter={false}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-9 w-1/3 mb-2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-navy-600 hover:text-navy-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-navy-900">Edit Your Profile</h1>
          <p className="text-navy-600 mt-2">
            Update your information to get better university recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Error Alert */}
          {errors.root && (
            <Alert type="error" title="Update Failed" className="mb-6">
              {errors.root.message}
            </Alert>
          )}

          {/* Section 1: Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <p className="text-sm text-navy-500 mt-1">Basic contact details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...register('first_name')}
                  placeholder="Enter your first name"
                  label="First Name"
                  error={errors.first_name?.message}
                  disabled={isSaving}
                />
                <Input
                  {...register('last_name')}
                  placeholder="Enter your last name"
                  label="Last Name"
                  error={errors.last_name?.message}
                  disabled={isSaving}
                />
                <div className="md:col-span-2">
                  <Input
                    {...register('mobile_number')}
                    placeholder="+1 (555) 123-4567"
                    label="Mobile Number"
                    error={errors.mobile_number?.message}
                    disabled={isSaving}
                    helperText="Include country code for international format"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Education Background */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <CardTitle>Education Background</CardTitle>
                  <p className="text-sm text-navy-500 mt-1">Your current academic status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Current Education Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('education_level')}
                    className="w-full rounded-lg border border-navy-300 bg-white px-4 py-2.5 text-navy-900 shadow-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-500 disabled:bg-navy-100 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isSaving}
                  >
                    <option value="">Select education level</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                  </select>
                  {errors.education_level && (
                    <p className="mt-1 text-sm text-red-600">{errors.education_level.message}</p>
                  )}
                </div>
                <Input
                  {...register('major')}
                  placeholder="e.g., Computer Science"
                  label="Current Major / Field of Study"
                  error={errors.major?.message}
                  disabled={isSaving}
                />
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('graduation_year')}
                    className="w-full rounded-lg border border-navy-300 bg-white px-4 py-2.5 text-navy-900 shadow-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-500 disabled:bg-navy-100 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isSaving}
                  >
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.graduation_year && (
                    <p className="mt-1 text-sm text-red-600">{errors.graduation_year.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Test Scores (Optional) */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <CardTitle>Test Scores</CardTitle>
                  <p className="text-sm text-navy-500 mt-1">English proficiency & standardized tests (optional)</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...register('ielts_score')}
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="e.g., 7.5"
                  label="IELTS Score"
                  error={errors.ielts_score?.message}
                  disabled={isSaving}
                  helperText="Range: 0 - 9"
                />
                <Input
                  {...register('toefl_score')}
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g., 100"
                  label="TOEFL Score"
                  error={errors.toefl_score?.message}
                  disabled={isSaving}
                  helperText="Range: 0 - 120"
                />
                <Input
                  type="number"
                  placeholder="e.g., 320"
                  label="GRE Score"
                  helperText="Range: 260 - 340"
                  disabled={true}
                />
                <Input
                  type="number"
                  placeholder="e.g., 700"
                  label="GMAT Score"
                  helperText="Range: 200 - 800"
                  disabled={true}
                />
              </div>
              <div className="mt-4 p-4 bg-navy-50 border border-navy-200 rounded-lg">
                <p className="text-sm text-navy-800">
                  <strong>Note:</strong> GRE/GMAT score input coming soon. Currently supported: IELTS & TOEFL.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Study Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <CardTitle>Study Preferences</CardTitle>
                  <p className="text-sm text-navy-500 mt-1">Your target study goals</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Intended Degree <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('target_degree')}
                    className="w-full rounded-lg border border-navy-300 bg-white px-4 py-2.5 text-navy-900 shadow-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-500 disabled:bg-navy-100 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isSaving}
                  >
                    <option value="">Select degree type</option>
                    <option value="Master's">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="MBA">MBA</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                  {errors.target_degree && (
                    <p className="mt-1 text-sm text-red-600">{errors.target_degree.message}</p>
                  )}
                </div>
                <Input
                  {...register('target_field')}
                  placeholder="e.g., Artificial Intelligence"
                  label="Field of Study"
                  error={errors.target_field?.message}
                  disabled={isSaving}
                />
                <div className="md:col-span-2">
                  <Input
                    {...register('target_country')}
                    placeholder="e.g., USA, UK, Canada, Australia"
                    label="Preferred Countries"
                    error={errors.target_country?.message}
                    disabled={isSaving}
                    helperText="Separate multiple countries with commas"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Budget & Funding */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <CardTitle>Budget & Funding</CardTitle>
                  <p className="text-sm text-navy-500 mt-1">Your financial planning</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Budget Range (Annual) <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('budget_range')}
                    className="w-full rounded-lg border border-navy-300 bg-white px-4 py-2.5 text-navy-900 shadow-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-500 disabled:bg-navy-100 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                    disabled={isSaving}
                  >
                    <option value="">Select budget range</option>
                    <option value="Under $10,000">Under $10,000</option>
                    <option value="$10,000 - $20,000">$10,000 - $20,000</option>
                    <option value="$20,000 - $35,000">$20,000 - $35,000</option>
                    <option value="$35,000 - $50,000">$35,000 - $50,000</option>
                    <option value="$50,000 - $75,000">$50,000 - $75,000</option>
                    <option value="Above $75,000">Above $75,000</option>
                  </select>
                  {errors.budget_range && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget_range.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSaving}
                  className="order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  className="order-1 sm:order-2"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Helpful Tip */}
        <div className="mt-6 p-4 bg-navy-50 border border-navy-200 rounded-lg">
          <h3 className="font-semibold text-navy-900 mb-2">Tip</h3>
          <p className="text-sm text-navy-800">
            Keep your profile updated to receive the most relevant university recommendations. 
            More detailed profiles help our AI provide better matches for your study abroad journey.
          </p>
        </div>
      </div>
    </Layout>
  );
}

