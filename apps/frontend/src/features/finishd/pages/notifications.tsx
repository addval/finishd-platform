/**
 * Finishd Notifications Page
 * Displays all notifications for the logged-in user
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  BellOff,
  CheckCheck,
  ArrowLeft,
  FileText,
  UserCheck,
  MessageSquare,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "../services/finishd-api.service"

// ============================================================================
// HELPERS
// ============================================================================

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-IN")
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "request":
      return FileText
    case "proposal":
      return MessageSquare
    case "verification":
      return UserCheck
    case "payment":
      return CreditCard
    default:
      return AlertCircle
  }
}

// ============================================================================
// NOTIFICATIONS PAGE
// ============================================================================

export function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      const result = await markNotificationRead(notification.id)
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        )
      }
    }

    const data = notification.data as Record<string, unknown> | undefined
    if (data?.projectId) {
      navigate(`/finishd/projects/${data.projectId}`)
    }
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true)
    try {
      const result = await markAllNotificationsRead()
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error("Failed to mark all notifications read:", error)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/finishd/dashboard")}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-foreground" />
              <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            </div>
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              isLoading={isMarkingAll}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellOff className="h-16 w-16 text-muted-foreground/40" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">No notifications yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              When you receive notifications, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const data = notification.data as Record<string, unknown> | undefined
              const isClickable = !!data?.projectId

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-colors",
                    isClickable && "cursor-pointer hover:bg-muted/50",
                    !notification.isRead && "border-l-4 border-l-primary",
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          notification.isRead
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm",
                              notification.isRead
                                ? "font-medium text-foreground"
                                : "font-bold text-foreground",
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
