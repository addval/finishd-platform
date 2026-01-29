/**
 * Homeowner Onboarding Page
 * Profile creation and property setup for homeowners
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { createHomeownerProfile, createProperty } from "../../services/finishd-api.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { StepProgress } from "@/components/ui/step-progress"
import { SuccessScreen } from "@/components/ui/success-screen"
import { ToggleChip } from "@/components/ui/toggle-chip"

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-lg">
        <StepProgress
          steps={["Profile", "Property", "Complete"]}
          currentStep={step === "profile" ? "Profile" : step === "property" ? "Property" : "Complete"}
          className="mb-8"
        />

        {/* Profile Step */}
        {step === "profile" && (
          <Card className="shadow-md">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Tell us about yourself</h2>
            <p className="mb-6 text-muted-foreground">
              Create your profile to start finding interior designers
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label className="mb-1 block">
                  Full Name *
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="px-4 py-3"
                  required
                />
              </div>

              <div>
                <Label className="mb-1 block">
                  Email (optional)
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="px-4 py-3"
                />
              </div>

              <div>
                <Label className="mb-1 block">
                  City
                </Label>
                <Select value={city || "__none__"} onValueChange={(value) => setCity(value === "__none__" ? "" : value)}>
                  <SelectTrigger className="w-full h-auto px-4 py-3">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select city</SelectItem>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block">
                  Locality / Area
                </Label>
                <Input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g., Sector 56, DLF Phase 1"
                  className="px-4 py-3"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
                className="mt-6"
              >
                {isLoading ? "Creating..." : "Continue"}
              </Button>
            </form>
            </CardContent>
          </Card>
        )}

        {/* Property Step */}
        {step === "property" && (
          <Card className="shadow-md">
            <CardContent className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Add your property</h2>
            <p className="mb-6 text-muted-foreground">
              Tell us about the property you want to design
            </p>

            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <Label className="mb-1 block">
                  Property Type
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <ToggleChip
                      key={type.value}
                      variant="card"
                      selected={propertyType === type.value}
                      onClick={() => setPropertyType(type.value as typeof propertyType)}
                    >
                      {type.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">
                    City
                  </Label>
                  <Select value={propertyCity || city || "__none__"} onValueChange={(value) => setPropertyCity(value === "__none__" ? "" : value)}>
                    <SelectTrigger className="w-full h-auto px-4 py-3">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select city</SelectItem>
                      {CITIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block">
                    Size (sq.ft)
                  </Label>
                  <Input
                    type="number"
                    value={sizeSqft}
                    onChange={(e) => setSizeSqft(e.target.value)}
                    placeholder="e.g., 1500"
                    className="px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1 block">
                  Locality / Area
                </Label>
                <Input
                  type="text"
                  value={propertyLocality || locality}
                  onChange={(e) => setPropertyLocality(e.target.value)}
                  placeholder="e.g., Sector 56"
                  className="px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">
                    Bedrooms
                  </Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger className="w-full h-auto px-4 py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "Bedroom" : "Bedrooms"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block">
                    Bathrooms
                  </Label>
                  <Select value={bathrooms} onValueChange={setBathrooms}>
                    <SelectTrigger className="w-full h-auto px-4 py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "Bathroom" : "Bathrooms"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipProperty}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Adding..." : "Add Property"}
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <SuccessScreen
            title="You're all set!"
            description="Your profile is ready. Start exploring interior designers and bring your dream home to life."
            actionLabel="Go to Dashboard"
            onAction={handleComplete}
          />
        )}
      </div>
    </div>
  )
}
