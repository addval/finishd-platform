/**
 * Notifications Service
 * Business logic for user notifications
 */

import { db } from "../../db/index.js"
import { notifications } from "../../db/schema.js"
import { eq, and, desc, count } from "drizzle-orm"

/**
 * Get all notifications for a user, ordered by newest first
 */
export async function getNotifications(userId: string) {
  try {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50)

    return result
  } catch (error) {
    console.error("[Notifications] Failed to get notifications:", error)
    throw error
  }
}

/**
 * Create a new notification
 */
export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  data?: unknown
}) {
  try {
    const result = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("[Notifications] Failed to create notification:", error)
    throw error
  }
}

/**
 * Mark a single notification as read (with user ownership check)
 */
export async function markNotificationRead(notificationId: string, userId: string) {
  try {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      )
      .returning()

    return result[0] || null
  } catch (error) {
    console.error("[Notifications] Failed to mark notification as read:", error)
    throw error
  }
}

/**
 * Mark all unread notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ),
      )
  } catch (error) {
    console.error("[Notifications] Failed to mark all notifications as read:", error)
    throw error
  }
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadCount(userId: string) {
  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ),
      )

    return result[0].count
  } catch (error) {
    console.error("[Notifications] Failed to get unread count:", error)
    throw error
  }
}
