/**
 * Tasks Service
 * Business logic for project tasks, milestones, and cost estimates
 */

import { eq, and, desc, asc } from "drizzle-orm"
import {
  db,
  projects,
  tasks,
  milestones,
  costEstimates,
  homeownerProfiles,
  designerProfiles,
  activityLogs,
  type Task,
  type NewTask,
  type Milestone,
  type NewMilestone,
  type CostEstimate,
  type NewCostEstimate,
} from "../../db/index.js"

// ============================================================================
// ACCESS CONTROL
// ============================================================================

/**
 * Check if user has access to project (homeowner or assigned designer)
 */
async function verifyProjectAccess(
  projectId: string,
  userId: string,
): Promise<{ hasAccess: boolean; role?: "homeowner" | "designer"; error?: string }> {
  // Get project
  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (projectList.length === 0) {
    return { hasAccess: false, error: "Project not found" }
  }

  const project = projectList[0]

  // Check if user is homeowner
  const homeownerList = await db
    .select()
    .from(homeownerProfiles)
    .where(eq(homeownerProfiles.userId, userId))
    .limit(1)

  if (homeownerList.length > 0 && homeownerList[0].id === project.homeownerId) {
    return { hasAccess: true, role: "homeowner" }
  }

  // Check if user is assigned designer
  if (project.designerId) {
    const designerList = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.userId, userId))
      .limit(1)

    if (designerList.length > 0 && designerList[0].id === project.designerId) {
      return { hasAccess: true, role: "designer" }
    }
  }

  return { hasAccess: false, error: "Access denied" }
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

async function logActivity(
  projectId: string,
  userId: string,
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
    console.error("[Tasks] Failed to log activity:", error)
  }
}

// ============================================================================
// TASK OPERATIONS
// ============================================================================

export type TaskStatus = "todo" | "in_progress" | "completed"

export interface CreateTaskData {
  projectId: string
  title: string
  description?: string
  assignedTo?: string
  dueDate?: Date
}

/**
 * Create task for project
 */
