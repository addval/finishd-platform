import { X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface PhoneVerificationScreenProps {
  phoneNumber?: string
  onVerify?: (code: string) => void
  onResendCode?: () => void
  onClose?: () => void
  isLoading?: boolean
  error?: string
  resendCountdown?: number
}

/**
 * PhoneVerificationScreen - Pixel-perfect implementation matching image copy 2.png
 *
 * Design specs:
 * - Close icon (X) top-left: 24px, black
 * - "Finishd" centered top: 24px, uppercase, bold
 * - Title: "Verify your phone number": 20px, bold, #333333
 * - Subtitle: 14px, #666666, 2 lines
 * - 6 OTP boxes: 48px × 48px, border 1px solid #E0E0E0, rounded 8px, 4px gap
 * - Focus: border 2px solid #000000
 * - "Continue" button: black bg, white text, rounded 8px
 */
export function PhoneVerificationScreen({
  phoneNumber = "+1 (310) 555-1234",
  onVerify,
  onResendCode,
  onClose,
  isLoading = false,
  error,
  resendCountdown = 60,
}: PhoneVerificationScreenProps) {
  const [otp, setOtp] = useState("")

  // OTP is complete when it has 6 digits
  const isOtpComplete = otp.length === 6

  const handleVerify = () => {
    if (!isOtpComplete) return
    onVerify?.(otp)
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    // Take only the last character
    const digit = value.slice(-1)

    // Update the value
    const newValue = otp.split("")
    newValue[index] = digit
    const result = newValue.join("").slice(0, 6)
    setOtp(result)

    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
      nextInput?.focus()
    }

    // Auto-submit when OTP is complete
    if (result.length === 6) {
      onVerify?.(result)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain")

    // Extract only digits
    const digits = pastedData.replace(/\D/g, "").slice(0, 6)
    setOtp(digits)

    if (digits.length === 6) {
      onVerify?.(digits)
    }
  }

  const handleResendCode = () => {
    if (resendCountdown > 0) return
    setOtp("")
    onResendCode?.()
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-background">
      {/* Close Icon - Top Left */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 w-6 h-6 flex items-center justify-center text-text-primary hover:opacity-70 transition-opacity"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Brand Header - Centered Top */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wider text-text-primary">
          Finishd
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-3">
            <h2 className="text-xl font-semibold text-text-primary">
              Verify your phone number
            </h2>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8 space-y-1">
            <p className="text-sm text-text-secondary">
              We've sent a code to {phoneNumber}
            </p>
            <p className="text-sm text-text-secondary">
              Please enter the code below.
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-1 mb-8">
            {[0, 1, 2, 3, 4, 5].map(index => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index] || ""}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={cn(
                  "w-12 h-12 text-center text-xl font-semibold",
                  "border-2 rounded-lg",
                  "focus:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "transition-all duration-200",
                  error
                    ? "border-error focus:border-error focus:ring-error"
                    : "border-border-light focus:border-border-primary focus:ring-2 focus:ring-border-primary/20",
                )}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-6">
              <p className="text-sm text-error font-medium">{error}</p>
            </div>
          )}

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
                  className="font-semibold underline hover:no-underline focus:outline-none text-text-primary"
                  disabled={isLoading}
                >
                  Resend
                </button>
              )}
            </p>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              type="button"
              className="min-w-50 h-12 px-8 text-base font-semibold rounded-lg text-white bg-primary transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isOtpComplete || isLoading}
              onClick={handleVerify}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
