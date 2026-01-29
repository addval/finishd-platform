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
 */
export const finishdRoutes: RouteObject[] = [
  // Auth routes
  {
    path: "/login",
    element: <PhoneLoginPage />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtpPage />,
  },

  // Onboarding routes
  {
    path: "/onboarding",
    element: (
      <FinishdProtectedRoute>
        <SelectUserTypePage />
      </FinishdProtectedRoute>
    ),
  },

  // Dashboard routes (placeholder for now)
  {
    path: "/dashboard",
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
    path: "/onboarding/homeowner",
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
    path: "/onboarding/designer",
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
    path: "/onboarding/contractor",
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

  // Home redirect
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Catch-all redirect to login
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]
