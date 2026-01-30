import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '../components/layout';
import { Input, Button, Alert } from '../components';
import { loginSchema, type LoginFormData } from '../schemas/validation';
import { login } from '../services/auth.service';
import { useAuth } from '../hooks';
import { useApiError } from '../hooks';

// Icon components
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await login(data);
      setToken(response.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = handleError(err);
      setError('root', {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your dashboard"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errors.root && (
          <Alert type="error" title="Login Failed">
            {errors.root.message}
          </Alert>
        )}

        <div className="space-y-1">
          <Input
            {...register('email')}
            type="email"
            placeholder="Email address"
            label="Email"
            error={errors.email?.message}
            disabled={isLoading}
            icon={<MailIcon />}
          />
        </div>

        <div className="space-y-1">
          <Input
            {...register('password')}
            type="password"
            placeholder="Password"
            label="Password"
            error={errors.password?.message}
            disabled={isLoading}
            icon={<LockIcon />}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Sign in
          </Button>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-navy-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-navy-900 hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-md px-1 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