export async function createTask(
  userId: string,
  data: CreateTaskData,
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const access = await verifyProjectAccess(data.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const taskData: NewTask = {
      projectId: data.projectId,
      createdBy: userId,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      status: "todo",
    }

    const taskList = await db.insert(tasks).values(taskData).returning()

    await logActivity(data.projectId, userId, "task_created", {
      taskId: taskList[0].id,
      title: data.title,
    })

    return { success: true, task: taskList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to create task:", error)
    return { success: false, error: "Failed to create task" }
  }
}

/**
 * Get tasks for project
 */
export async function getProjectTasks(
  userId: string,
  projectId: string,
  status?: TaskStatus,
): Promise<{ success: boolean; tasks?: Task[]; error?: string }> {
  try {
    const access = await verifyProjectAccess(projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const conditions = [eq(tasks.projectId, projectId)]
    if (status) {
      conditions.push(eq(tasks.status, status))
    }

    const taskList = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt))

    return { success: true, tasks: taskList }
  } catch (error) {
    console.error("[Tasks] Failed to get tasks:", error)
    return { success: false, error: "Failed to get tasks" }
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: TaskStatus,
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    // Get task
    const taskList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (taskList.length === 0) {
      return { success: false, error: "Task not found" }
    }

    const task = taskList[0]

    const access = await verifyProjectAccess(task.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const updateData: Partial<Task> = {
      status,
      updatedAt: new Date(),
    }

    if (status === "completed") {
      updateData.completedAt = new Date()
    }

    const updatedList = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning()

    await logActivity(task.projectId, userId, "task_status_changed", {
      taskId,
      from: task.status,
      to: status,
    })

    return { success: true, task: updatedList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to update task:", error)
    return { success: false, error: "Failed to update task" }
  }
}

/**
 * Update task details
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<Pick<Task, "title" | "description" | "assignedTo" | "dueDate">>,
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const taskList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (taskList.length === 0) {
      return { success: false, error: "Task not found" }
    }

    const task = taskList[0]

    const access = await verifyProjectAccess(task.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const updatedList = await db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning()

    await logActivity(task.projectId, userId, "task_updated", {
      taskId,
      changes: data,
    })

    return { success: true, task: updatedList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to update task:", error)
    return { success: false, error: "Failed to update task" }
  }
}

/**
 * Delete task
 */
export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const taskList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)

    if (taskList.length === 0) {
      return { success: false, error: "Task not found" }
    }

    const task = taskList[0]

    const access = await verifyProjectAccess(task.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    await db.delete(tasks).where(eq(tasks.id, taskId))

    await logActivity(task.projectId, userId, "task_deleted", {
      taskId,
      title: task.title,
    })

    return { success: true }
  } catch (error) {
    console.error("[Tasks] Failed to delete task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

// ============================================================================
// MILESTONE OPERATIONS
// ============================================================================

export type MilestoneStatus = "pending" | "completed"
export type PaymentStatus = "not_paid" | "paid"

export interface CreateMilestoneData {
  projectId: string
  title: string
  description?: string
  targetDate?: Date
  paymentAmount?: number
}

/**
 * Create milestone for project
 */
export async function createMilestone(
  userId: string,
  data: CreateMilestoneData,
): Promise<{ success: boolean; milestone?: Milestone; error?: string }> {
  try {
    const access = await verifyProjectAccess(data.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    // Get next order index
    const existingMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, data.projectId))

    const orderIndex = existingMilestones.length

    const milestoneData: NewMilestone = {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      targetDate: data.targetDate,
      paymentAmount: data.paymentAmount,
      orderIndex,
      status: "pending",
      paymentStatus: "not_paid",
    }

    const milestoneList = await db.insert(milestones).values(milestoneData).returning()

    await logActivity(data.projectId, userId, "milestone_created", {
      milestoneId: milestoneList[0].id,
      title: data.title,
    })

    return { success: true, milestone: milestoneList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to create milestone:", error)
    return { success: false, error: "Failed to create milestone" }
  }
}

/**
 * Get milestones for project
 */
export async function getProjectMilestones(
  userId: string,
  projectId: string,
): Promise<{ success: boolean; milestones?: Milestone[]; error?: string }> {
  try {
    const access = await verifyProjectAccess(projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const milestoneList = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(asc(milestones.orderIndex))

    return { success: true, milestones: milestoneList }
  } catch (error) {
    console.error("[Tasks] Failed to get milestones:", error)
    return { success: false, error: "Failed to get milestones" }
  }
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
  userId: string,
  milestoneId: string,
  status: MilestoneStatus,
): Promise<{ success: boolean; milestone?: Milestone; error?: string }> {
  try {
    const milestoneList = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, milestoneId))
      .limit(1)

    if (milestoneList.length === 0) {
      return { success: false, error: "Milestone not found" }
    }

    const milestone = milestoneList[0]

    const access = await verifyProjectAccess(milestone.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const updateData: Partial<Milestone> = {
      status,
      updatedAt: new Date(),
    }

    if (status === "completed") {
      updateData.completedAt = new Date()
    }

    const updatedList = await db
      .update(milestones)
      .set(updateData)
      .where(eq(milestones.id, milestoneId))
      .returning()

    await logActivity(milestone.projectId, userId, "milestone_status_changed", {
      milestoneId,
      from: milestone.status,
      to: status,
    })

    return { success: true, milestone: updatedList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to update milestone:", error)
    return { success: false, error: "Failed to update milestone" }
  }
}

/**
 * Update milestone payment status (homeowner only)
 */
export async function updateMilestonePayment(
  userId: string,
  milestoneId: string,
  paymentStatus: PaymentStatus,
): Promise<{ success: boolean; milestone?: Milestone; error?: string }> {
  try {
    const milestoneList = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, milestoneId))
      .limit(1)

    if (milestoneList.length === 0) {
      return { success: false, error: "Milestone not found" }
    }

    const milestone = milestoneList[0]

    const access = await verifyProjectAccess(milestone.projectId, userId)
    if (!access.hasAccess || access.role !== "homeowner") {
      return { success: false, error: "Only homeowner can update payment status" }
    }

    const updateData: Partial<Milestone> = {
      paymentStatus,
      updatedAt: new Date(),
    }

    if (paymentStatus === "paid") {
      updateData.paidAt = new Date()
    }

    const updatedList = await db
      .update(milestones)
      .set(updateData)
      .where(eq(milestones.id, milestoneId))
      .returning()

    await logActivity(milestone.projectId, userId, "payment_status_changed", {
      milestoneId,
      paymentStatus,
      amount: milestone.paymentAmount,
    })

    return { success: true, milestone: updatedList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to update milestone payment:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}

/**
 * Update milestone details
 */
export async function updateMilestone(
  userId: string,
  milestoneId: string,
  data: Partial<Pick<Milestone, "title" | "description" | "targetDate" | "paymentAmount">>,
): Promise<{ success: boolean; milestone?: Milestone; error?: string }> {
  try {
    const milestoneList = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, milestoneId))
      .limit(1)

    if (milestoneList.length === 0) {
      return { success: false, error: "Milestone not found" }
    }

    const milestone = milestoneList[0]

    const access = await verifyProjectAccess(milestone.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const updatedList = await db
      .update(milestones)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, milestoneId))
      .returning()

    return { success: true, milestone: updatedList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to update milestone:", error)
    return { success: false, error: "Failed to update milestone" }
  }
}

/**
 * Delete milestone
 */
export async function deleteMilestone(
  userId: string,
  milestoneId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const milestoneList = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, milestoneId))
      .limit(1)

    if (milestoneList.length === 0) {
      return { success: false, error: "Milestone not found" }
    }

    const milestone = milestoneList[0]

    const access = await verifyProjectAccess(milestone.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    await db.delete(milestones).where(eq(milestones.id, milestoneId))

    await logActivity(milestone.projectId, userId, "milestone_deleted", {
      milestoneId,
      title: milestone.title,
    })

    return { success: true }
  } catch (error) {
    console.error("[Tasks] Failed to delete milestone:", error)
    return { success: false, error: "Failed to delete milestone" }
  }
}

