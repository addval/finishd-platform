/**
 * Contractors Routes
 * API endpoints for contractor profile management
 */

import { Router } from "express"
import {
  browseContractorsHandler,
  getContractorsByTradeHandler,
  getContractorHandler,
  getMyProfileHandler,
  createMyProfileHandler,
  updateMyProfileHandler,
} from "./contractors.controller.js"
import { authMiddleware, optionalAuthMiddleware } from "../auth/auth.middleware.js"

const router = Router()

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// GET /api/v1/contractors - Browse contractors
router.get("/", optionalAuthMiddleware, browseContractorsHandler)

// GET /api/v1/contractors/by-trade/:trade - Get by trade
router.get("/by-trade/:trade", optionalAuthMiddleware, getContractorsByTradeHandler)

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

// GET /api/v1/contractors/me - Get own profile
router.get("/me", authMiddleware, getMyProfileHandler)

// POST /api/v1/contractors/me - Create profile
router.post("/me", authMiddleware, createMyProfileHandler)

// PATCH /api/v1/contractors/me - Update profile
router.patch("/me", authMiddleware, updateMyProfileHandler)

// ============================================================================
// PUBLIC ROUTES (specific contractor - must be after /me)
// ============================================================================

// GET /api/v1/contractors/:id - Get by ID
router.get("/:id", optionalAuthMiddleware, getContractorHandler)

export default router
