/**
 * Requests Service
 * Business logic for project requests and proposals workflow
 *
 * Workflow:
 * 1. Homeowner sends request to designer (creates projectRequest)
 * 2. Designer reviews and submits proposal
 * 3. Homeowner accepts/rejects proposal
 * 4. If accepted, designer is assigned to project
 */

import { eq, and, desc } from "drizzle-orm"
import {
  db,
  projects,
  projectRequests,
  proposals,
  homeownerProfiles,
  designerProfiles,
  activityLogs,
  type ProjectRequest,
  type NewProjectRequest,
  type Proposal,
  type NewProposal,
} from "../../db/index.js"
import { startSeekingDesigner, assignDesigner, canTransition } from "../projects/projects.service.js"

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

async function logActivity(
  projectId: string,
  userId: string | null,
  action: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      projectId,
      userId,
      action,
      details,
    })
  } catch (error) {
    console.error("[Requests] Failed to log activity:", error)
  }
}

// ============================================================================
// REQUEST OPERATIONS (Homeowner)
// ============================================================================

export interface SendRequestData {
  projectId: string
  designerId: string
  message?: string
}

/**
 * Send request to designer (homeowner action)
 */
export async function sendRequest(
  userId: string,
  data: SendRequestData,
): Promise<{ success: boolean; request?: ProjectRequest; error?: string }> {
  try {
    // Get homeowner profile
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)

    if (homeownerList.length === 0) {
      return { success: false, error: "Homeowner profile not found" }
    }

    // Get project
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .limit(1)

    if (projectList.length === 0) {
      return { success: false, error: "Project not found" }
    }

    // Verify ownership
    if (projectList[0].homeownerId !== homeownerList[0].id) {
      return { success: false, error: "Access denied: you do not own this project" }
    }

    const project = projectList[0]

    // Check project status allows sending requests
    if (project.status !== "draft" && project.status !== "seeking_designer") {
      return { success: false, error: "Cannot send requests for this project status" }
    }

    // Verify designer exists and is verified
    const designerList = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.id, data.designerId))
      .limit(1)

    if (designerList.length === 0) {
      return { success: false, error: "Designer not found" }
    }

    if (!designerList[0].isVerified) {
      return { success: false, error: "Designer is not verified" }
    }

    // Check if request already exists
    const existingRequest = await db
      .select()
      .from(projectRequests)
      .where(
        and(
          eq(projectRequests.projectId, data.projectId),
          eq(projectRequests.designerId, data.designerId),
        ),
      )
      .limit(1)

    if (existingRequest.length > 0) {
      return { success: false, error: "Request already sent to this designer" }
    }

    // Create request
    const requestData: NewProjectRequest = {
      projectId: data.projectId,
      designerId: data.designerId,
      message: data.message,
      status: "pending",
    }

    const requestList = await db.insert(projectRequests).values(requestData).returning()

    // Transition project to seeking_designer if in draft
    if (project.status === "draft") {
      await startSeekingDesigner(data.projectId, userId)
    }

    await logActivity(data.projectId, userId, "request_sent", {
      designerId: data.designerId,
      designerName: designerList[0].name,
    })

    return { success: true, request: requestList[0] }
  } catch (error) {
    console.error("[Requests] Failed to send request:", error)
    return { success: false, error: "Failed to send request" }
  }
}

/**
 * Get requests sent by homeowner for a project
 */
export async function getProjectRequests(
  userId: string,
  projectId: string,
): Promise<{ success: boolean; requests?: ProjectRequest[]; error?: string }> {
  try {
    // Verify homeowner owns project
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)

    if (homeownerList.length === 0) {
      return { success: false, error: "Homeowner profile not found" }
    }

    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (projectList.length === 0) {
      return { success: false, error: "Project not found" }
    }

    // Verify ownership
    if (projectList[0].homeownerId !== homeownerList[0].id) {
      return { success: false, error: "Access denied: you do not own this project" }
    }

    const requests = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.projectId, projectId))
      .orderBy(desc(projectRequests.createdAt))

    return { success: true, requests }
  } catch (error) {
    console.error("[Requests] Failed to get requests:", error)
    return { success: false, error: "Failed to get requests" }
  }
}

