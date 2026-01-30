import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '../components/layout';
import { Input, Button, Alert } from '../components';
import { signupSchema, type SignupFormData } from '../schemas/validation';
import { signup, verifyOtp } from '../services/auth.service';
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

export default function SignupPage() {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const RESEND_INTERVAL = 60;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const email = watch('email');

  // Resend OTP cooldown
  React.useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      if (step === 'signup') {
        await signup({ email: data.email, password: data.password });
        setStep('verify');
        setResendCooldown(RESEND_INTERVAL);
      } else {
        // For OTP verification, we'll need a separate form
        // This is handled in the verify step below
      }
    } catch (err: any) {
      const errorMessage = handleError(err);
      setError('root', { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify') {
    return <VerifyOtpStep email={email} onBack={() => setStep('signup')} />;
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your study abroad journey today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errors.root && (
          <Alert type="error" title="Signup Failed">
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
            placeholder="At least 8 characters"
            label="Password"
            error={errors.password?.message}
            disabled={isLoading}
            icon={<LockIcon />}
            helperText="Must contain uppercase, lowercase, and number"
          />
        </div>

        <div className="space-y-1">
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm password"
            label="Confirm Password"
            error={errors.confirmPassword?.message}
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
            Create account
          </Button>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-navy-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-navy-900 hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-md px-1 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

interface VerifyOtpStepProps {
  email: string;
  onBack: () => void;
}

function VerifyOtpStep({ email, onBack }: VerifyOtpStepProps) {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (otp.length !== 6) {
        setError('OTP must be 6 digits');
        return;
      }

      await verifyOtp({ email, code: otp });
      navigate('/login');
    } catch (err: any) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      // Resend OTP - you'll need to add this function to auth.service
      setResendCooldown(60);
    } catch (err: any) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Email"
      subtitle="We've sent a code to your email"
    >
      <form onSubmit={handleVerify} className="space-y-5">
        {error && (
          <Alert type="error" title="Verification Failed">
            {error}
          </Alert>
        )}

        <div>
          <p className="text-sm text-navy-600 mb-4">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
          <Input
            type="text"
            placeholder="000000"
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            maxLength={6}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Verify Email
          </Button>
        </div>

        <div className="pt-6 border-t border-navy-200 space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isLoading}
            className="w-full text-sm font-semibold text-navy-900 hover:text-navy-700 disabled:text-navy-400 transition-colors"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
          >
            Change Email
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

