/**
 * Select User Type Page
 * Onboarding step to choose homeowner, designer, or contractor
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import { Button } from "@/components/ui/button"

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
  useEffect(() => {
    if (user && !needsOnboarding()) {
      navigate("/finishd/dashboard", { replace: true })
    }
  }, [user, needsOnboarding, navigate])

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
        navigate("/finishd/onboarding/homeowner")
      } else if (selected === "designer") {
        navigate("/finishd/onboarding/designer")
      } else {
        navigate("/finishd/onboarding/contractor")
      }
    } catch {
      toast.error("Failed to set user type")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            How will you use Finishd?
          </h1>
          <p className="mt-2 text-muted-foreground">
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
                  ? "border-primary bg-primary/10"
                  : "border-input bg-card hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{option.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {option.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <div
                    className={`h-6 w-6 rounded-full border-2 ${
                      selected === option.type
                        ? "border-primary bg-primary"
                        : "border-input"
                    }`}
                  >
                    {selected === option.type && (
                      <svg
                        className="h-5 w-5 text-primary-foreground"
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
        <Button
          type="button"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={!selected || isLoading}
          onClick={handleContinue}
          className="mt-8"
        >
          {isLoading ? "Setting up..." : "Continue"}
        </Button>

        {/* Note */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          You can change this later in settings
        </p>
      </div>
    </div>
  )
}
