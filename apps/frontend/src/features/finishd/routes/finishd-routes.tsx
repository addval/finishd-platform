/**
 * Finishd Routes Configuration
 * Routes for the Finishd marketplace
 */

import { Navigate, type RouteObject } from "react-router-dom"
import { PhoneLoginPage } from "../pages/phone-login"
import { VerifyOtpPage } from "../pages/verify-otp"
import { SelectUserTypePage } from "../pages/select-user-type"
import { HomeownerOnboardingPage } from "../pages/onboarding/homeowner-onboarding"
import { DesignerOnboardingPage } from "../pages/onboarding/designer-onboarding"
import { ContractorOnboardingPage } from "../pages/onboarding/contractor-onboarding"
import { BrowseDesignersPage } from "../pages/browse-designers"
import { CreateProjectPage } from "../pages/create-project"
import { DashboardPage } from "../pages/dashboard"
import { FinishdProtectedRoute } from "./finishd-protected-route"

/**
 * Finishd route definitions
 * All routes are prefixed with /finishd
 */
export const finishdRoutes: RouteObject[] = [
  // Auth routes
  {
    path: "/finishd/login",
    element: <PhoneLoginPage />,
  },
  {
    path: "/finishd/verify-otp",
    element: <VerifyOtpPage />,
  },

  // User type selection (after first login)
  {
    path: "/finishd/onboarding",
    element: (
      <FinishdProtectedRoute>
        <SelectUserTypePage />
      </FinishdProtectedRoute>
    ),
  },

  // Dashboard - main landing page after login
  {
    path: "/finishd/dashboard",
    element: (
      <FinishdProtectedRoute requireUserType>
        <DashboardPage />
      </FinishdProtectedRoute>
    ),
  },

  // Homeowner routes
  {
    path: "/finishd/onboarding/homeowner",
    element: (
      <FinishdProtectedRoute requireUserType="homeowner">
        <HomeownerOnboardingPage />
      </FinishdProtectedRoute>
    ),
  },

  // Designer routes
  {
    path: "/finishd/onboarding/designer",
    element: (
      <FinishdProtectedRoute requireUserType="designer">
        <DesignerOnboardingPage />
      </FinishdProtectedRoute>
    ),
  },

  // Contractor routes
  {
    path: "/finishd/onboarding/contractor",
    element: (
      <FinishdProtectedRoute requireUserType="contractor">
        <ContractorOnboardingPage />
      </FinishdProtectedRoute>
    ),
  },

  // Browse designers (for homeowners)
  {
    path: "/finishd/designers",
    element: (
      <FinishdProtectedRoute requireUserType>
        <BrowseDesignersPage />
      </FinishdProtectedRoute>
    ),
  },

  // Create project (for homeowners)
  {
    path: "/finishd/projects/new",
    element: (
      <FinishdProtectedRoute requireUserType="homeowner">
        <CreateProjectPage />
      </FinishdProtectedRoute>
    ),
  },

  // Redirect /finishd to appropriate page
  {
    path: "/finishd",
    element: <Navigate to="/finishd/login" replace />,
  },
]
