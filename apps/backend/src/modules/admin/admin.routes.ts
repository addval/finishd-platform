/**
 * Admin Routes
 * API endpoints for admin verification queue management
 */

import { Router } from "express"
import {
  getUnverifiedDesignersHandler,
  verifyDesignerHandler,
  rejectDesignerHandler,
  getUnverifiedContractorsHandler,
  verifyContractorHandler,
  rejectContractorHandler,
} from "./admin.controller.js"
import { authMiddleware } from "../auth/auth.middleware.js"

const router = Router()

// ============================================================================
// DESIGNER VERIFICATION ROUTES (all require auth)
// ============================================================================

// GET /api/v1/admin/designers/pending - Get unverified designers
router.get("/designers/pending", authMiddleware, getUnverifiedDesignersHandler)

// POST /api/v1/admin/designers/:id/verify - Verify a designer
router.post("/designers/:id/verify", authMiddleware, verifyDesignerHandler)

// POST /api/v1/admin/designers/:id/reject - Reject a designer
router.post("/designers/:id/reject", authMiddleware, rejectDesignerHandler)

// ============================================================================
// CONTRACTOR VERIFICATION ROUTES (all require auth)
// ============================================================================

// GET /api/v1/admin/contractors/pending - Get unverified contractors
router.get("/contractors/pending", authMiddleware, getUnverifiedContractorsHandler)

// POST /api/v1/admin/contractors/:id/verify - Verify a contractor
router.post("/contractors/:id/verify", authMiddleware, verifyContractorHandler)

// POST /api/v1/admin/contractors/:id/reject - Reject a contractor
router.post("/contractors/:id/reject", authMiddleware, rejectContractorHandler)

export default router
