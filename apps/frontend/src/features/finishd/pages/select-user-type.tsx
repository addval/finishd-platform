/**
 * Select User Type Page
 * Onboarding step to choose homeowner, designer, or contractor
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useFinishdAuthStore } from "../store/finishd-auth.store"

type UserType = "homeowner" | "designer" | "contractor"

interface UserTypeOption {
  type: UserType
  title: string
  description: string
  icon: string
}

const userTypeOptions: UserTypeOption[] = [
  {
    type: "homeowner",
    title: "Homeowner",
    description: "I want to transform my home with professional help",
    icon: "🏠",
  },
  {
    type: "designer",
    title: "Interior Designer",
    description: "I design beautiful spaces for homeowners",
    icon: "🎨",
  },
  {
    type: "contractor",
    title: "Contractor",
    description: "I provide skilled labor for interior projects",
    icon: "🔧",
  },
]

export function SelectUserTypePage() {
  const navigate = useNavigate()
  const { setUserType, isLoading, user, needsOnboarding } = useFinishdAuthStore()
  const [selected, setSelected] = useState<UserType | null>(null)

  // Redirect if already has user type
  if (user && !needsOnboarding()) {
    navigate("/dashboard")
    return null
  }

  const handleContinue = async () => {
    if (!selected) {
      toast.error("Please select how you want to use Finishd")
      return
    }

    try {
      await setUserType(selected)
      toast.success("Profile type set!")

      // Navigate to appropriate onboarding
      if (selected === "homeowner") {
        navigate("/onboarding/homeowner")
      } else if (selected === "designer") {
        navigate("/onboarding/designer")
      } else {
        navigate("/onboarding/contractor")
      }
    } catch {
      toast.error("Failed to set user type")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            How will you use Finishd?
          </h1>
          <p className="mt-2 text-gray-600">
            Choose your role to personalize your experience
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {userTypeOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => setSelected(option.type)}
              className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                selected === option.type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{option.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {option.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <div
                    className={`h-6 w-6 rounded-full border-2 ${
                      selected === option.type
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selected === option.type && (
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || isLoading}
          className="mt-8 w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isLoading ? "Setting up..." : "Continue"}
        </button>

        {/* Note */}
        <p className="mt-4 text-center text-sm text-gray-500">
          You can change this later in settings
        </p>
      </div>
    </div>
  )
}
