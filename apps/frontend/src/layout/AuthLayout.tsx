/**
 * Auth Layout Component
 * Provides AuthHeader for authentication/onboarding flows using React Router outlet pattern
 */

import { Outlet, useNavigate } from "react-router-dom"
import { AuthHeader } from "./AuthHeader"

interface AuthLayoutProps {
  children?: React.ReactNode
  showBackButton?: boolean
  enableSmartNavigation?: boolean
}

export function AuthLayout({
  children,
  showBackButton = true,
  enableSmartNavigation = false,
}: AuthLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (enableSmartNavigation) {
      // Smart navigation: show logout confirmation
      // This will be handled by AuthHeader's logout logic
    } else {
      navigate(-1)
    }
  }

  return (
    <>
      <AuthHeader
        showBackButton={showBackButton}
        onNavigateBack={handleBack}
        enableSmartNavigation={enableSmartNavigation}
      />
      <div style={{ paddingTop: "60px" }}>{children || <Outlet />}</div>
    </>
  )
}
