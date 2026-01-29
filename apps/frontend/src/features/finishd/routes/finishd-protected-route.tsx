/**
 * Finishd Protected Route
 * Route guard for authenticated Finishd routes
 */

import { Navigate } from "react-router-dom"
import { useFinishdAuthStore } from "../store/finishd-auth.store"

type UserType = "homeowner" | "designer" | "contractor"

interface FinishdProtectedRouteProps {
  children: React.ReactNode
  requireUserType?: UserType | boolean
}

export function FinishdProtectedRoute({
  children,
  requireUserType = false,
}: FinishdProtectedRouteProps) {
  const { user, isAuthenticated, needsOnboarding, getUserType } = useFinishdAuthStore()

  // Not authenticated - redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/finishd/login" replace />
  }

  // Authenticated but needs onboarding (no user type)
  if (needsOnboarding() && requireUserType) {
    return <Navigate to="/finishd/onboarding" replace />
  }

  // Check specific user type requirement
  if (typeof requireUserType === "string") {
    const currentUserType = getUserType()
    if (currentUserType !== requireUserType) {
      // Redirect to dashboard if wrong user type
      return <Navigate to="/finishd/dashboard" replace />
    }
  }

  // All checks passed
  return <>{children}</>
}
