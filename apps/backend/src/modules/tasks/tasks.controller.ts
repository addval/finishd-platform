/**
 * Tasks Controller
 * HTTP handlers for tasks, milestones, and cost estimates
 */

import type { Response } from "express"
import type { AuthenticatedRequest } from "../auth/auth.middleware.js"
import {
  createTask,
  getProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  createMilestone,
  getProjectMilestones,
  updateMilestoneStatus,
  updateMilestonePayment,
  updateMilestone,
  deleteMilestone,
  createCostEstimate,
  getProjectCostEstimates,
  updateCostEstimate,
  deleteCostEstimate,
  type TaskStatus,
  type MilestoneStatus,
  type PaymentStatus,
  type CostCategory,
} from "./tasks.service.js"

// ============================================================================
// TASK HANDLERS
// ============================================================================

/**
 * POST /api/v1/projects/:projectId/tasks
 * Create task for project
 */
export async function createTaskHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId
  const { title, description, assignedTo, dueDate } = req.body

  if (!title) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Title is required",
      error: "Missing required field",
    })
    return
  }

  const result = await createTask(userId, {
    projectId,
    title,
    description,
    assignedTo,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  })

  if (!result.success) {
    const status = result.error?.includes("not found") ? 404 : 400
    res.status(status).json({
      success: false,
      data: null,
      message: result.error || "Failed to create task",
      error: result.error,
    })
    return
  }

  res.status(201).json({
    success: true,
    data: { task: result.task },
    message: "Task created successfully",
    error: null,
  })
}

/**
 * GET /api/v1/projects/:projectId/tasks
 * Get tasks for project
 */
export async function getTasksHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId
  const status = req.query.status as TaskStatus | undefined

  const result = await getProjectTasks(userId, projectId, status)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get tasks",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { tasks: result.tasks },
    message: "Tasks retrieved successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/tasks/:taskId
 * Update task details
 */
export async function updateTaskHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const taskId = req.params.taskId
  const { title, description, assignedTo, dueDate } = req.body

  const result = await updateTask(userId, taskId, {
    title,
    description,
    assignedTo,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  })

  if (!result.success) {
    const status = result.error?.includes("not found") ? 404 : 400
    res.status(status).json({
      success: false,
      data: null,
      message: result.error || "Failed to update task",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { task: result.task },
    message: "Task updated successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/tasks/:taskId/status
 * Update task status
 */
export async function updateTaskStatusHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const taskId = req.params.taskId
  const { status } = req.body

  if (!status || !["todo", "in_progress", "completed"].includes(status)) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Valid status is required (todo, in_progress, completed)",
      error: "Invalid status",
    })
    return
  }

  const result = await updateTaskStatus(userId, taskId, status as TaskStatus)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to update task status",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { task: result.task },
    message: "Task status updated successfully",
    error: null,
  })
}

/**
 * DELETE /api/v1/tasks/:taskId
 * Delete task
 */
export async function deleteTaskHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const taskId = req.params.taskId

  const result = await deleteTask(userId, taskId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to delete task",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: null,
    message: "Task deleted successfully",
    error: null,
  })
}

// ============================================================================
// MILESTONE HANDLERS
// ============================================================================

/**
 * POST /api/v1/projects/:projectId/milestones
 * Create milestone for project
 */
export async function createMilestoneHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId
  const { title, description, targetDate, paymentAmount } = req.body

  if (!title) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Title is required",
      error: "Missing required field",
    })
    return
  }

  const result = await createMilestone(userId, {
    projectId,
    title,
    description,
    targetDate: targetDate ? new Date(targetDate) : undefined,
    paymentAmount,
  })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to create milestone",
      error: result.error,
    })
    return
  }

  res.status(201).json({
    success: true,
    data: { milestone: result.milestone },
    message: "Milestone created successfully",
    error: null,
  })
}

/**
 * GET /api/v1/projects/:projectId/milestones
 * Get milestones for project
 */
