/**
 * Contractor Onboarding Page
 * Profile creation for contractors
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SuccessScreen } from "@/components/ui/success-screen"
import { Textarea } from "@/components/ui/textarea"
import { ToggleChip, ToggleChipGroup } from "@/components/ui/toggle-chip"
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-8">
        <div className="w-full max-w-lg">
          <SuccessScreen
            title="Profile submitted!"
            description="Your profile is under review. Once verified, designers will be able to invite you to projects."
            actionLabel="Go to Dashboard"
            onAction={handleComplete}
            notice={{
              title: "Verification pending:",
              message: "Our team will review your profile within 24-48 hours. You'll be notified once your profile is live.",
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create your contractor profile</h1>
          <p className="mt-2 text-muted-foreground">
            Let designers and homeowners know about your skills
          </p>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">
                  Your Name / Business Name *
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sharma Electricals"
                  className="px-4 py-3 h-auto"
                  required
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
                  About Your Work
                </Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your experience, specializations, and what makes you reliable..."
                  rows={3}
                  className="px-4 py-3"
                />
              </div>
            </div>

            {/* Trades */}
            <div>
              <Label className="mb-2 block">
                Your trades / skills *
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TRADES.map((trade) => (
                  <ToggleChip
                    key={trade.value}
                    variant="card"
                    selected={selectedTrades.includes(trade.value)}
                    onClick={() => toggleTrade(trade.value)}
                    className="flex items-center gap-2"
                  >
                    <span>{trade.icon}</span>
                    <span>{trade.label}</span>
                  </ToggleChip>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div>
              <Label className="mb-2 block">
                Areas you serve *
              </Label>
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="mt-6 py-3"
            >
              {isLoading ? "Creating..." : "Create Profile"}
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
