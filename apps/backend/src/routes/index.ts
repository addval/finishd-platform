/**
 * Routes Index
 * Aggregates all API routes
 *
 * Route Structure:
 * - Public routes (no authentication): /auth/*
 * - Protected routes (authentication required): /api/*
 */

import { Router } from "express"
import authProtectedRoutes from "./auth.protected.routes.js"
import authPublicRoutes from "./auth.public.routes.js"
import userRoutes from "./user.routes.js"

const router = Router()

// Mount public routes (no authentication required)
router.use("/auth", authPublicRoutes)

// Mount protected routes (authentication required)
router.use("/api", authProtectedRoutes)
router.use("/api/users", userRoutes)

export default router
