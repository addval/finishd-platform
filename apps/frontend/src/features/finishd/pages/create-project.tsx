/**
 * Create Project Page
 * Multi-step project creation for homeowners
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StepProgress } from "@/components/ui/step-progress"
import { Textarea } from "@/components/ui/textarea"
import { ToggleChip, ToggleChipGroup } from "@/components/ui/toggle-chip"
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
    <div className="min-h-screen bg-muted py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress */}
        <StepProgress
          steps={["Scope", "Details", "Budget", "Review"]}
          currentStep={step === "scope" ? "Scope" : step === "details" ? "Details" : step === "budget" ? "Budget" : "Review"}
          className="mb-8"
        />

        {/* Scope Step */}
        {step === "scope" && (
          <Card className="shadow-sm">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">What do you want to design?</h2>
            <p className="mb-6 text-muted-foreground">Tell us the scope of your project</p>

            <div className="space-y-4">
              <ToggleChip
                variant="card"
                selected={scope === "full_home"}
                onClick={() => setScope("full_home")}
                className="w-full rounded-lg border-2 p-6"
              >
                <h3 className="text-lg font-semibold">Full Home Interior</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete interior design for your entire home
                </p>
              </ToggleChip>

              <ToggleChip
                variant="card"
                selected={scope === "partial"}
                onClick={() => setScope("partial")}
                className="w-full rounded-lg border-2 p-6"
              >
                <h3 className="text-lg font-semibold">Specific Rooms</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Design only selected rooms or areas
                </p>
              </ToggleChip>
            </div>

            {scope === "partial" && (
              <div className="mt-6">
                <Label className="mb-2 block">
                  Select rooms to design
                </Label>
                <ToggleChipGroup>
                  {ROOMS.map((room) => (
                    <ToggleChip
                      key={room}
                      selected={selectedRooms.includes(room)}
                      onClick={() => toggleRoom(room)}
                    >
                      {room}
                    </ToggleChip>
                  ))}
                </ToggleChipGroup>
              </div>
            )}

            <Button
              onClick={handleScopeNext}
              variant="primary"
              fullWidth
              className="mt-8 py-3"
            >
              Continue
            </Button>
            </CardContent>
          </Card>
        )}

        {/* Details Step */}
        {step === "details" && (
          <Card className="shadow-sm">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Project details</h2>
            <p className="mb-6 text-muted-foreground">Give your project a name and add any notes</p>

            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">
                  Project Title *
                </Label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 3BHK Modern Apartment Interior"
                  className="px-4 py-3 h-auto"
                />
              </div>

              {properties.length > 0 && (
                <div>
                  <Label className="mb-1 block">
                    Property
                  </Label>
                  <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger className="w-full h-auto px-4 py-3">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((prop) => {
                        const propertyType =
                          prop.type.charAt(0).toUpperCase() + prop.type.slice(1)
                        const cityText = prop.city || "No city"

                        return (
                          <SelectItem key={prop.id} value={prop.id}>
                            {propertyType} - {cityText} ({prop.sizeSqft || "N/A"} sq.ft)
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="mb-1 block">
                  Additional Notes
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements, preferences, or things you want the designer to know..."
                  rows={4}
                  className="px-4 py-3"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setStep("scope")}
                variant="outline"
                className="flex-1 py-3"
              >
                Back
              </Button>
              <Button
                onClick={handleDetailsNext}
                variant="primary"
                className="flex-1 py-3"
              >
                Continue
              </Button>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Step */}
        {step === "budget" && (
          <Card className="shadow-sm">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Budget & Timeline</h2>
            <p className="mb-6 text-muted-foreground">Help designers understand your expectations</p>

            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  Budget Range (in Rs.) *
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Minimum"
                      className="px-4 py-3 h-auto"
                    />
                    {budgetMin && (
                      <p className="mt-1 text-xs text-muted-foreground">{formatBudget(budgetMin)}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="Maximum"
                      className="px-4 py-3 h-auto"
                    />
                    {budgetMax && (
                      <p className="mt-1 text-xs text-muted-foreground">{formatBudget(budgetMax)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">
                  When do you want to start?
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIMELINE_OPTIONS.map((option) => (
                    <ToggleChip
                      key={option.value}
                      variant="card"
                      selected={startTimeline === option.value}
                      onClick={() => setStartTimeline(option.value)}
                    >
                      {option.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-1 block">
                  Expected duration (weeks)
                </Label>
                <Input
                  type="number"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(e.target.value)}
                  placeholder="e.g., 12"
                  className="px-4 py-3 h-auto"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setStep("details")}
                variant="outline"
                className="flex-1 py-3"
              >
                Back
              </Button>
              <Button
                onClick={handleBudgetNext}
                variant="primary"
                className="flex-1 py-3"
              >
                Review
              </Button>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Review Step */}
        {step === "review" && (
          <Card className="shadow-sm">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Review your project</h2>
            <p className="mb-6 text-muted-foreground">Make sure everything looks good before creating</p>

            <div className="space-y-4 divide-y">
              <div className="pb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Project Title</h3>
                <p className="mt-1 text-lg font-semibold">{title}</p>
              </div>

              <div className="py-4">
                <h3 className="text-sm font-medium text-muted-foreground">Scope</h3>
                <p className="mt-1">
                  {scope === "full_home" ? "Full Home Interior" : `Specific Rooms: ${selectedRooms.join(", ")}`}
                </p>
              </div>

              <div className="py-4">
                <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                <p className="mt-1">
                  {formatBudget(budgetMin)} - {formatBudget(budgetMax)}
                </p>
              </div>

              <div className="py-4">
                <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
                <p className="mt-1">
                  Start: {TIMELINE_OPTIONS.find((t) => t.value === startTimeline)?.label}
                  {timelineWeeks && ` -- Duration: ${timelineWeeks} weeks`}
                </p>
              </div>

              {notes && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1 text-muted-foreground">{notes}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setStep("budget")}
                variant="outline"
                className="flex-1 py-3"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                isLoading={isLoading}
                className="flex-1 py-3"
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
