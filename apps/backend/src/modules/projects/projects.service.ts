/**
 * Projects Service
 * Business logic for project management with state machine
 */

import { eq, and, desc } from "drizzle-orm"
import {
  db,
  projects,
  homeownerProfiles,
  properties,
  activityLogs,
  type Project,
  type NewProject,
} from "../../db/index.js"

// ============================================================================
// PROJECT STATE MACHINE
// ============================================================================

/**
 * Valid project status transitions
 * - draft → seeking_designer (when first request sent)
 * - seeking_designer → in_progress (when proposal accepted)
 * - in_progress → completed (when project finished)
 * - Any → cancelled (homeowner can cancel anytime)
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["seeking_designer", "cancelled"],
  seeking_designer: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
}

export function canTransition(currentStatus: string, newStatus: string): boolean {
  const validNext = VALID_TRANSITIONS[currentStatus] || []
  return validNext.includes(newStatus)
}

export type ProjectStatus = "draft" | "seeking_designer" | "in_progress" | "completed" | "cancelled"

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
    console.error("[Projects] Failed to log activity:", error)
  }
}

// ============================================================================
// PROJECT CRUD
// ============================================================================

/**
 * Get project by ID with access control
 */
export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (projectList.length === 0) {
      return { success: false, error: "Project not found" }
    }

    const project = projectList[0]

    // Get homeowner profile to check ownership
    const homeownerList = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)

    // Check access: homeowner owns project OR designer assigned
    const isOwner = homeownerList[0]?.id === project.homeownerId
    const isDesigner = project.designerId !== null // TODO: check if user is the assigned designer

    if (!isOwner && !isDesigner) {
      return { success: false, error: "Access denied" }
    }

    return { success: true, project }
  } catch (error) {
    console.error("[Projects] Failed to get project:", error)
    return { success: false, error: "Failed to get project" }
  }
}

/**
 * List projects for homeowner
 */
export async function getHomeownerProjects(
  userId: string,
  status?: ProjectStatus,
): Promise<{ success: boolean; projects?: Project[]; error?: string }> {
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

    const conditions = [eq(projects.homeownerId, homeownerList[0].id)]

    if (status) {
      conditions.push(eq(projects.status, status))
    }

    const projectList = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt))

    return { success: true, projects: projectList }
  } catch (error) {
    console.error("[Projects] Failed to list projects:", error)
    return { success: false, error: "Failed to list projects" }
  }
}

/**
 * List projects for designer (assigned projects only)
 */
export async function getDesignerProjects(
  designerProfileId: string,
  status?: ProjectStatus,
): Promise<{ success: boolean; projects?: Project[]; error?: string }> {
  try {
    const conditions = [eq(projects.designerId, designerProfileId)]

    if (status) {
      conditions.push(eq(projects.status, status))
    }

    const projectList = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt))

    return { success: true, projects: projectList }
  } catch (error) {
    console.error("[Projects] Failed to list designer projects:", error)
    return { success: false, error: "Failed to list projects" }
  }
}

export interface CreateProjectData {
  title: string
  scope: "full_home" | "partial"
  propertyId?: string
  scopeDetails?: {
    rooms?: string[]
    areas?: string[]
    notes?: string
  }
  budgetMin?: number
  budgetMax?: number
  timelineWeeks?: number
  startTimeline?: string
}

/**
 * Create new project (homeowner only)
 */
export async function createProject(
  userId: string,
  data: CreateProjectData,
): Promise<{ success: boolean; project?: Project; error?: string }> {
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

    const homeowner = homeownerList[0]

    // Verify property belongs to homeowner if specified
    if (data.propertyId) {
      const propertyList = await db
        .select()
        .from(properties)
        .where(
          and(eq(properties.id, data.propertyId), eq(properties.homeownerId, homeowner.id)),
        )
        .limit(1)

      if (propertyList.length === 0) {
        return { success: false, error: "Property not found or does not belong to you" }
      }
    }

    const projectData: NewProject = {
      homeownerId: homeowner.id,
      propertyId: data.propertyId,
      title: data.title,
      scope: data.scope,
      scopeDetails: data.scopeDetails,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      timelineWeeks: data.timelineWeeks,
      startTimeline: data.startTimeline,
      status: "draft",
    }

    const projectList = await db.insert(projects).values(projectData).returning()

    // Log activity
    await logActivity(projectList[0].id, userId, "project_created", {
      title: data.title,
      scope: data.scope,
    })

    return { success: true, project: projectList[0] }
  } catch (error) {
    console.error("[Projects] Failed to create project:", error)
    return { success: false, error: "Failed to create project" }
  }
}

export interface UpdateProjectData {
  title?: string
  scope?: "full_home" | "partial"
  propertyId?: string
  scopeDetails?: {
    rooms?: string[]
    areas?: string[]
    notes?: string
  }
  budgetMin?: number
  budgetMax?: number
  timelineWeeks?: number
  startTimeline?: string
}

