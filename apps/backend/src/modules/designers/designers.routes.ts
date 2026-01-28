/**
 * Designers Routes
 * API endpoints for designer profile management
 */

import { Router } from "express"
import {
  browseDesignersHandler,
  getFeaturedDesignersHandler,
  getDesignerHandler,
  getMyProfileHandler,
  createMyProfileHandler,
  updateMyProfileHandler,
} from "./designers.controller.js"
import { authMiddleware, optionalAuthMiddleware } from "../auth/auth.middleware.js"

const router = Router()

// ============================================================================
// PUBLIC ROUTES (no auth or optional auth)
// ============================================================================

// GET /api/v1/designers - Browse designers
router.get("/", optionalAuthMiddleware, browseDesignersHandler)

// GET /api/v1/designers/featured - Get featured designers
router.get("/featured", optionalAuthMiddleware, getFeaturedDesignersHandler)

// ============================================================================
// AUTHENTICATED ROUTES (own profile)
// ============================================================================

// GET /api/v1/designers/me - Get own profile
router.get("/me", authMiddleware, getMyProfileHandler)

// POST /api/v1/designers/me - Create own profile (onboarding)
router.post("/me", authMiddleware, createMyProfileHandler)

// PATCH /api/v1/designers/me - Update own profile
router.patch("/me", authMiddleware, updateMyProfileHandler)

// ============================================================================
// PUBLIC ROUTES (specific designer)
// Must be after /me routes to avoid conflicts
// ============================================================================

// GET /api/v1/designers/:id - Get designer by ID
router.get("/:id", optionalAuthMiddleware, getDesignerHandler)

export default router
