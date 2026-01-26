/**
 * App Header Component
 * Header for authenticated main app pages (Dashboard, etc.)
 * Logo on left, logout button on right
 */

import { LogOut } from "lucide-react"
import { useState } from "react"
import logo from "@/assets/images/logo.png"
import { LogoutConfirmationModal } from "@/components/modals/LogoutConfirmationModal"
import { useAuthStore } from "@/features/auth/store/authStore"

export function AppHeader() {
  const logout = useAuthStore(state => state.logout)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    try {
      logout()
      setShowLogoutModal(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: "60px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E5E5",
        }}
      >
        <div className="relative h-full flex items-center justify-between px-6">
          {/* Logo - Left */}
          <img
            src={logo}
            alt="Rituality"
            style={{ height: "auto", width: "130px" }}
            className="ms-10"
          />

          {/* Logout Button - Right */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: "#CCCCCC",
              backgroundColor: "#FFFFFF",
              color: "#666666",
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
