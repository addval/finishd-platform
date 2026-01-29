import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { OtpInput } from "@/components/forms/otp-input"
import { useResendVerification, useVerifyEmail } from "../hooks/useAuth"
import { useAuthStore } from "../store/authStore"

/**
 * EmailVerificationScreen - Pixel-perfect implementation matching image copy 2.png
 *
 * Design specs:
 * - WHITE HEADER BAR at top (60px height, 100% width, border-bottom)
 * - Background: #F8F5F2 for main page
 * - Center white card/modal (~420px wide) with all content inside
 * - "Finishd" in header: Medium weight (500), 24px, letter-spacing: 0.05em
 * - Title: "Verify your email"
 * - 6 OTP boxes: 45px × 45px (not 48px)
 */
export function EmailVerificationScreen() {
  const navigate = useNavigate()
  const verifyEmailMutation = useVerifyEmail()
  const resendVerificationMutation = useResendVerification()

  const email = useAuthStore(state => state.user?.email)
  const [otp, setOtp] = useState("")
  const [resendCountdown, setResendCountdown] = useState(60)

  const isOtpComplete = otp.length === 6
  const isLoading = verifyEmailMutation.isPending

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleVerify = async () => {
    if (!isOtpComplete) return

    try {
      await verifyEmailMutation.mutateAsync({ code: otp })
      // Navigate to profile creation on success
      navigate("/onboarding/profile")
    } catch (error) {
      // Error is handled by the hook and displayed via toast
      console.error("Verification error:", error)
    }
  }

  const handleResendCode = async () => {
    if (resendCountdown > 0) return
    if (!email) return

    try {
      await resendVerificationMutation.mutateAsync({ email })
      // Reset countdown
      setResendCountdown(60)
      // Clear OTP
      setOtp("")
    } catch (error) {
      console.error("Resend error:", error)
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Main Content - Centered White Card/Modal */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="w-full max-w-[550px] rounded-md p-10 shadow-lg bg-card"
        >
          {/* Title */}
          <div className="text-center mb-3">
            <h2 className="text-2xl font-semibold text-text-primary">
              Verify your email
            </h2>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8 space-y-1">
            <p className="text-sm text-text-secondary">
              We've sent a code to {email || "your email"}. Please enter the code below.
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center mb-8">
            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
              disabled={isLoading}
            />
          </div>

          {/* Resend Link */}
          <div className="text-center mb-8">
            <p className="text-sm text-text-secondary">
              Didn't get a code?{" "}
              {resendCountdown > 0 ? (
                <span className="text-text-tertiary">Resend in {resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="font-semibold underline hover:no-underline focus:outline-none transition-opacity text-text-primary"
                  disabled={isLoading}
                >
                  Resend
                </button>
              )}
            </p>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={!isOtpComplete}
              fullWidth
              onClick={handleVerify}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
