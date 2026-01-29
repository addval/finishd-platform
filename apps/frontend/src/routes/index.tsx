/**
 * App Routes Configuration
 * Finishd Platform - Phone OTP Authentication
 */

import { createBrowserRouter, Navigate } from "react-router-dom"
import { finishdRoutes } from "@/features/finishd"

export const router = createBrowserRouter([
  // Finishd routes (phone OTP auth)
  ...finishdRoutes,

  // Root redirects to Finishd login
  {
    path: "/",
    element: <Navigate to="/finishd/login" replace />,
  },

  // Legacy routes redirect to new auth
  {
    path: "/login",
    element: <Navigate to="/finishd/login" replace />,
  },
  {
    path: "/signup",
    element: <Navigate to="/finishd/login" replace />,
  },

  // Catch-all redirects to Finishd login
  {
    path: "*",
    element: <Navigate to="/finishd/login" replace />,
  },
])
