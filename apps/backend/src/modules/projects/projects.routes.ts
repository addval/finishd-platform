/**
 * Projects Routes
 * API endpoints for project management
 */

import { Router } from "express"
import { authMiddleware, requireUserType } from "../auth/auth.middleware.js"
import {
  listProjectsHandler,
  listDesignerProjectsHandler,
  getProjectHandler,
  createProjectHandler,
  updateProjectHandler,
  completeProjectHandler,
  cancelProjectHandler,
  getProjectActivityHandler,
} from "./projects.controller.js"

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// ============================================================================
// HOMEOWNER ROUTES
// ============================================================================

// GET /api/v1/projects - List homeowner's projects
router.get("/", requireUserType("homeowner"), listProjectsHandler)

// POST /api/v1/projects - Create new project
router.post("/", requireUserType("homeowner"), createProjectHandler)

// ============================================================================
// DESIGNER ROUTES
// ============================================================================

// GET /api/v1/projects/designer - List designer's assigned projects
router.get("/designer", requireUserType("designer"), listDesignerProjectsHandler)

// ============================================================================
// PROJECT OPERATIONS (Both homeowner and designer can access)
// ============================================================================

// GET /api/v1/projects/:id - Get project details
router.get("/:id", getProjectHandler)

// PATCH /api/v1/projects/:id - Update project (homeowner, draft only)
router.patch("/:id", requireUserType("homeowner"), updateProjectHandler)

// POST /api/v1/projects/:id/complete - Mark project as completed
router.post("/:id/complete", requireUserType("homeowner"), completeProjectHandler)

// POST /api/v1/projects/:id/cancel - Cancel project
router.post("/:id/cancel", requireUserType("homeowner"), cancelProjectHandler)

// GET /api/v1/projects/:id/activity - Get project activity log
router.get("/:id/activity", getProjectActivityHandler)

export default router
