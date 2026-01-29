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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { StepProgress } from "@/components/ui/step-progress"
import { SuccessScreen } from "@/components/ui/success-screen"
import { ToggleChip, ToggleChipGroup } from "@/components/ui/toggle-chip"
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
        <StepProgress
          steps={["Basic Info", "Expertise", "Complete"]}
          currentStep={step === "basic" ? "Basic Info" : step === "expertise" ? "Expertise" : "Complete"}
          className="mb-8"
        />

        {/* Basic Info Step */}
        {step === "basic" && (
          <Card className="shadow-md">
            <CardContent className="p-8">
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
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell homeowners about your design philosophy, specializations, and what makes you unique..."
                  rows={4}
                  className="px-4 py-3"
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
            </CardContent>
          </Card>
        )}

        {/* Expertise Step */}
        {step === "expertise" && (
          <Card className="shadow-md">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Your expertise</h2>
            <p className="mb-6 text-muted-foreground">Help homeowners find you based on their needs</p>

            <form onSubmit={handleExpertiseSubmit} className="space-y-6">
              {/* Cities */}
              <div>
                <Label className="mb-2 block">Cities you serve *</Label>
                <ToggleChipGroup>
                  {CITIES.map((city) => (
                    <ToggleChip
                      key={city.value}
                      selected={selectedCities.includes(city.value)}
                      onClick={() => toggleCity(city.value)}
                    >
                      {city.label}
                    </ToggleChip>
                  ))}
                </ToggleChipGroup>
              </div>

              {/* Design Styles */}
              <div>
                <Label className="mb-2 block">Design styles you specialize in *</Label>
                <ToggleChipGroup>
                  {DESIGN_STYLES.map((style) => (
                    <ToggleChip
                      key={style}
                      selected={selectedStyles.includes(style)}
                      onClick={() => toggleStyle(style)}
                    >
                      {style}
                    </ToggleChip>
                  ))}
                </ToggleChipGroup>
              </div>

              {/* Services */}
              <div>
                <Label className="mb-2 block">Services you offer</Label>
                <ToggleChipGroup>
                  {SERVICES.map((service) => (
                    <ToggleChip
                      key={service}
                      selected={selectedServices.includes(service)}
                      onClick={() => toggleService(service)}
                    >
                      {service}
                    </ToggleChip>
                  ))}
                </ToggleChipGroup>
              </div>

              {/* Budget Range */}
              <div>
                <Label className="mb-2 block">Typical project budget range</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BUDGET_RANGES.map((range) => (
                    <ToggleChip
                      key={range.label}
                      variant="card"
                      selected={budgetRange?.min === range.min}
                      onClick={() => setBudgetRange(range)}
                    >
                      {range.label}
                    </ToggleChip>
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
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <SuccessScreen
            title="Profile submitted!"
            description="Your profile is under review. Once verified, you'll start receiving project requests from homeowners."
            actionLabel="Go to Dashboard"
            onAction={handleComplete}
            notice={{
              title: "Verification pending:",
              message: "Our team will review your profile within 24-48 hours. You'll be notified once your profile is live.",
            }}
          />
        )}
      </div>
    </div>
  )
}
