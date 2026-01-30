import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

// Onboarding steps for the informational panel
const onboardingSteps = [
  {
    number: 1,
    title: 'Complete your profile',
    description: 'Share your academic background and goals with our AI',
  },
  {
    number: 2,
    title: 'Get AI recommendations',
    description: 'Receive personalized university suggestions tailored to you',
  },
  {
    number: 3,
    title: 'Lock your choices',
    description: 'Finalize your university selections with confidence',
  },
  {
    number: 4,
    title: 'Prepare applications',
    description: 'Complete guided tasks to submit your applications',
  },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-navy-50 flex flex-col lg:flex-row">
      {/* Left Section - Authentication Form (White Background) */}
      <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col min-h-screen">
        {/* Back to Home Link */}
        <div className="p-6 lg:p-8 flex-shrink-0">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-navy-600 hover:text-navy-800 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>

        {/* Form Content - Centered */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-8 lg:px-12 xl:px-16">
          {/* Logo and Branding - Prominent */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              {/* Logo Icon */}
              <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
              <span className="text-2xl font-bold text-navy-900">AI Counsellor</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-navy-900 mb-2">{title}</h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-navy-500 text-base">{subtitle}</p>
            )}
          </div>

          {/* Form Children */}
          {children}
        </div>
      </div>

      {/* Right Section - Informational Panel (Gradient Background) */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-8/12 relative min-h-screen">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Circle Decorations */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-navy-700/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-700/20 rounded-full blur-3xl" />
        </div>

        {/* Content - Centered vertically */}
        <div className="relative z-10 flex flex-col justify-center h-full px-12 xl:px-20">
          {/* Headline */}
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
            Your guided path to studying abroad
          </h2>

          <p className="text-navy-200 mb-10 text-lg max-w-md">
            Join thousands of students who have successfully navigated their study abroad journey with AI-powered guidance.
          </p>

          {/* Steps */}
          <div className="space-y-6">
            {onboardingSteps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                {/* Yellow Circle Badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-400 text-navy-900 flex items-center justify-center font-bold text-sm shadow-lg">
                  {step.number}
                </div>

                {/* Step Content */}
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {step.title}
                  </h3>
                  <p className="text-navy-300 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Right Panel - Shows below form on mobile */}
      <div className="lg:hidden relative min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950" />
        <div className="relative z-10 flex flex-col justify-center h-full px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight text-center">
            Your guided path to studying abroad
          </h2>
          <p className="text-navy-200 text-sm text-center mb-8">
            Join thousands of students who have successfully navigated their study abroad journey with AI-powered guidance.
          </p>
          <div className="space-y-4">
            {onboardingSteps.map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-400 text-navy-900 flex items-center justify-center font-bold text-xs shadow">
                  {step.number}
                </div>
                <span className="text-white text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