/**
 * Update project (homeowner only, draft status only)
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectData,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    // Get project and verify ownership
    const result = await getProjectById(projectId, userId)
    if (!result.success || !result.project) {
      return result
    }

    const project = result.project

    // Only allow updates in draft status
    if (project.status !== "draft") {
      return { success: false, error: "Can only update projects in draft status" }
    }

    // Verify property belongs to homeowner if specified
    if (data.propertyId) {
      const homeownerList = await db
        .select()
        .from(homeownerProfiles)
        .where(eq(homeownerProfiles.userId, userId))
        .limit(1)

      const propertyList = await db
        .select()
        .from(properties)
        .where(
          and(eq(properties.id, data.propertyId), eq(properties.homeownerId, homeownerList[0].id)),
        )
        .limit(1)

      if (propertyList.length === 0) {
        return { success: false, error: "Property not found or does not belong to you" }
      }
    }

    const projectList = await db
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning()

    await logActivity(projectId, userId, "project_updated", data)

    return { success: true, project: projectList[0] }
  } catch (error) {
    console.error("[Projects] Failed to update project:", error)
    return { success: false, error: "Failed to update project" }
  }
}

// ============================================================================
// PROJECT STATE TRANSITIONS
// ============================================================================

/**
 * Transition project to seeking_designer status
 * Called when homeowner sends first request to a designer
 */
export async function startSeekingDesigner(
  projectId: string,
  userId: string,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const result = await getProjectById(projectId, userId)
    if (!result.success || !result.project) {
      return result
    }

    if (!canTransition(result.project.status, "seeking_designer")) {
      return {
        success: false,
        error: `Cannot transition from ${result.project.status} to seeking_designer`,
      }
    }

    const projectList = await db
      .update(projects)
      .set({
        status: "seeking_designer",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning()

    await logActivity(projectId, userId, "status_changed", {
      from: result.project.status,
      to: "seeking_designer",
    })

    return { success: true, project: projectList[0] }
  } catch (error) {
    console.error("[Projects] Failed to start seeking designer:", error)
    return { success: false, error: "Failed to update project status" }
  }
}

/**
 * Assign designer and transition to in_progress
 * Called when homeowner accepts a proposal
 */
export async function assignDesigner(
  projectId: string,
  designerProfileId: string,
  userId: string,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const result = await getProjectById(projectId, userId)
    if (!result.success || !result.project) {
      return result
    }

    if (!canTransition(result.project.status, "in_progress")) {
      return {
        success: false,
        error: `Cannot transition from ${result.project.status} to in_progress`,
      }
    }

    const projectList = await db
      .update(projects)
      .set({
        designerId: designerProfileId,
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning()

    await logActivity(projectId, userId, "designer_assigned", {
      designerId: designerProfileId,
    })

    await logActivity(projectId, userId, "status_changed", {
      from: result.project.status,
      to: "in_progress",
    })

    return { success: true, project: projectList[0] }
  } catch (error) {
    console.error("[Projects] Failed to assign designer:", error)
    return { success: false, error: "Failed to assign designer" }
  }
}

/**
 * Mark project as completed
 */
export async function completeProject(
  projectId: string,
  userId: string,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const result = await getProjectById(projectId, userId)
    if (!result.success || !result.project) {
      return result
    }

    if (!canTransition(result.project.status, "completed")) {
      return {
        success: false,
        error: `Cannot transition from ${result.project.status} to completed`,
      }
    }

    const projectList = await db
      .update(projects)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning()

    await logActivity(projectId, userId, "status_changed", {
      from: result.project.status,
      to: "completed",
    })

    return { success: true, project: projectList[0] }
  } catch (error) {
    console.error("[Projects] Failed to complete project:", error)
    return { success: false, error: "Failed to complete project" }
  }
}

/**
 * Cancel project
 */
export async function cancelProject(
  projectId: string,
  userId: string,
  reason?: string,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const result = await getProjectById(projectId, userId)
    if (!result.success || !result.project) {
      return result
    }

    if (!canTransition(result.project.status, "cancelled")) {
      return {
        success: false,
        error: `Cannot cancel project in ${result.project.status} status`,
      }
    }

    const projectList = await db
      .update(projects)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning()

    await logActivity(projectId, userId, "project_cancelled", {
      reason,
      previousStatus: result.project.status,
    })

    return { success: true, project: projectList[0] }
  } catch (error) {
    console.error("[Projects] Failed to cancel project:", error)
    return { success: false, error: "Failed to cancel project" }
  }
}

// ============================================================================
// ACTIVITY RETRIEVAL
// ============================================================================

export async function getProjectActivity(
  projectId: string,
  userId: string,
  limit = 50,
): Promise<{
  success: boolean
  activities?: Array<{
    id: string
    action: string
    details: Record<string, unknown> | null
    createdAt: Date
  }>
  error?: string
}> {
  try {
    // Verify access
    const result = await getProjectById(projectId, userId)
    if (!result.success) {
      return result
    }

    const activities = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.projectId, projectId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)

    return { success: true, activities }
  } catch (error) {
    console.error("[Projects] Failed to get activity:", error)
    return { success: false, error: "Failed to get activity" }
  }
}
