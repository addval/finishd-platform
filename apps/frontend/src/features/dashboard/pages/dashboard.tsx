/**
 * Dashboard Screen
 * Main dashboard page after user completes onboarding
 */

import { useAuthStore } from "@/features/auth/store/authStore"

export function DashboardScreen() {
  const user = useAuthStore(state => state.user)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-text-primary">
          Welcome to dashboard
        </h1>
        {user?.name && (
          <p className="text-xl mb-8 text-text-secondary">
            Welcome back, {user.name}!
          </p>
        )}
      </div>
    </div>
  )
}
