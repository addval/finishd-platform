/**
 * Tasks Routes
 * API endpoints for tasks, milestones, and cost estimates
 */

import { Router } from "express"
import { authMiddleware } from "../auth/auth.middleware.js"
import {
  createTaskHandler,
  getTasksHandler,
  updateTaskHandler,
  updateTaskStatusHandler,
  deleteTaskHandler,
  createMilestoneHandler,
  getMilestonesHandler,
  updateMilestoneHandler,
  updateMilestoneStatusHandler,
  updateMilestonePaymentHandler,
  deleteMilestoneHandler,
  createCostEstimateHandler,
  getCostEstimatesHandler,
  updateCostEstimateHandler,
  deleteCostEstimateHandler,
} from "./tasks.controller.js"

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// ============================================================================
// TASK ROUTES (nested under projects)
// ============================================================================

// POST /api/v1/projects/:projectId/tasks - Create task
router.post("/projects/:projectId/tasks", createTaskHandler)

// GET /api/v1/projects/:projectId/tasks - Get tasks for project
router.get("/projects/:projectId/tasks", getTasksHandler)

// PATCH /api/v1/tasks/:taskId - Update task details
router.patch("/tasks/:taskId", updateTaskHandler)

// PATCH /api/v1/tasks/:taskId/status - Update task status
router.patch("/tasks/:taskId/status", updateTaskStatusHandler)

// DELETE /api/v1/tasks/:taskId - Delete task
router.delete("/tasks/:taskId", deleteTaskHandler)

// ============================================================================
// MILESTONE ROUTES (nested under projects)
// ============================================================================

// POST /api/v1/projects/:projectId/milestones - Create milestone
router.post("/projects/:projectId/milestones", createMilestoneHandler)

// GET /api/v1/projects/:projectId/milestones - Get milestones for project
router.get("/projects/:projectId/milestones", getMilestonesHandler)

// PATCH /api/v1/milestones/:milestoneId - Update milestone details
router.patch("/milestones/:milestoneId", updateMilestoneHandler)

// PATCH /api/v1/milestones/:milestoneId/status - Update milestone status
router.patch("/milestones/:milestoneId/status", updateMilestoneStatusHandler)

// PATCH /api/v1/milestones/:milestoneId/payment - Update payment status
router.patch("/milestones/:milestoneId/payment", updateMilestonePaymentHandler)

// DELETE /api/v1/milestones/:milestoneId - Delete milestone
router.delete("/milestones/:milestoneId", deleteMilestoneHandler)

// ============================================================================
// COST ESTIMATE ROUTES (nested under projects)
// ============================================================================

// POST /api/v1/projects/:projectId/costs - Create cost estimate
router.post("/projects/:projectId/costs", createCostEstimateHandler)

// GET /api/v1/projects/:projectId/costs - Get cost estimates for project
router.get("/projects/:projectId/costs", getCostEstimatesHandler)

// PATCH /api/v1/costs/:costEstimateId - Update cost estimate
router.patch("/costs/:costEstimateId", updateCostEstimateHandler)

// DELETE /api/v1/costs/:costEstimateId - Delete cost estimate
router.delete("/costs/:costEstimateId", deleteCostEstimateHandler)

export default router
