/**
 * App Layout Component
 * Provides AppHeader for main authenticated app pages
 */

import { Outlet } from "react-router-dom"
import { AppHeader } from "./AppHeader"

interface AppLayoutProps {
  children?: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <AppHeader />
      <div className="pt-15">{children || <Outlet />}</div>
    </>
  )
}
