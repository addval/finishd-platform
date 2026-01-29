/**
 * Phone Login Page
 * Phone OTP authentication for Finishd marketplace
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PhoneLoginPage() {
  const navigate = useNavigate()
  const { sendOtp, isLoading, error, clearError } = useFinishdAuthStore()
  const [phone, setPhone] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    try {
      await sendOtp(cleanPhone)
      toast.success("OTP sent successfully!")
      navigate("/finishd/verify-otp", { state: { phone: cleanPhone } })
    } catch {
      toast.error(error || "Failed to send OTP")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Finishd</h1>
          <p className="mt-2 text-muted-foreground">
            Connect with interior designers and contractors
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Login with Phone
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <Label
                htmlFor="phone"
                className="mb-2 block"
              >
                Phone Number
              </Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    clearError()
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                    setPhone(value)
                  }}
                  placeholder="9876543210"
                  className="rounded-l-none rounded-r-md px-4 py-3"
                  maxLength={10}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                We'll send you a one-time password
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || phone.length !== 10}
            >
              {isLoading ? "Sending OTP..." : "Continue"}
            </Button>
          </form>

          {/* Dev hint */}
          {import.meta.env.DEV && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Dev mode: Use OTP "123456" for any phone number
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
