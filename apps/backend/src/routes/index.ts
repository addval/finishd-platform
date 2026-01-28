/**
 * Routes Index
 * Aggregates all API routes for Finishd platform
 *
 * Route Structure:
 * - Public routes (no auth): /api/v1/auth/*
 * - Protected routes (auth required): /api/v1/users/*, /api/v1/homeowners/*, etc.
 *
 * Legacy routes (to be deprecated):
 * - /auth/* - Old auth routes
 * - /api/* - Old API routes
 */

import { Router } from "express"

// Legacy routes (keeping for backwards compatibility)
import authProtectedRoutes from "./auth.protected.routes.js"
import authPublicRoutes from "./auth.public.routes.js"
import userRoutes from "./user.routes.js"

// New Finishd routes (v1)
import { authRoutes } from "../modules/auth/index.js"
import { usersRoutes } from "../modules/users/index.js"
import { homeownersRoutes } from "../modules/homeowners/index.js"
import { designersRoutes } from "../modules/designers/index.js"
import { contractorsRoutes } from "../modules/contractors/index.js"
import { uploadRoutes } from "../modules/upload/index.js"
import { searchRoutes } from "../modules/search/index.js"
import { projectsRoutes } from "../modules/projects/index.js"
import { requestsRoutes } from "../modules/requests/index.js"
import { tasksRoutes } from "../modules/tasks/index.js"

const router = Router()

// ============================================================================
// FINISHD API V1 ROUTES
// ============================================================================

// Auth routes (public)
router.use("/api/v1/auth", authRoutes)

// User routes (protected)
router.use("/api/v1/users", usersRoutes)

// Profile routes
router.use("/api/v1/homeowners", homeownersRoutes)
router.use("/api/v1/designers", designersRoutes)
router.use("/api/v1/contractors", contractorsRoutes)

// File upload routes
router.use("/api/v1/upload", uploadRoutes)

// Search routes (Typesense)
router.use("/api/v1/search", searchRoutes)

// Project routes
router.use("/api/v1/projects", projectsRoutes)

// Requests & proposals routes
router.use("/api/v1/requests", requestsRoutes)

// Tasks, milestones, costs routes
router.use("/api/v1", tasksRoutes)

// ============================================================================
// LEGACY ROUTES (to be deprecated)
// ============================================================================

// Mount legacy public routes (no authentication required)
router.use("/auth", authPublicRoutes)

// Mount legacy protected routes (authentication required)
router.use("/api", authProtectedRoutes)
router.use("/api/users", userRoutes)

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    message: "Finishd API is running",
    error: null,
  })
})

export default router
