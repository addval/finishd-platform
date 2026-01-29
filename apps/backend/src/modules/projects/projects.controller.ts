/**
 * Projects Controller
 * HTTP handlers for project endpoints
 */

import type { Response } from "express"
import type { AuthenticatedRequest } from "../auth/auth.middleware.js"
import {
  getProjectById,
  getHomeownerProjects,
  getDesignerProjects,
  createProject,
  updateProject,
  cancelProject,
  completeProject,
  getProjectActivity,
  type ProjectStatus,
} from "./projects.service.js"
import { getDesignerProfileByUserId } from "../designers/designers.service.js"

/**
 * GET /api/v1/projects
 * List projects for current user (homeowner view)
 */
export async function listProjectsHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const status = req.query.status as ProjectStatus | undefined

  const result = await getHomeownerProjects(userId, status)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to list projects",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { projects: result.projects },
    message: "Projects retrieved successfully",
    error: null,
  })
}

/**
 * GET /api/v1/projects/designer
 * List projects for designer (assigned projects)
 */
export async function listDesignerProjectsHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const status = req.query.status as ProjectStatus | undefined

  // Get designer profile
  const designer = await getDesignerProfileByUserId(userId)
  if (!designer) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Designer profile not found",
      error: "Designer profile not found",
    })
    return
  }

  const result = await getDesignerProjects(designer.id, status)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to list projects",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { projects: result.projects },
    message: "Projects retrieved successfully",
    error: null,
  })
}

/**
 * GET /api/v1/projects/:id
 * Get single project by ID
 */
export async function getProjectHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.id

  const result = await getProjectById(projectId, userId)

  if (!result.success) {
    const status = result.error === "Project not found" ? 404 : 403
    res.status(status).json({
      success: false,
      data: null,
      message: result.error || "Failed to get project",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { project: result.project },
    message: "Project retrieved successfully",
    error: null,
  })
}

/**
 * POST /api/v1/projects
 * Create new project
 */
export async function createProjectHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const { title, scope, propertyId, scopeDetails, budgetMin, budgetMax, timelineWeeks, startTimeline } =
    req.body

  if (!title || !scope) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Title and scope are required",
      error: "Missing required fields",
    })
    return
  }

  if (!["full_home", "partial"].includes(scope)) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Scope must be 'full_home' or 'partial'",
      error: "Invalid scope value",
    })
    return
  }

  const result = await createProject(userId, {
    title,
    scope,
    propertyId,
    scopeDetails,
    budgetMin,
    budgetMax,
    timelineWeeks,
    startTimeline,
  })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to create project",
      error: result.error,
    })
    return
  }

  res.status(201).json({
    success: true,
    data: { project: result.project },
    message: "Project created successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/projects/:id
 * Update project (draft only)
 */
export async function updateProjectHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.id
  const { title, scope, propertyId, scopeDetails, budgetMin, budgetMax, timelineWeeks, startTimeline } =
    req.body

  if (scope && !["full_home", "partial"].includes(scope)) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Scope must be 'full_home' or 'partial'",
      error: "Invalid scope value",
    })
    return
  }

  const result = await updateProject(projectId, userId, {
    title,
    scope,
    propertyId,
    scopeDetails,
    budgetMin,
    budgetMax,
    timelineWeeks,
    startTimeline,
  })

  if (!result.success) {
    const status = result.error?.includes("not found") ? 404 : 400
    res.status(status).json({
      success: false,
      data: null,
      message: result.error || "Failed to update project",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { project: result.project },
    message: "Project updated successfully",
    error: null,
  })
}

/**
 * POST /api/v1/projects/:id/complete
 * Mark project as completed
 */
export async function completeProjectHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.id

  const result = await completeProject(projectId, userId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to complete project",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { project: result.project },
    message: "Project completed successfully",
    error: null,
  })
}

/**
 * POST /api/v1/projects/:id/cancel
 * Cancel project
 */
export async function cancelProjectHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.id
  const { reason } = req.body

  const result = await cancelProject(projectId, userId, reason)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to cancel project",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { project: result.project },
    message: "Project cancelled successfully",
    error: null,
  })
}

/**
 * GET /api/v1/projects/:id/activity
 * Get project activity log
 */
export async function getProjectActivityHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.id
  const limit = Math.min(Number.parseInt(req.query.limit as string) || 50, 100)

  const result = await getProjectActivity(projectId, userId, limit)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get activity",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { activities: result.activities },
    message: "Activity retrieved successfully",
    error: null,
  })
}