export async function getMilestonesHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId

  const result = await getProjectMilestones(userId, projectId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get milestones",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { milestones: result.milestones },
    message: "Milestones retrieved successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/milestones/:milestoneId
 * Update milestone details
 */
export async function updateMilestoneHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const milestoneId = req.params.milestoneId
  const { title, description, targetDate, paymentAmount } = req.body

  const result = await updateMilestone(userId, milestoneId, {
    title,
    description,
    targetDate: targetDate ? new Date(targetDate) : undefined,
    paymentAmount,
  })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to update milestone",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { milestone: result.milestone },
    message: "Milestone updated successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/milestones/:milestoneId/status
 * Update milestone status
 */
export async function updateMilestoneStatusHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const milestoneId = req.params.milestoneId
  const { status } = req.body

  if (!status || !["pending", "completed"].includes(status)) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Valid status is required (pending, completed)",
      error: "Invalid status",
    })
    return
  }

  const result = await updateMilestoneStatus(userId, milestoneId, status as MilestoneStatus)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to update milestone status",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { milestone: result.milestone },
    message: "Milestone status updated successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/milestones/:milestoneId/payment
 * Update milestone payment status (homeowner only)
 */
export async function updateMilestonePaymentHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const milestoneId = req.params.milestoneId
  const { paymentStatus } = req.body

  if (!paymentStatus || !["not_paid", "paid"].includes(paymentStatus)) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Valid payment status is required (not_paid, paid)",
      error: "Invalid payment status",
    })
    return
  }

  const result = await updateMilestonePayment(userId, milestoneId, paymentStatus as PaymentStatus)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to update payment status",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { milestone: result.milestone },
    message: "Payment status updated successfully",
    error: null,
  })
}

/**
 * DELETE /api/v1/milestones/:milestoneId
 * Delete milestone
 */
export async function deleteMilestoneHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const milestoneId = req.params.milestoneId

  const result = await deleteMilestone(userId, milestoneId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to delete milestone",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: null,
    message: "Milestone deleted successfully",
    error: null,
  })
}

// ============================================================================
// COST ESTIMATE HANDLERS
// ============================================================================

/**
 * POST /api/v1/projects/:projectId/costs
 * Create cost estimate
 */
export async function createCostEstimateHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId
  const { category, description, estimatedAmount, actualAmount } = req.body

  if (!category || !description || estimatedAmount === undefined) {
    res.status(400).json({
      success: false,
      data: null,
      message: "Category, description, and estimated amount are required",
      error: "Missing required fields",
    })
    return
  }

  const validCategories = ["design_fees", "labor", "materials", "miscellaneous"]
  if (!validCategories.includes(category)) {
    res.status(400).json({
      success: false,
      data: null,
      message: `Category must be one of: ${validCategories.join(", ")}`,
      error: "Invalid category",
    })
    return
  }

  const result = await createCostEstimate(userId, {
    projectId,
    category: category as CostCategory,
    description,
    estimatedAmount,
    actualAmount,
  })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to create cost estimate",
      error: result.error,
    })
    return
  }

  res.status(201).json({
    success: true,
    data: { costEstimate: result.costEstimate },
    message: "Cost estimate created successfully",
    error: null,
  })
}

/**
 * GET /api/v1/projects/:projectId/costs
 * Get cost estimates for project with summary
 */
export async function getCostEstimatesHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const projectId = req.params.projectId

  const result = await getProjectCostEstimates(userId, projectId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to get cost estimates",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: {
      costEstimates: result.costEstimates,
      summary: result.summary,
    },
    message: "Cost estimates retrieved successfully",
    error: null,
  })
}

/**
 * PATCH /api/v1/costs/:costEstimateId
 * Update cost estimate
 */
export async function updateCostEstimateHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const costEstimateId = req.params.costEstimateId
  const { description, estimatedAmount, actualAmount } = req.body

  const result = await updateCostEstimate(userId, costEstimateId, {
    description,
    estimatedAmount,
    actualAmount,
  })

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to update cost estimate",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: { costEstimate: result.costEstimate },
    message: "Cost estimate updated successfully",
    error: null,
  })
}

/**
 * DELETE /api/v1/costs/:costEstimateId
 * Delete cost estimate
 */
export async function deleteCostEstimateHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = req.user!.id
  const costEstimateId = req.params.costEstimateId

  const result = await deleteCostEstimate(userId, costEstimateId)

  if (!result.success) {
    res.status(400).json({
      success: false,
      data: null,
      message: result.error || "Failed to delete cost estimate",
      error: result.error,
    })
    return
  }

  res.status(200).json({
    success: true,
    data: null,
    message: "Cost estimate deleted successfully",
    error: null,
  })
}
