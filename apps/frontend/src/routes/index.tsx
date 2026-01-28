/**
 * App Routes Configuration
 */

import { createBrowserRouter, Navigate } from "react-router-dom"
import { LoginScreen } from "@/features/auth/pages/loginPage"
import { SignupScreen } from "@/features/auth/pages/signupPage"
import { EmailVerificationScreen } from "@/features/auth/pages/verifyEmail"
import { DashboardScreen } from "@/features/dashboard/pages/dashboard"
import { PermissionSetupScreen } from "@/features/onboarding/pages/setupPermission"
import { WelcomeScreen } from "@/features/onboarding/pages/welcomeUser"
import { ProfileCreationScreen } from "@/features/profile/pages/createProfile"
import { AppLayout } from "@/layout/AppLayout"
import { AuthLayout } from "@/layout/AuthLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { finishdRoutes } from "@/features/finishd"

export const router = createBrowserRouter([
  // Finishd routes (phone OTP auth)
  ...finishdRoutes,

  {
    path: "/",
    element: (
      <ProtectedRoute
        requireAuth={true}
        requireVerified={true}
        requireProfile={true}
        requireOnboarding={true}
      >
        <AppLayout>
          <DashboardScreen />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/welcome",
    element: (
      <ProtectedRoute requireAuth={true} requireOnboarding={true}>
        <AuthLayout showBackButton={true} enableSmartNavigation={true}>
          <WelcomeScreen />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthLayout showBackButton={false}>
        <SignupScreen />
      </AuthLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthLayout showBackButton={false}>
        <LoginScreen />
      </AuthLayout>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <ProtectedRoute requireAuth={true}>
        <AuthLayout showBackButton={true} enableSmartNavigation={true}>
          <EmailVerificationScreen />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/profile",
    element: (
      <ProtectedRoute requireAuth={true} requireVerified={true}>
        <AuthLayout showBackButton={true} enableSmartNavigation={true}>
          <ProfileCreationScreen />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/permissions",
    element: (
      <ProtectedRoute requireAuth={true} requireVerified={true} requireProfile={true}>
        <AuthLayout showBackButton={true} enableSmartNavigation={true}>
          <PermissionSetupScreen />
        </AuthLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
])
