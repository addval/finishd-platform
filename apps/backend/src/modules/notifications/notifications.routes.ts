/**
 * Notifications Routes
 * API endpoints for user notifications
 */

import { Router } from "express"
import { authMiddleware } from "../auth/auth.middleware.js"
import {
  getNotificationsHandler,
  markNotificationReadHandler,
  markAllReadHandler,
} from "./notifications.controller.js"

const router = Router()

// All notification routes require authentication
router.use(authMiddleware)

// GET /api/v1/notifications - Get all notifications for user
router.get("/", getNotificationsHandler)

// PATCH /api/v1/notifications/:id/read - Mark notification as read
router.patch("/:id/read", markNotificationReadHandler)

// POST /api/v1/notifications/read-all - Mark all notifications as read
router.post("/read-all", markAllReadHandler)

export default router
