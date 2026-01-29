/**
 * Users Routes
 * API endpoints for user management
 */

import { Router } from "express"
import { getMeHandler, updateMeHandler, deleteMeHandler } from "./users.controller.js"
import { authMiddleware } from "../auth/auth.middleware.js"

const router = Router()

// All user routes require authentication
router.use(authMiddleware)

// GET /api/v1/users/me
// Get current user profile
router.get("/me", getMeHandler)

// PATCH /api/v1/users/me
// Update current user (user type, language preference)
router.patch("/me", updateMeHandler)

// DELETE /api/v1/users/me
// Deactivate account
router.delete("/me", deleteMeHandler)

export default router
