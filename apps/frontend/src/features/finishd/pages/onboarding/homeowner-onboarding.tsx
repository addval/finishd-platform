/**
 * Homeowner Onboarding Page
 * Profile creation and property setup for homeowners
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { createHomeownerProfile, createProperty } from "../../services/finishd-api.service"

const CITIES = [
  { value: "Delhi", label: "Delhi" },
  { value: "Gurgaon", label: "Gurgaon" },
  { value: "Noida", label: "Noida" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Mohali", label: "Mohali" },
  { value: "Panchkula", label: "Panchkula" },
]

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "Independent House" },
  { value: "villa", label: "Villa" },
]

type Step = "profile" | "property" | "complete"

export function HomeownerOnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("profile")
  const [isLoading, setIsLoading] = useState(false)

  // Profile form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("")
  const [locality, setLocality] = useState("")

  // Property form state
  const [propertyType, setPropertyType] = useState<"apartment" | "house" | "villa">("apartment")
  const [propertyCity, setPropertyCity] = useState("")
  const [propertyLocality, setPropertyLocality] = useState("")
  const [sizeSqft, setSizeSqft] = useState("")
  const [bedrooms, setBedrooms] = useState("2")
  const [bathrooms, setBathrooms] = useState("2")

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }

    setIsLoading(true)
    try {
      const result = await createHomeownerProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        city: city || undefined,
        locality: locality.trim() || undefined,
      })

      if (result.success) {
        toast.success("Profile created!")
        setStep("property")
      } else {
        toast.error(result.error || "Failed to create profile")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const result = await createProperty({
        type: propertyType,
        city: propertyCity || city || undefined,
        locality: propertyLocality.trim() || locality.trim() || undefined,
        sizeSqft: sizeSqft ? parseInt(sizeSqft) : undefined,
        rooms: {
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          livingAreas: 1,
        },
      })

      if (result.success) {
        toast.success("Property added!")
        setStep("complete")
      } else {
        toast.error(result.error || "Failed to add property")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipProperty = () => {
    setStep("complete")
  }

  const handleComplete = () => {
    navigate("/finishd/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 w-16 rounded-full ${
                step === "profile" ? "bg-blue-600" : "bg-blue-200"
              }`}
            />
            <div
              className={`h-2 w-16 rounded-full ${
                step === "property" ? "bg-blue-600" : step === "complete" ? "bg-blue-200" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 w-16 rounded-full ${
                step === "complete" ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          </div>
        </div>

        {/* Profile Step */}
        {step === "profile" && (
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Tell us about yourself</h2>
            <p className="mb-6 text-gray-600">
              Create your profile to start finding interior designers
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select city</option>
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Locality / Area
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g., Sector 56, DLF Phase 1"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? "Creating..." : "Continue"}
              </button>
            </form>
          </div>
        )}

        {/* Property Step */}
        {step === "property" && (
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Add your property</h2>
            <p className="mb-6 text-gray-600">
              Tell us about the property you want to design
            </p>

            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPropertyType(type.value as typeof propertyType)}
                      className={`rounded-md border-2 px-4 py-3 text-sm font-medium transition-colors ${
                        propertyType === type.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <select
                    value={propertyCity || city}
                    onChange={(e) => setPropertyCity(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Size (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={sizeSqft}
                    onChange={(e) => setSizeSqft(e.target.value)}
                    placeholder="e.g., 1500"
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Locality / Area
                </label>
                <input
                  type="text"
                  value={propertyLocality || locality}
                  onChange={(e) => setPropertyLocality(e.target.value)}
                  placeholder="e.g., Sector 56"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Bedroom" : "Bedrooms"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Bathroom" : "Bathrooms"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSkipProperty}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isLoading ? "Adding..." : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
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

            <h2 className="mb-2 text-2xl font-bold text-gray-900">You're all set!</h2>
            <p className="mb-6 text-gray-600">
              Your profile is ready. Start exploring interior designers and bring your dream home to
              life.
            </p>

            <button
              onClick={handleComplete}
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