// ============================================================================
// REQUEST OPERATIONS (Designer)
// ============================================================================

/**
 * Get requests received by designer
 */
export async function getDesignerRequests(
  userId: string,
  status?: "pending" | "proposal_submitted" | "accepted" | "rejected",
): Promise<{ success: boolean; requests?: ProjectRequest[]; error?: string }> {
  try {
    // Get designer profile
    const designerList = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.userId, userId))
      .limit(1)

    if (designerList.length === 0) {
      return { success: false, error: "Designer profile not found" }
    }

    const conditions = [eq(projectRequests.designerId, designerList[0].id)]

    if (status) {
      conditions.push(eq(projectRequests.status, status))
    }

    const requests = await db
      .select()
      .from(projectRequests)
      .where(and(...conditions))
      .orderBy(desc(projectRequests.createdAt))

    return { success: true, requests }
  } catch (error) {
    console.error("[Requests] Failed to get designer requests:", error)
    return { success: false, error: "Failed to get requests" }
  }
}

/**
 * Get request details with project info (designer view)
 */
export async function getRequestDetails(
  userId: string,
  requestId: string,
): Promise<{
  success: boolean
  request?: ProjectRequest
  project?: typeof projects.$inferSelect
  homeowner?: typeof homeownerProfiles.$inferSelect
  error?: string
}> {
  try {
    // Get designer profile
    const designerList = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.userId, userId))
      .limit(1)

    if (designerList.length === 0) {
      return { success: false, error: "Designer profile not found" }
    }

    // Get request
    const requestList = await db
      .select()
      .from(projectRequests)
      .where(
        and(
          eq(projectRequests.id, requestId),
          eq(projectRequests.designerId, designerList[0].id),
        ),
      )
      .limit(1)

    if (requestList.length === 0) {
      return { success: false, error: "Request not found" }
    }

    const request = requestList[0]

    // Get project
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, request.projectId))
      .limit(1)

    // Get homeowner
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.id, projectList[0].homeownerId))
      .limit(1)

    return {
      success: true,
      request,
      project: projectList[0],
      homeowner: homeownerList[0],
    }
  } catch (error) {
    console.error("[Requests] Failed to get request details:", error)
    return { success: false, error: "Failed to get request details" }
  }
}

/**
 * Decline a request (designer action)
 */
export async function declineRequest(
  userId: string,
  requestId: string,
): Promise<{ success: boolean; request?: ProjectRequest; error?: string }> {
  try {
    // Get designer profile
    const designerList = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.userId, userId))
      .limit(1)

    if (designerList.length === 0) {
      return { success: false, error: "Designer profile not found" }
    }

    // Get and verify request
    const requestList = await db
      .select()
      .from(projectRequests)
      .where(
        and(
          eq(projectRequests.id, requestId),
          eq(projectRequests.designerId, designerList[0].id),
        ),
      )
      .limit(1)

    if (requestList.length === 0) {
      return { success: false, error: "Request not found" }
    }

    if (requestList[0].status !== "pending") {
      return { success: false, error: "Can only decline pending requests" }
    }

    const updatedList = await db
      .update(projectRequests)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(projectRequests.id, requestId))
      .returning()

    await logActivity(requestList[0].projectId, userId, "request_declined", {
      requestId,
    })

    return { success: true, request: updatedList[0] }
  } catch (error) {
    console.error("[Requests] Failed to decline request:", error)
    return { success: false, error: "Failed to decline request" }
  }
}

// ============================================================================
// PROPOSAL OPERATIONS (Designer)
// ============================================================================

export interface SubmitProposalData {
  requestId: string
  scopeDescription: string
  approach?: string
  timelineWeeks: number
  costEstimate: number
  costBreakdown?: {
    designFees?: number
    labor?: number
    materials?: number
    other?: number
  }
  notes?: string
}

/**
 * Submit proposal for a request (designer action)
 */
