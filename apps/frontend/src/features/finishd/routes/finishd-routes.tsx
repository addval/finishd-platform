/**
 * Finishd Routes Configuration
 * Routes for the Finishd marketplace
 */

import { Navigate, type RouteObject } from "react-router-dom"
import { PhoneLoginPage } from "../pages/phone-login"
import { VerifyOtpPage } from "../pages/verify-otp"
import { SelectUserTypePage } from "../pages/select-user-type"
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

  // Onboarding routes
  {
    path: "/finishd/onboarding",
    element: (
      <FinishdProtectedRoute>
        <SelectUserTypePage />
      </FinishdProtectedRoute>
    ),
  },

  // Dashboard routes (placeholder for now)
  {
    path: "/finishd/dashboard",
    element: (
      <FinishdProtectedRoute requireUserType>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Finishd Dashboard</h1>
            <p className="mt-2 text-gray-600">Coming soon...</p>
          </div>
        </div>
      </FinishdProtectedRoute>
    ),
  },

  // Homeowner routes
  {
    path: "/finishd/onboarding/homeowner",
    element: (
      <FinishdProtectedRoute requireUserType="homeowner">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Homeowner Profile Setup</h1>
            <p className="mt-2 text-gray-600">Coming soon...</p>
          </div>
        </div>
      </FinishdProtectedRoute>
    ),
  },

  // Designer routes
  {
    path: "/finishd/onboarding/designer",
    element: (
      <FinishdProtectedRoute requireUserType="designer">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Designer Profile Setup</h1>
            <p className="mt-2 text-gray-600">Coming soon...</p>
          </div>
        </div>
      </FinishdProtectedRoute>
    ),
  },

  // Contractor routes
  {
    path: "/finishd/onboarding/contractor",
    element: (
      <FinishdProtectedRoute requireUserType="contractor">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Contractor Profile Setup</h1>
            <p className="mt-2 text-gray-600">Coming soon...</p>
          </div>
        </div>
      </FinishdProtectedRoute>
    ),
  },

  // Redirect /finishd to appropriate page
  {
    path: "/finishd",
    element: <Navigate to="/finishd/login" replace />,
  },
]
