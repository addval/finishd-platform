import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/buttons/button"
import { Switch } from "@/components/switches/switch"
import { useUpdatePermissions } from "@/features/auth/hooks/useAuth"

/**
 * PermissionSetupScreen - Pixel-perfect implementation matching image copy 6/7.png
 *
 * Design specs:
 * - Background: #F8F5F2 (warm off-white)
 * - White card: 560px max-width, 12px rounded, 32px padding
 * - Skip button top-right: "Skip" in light gray (#9B9B9B)
 * - Title: "Enable your journey" - 24px, bold, #000000, centered
 * - Subtitle and note: centered, gray
 * - 4 toggle cards: white, rounded 8px, 16px padding
 * - 2 toggles on by default (Calendar, Notifications)
 * - 2 toggles off by default (Contacts, Location)
 * - "Start Your Journey" button: full-width, black bg, 48px height
 */
export function PermissionSetupScreen() {
  const navigate = useNavigate()
  const updatePermissionsMutation = useUpdatePermissions()

  const [permissions, setPermissions] = useState({
    calendarEnabled: true,
    notificationsEnabled: true,
    contactsEnabled: true,
    locationEnabled: true,
  })

  const isLoading = updatePermissionsMutation.isPending

  const handleSubmit = async () => {
    try {
      await updatePermissionsMutation.mutateAsync(permissions)
      // Navigate to welcome screen on success
      navigate("/welcome")
    } catch (error) {
      // Error is handled by the hook and displayed via toast
      console.error("Permissions update error:", error)
    }
  }

  const toggleItems = [
    {
      key: "calendarEnabled" as const,
      label: "Calendar access",
      description: "Add rituals and events directly to your schedule and get timely reminders.",
    },
    {
      key: "notificationsEnabled" as const,
      label: "Notifications",
      description: "Stay gently reminded of rituals, streaks, and community updates.",
    },
    {
      key: "contactsEnabled" as const,
      label: "Contacts access",
      description: "Find and connect with friends who are already part of Rituality.",
    },
    {
      key: "locationEnabled" as const,
      label: "Location access",
      description: "Discover rituals, circles, and gatherings near you.",
    },
  ]

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#F8F5F2" }}>
      {/* Main Content - Centered White Card */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="w-full max-w-[700px] rounded-md p-10 shadow-lg"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {/* Title */}
          <div className="text-center mb-3">
            <h2 className="text-2xl font-bold" style={{ color: "#000000" }}>
              Enable your journey
            </h2>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-2">
            <p className="text-sm" style={{ color: "#666666" }}>
              Turn these on to get reminders, stay connected, and discover rituals near you.
            </p>
          </div>

          {/* Note */}
          <div className="text-center mb-8">
            <p className="text-xs" style={{ color: "#999999" }}>
              You can change these settings anytime later.
            </p>
          </div>

          {/* Permission Toggles */}
          <div className="space-y-4 mb-8">
            {toggleItems.map(item => (
              <div
                key={item.key}
                className="rounded-lg p-4 border transition-colors hover:bg-gray-50 flex justify-between"
                style={{ borderColor: "#E0E0E0" }}
              >
                {/* Text Content - Top */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold" style={{ color: "#333333" }}>
                    {item.label}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "#666666" }}>
                    {item.description}
                  </p>
                </div>

                {/* Toggle - Centered */}
                <div className="flex items-center">
                  <Switch
                    checked={permissions[item.key]}
                    onChange={checked => setPermissions(prev => ({ ...prev, [item.key]: checked }))}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Start Your Journey Button */}
          <div>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isLoading}
              fullWidth
              onClick={handleSubmit}
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
