/**
 * Notifications Controller
 * HTTP request handlers for user notifications
 */

import type { Request, Response } from "express"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notifications.service.js"

/**
 * GET /api/v1/notifications
 * Get all notifications for the authenticated user
 */
export async function getNotificationsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id
    const result = await getNotifications(userId)

    res.status(200).json({
      success: true,
      data: { notifications: result },
      message: "Notifications retrieved successfully",
      error: null,
    })
  } catch (error) {
    console.error("[Notifications Controller] Failed to get notifications:", error)
    res.status(500).json({
      success: false,
      data: null,
      message: "Failed to retrieve notifications",
      error: "INTERNAL_ERROR",
    })
  }
}

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
export async function markNotificationReadHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id
    const notificationId = req.params.id

    const notification = await markNotificationRead(notificationId, userId)

    if (!notification) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Notification not found",
        error: "NOT_FOUND",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { notification },
      message: "Notification marked as read",
      error: null,
    })
  } catch (error) {
    console.error("[Notifications Controller] Failed to mark notification as read:", error)
    res.status(500).json({
      success: false,
      data: null,
      message: "Failed to mark notification as read",
      error: "INTERNAL_ERROR",
    })
  }
}

/**
 * POST /api/v1/notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
export async function markAllReadHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user!.id
    await markAllNotificationsRead(userId)

    res.status(200).json({
      success: true,
      data: null,
      message: "All notifications marked as read",
      error: null,
    })
  } catch (error) {
    console.error("[Notifications Controller] Failed to mark all as read:", error)
    res.status(500).json({
      success: false,
      data: null,
      message: "Failed to mark all notifications as read",
      error: "INTERNAL_ERROR",
    })
  }
}
