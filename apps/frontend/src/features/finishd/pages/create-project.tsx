/**
 * Create Project Page
 * Multi-step project creation for homeowners
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  getProperties,
  createProject,
  type Property,
} from "../services/finishd-api.service"

const ROOMS = [
  "Living Room",
  "Master Bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Kitchen",
  "Dining Room",
  "Bathroom",
  "Study/Office",
  "Balcony",
  "Terrace",
]

const TIMELINE_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "within_month", label: "Within a month" },
  { value: "1_3_months", label: "1-3 months" },
  { value: "3_6_months", label: "3-6 months" },
  { value: "flexible", label: "Flexible" },
]

type Step = "scope" | "details" | "budget" | "review"

export function CreateProjectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("scope")
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [scope, setScope] = useState<"full_home" | "partial">("full_home")
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [timelineWeeks, setTimelineWeeks] = useState("")
  const [startTimeline, setStartTimeline] = useState("within_month")

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    const props = await getProperties()
    setProperties(props)
    if (props.length > 0) {
      setPropertyId(props[0].id)
    }
  }

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    )
  }

  const handleScopeNext = () => {
    if (scope === "partial" && selectedRooms.length === 0) {
      toast.error("Please select at least one room")
      return
    }
    setStep("details")
  }

  const handleDetailsNext = () => {
    if (!title.trim()) {
      toast.error("Please enter a project title")
      return
    }
    setStep("budget")
  }

  const handleBudgetNext = () => {
    if (!budgetMin || !budgetMax) {
      toast.error("Please enter your budget range")
      return
    }
    if (parseInt(budgetMin) > parseInt(budgetMax)) {
      toast.error("Minimum budget cannot be greater than maximum")
      return
    }
    setStep("review")
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await createProject({
        title: title.trim(),
        scope,
        propertyId: propertyId || undefined,
        scopeDetails:
          scope === "partial"
            ? {
                rooms: selectedRooms,
                notes: notes.trim() || undefined,
              }
            : notes.trim()
              ? { notes: notes.trim() }
              : undefined,
        budgetMin: parseInt(budgetMin),
        budgetMax: parseInt(budgetMax),
        timelineWeeks: timelineWeeks ? parseInt(timelineWeeks) : undefined,
        startTimeline,
      })

      if (result.success) {
        toast.success("Project created!")
        navigate(`/finishd/projects/${result.project?.id}`)
      } else {
        toast.error(result.error || "Failed to create project")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const formatBudget = (value: string) => {
    const num = parseInt(value)
    if (isNaN(num)) return ""
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)} Lakh`
    return `₹${num.toLocaleString("en-IN")}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className={step === "scope" ? "font-medium text-blue-600" : "text-gray-500"}>
              Scope
            </span>
            <span className={step === "details" ? "font-medium text-blue-600" : "text-gray-500"}>
              Details
            </span>
            <span className={step === "budget" ? "font-medium text-blue-600" : "text-gray-500"}>
              Budget
            </span>
            <span className={step === "review" ? "font-medium text-blue-600" : "text-gray-500"}>
              Review
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            <div className={`h-1 flex-1 rounded ${step === "scope" ? "bg-blue-600" : "bg-blue-200"}`} />
            <div className={`h-1 flex-1 rounded ${step === "details" ? "bg-blue-600" : step === "budget" || step === "review" ? "bg-blue-200" : "bg-gray-200"}`} />
            <div className={`h-1 flex-1 rounded ${step === "budget" ? "bg-blue-600" : step === "review" ? "bg-blue-200" : "bg-gray-200"}`} />
            <div className={`h-1 flex-1 rounded ${step === "review" ? "bg-blue-600" : "bg-gray-200"}`} />
          </div>
        </div>

        {/* Scope Step */}
        {step === "scope" && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">What do you want to design?</h2>
            <p className="mb-6 text-gray-600">Tell us the scope of your project</p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setScope("full_home")}
                className={`w-full rounded-lg border-2 p-6 text-left transition-colors ${
                  scope === "full_home"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="text-lg font-semibold">Full Home Interior</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Complete interior design for your entire home
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope("partial")}
                className={`w-full rounded-lg border-2 p-6 text-left transition-colors ${
                  scope === "partial"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="text-lg font-semibold">Specific Rooms</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Design only selected rooms or areas
                </p>
              </button>
            </div>

            {scope === "partial" && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select rooms to design
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROOMS.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => toggleRoom(room)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedRooms.includes(room)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleScopeNext}
              className="mt-8 w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        )}

        {/* Details Step */}
        {step === "details" && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Project details</h2>
            <p className="mb-6 text-gray-600">Give your project a name and add any notes</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 3BHK Modern Apartment Interior"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {properties.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Property
                  </label>
                  <select
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  >
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.type.charAt(0).toUpperCase() + prop.type.slice(1)} -{" "}
                        {prop.city || "No city"} ({prop.sizeSqft || "N/A"} sq.ft)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements, preferences, or things you want the designer to know..."
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep("scope")}
                className="flex-1 rounded-md border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleDetailsNext}
                className="flex-1 rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Budget Step */}
        {step === "budget" && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Budget & Timeline</h2>
            <p className="mb-6 text-gray-600">Help designers understand your expectations</p>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget Range (in ₹) *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Minimum"
                      className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                    {budgetMin && (
                      <p className="mt-1 text-xs text-gray-500">{formatBudget(budgetMin)}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="Maximum"
                      className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                    {budgetMax && (
                      <p className="mt-1 text-xs text-gray-500">{formatBudget(budgetMax)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  When do you want to start?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStartTimeline(option.value)}
                      className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                        startTimeline === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Expected duration (weeks)
                </label>
                <input
                  type="number"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(e.target.value)}
                  placeholder="e.g., 12"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep("details")}
                className="flex-1 rounded-md border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBudgetNext}
                className="flex-1 rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === "review" && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Review your project</h2>
            <p className="mb-6 text-gray-600">Make sure everything looks good before creating</p>

            <div className="space-y-4 divide-y">
              <div className="pb-4">
                <h3 className="text-sm font-medium text-gray-500">Project Title</h3>
                <p className="mt-1 text-lg font-semibold">{title}</p>
              </div>

              <div className="py-4">
                <h3 className="text-sm font-medium text-gray-500">Scope</h3>
                <p className="mt-1">
                  {scope === "full_home" ? "Full Home Interior" : `Specific Rooms: ${selectedRooms.join(", ")}`}
                </p>
              </div>

              <div className="py-4">
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <p className="mt-1">
                  {formatBudget(budgetMin)} - {formatBudget(budgetMax)}
                </p>
              </div>

              <div className="py-4">
                <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                <p className="mt-1">
                  Start: {TIMELINE_OPTIONS.find((t) => t.value === startTimeline)?.label}
                  {timelineWeeks && ` • Duration: ${timelineWeeks} weeks`}
                </p>
              </div>

              {notes && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-gray-600">{notes}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep("budget")}
                className="flex-1 rounded-md border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
