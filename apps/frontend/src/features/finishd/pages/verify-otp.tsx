/**
 * OTP Verification Page
 * Verify phone OTP for Finishd marketplace
 */

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || ""

  const { verifyOtp, sendOtp, isLoading, error, clearError, resetOtpState } =
    useFinishdAuthStore()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no phone
  useEffect(() => {
    if (!phone) {
      navigate("/finishd/login")
    }
  }, [phone, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOtpChange = (index: number, value: string) => {
    clearError()

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1)
    }

    // Update OTP array
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (otpValue: string) => {
    try {
      await verifyOtp(phone, otpValue)
      toast.success("Logged in successfully!")
      // Navigate based on redirect target if provided, otherwise onboarding
      const state = location.state as { redirectTo?: string } | null
      const redirectTo = state?.redirectTo
      navigate(redirectTo || "/finishd/onboarding")
    } catch {
      // Error is handled in store and displayed
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    try {
      await sendOtp(phone)
      toast.success("OTP resent!")
      setResendTimer(30)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch {
      toast.error("Failed to resend OTP")
    }
  }

  const handleBack = () => {
    resetOtpState()
    navigate("/finishd/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
          <p className="mt-2 text-muted-foreground">
            Enter the 6-digit code sent to
            <br />
            <span className="font-medium">+91 {phone}</span>
          </p>
        </div>

        {/* OTP Card */}
        <div className="rounded-lg bg-card p-8 shadow-md">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-14 w-12 text-center text-xl font-semibold"
                maxLength={1}
              />
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Verifying...
            </div>
          )}

          {/* Resend */}
          <div className="mt-6 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in {resendTimer}s
              </p>
            ) : (
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={isLoading}
              >
                Resend OTP
              </Button>
            )}
          </div>

          {/* Back button */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            fullWidth
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Change phone number
          </Button>

          {/* Dev hint */}
          {import.meta.env.DEV && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Dev mode: Use OTP "123456"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
