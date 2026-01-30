import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Lock, FileText, Bot, CheckCircle, ArrowRight } from 'lucide-react';

// Logo Component - Same as in AuthLayout
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

// Logo with Text
const Logo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center shadow-lg">
      <LogoIcon className="w-6 h-6 text-white" />
    </div>
    <span className="text-xl font-bold text-navy-900">AI Counsellor</span>
  </div>
);

export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleStartJourney = () => {
    navigate('/signup');
  };

  const handleGetStartedFree = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-navy-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-navy-600 hover:text-navy-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 mb-6 leading-tight">
            Plan Your Study Abroad Journey with Clarity
          </h1>
          <p className="text-xl text-navy-600 mb-8 max-w-2xl mx-auto">
            The AI Counsellor guides students step-by-step through university discovery, shortlisting, and application preparation, removing the overwhelm and uncertainty from studying abroad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartJourney}
              className="bg-navy-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-navy-800 transition-colors shadow-lg flex items-center justify-center"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border border-navy-300 text-navy-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-navy-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Structured Journey Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              A Structured Path to Your Dream University
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Our platform removes the overwhelm by guiding you through clear, actionable stages from profile building to application submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stage 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg mb-4">
                <User className="h-6 w-6 text-navy-700" />
              </div>
              <div className="text-sm font-medium text-navy-700 mb-2">Stage 1</div>
              <h3 className="text-lg font-semibold text-navy-900 mb-3">Profile Building</h3>
              <p className="text-navy-600">
                Complete your academic profile, set clear goals, and assess your readiness for studying abroad.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg mb-4">
                <Search className="h-6 w-6 text-navy-700" />
              </div>
              <div className="text-sm font-medium text-navy-700 mb-2">Stage 2</div>
              <h3 className="text-lg font-semibold text-navy-900 mb-3">University Discovery</h3>
              <p className="text-navy-600">
                Get AI-powered university recommendations categorized into suitable groups based on your profile.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg mb-4">
                <Lock className="h-6 w-6 text-navy-700" />
              </div>
              <div className="text-sm font-medium text-navy-700 mb-2">Stage 3</div>
              <h3 className="text-lg font-semibold text-navy-900 mb-3">Lock Universities</h3>
              <p className="text-navy-600">
                Finalize your university choices with detailed reasoning and comprehensive risk analysis.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg mb-4">
                <FileText className="h-6 w-6 text-navy-700" />
              </div>
              <div className="text-sm font-medium text-navy-700 mb-2">Stage 4</div>
              <h3 className="text-lg font-semibold text-navy-900 mb-3">Application Prep</h3>
              <p className="text-navy-600">
                Follow guided tasks for SOP writing, exam preparation, and document collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Counsellor Feature Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-medium text-navy-700 mb-4 uppercase tracking-wide">
            AI Powered Guidance
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Your Personal AI Counsellor
          </h2>
          <p className="text-xl text-navy-600 mb-12 max-w-3xl mx-auto">
            This is not a generic chatbot. Our AI Counsellor is a sophisticated decision-making assistant that understands your unique profile, tracks your progress, and guides you through real, actionable steps toward your study abroad goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-navy-700" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Profile Analysis</h3>
              <p className="text-navy-600">
                Analyzes your academic strengths, identifies gaps, and provides personalized improvement recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mx-auto mb-4">
                <Search className="h-8 w-8 text-navy-700" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Smart Recommendations</h3>
              <p className="text-navy-600">
                Recommends universities with clear reasoning based on your goals, budget, and academic profile.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mx-auto mb-4">
                <Bot className="h-8 w-8 text-navy-700" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Task Management</h3>
              <p className="text-navy-600">
                Guides you through application tasks, tracks progress, and ensures nothing falls through the cracks.
              </p>
            </div>
          </div>

          <button
            onClick={handleGetStartedFree}
            className="bg-navy-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-navy-800 transition-colors shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-navy-700 rounded-xl flex items-center justify-center shadow-lg">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold">AI Counsellor</span>
          </div>
          <p className="text-navy-300 mb-4">
            Your guided path to studying abroad with confidence.
          </p>
          <p className="text-sm text-navy-400">
            © {new Date().getFullYear()} AI Counsellor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

