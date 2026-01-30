import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '../components/layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Button, Alert } from '../components';
import { onboardingSchema, type OnboardingFormData } from '../schemas/validation';
import apiClient from '../services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks';
import { useApiError } from '../hooks';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const { setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  // Fetch current user/profile to detect whether onboarding was already completed
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const r = await apiClient.get('/auth/me');
      return r.data;
    },
    retry: false,
  });

  useEffect(() => {
    const profile = meData?.profile;
    if (profile) {
      setIsExistingProfile(true);
      // Prefill form values if profile exists
      reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        mobile_number: profile.mobile_number || '',
        education_level: profile.education_level || '',
        major: profile.major || '',
        graduation_year: profile.graduation_year || new Date().getFullYear(),
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
  }, [meData, reset]);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);

    try {
      if (isExistingProfile) {
        // Update existing profile
        await apiClient.put('/onboarding/profile/', {
          ...data,
          graduation_year: Number(data.graduation_year),
          ielts_score: data.ielts_score || undefined,
          toefl_score: data.toefl_score || undefined,
        });
        // Stay on dashboard or inform user — navigate back to dashboard
        navigate('/dashboard');
      } else {
        const response = await apiClient.post('/onboarding/complete', {
          ...data,
          graduation_year: Number(data.graduation_year),
        });

        // Update token with new stage
        if (response.data?.access_token) {
          setToken(response.data.access_token);
        }

        // Navigate to Discovery using window.location.href to ensure fresh token is read
        // Using full page reload to avoid StageGuard caching old token stage
        setTimeout(() => {
          window.location.href = '/discover';
        }, 100);
      }
    } catch (err: any) {
      const errorMessage = handleError(err);
      setError('root', { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Complete Your Profile</h1>
          <p className="text-navy-600 mt-2">
            Tell us about yourself so we can find the perfect universities for you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <Alert type="error" title="Profile Update Failed">
                  {errors.root.message}
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('first_name')}
                  placeholder="John"
                  label="First Name"
                  error={errors.first_name?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('last_name')}
                  placeholder="Doe"
                  label="Last Name"
                  error={errors.last_name?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('mobile_number')}
                  placeholder="+1 234 567 8900"
                  label="Mobile Number (Optional)"
                  error={errors.mobile_number?.message}
                  disabled={isLoading}
                />
              </div>

              <CardHeader className="px-0 pt-4 pb-2">
                <CardTitle className="text-lg">Education Background</CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('education_level')}
                  placeholder="e.g., Bachelor's, Master's"
                  label="Current Education Level"
                  error={errors.education_level?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('major')}
                  placeholder="e.g., Computer Science"
                  label="Current Major"
                  error={errors.major?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('graduation_year')}
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  label="Graduation Year"
                  error={errors.graduation_year?.message}
                  disabled={isLoading}
                />
              </div>

              <CardHeader className="px-0 pt-4 pb-2">
                <CardTitle className="text-lg">Test Scores (Optional)</CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('ielts_score')}
                  type="number"
                  step="0.5"
                  placeholder="e.g., 7.5"
                  label="IELTS Score (0-9)"
                  error={errors.ielts_score?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('toefl_score')}
                  type="number"
                  placeholder="e.g., 100"
                  label="TOEFL Score (0-120)"
                  error={errors.toefl_score?.message}
                  disabled={isLoading}
                />
              </div>

              <CardHeader className="px-0 pt-4 pb-2">
                <CardTitle className="text-lg">Application Status</CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">SOP Status</label>
                  <select
                    {...register('sop_status')}
                    className="w-full px-3 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                    disabled={isLoading}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                  {errors.sop_status && (
                    <p className="text-red-500 text-sm mt-1">{errors.sop_status.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">LOR Status</label>
                  <select
                    {...register('lor_status')}
                    className="w-full px-3 py-2 border border-navy-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                    disabled={isLoading}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                  {errors.lor_status && (
                    <p className="text-red-500 text-sm mt-1">{errors.lor_status.message}</p>
                  )}
                </div>
              </div>

              <CardHeader className="px-0 pt-4 pb-2">
                <CardTitle className="text-lg">Target Information</CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('target_degree')}
                  placeholder="e.g., Master's in CS"
                  label="Target Degree"
                  error={errors.target_degree?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('target_field')}
                  placeholder="e.g., Artificial Intelligence"
                  label="Target Field of Study"
                  error={errors.target_field?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('target_country')}
                  placeholder="e.g., USA, UK, Canada"
                  label="Target Country"
                  error={errors.target_country?.message}
                  disabled={isLoading}
                />

                <Input
                  {...register('budget_range')}
                  placeholder="e.g., $20,000 - $40,000"
                  label="Budget Range (Annual)"
                  error={errors.budget_range?.message}
                  disabled={isLoading}
                />
              </div>

              <CardFooter className="mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  Continue
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-navy-50 border border-navy-200 rounded-lg">
          <h3 className="font-semibold text-navy-900 mb-2">💡 Tip</h3>
          <p className="text-sm text-navy-800">
            The more information you provide, the better recommendations we can give you. You can always update this later.
          </p>
        </div>
      </div>
    </Layout>
  );
}

