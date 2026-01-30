import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import LandingPage from './pages/Landing';
import DashboardPage from './pages/Dashboard';
import OnboardingPage from './pages/Onboarding';
import DiscoveryPage from './pages/Discovery';
import ShortlistPage from './pages/Shortlist';
import ApplicationPage from './pages/Application';
import ProfileEditPage from './pages/ProfileEdit';
import AICounsellorPage from './pages/AICounsellor';

import StageGuard from './guards/StageGuard';
import { STAGE } from './constants/stages';

export const router = createBrowserRouter([
  // 🌍 Public routes
  { path: '/', element: <LandingPage /> },
  { path: '/landing', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },

  // 🧠 Onboarding — ONLY when onboarding
  {
    path: '/onboarding',
    element: (
      <StageGuard allowedStages={[STAGE.ONBOARDING]}>
        <OnboardingPage />
      </StageGuard>
    ),
  },

  // 📊 Dashboard — accessible in ALL stages
  {
    path: '/dashboard',
    element: (
      <StageGuard
        allowedStages={[
          STAGE.ONBOARDING,
          STAGE.DISCOVERY,
          STAGE.SHORTLISTING,
          STAGE.LOCKED,
          STAGE.APPLICATION,
        ]}
      >
        <DashboardPage />
      </StageGuard>
    ),
  },

  // 🎓 University Discovery — accessible at ANY stage
  {
    path: '/discover',
    element: (
      <StageGuard allowedStages={[STAGE.ONBOARDING, STAGE.DISCOVERY, STAGE.SHORTLISTING, STAGE.LOCKED, STAGE.APPLICATION]}>
        <DiscoveryPage />
      </StageGuard>
    ),
  },

  // ⭐ Shortlist — accessible from discovery onwards
  {
    path: '/shortlist',
    element: (
      <StageGuard allowedStages={[STAGE.DISCOVERY, STAGE.SHORTLISTING, STAGE.LOCKED, STAGE.APPLICATION]}>
        <ShortlistPage />
      </StageGuard>
    ),
  },

  // 🎓 Application — accessible from discovery stage onwards
  {
    path: '/application',
    element: (
      <StageGuard allowedStages={[STAGE.DISCOVERY, STAGE.SHORTLISTING, STAGE.LOCKED, STAGE.APPLICATION]}>
        <ApplicationPage />
      </StageGuard>
    ),
  },
  // ✏️ Profile Edit — accessible in all stages
  {
    path: '/profile/edit',
    element: (
      <StageGuard
        allowedStages={[
          STAGE.ONBOARDING,
          STAGE.DISCOVERY,
          STAGE.SHORTLISTING,
          STAGE.LOCKED,
          STAGE.APPLICATION,
        ]}
      >
        <ProfileEditPage />
      </StageGuard>
    ),
  },
  // 🤖 AI Counsellor — accessible from discovery stage onwards
  {
    path: '/ai-counsellor',
    element: (
      <StageGuard allowedStages={[STAGE.DISCOVERY, STAGE.SHORTLISTING, STAGE.LOCKED, STAGE.APPLICATION]}>
        <AICounsellorPage />
      </StageGuard>
    ),
  },
  // Catch all - redirect to login
  { path: '*', element: <LoginPage /> },
]);
