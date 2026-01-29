/**
 * Designer Onboarding Page
 * Profile creation for interior designers
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDesignerProfile } from "../../services/finishd-api.service"

const CITIES = [
  { value: "Delhi", label: "Delhi" },
  { value: "Gurgaon", label: "Gurgaon" },
  { value: "Noida", label: "Noida" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Mohali", label: "Mohali" },
  { value: "Panchkula", label: "Panchkula" },
]

const DESIGN_STYLES = [
  "Contemporary",
  "Modern",
  "Traditional",
  "Minimalist",
  "Industrial",
  "Scandinavian",
  "Bohemian",
  "Mid-Century Modern",
]

const SERVICES = [
  "Full Home Design",
  "Room Makeover",
  "Kitchen Design",
  "Bathroom Design",
  "Living Room Design",
  "Bedroom Design",
  "Office Design",
  "Consultation Only",
]

const BUDGET_RANGES = [
  { min: 100000, max: 500000, label: "₹1-5 Lakh" },
  { min: 500000, max: 1500000, label: "₹5-15 Lakh" },
  { min: 1500000, max: 3000000, label: "₹15-30 Lakh" },
  { min: 3000000, max: 5000000, label: "₹30-50 Lakh" },
  { min: 5000000, max: 10000000, label: "₹50 Lakh+" },
]

type Step = "basic" | "expertise" | "complete"

export function DesignerOnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("basic")
  const [isLoading, setIsLoading] = useState(false)

  // Basic info
  const [name, setName] = useState("")
  const [firmName, setFirmName] = useState("")
  const [bio, setBio] = useState("")
  const [experienceYears, setExperienceYears] = useState("")

  // Expertise
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number } | null>(null)

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    )
  }

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    )
  }

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    )
  }

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name or firm name")
      return
    }

    setStep("expertise")
  }

  const handleExpertiseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCities.length === 0) {
      toast.error("Please select at least one city")
      return
    }

    if (selectedStyles.length === 0) {
      toast.error("Please select at least one design style")
      return
    }

    setIsLoading(true)
    try {
      const result = await createDesignerProfile({
        name: name.trim(),
        firmName: firmName.trim() || undefined,
        bio: bio.trim() || undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        serviceCities: selectedCities,
        styles: selectedStyles,
        services: selectedServices.length > 0 ? selectedServices : undefined,
        priceRangeMin: budgetRange?.min,
        priceRangeMax: budgetRange?.max,
      })

      if (result.success) {
        toast.success("Profile created!")
        setStep("complete")
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-24 rounded-full ${step === "basic" ? "bg-primary" : "bg-primary/20"}`} />
            <div className={`h-2 w-24 rounded-full ${step === "expertise" ? "bg-primary" : step === "complete" ? "bg-primary/20" : "bg-muted-foreground/20"}`} />
            <div className={`h-2 w-24 rounded-full ${step === "complete" ? "bg-primary" : "bg-muted-foreground/20"}`} />
          </div>
        </div>

        {/* Basic Info Step */}
        {step === "basic" && (
          <div className="rounded-lg bg-card p-8 shadow-md">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Create your designer profile</h2>
            <p className="mb-6 text-muted-foreground">Let homeowners know about you and your work</p>

            <form onSubmit={handleBasicSubmit} className="space-y-4">
              <div>
                <Label className="mb-1 block">Your Name *</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="px-4 py-3 h-auto"
                  required
                />
              </div>

              <div>
                <Label className="mb-1 block">
                  Firm / Studio Name (optional)
                </Label>
                <Input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g., Design Studio Co."
                  className="px-4 py-3 h-auto"
                />
              </div>

              <div>
                <Label className="mb-1 block">
                  Years of Experience
                </Label>
                <Select value={experienceYears || "__none__"} onValueChange={(value) => setExperienceYears(value === "__none__" ? "" : value)}>
                  <SelectTrigger className="w-full h-auto px-4 py-3">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select experience</SelectItem>
                    <SelectItem value="1">1-2 years</SelectItem>
                    <SelectItem value="3">3-5 years</SelectItem>
                    <SelectItem value="6">6-10 years</SelectItem>
                    <SelectItem value="11">10-15 years</SelectItem>
                    <SelectItem value="16">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block">
                  About You / Your Work
                </Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell homeowners about your design philosophy, specializations, and what makes you unique..."
                  rows={4}
                  className="w-full rounded-md border border-input px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="mt-6 py-3"
              >
                Continue
              </Button>
            </form>
          </div>
        )}

        {/* Expertise Step */}
        {step === "expertise" && (
          <div className="rounded-lg bg-card p-8 shadow-md">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Your expertise</h2>
            <p className="mb-6 text-muted-foreground">Help homeowners find you based on their needs</p>

            <form onSubmit={handleExpertiseSubmit} className="space-y-6">
              {/* Cities */}
              <div>
                <Label className="mb-2 block">
                  Cities you serve *
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      onClick={() => toggleCity(city.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCities.includes(city.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-input/80"
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Styles */}
              <div>
                <Label className="mb-2 block">
                  Design styles you specialize in *
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedStyles.includes(style)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-input/80"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <Label className="mb-2 block">
                  Services you offer
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedServices.includes(service)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-input/80"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <Label className="mb-2 block">
                  Typical project budget range
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setBudgetRange(range)}
                      className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                        budgetRange?.min === range.min
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:border-input/80"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setStep("basic")}
                  variant="outline"
                  className="flex-1 py-3"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex-1 py-3"
                >
                  {isLoading ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="rounded-lg bg-card p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-foreground">Profile submitted!</h2>
            <p className="mb-6 text-muted-foreground">
              Your profile is under review. Once verified, you'll start receiving project requests
              from homeowners.
            </p>

            <div className="mb-6 rounded-md bg-yellow-50 p-4 text-left">
              <p className="text-sm text-yellow-800">
                <strong>Verification pending:</strong> Our team will review your profile within 24-48
                hours. You'll be notified once your profile is live.
              </p>
            </div>

            <Button
              onClick={handleComplete}
              variant="primary"
              fullWidth
              className="py-3"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
