/**
 * Dashboard Screen
 * Main dashboard page after user completes onboarding
 */

import { useAuthStore } from "@/features/auth/store/authStore"

export function DashboardScreen() {
  const user = useAuthStore(state => state.user)

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F8F5F2" }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#333333" }}>
          Welcome to dashboard
        </h1>
        {user?.name && (
          <p className="text-xl mb-8" style={{ color: "#666666" }}>
            Welcome back, {user.name}!
          </p>
        )}
      </div>
    </div>
  )
}