export async function submitProposal(
  userId: string,
  data: SubmitProposalData,
): Promise<{ success: boolean; proposal?: Proposal; error?: string }> {
  try {
    // Get designer profile
    const designerList = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.userId, userId))
      .limit(1)

    if (designerList.length === 0) {
      return { success: false, error: "Designer profile not found" }
    }

    const designer = designerList[0]

    // Get and verify request belongs to designer
    const requestList = await db
      .select()
      .from(projectRequests)
      .where(
        and(
          eq(projectRequests.id, data.requestId),
          eq(projectRequests.designerId, designer.id),
        ),
      )
      .limit(1)

    if (requestList.length === 0) {
      return { success: false, error: "Request not found" }
    }

    const request = requestList[0]

    if (request.status !== "pending") {
      return { success: false, error: "Can only submit proposal for pending requests" }
    }

    // Check if proposal already exists
    const existingProposal = await db
      .select()
      .from(proposals)
      .where(eq(proposals.projectRequestId, data.requestId))
      .limit(1)

    if (existingProposal.length > 0) {
      return { success: false, error: "Proposal already submitted" }
    }

    // Create proposal
    const proposalData: NewProposal = {
      projectRequestId: data.requestId,
      designerId: designer.id,
      scopeDescription: data.scopeDescription,
      approach: data.approach,
      timelineWeeks: data.timelineWeeks,
      costEstimate: data.costEstimate,
      costBreakdown: data.costBreakdown,
      notes: data.notes,
      status: "submitted",
    }

    const proposalList = await db.insert(proposals).values(proposalData).returning()

    // Update request status
    await db
      .update(projectRequests)
      .set({
        status: "proposal_submitted",
        updatedAt: new Date(),
      })
      .where(eq(projectRequests.id, data.requestId))

    await logActivity(request.projectId, userId, "proposal_submitted", {
      requestId: data.requestId,
      costEstimate: data.costEstimate,
      timelineWeeks: data.timelineWeeks,
    })

    return { success: true, proposal: proposalList[0] }
  } catch (error) {
    console.error("[Requests] Failed to submit proposal:", error)
    return { success: false, error: "Failed to submit proposal" }
  }
}

/**
 * Get proposal for a request
 */
export async function getProposalByRequestId(
  requestId: string,
): Promise<Proposal | null> {
  const proposalList = await db
    .select()
    .from(proposals)
    .where(eq(proposals.projectRequestId, requestId))
    .limit(1)

  return proposalList[0] || null
}

// ============================================================================
// PROPOSAL RESPONSE (Homeowner)
// ============================================================================

/**
 * Accept proposal (homeowner action)
 * This assigns the designer to the project
 */
export async function acceptProposal(
  userId: string,
  proposalId: string,
): Promise<{ success: boolean; proposal?: Proposal; error?: string }> {
  try {
    // Get homeowner profile
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)

    if (homeownerList.length === 0) {
      return { success: false, error: "Homeowner profile not found" }
    }

    // Get proposal
    const proposalList = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, proposalId))
      .limit(1)

    if (proposalList.length === 0) {
      return { success: false, error: "Proposal not found" }
    }

    const proposal = proposalList[0]

    if (proposal.status !== "submitted") {
      return { success: false, error: "Proposal already processed" }
    }

    // Get request and project
    const requestList = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.id, proposal.projectRequestId))
      .limit(1)

    const request = requestList[0]

    // Get project
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, request.projectId))
      .limit(1)

    if (projectList.length === 0) {
      return { success: false, error: "Project not found" }
    }

    // Verify homeowner owns the project
    if (projectList[0].homeownerId !== homeownerList[0].id) {
      return { success: false, error: "Access denied: you do not own this project" }
    }

    // Update proposal status
    const updatedProposal = await db
      .update(proposals)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, proposalId))
      .returning()

    // Update request status
    await db
      .update(projectRequests)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(projectRequests.id, request.id))

    // Reject other proposals for this project
    const otherRequests = await db
      .select()
      .from(projectRequests)
      .where(
        and(
          eq(projectRequests.projectId, request.projectId),
          eq(projectRequests.status, "proposal_submitted"),
        ),
      )

    for (const otherRequest of otherRequests) {
      if (otherRequest.id !== request.id) {
        await db
          .update(projectRequests)
          .set({
            status: "rejected",
            updatedAt: new Date(),
          })
          .where(eq(projectRequests.id, otherRequest.id))

        // Reject any proposals for this request
        await db
          .update(proposals)
          .set({
            status: "rejected",
            updatedAt: new Date(),
          })
          .where(eq(proposals.projectRequestId, otherRequest.id))
      }
    }

    // Assign designer to project
    await assignDesigner(request.projectId, proposal.designerId, userId)

    await logActivity(request.projectId, userId, "proposal_accepted", {
      proposalId,
      designerId: proposal.designerId,
    })

    return { success: true, proposal: updatedProposal[0] }
  } catch (error) {
    console.error("[Requests] Failed to accept proposal:", error)
    return { success: false, error: "Failed to accept proposal" }
  }
}

