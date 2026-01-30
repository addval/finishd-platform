/**
 * Requests Controller
 * HTTP handlers for project requests and proposals
 */

import type { Request, Response } from "express"
import {
  sendRequest,
  getProjectRequests,
  getDesignerRequests,
  getRequestDetails,
  declineRequest,
  submitProposal,
  acceptProposal,
  rejectProposal,
  getProjectProposals,
} from "./requests.service.js"

// ============================================================================
// HOMEOWNER ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/requests
 * Send request to designer
 */
export async function sendRequestHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const { projectId, designerId, message } = req.body

  if (!projectId || !designerId) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Project ID and designer ID are required",
      error: "Missing required fields",
    })
    return
  }

  const result = await sendRequest(userId, { projectId, designerId, message })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to send request",
      error: result.error,
    })
    return
  }

  res.status(201).json({
    success: true,
    data: { request: result.request },
    message: "Request sent successfully",
    error: null,
  })
}

/**
 * GET /api/v1/requests/project/:projectId
 * Get all requests for a project (homeowner view)
 */
export async function getProjectRequestsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId

  const result = await getProjectRequests(userId, projectId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get requests",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { requests: result.requests },
    message: "Requests retrieved successfully",
    error: null,
  })
}

/**
 * GET /api/v1/requests/project/:projectId/proposals
 * Get all proposals for a project with designer info
 */
export async function getProjectProposalsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId

  const result = await getProjectProposals(userId, projectId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get proposals",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { proposals: result.proposals },
    message: "Proposals retrieved successfully",
    error: null,
  })
}

/**
 * POST /api/v1/requests/proposals/:proposalId/accept
 * Accept a proposal
 */
export async function acceptProposalHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const proposalId = req.params.proposalId

  const result = await acceptProposal(userId, proposalId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to accept proposal",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { proposal: result.proposal },
    message: "Proposal accepted successfully",
    error: null,
  })
}

/**
 * POST /api/v1/requests/proposals/:proposalId/reject
 * Reject a proposal
 */
export async function rejectProposalHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const proposalId = req.params.proposalId
  const { reason } = req.body

  const result = await rejectProposal(userId, proposalId, reason)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to reject proposal",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { proposal: result.proposal },
    message: "Proposal rejected successfully",
    error: null,
  })
}

// ============================================================================
// DESIGNER ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/requests/designer
 * Get requests received by designer
 */
export async function getDesignerRequestsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const status = req.query.status as
    | "pending"
    | "proposal_submitted"
    | "accepted"
    | "rejected"
    | undefined

  const result = await getDesignerRequests(userId, status)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get requests",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { requests: result.requests },
    message: "Requests retrieved successfully",
    error: null,
  })
}

/**
 * GET /api/v1/requests/:requestId
 * Get request details with project info (designer view)
 */
export async function getRequestDetailsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const requestId = req.params.requestId

  const result = await getRequestDetails(userId, requestId)

  if (!result.success) {
    const status = result.error === "Request not found" ? 404 : 400
    res.status(status).json({
      success: false,
      data: null,
      message: result.error || "Failed to get request",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: {
      request: result.request,
      project: result.project,
      homeowner: result.homeowner,
    },
    message: "Request retrieved successfully",
    error: null,
  })
}

/**
 * POST /api/v1/requests/:requestId/decline
 * Decline a request
 */
export async function declineRequestHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const requestId = req.params.requestId

  const result = await declineRequest(userId, requestId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to decline request",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { request: result.request },
    message: "Request declined successfully",
    error: null,
  })
}

/**
 * POST /api/v1/requests/:requestId/proposal
 * Submit proposal for a request
 */
export async function submitProposalHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const requestId = req.params.requestId
  const { scopeDescription, approach, timelineWeeks, costEstimate, costBreakdown, notes } = req.body

  if (!scopeDescription || !timelineWeeks || !costEstimate) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Scope description, timeline, and cost estimate are required",
      error: "Missing required fields",
    })
    return
  }

  const result = await submitProposal(userId, {
    requestId,
    scopeDescription,
    approach,
    timelineWeeks,
    costEstimate,
    costBreakdown,
    notes,
  })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to submit proposal",
      error: result.error,
    })
    return
  }

  res.status(201).json({
    success: true,
    data: { proposal: result.proposal },
    message: "Proposal submitted successfully",
    error: null,
  })
}
