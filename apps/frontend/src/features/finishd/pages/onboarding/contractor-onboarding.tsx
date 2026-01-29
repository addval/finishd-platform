/**
 * Contractor Onboarding Page
 * Profile creation for contractors
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { createContractorProfile } from "../../services/finishd-api.service"

const CITIES = [
  { value: "Delhi", label: "Delhi" },
  { value: "Gurgaon", label: "Gurgaon" },
  { value: "Noida", label: "Noida" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Mohali", label: "Mohali" },
  { value: "Panchkula", label: "Panchkula" },
]

const TRADES = [
  { value: "electrician", label: "Electrician", icon: "⚡" },
  { value: "plumber", label: "Plumber", icon: "🔧" },
  { value: "mason", label: "Mason", icon: "🧱" },
  { value: "carpenter", label: "Carpenter", icon: "🪚" },
  { value: "painter", label: "Painter", icon: "🎨" },
  { value: "general_contractor", label: "General Contractor", icon: "🏗️" },
  { value: "false_ceiling", label: "False Ceiling", icon: "🏠" },
  { value: "flooring", label: "Flooring", icon: "🪵" },
  { value: "hvac", label: "HVAC", icon: "❄️" },
]

export function ContractorOnboardingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const toggleTrade = (trade: string) => {
    setSelectedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade],
    )
  }

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name or business name")
      return
    }

    if (selectedTrades.length === 0) {
      toast.error("Please select at least one trade")
      return
    }

    if (selectedCities.length === 0) {
      toast.error("Please select at least one service area")
      return
    }

    setIsLoading(true)
    try {
      const result = await createContractorProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        trades: selectedTrades,
        serviceAreas: selectedCities,
      })

      if (result.success) {
        toast.success("Profile created!")
        setIsComplete(true)
      } else {
        toast.error(result.error || "Failed to create profile")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    navigate("/finishd/dashboard")
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-900">Profile submitted!</h2>
            <p className="mb-6 text-gray-600">
              Your profile is under review. Once verified, designers will be able to invite you to
              projects.
            </p>

            <div className="mb-6 rounded-md bg-yellow-50 p-4 text-left">
              <p className="text-sm text-yellow-800">
                <strong>Verification pending:</strong> Our team will review your profile within 24-48
                hours. You'll be notified once your profile is live.
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your contractor profile</h1>
          <p className="mt-2 text-gray-600">
            Let designers and homeowners know about your skills
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your Name / Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sharma Electricals"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select experience</option>
                  <option value="1">1-2 years</option>
                  <option value="3">3-5 years</option>
                  <option value="6">6-10 years</option>
                  <option value="11">10-15 years</option>
                  <option value="16">15+ years</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  About Your Work
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your experience, specializations, and what makes you reliable..."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Trades */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Your trades / skills *
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TRADES.map((trade) => (
                  <button
                    key={trade.value}
                    type="button"
                    onClick={() => toggleTrade(trade.value)}
                    className={`flex items-center gap-2 rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selectedTrades.includes(trade.value)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span>{trade.icon}</span>
                    <span>{trade.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Areas you serve *
              </label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city.value}
                    type="button"
                    onClick={() => toggleCity(city.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCities.includes(city.value)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "Creating..." : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