/**
 * Reject proposal (homeowner action)
 */
export async function rejectProposal(
  userId: string,
  proposalId: string,
  reason?: string,
): Promise<{ success: boolean; proposal?: Proposal; error?: string }> {
  try {
    // Get homeowner profile
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)

    if (homeownerList.length === 0) {
      return { success: false, error: "Homeowner profile not found" }
    }

    // Get proposal
    const proposalList = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, proposalId))
      .limit(1)

    if (proposalList.length === 0) {
      return { success: false, error: "Proposal not found" }
    }

    const proposal = proposalList[0]

    if (proposal.status !== "submitted") {
      return { success: false, error: "Proposal already processed" }
    }

    // Get request
    const requestList = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.id, proposal.projectRequestId))
      .limit(1)

    const request = requestList[0]

    // Get project
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, request.projectId))
      .limit(1)

    if (projectList.length === 0) {
      return { success: false, error: "Project not found" }
    }

    // Verify ownership
    if (projectList[0].homeownerId !== homeownerList[0].id) {
      return { success: false, error: "Access denied: you do not own this project" }
    }

    // Update proposal status
    const updatedProposal = await db
      .update(proposals)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, proposalId))
      .returning()

    // Update request status
    await db
      .update(projectRequests)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(projectRequests.id, request.id))

    await logActivity(request.projectId, userId, "proposal_rejected", {
      proposalId,
      reason,
    })

    return { success: true, proposal: updatedProposal[0] }
  } catch (error) {
    console.error("[Requests] Failed to reject proposal:", error)
    return { success: false, error: "Failed to reject proposal" }
  }
}

/**
 * Get all proposals for a project (homeowner view)
 */
export async function getProjectProposals(
  userId: string,
  projectId: string,
): Promise<{
  success: boolean
  proposals?: Array<{
    request: ProjectRequest
    proposal: Proposal | null
    designer: typeof designerProfiles.$inferSelect
  }>
  error?: string
}> {
  try {
    // Verify homeowner owns project
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)

    if (homeownerList.length === 0) {
      return { success: false, error: "Homeowner profile not found" }
    }

    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (projectList.length === 0) {
      return { success: false, error: "Project not found" }
    }

    // Verify ownership
    if (projectList[0].homeownerId !== homeownerList[0].id) {
      return { success: false, error: "Access denied: you do not own this project" }
    }

    // Get all requests for this project
    const requests = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.projectId, projectId))
      .orderBy(desc(projectRequests.createdAt))

    const result = []

    for (const request of requests) {
      // Get designer
      const designerList = await db
        .select()
        .from(designerProfiles)
        .where(eq(designerProfiles.id, request.designerId))
        .limit(1)

      // Get proposal if exists
      const proposal = await getProposalByRequestId(request.id)

      result.push({
        request,
        proposal,
        designer: designerList[0],
      })
    }

    return { success: true, proposals: result }
  } catch (error) {
    console.error("[Requests] Failed to get project proposals:", error)
    return { success: false, error: "Failed to get proposals" }
  }
}
