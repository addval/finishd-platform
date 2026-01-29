/**
 * Protected Route Component
 * Redirects users based on authentication and onboarding state
 */

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

interface ProtectedRouteProps {
  children: React.ReactElement
  requireAuth?: boolean // default: true
  requireVerified?: boolean // default: false
  requireProfile?: boolean // default: false
  requireOnboarding?: boolean // default: false
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireVerified = false,
  requireProfile = false,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated())

  // Give Zustand time to hydrate from localStorage
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check email verification
  if (requireVerified && isAuthenticated && !user?.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  // Check profile creation
  if (requireProfile && isAuthenticated && !user?.profileCreated) {
    return <Navigate to="/onboarding/profile" replace />
  }

  // Check onboarding completion
  if (requireOnboarding && isAuthenticated && !user?.onboardingCompleted) {
    return <Navigate to="/onboarding/permissions" replace />
  }

  // All checks passed
  return children
}
