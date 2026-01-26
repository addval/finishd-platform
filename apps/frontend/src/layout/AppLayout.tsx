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
      <div style={{ paddingTop: "60px" }}>{children || <Outlet />}</div>
    </>
  )
}