// ============================================================================
// COST ESTIMATE OPERATIONS
// ============================================================================

export type CostCategory = "design_fees" | "labor" | "materials" | "miscellaneous"

export interface CreateCostEstimateData {
  projectId: string
  category: CostCategory
  description: string
  estimatedAmount: number
  actualAmount?: number
}

/**
 * Create cost estimate
 */
export async function createCostEstimate(
  userId: string,
  data: CreateCostEstimateData,
): Promise<{ success: boolean; costEstimate?: CostEstimate; error?: string }> {
  try {
    const access = await verifyProjectAccess(data.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const costData: NewCostEstimate = {
      projectId: data.projectId,
      category: data.category,
      description: data.description,
      estimatedAmount: data.estimatedAmount,
      actualAmount: data.actualAmount,
    }

    const costList = await db.insert(costEstimates).values(costData).returning()

    await logActivity(data.projectId, userId, "cost_estimate_added", {
      category: data.category,
      estimatedAmount: data.estimatedAmount,
    })

    return { success: true, costEstimate: costList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to create cost estimate:", error)
    return { success: false, error: "Failed to create cost estimate" }
  }
}

/**
 * Get cost estimates for project
 */
export async function getProjectCostEstimates(
  userId: string,
  projectId: string,
): Promise<{
  success: boolean
  costEstimates?: CostEstimate[]
  summary?: {
    totalEstimated: number
    totalActual: number
    byCategory: Record<CostCategory, { estimated: number; actual: number }>
  }
  error?: string
}> {
  try {
    const access = await verifyProjectAccess(projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const costs = await db
      .select()
      .from(costEstimates)
      .where(eq(costEstimates.projectId, projectId))
      .orderBy(desc(costEstimates.createdAt))

    // Calculate summary
    const summary = {
      totalEstimated: 0,
      totalActual: 0,
      byCategory: {
        design_fees: { estimated: 0, actual: 0 },
        labor: { estimated: 0, actual: 0 },
        materials: { estimated: 0, actual: 0 },
        miscellaneous: { estimated: 0, actual: 0 },
      } as Record<CostCategory, { estimated: number; actual: number }>,
    }

    for (const cost of costs) {
      summary.totalEstimated += cost.estimatedAmount
      summary.totalActual += cost.actualAmount || 0
      summary.byCategory[cost.category as CostCategory].estimated += cost.estimatedAmount
      summary.byCategory[cost.category as CostCategory].actual += cost.actualAmount || 0
    }

    return { success: true, costEstimates: costs, summary }
  } catch (error) {
    console.error("[Tasks] Failed to get cost estimates:", error)
    return { success: false, error: "Failed to get cost estimates" }
  }
}

/**
 * Update cost estimate
 */
export async function updateCostEstimate(
  userId: string,
  costEstimateId: string,
  data: Partial<Pick<CostEstimate, "description" | "estimatedAmount" | "actualAmount">>,
): Promise<{ success: boolean; costEstimate?: CostEstimate; error?: string }> {
  try {
    const costList = await db
      .select()
      .from(costEstimates)
      .where(eq(costEstimates.id, costEstimateId))
      .limit(1)

    if (costList.length === 0) {
      return { success: false, error: "Cost estimate not found" }
    }

    const cost = costList[0]

    const access = await verifyProjectAccess(cost.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    const updatedList = await db
      .update(costEstimates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(costEstimates.id, costEstimateId))
      .returning()

    await logActivity(cost.projectId, userId, "cost_estimate_updated", {
      costEstimateId,
      changes: data,
    })

    return { success: true, costEstimate: updatedList[0] }
  } catch (error) {
    console.error("[Tasks] Failed to update cost estimate:", error)
    return { success: false, error: "Failed to update cost estimate" }
  }
}

/**
 * Delete cost estimate
 */
export async function deleteCostEstimate(
  userId: string,
  costEstimateId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const costList = await db
      .select()
      .from(costEstimates)
      .where(eq(costEstimates.id, costEstimateId))
      .limit(1)

    if (costList.length === 0) {
      return { success: false, error: "Cost estimate not found" }
    }

    const cost = costList[0]

    const access = await verifyProjectAccess(cost.projectId, userId)
    if (!access.hasAccess) {
      return { success: false, error: access.error }
    }

    await db.delete(costEstimates).where(eq(costEstimates.id, costEstimateId))

    await logActivity(cost.projectId, userId, "cost_estimate_deleted", {
      costEstimateId,
      category: cost.category,
    })

    return { success: true }
  } catch (error) {
    console.error("[Tasks] Failed to delete cost estimate:", error)
    return { success: false, error: "Failed to delete cost estimate" }
  }
}
