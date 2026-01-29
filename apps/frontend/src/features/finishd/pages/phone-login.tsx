/**
 * Phone Login Page
 * Phone OTP authentication for Finishd marketplace
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useFinishdAuthStore } from "../store/finishd-auth.store"

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
      navigate("/verify-otp", { state: { phone: cleanPhone } })
    } catch {
      toast.error(error || "Failed to send OTP")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Finishd</h1>
          <p className="mt-2 text-gray-600">
            Connect with interior designers and contractors
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Login with Phone
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                  +91
                </span>
                <input
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
                  className="block w-full rounded-r-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  maxLength={10}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                We'll send you a one-time password
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isLoading ? "Sending OTP..." : "Continue"}
            </button>
          </form>

          {/* Dev hint */}
          {import.meta.env.DEV && (
            <p className="mt-4 text-center text-xs text-gray-400">
              Dev mode: Use OTP "123456" for any phone number
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
