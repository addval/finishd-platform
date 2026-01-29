/**
 * Unified Auth Header
 * Single header component for authentication/onboarding screens
 * with centered logo and optional back button
 */

import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import logo from "@/assets/images/logo.png"
import { LogoutConfirmationModal } from "@/components/modals/LogoutConfirmationModal"
import { useAuthStore } from "@/features/auth/store/authStore"

interface AuthHeaderProps {
  showBackButton?: boolean
  onNavigateBack?: () => void
  extraContent?: React.ReactNode
  enableSmartNavigation?: boolean
}

export function AuthHeader({
  showBackButton = true,
  onNavigateBack,
  extraContent,
  enableSmartNavigation = false,
}: AuthHeaderProps) {
  const logout = useAuthStore(state => state.logout)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleBack = () => {
    try {
      logout()
      setShowLogoutModal(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleButtonClick = () => {
    if (enableSmartNavigation) {
      setShowLogoutModal(true)
    } else if (onNavigateBack) {
      onNavigateBack()
    }
  }

  // If extraContent is provided, use custom layout
  if (extraContent) {
    return (
      <>
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-15 bg-card border-b border-border-light"
        >
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleButtonClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-card text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {/* Logo - Centered */}
          <img src={logo} alt="Finishd" className="h-auto w-32.5" />

          {/* Extra Content */}
          {extraContent}
        </div>
        <LogoutConfirmationModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleBack}
        />
      </>
    )
  }

  // Default layout with centered logo
  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-15 bg-card border-b border-border-light"
      >
        <div className="relative h-full flex items-center justify-center px-4">
          {/* Back Button - Left */}
          {showBackButton && (
            <button
              onClick={handleButtonClick}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-card text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {/* Logo Branding - Centered */}
          <img src={logo} alt="Finishd" className="h-auto w-32.5" />
        </div>
      </header>
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleBack}
      />
    </>
  )
}
