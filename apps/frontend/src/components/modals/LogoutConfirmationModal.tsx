/**
 * Logout Confirmation Modal
 * Modern, minimal modal design for confirming logout action
 */

import { LogOut } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/buttons/button"

interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md p-10 max-w-[440px] w-full shadow-2xl"
        style={{
          backgroundColor: "#FFFFFF",
          animation: "modalEnter 0.2s ease-out",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon Section */}
        <div className="flex justify-center mb-6" style={{ marginBottom: "24px" }}>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#FEF2F2",
              width: "48px",
              height: "48px",
            }}
          >
            <LogOut size={24} style={{ color: "#DC2626" }} />
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-semibold text-center mb-3"
          style={{
            color: "#1A1A1A",
            fontSize: "24px",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          Logging Out?
        </h2>

        {/* Description */}
        <p
          className="text-center leading-relaxed mb-8"
          style={{
            color: "#666666",
            fontSize: "15px",
            lineHeight: "1.6",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          You're about to log out of your account.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3" style={{ gap: "12px" }}>
          {/* Cancel Button - Stay */}
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            style={{
              borderColor: "#D1D5DB",
              color: "#374151",
              flex: 1,
            }}
          >
            Stay
          </Button>

          {/* Confirm Button - Log Out */}
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            style={{
              backgroundColor: "#DC2626",
              flex: 1,
            }}
          >
            Log Out
          </Button>
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
