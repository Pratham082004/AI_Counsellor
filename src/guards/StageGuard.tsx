import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';
import { STAGE } from '../constants/stages';

interface Props {
  children: JSX.Element;
  allowedStages: STAGE[];
}

/**
 * Route guard component that enforces stage-based access control
 * - Redirects to login if not authenticated
 * - Forces onboarding if user is in ONBOARDING stage
 * - Redirects to dashboard if current route is not allowed for user's stage
 */
export default function StageGuard({ children, allowedStages }: Props) {
  const user = getUserFromToken();
  const location = useLocation();

  // ❌ Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userStage = user.stage as STAGE;

  // 🔒 Force onboarding EXCEPT when already on onboarding
  if (userStage === STAGE.ONBOARDING && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // 🚫 Stage not allowed for this route - redirect to dashboard
  if (!allowedStages.includes(userStage)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

