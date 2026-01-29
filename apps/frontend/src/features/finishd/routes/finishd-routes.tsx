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
import { DesignerDetailPage } from "../pages/designer-detail"
import { ProjectDetailPage } from "../pages/project-detail"
import { ProposalsPage } from "../pages/proposals"
import { EditProfilePage } from "../pages/edit-profile"
import { AdminPanelPage } from "../pages/admin-panel"
import { NotificationsPage } from "../pages/notifications"
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

  // Homeowner onboarding
  {
    path: "/finishd/onboarding/homeowner",
    element: (
      <FinishdProtectedRoute requireUserType="homeowner">
        <HomeownerOnboardingPage />
      </FinishdProtectedRoute>
    ),
  },

  // Designer onboarding
  {
    path: "/finishd/onboarding/designer",
    element: (
      <FinishdProtectedRoute requireUserType="designer">
        <DesignerOnboardingPage />
      </FinishdProtectedRoute>
    ),
  },

  // Contractor onboarding
  {
    path: "/finishd/onboarding/contractor",
    element: (
      <FinishdProtectedRoute requireUserType="contractor">
        <ContractorOnboardingPage />
      </FinishdProtectedRoute>
    ),
  },

  // Browse designers
  {
    path: "/finishd/designers",
    element: (
      <FinishdProtectedRoute requireUserType>
        <BrowseDesignersPage />
      </FinishdProtectedRoute>
    ),
  },

  // Designer detail
  {
    path: "/finishd/designers/:id",
    element: (
      <FinishdProtectedRoute requireUserType>
        <DesignerDetailPage />
      </FinishdProtectedRoute>
    ),
  },

  // Create project
  {
    path: "/finishd/projects/new",
    element: (
      <FinishdProtectedRoute requireUserType="homeowner">
        <CreateProjectPage />
      </FinishdProtectedRoute>
    ),
  },

  // Project detail
  {
    path: "/finishd/projects/:id",
    element: (
      <FinishdProtectedRoute requireUserType>
        <ProjectDetailPage />
      </FinishdProtectedRoute>
    ),
  },

  // Proposals management
  {
    path: "/finishd/proposals",
    element: (
      <FinishdProtectedRoute requireUserType>
        <ProposalsPage />
      </FinishdProtectedRoute>
    ),
  },

  // Edit profile
  {
    path: "/finishd/profile/edit",
    element: (
      <FinishdProtectedRoute requireUserType>
        <EditProfilePage />
      </FinishdProtectedRoute>
    ),
  },

  // Notifications
  {
    path: "/finishd/notifications",
    element: (
      <FinishdProtectedRoute requireUserType>
        <NotificationsPage />
      </FinishdProtectedRoute>
    ),
  },

  // Admin panel
  {
    path: "/finishd/admin",
    element: (
      <FinishdProtectedRoute requireUserType>
        <AdminPanelPage />
      </FinishdProtectedRoute>
    ),
  },

  // Redirect /finishd to appropriate page
  {
    path: "/finishd",
    element: <Navigate to="/finishd/login" replace />,
  },
]
