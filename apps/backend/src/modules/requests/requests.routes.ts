/**
 * Requests Routes
 * API endpoints for project requests and proposals
 */

import { Router } from "express"
import { authMiddleware, requireUserType } from "../auth/auth.middleware.js"
import {
  sendRequestHandler,
  getProjectRequestsHandler,
  getProjectProposalsHandler,
  acceptProposalHandler,
  rejectProposalHandler,
  getDesignerRequestsHandler,
  getRequestDetailsHandler,
  declineRequestHandler,
  submitProposalHandler,
} from "./requests.controller.js"

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// ============================================================================
// HOMEOWNER ROUTES
// ============================================================================

// POST /api/v1/requests - Send request to designer
router.post("/", requireUserType("homeowner"), sendRequestHandler)

// GET /api/v1/requests/project/:projectId - Get all requests for a project
router.get("/project/:projectId", requireUserType("homeowner"), getProjectRequestsHandler)

// GET /api/v1/requests/project/:projectId/proposals - Get all proposals for a project
router.get("/project/:projectId/proposals", requireUserType("homeowner"), getProjectProposalsHandler)

// POST /api/v1/requests/proposals/:proposalId/accept - Accept proposal
router.post("/proposals/:proposalId/accept", requireUserType("homeowner"), acceptProposalHandler)

// POST /api/v1/requests/proposals/:proposalId/reject - Reject proposal
router.post("/proposals/:proposalId/reject", requireUserType("homeowner"), rejectProposalHandler)

// ============================================================================
// DESIGNER ROUTES
// ============================================================================

// GET /api/v1/requests/designer - Get requests received by designer
router.get("/designer", requireUserType("designer"), getDesignerRequestsHandler)

// GET /api/v1/requests/:requestId - Get request details (designer)
router.get("/:requestId", requireUserType("designer"), getRequestDetailsHandler)

// POST /api/v1/requests/:requestId/decline - Decline request
router.post("/:requestId/decline", requireUserType("designer"), declineRequestHandler)

// POST /api/v1/requests/:requestId/proposal - Submit proposal
router.post("/:requestId/proposal", requireUserType("designer"), submitProposalHandler)

export default router
