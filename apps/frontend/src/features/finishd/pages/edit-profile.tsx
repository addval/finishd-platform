/**
 * Edit Profile Page
 * Renders different profile edit forms based on user type (homeowner, designer, contractor)
 */

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleChip, ToggleChipGroup } from "@/components/ui/toggle-chip"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import {
  getHomeownerProfile,
  updateHomeownerProfile,
  getDesignerProfile,
  updateDesignerProfile,
  getContractorProfile,
  updateContractorProfile,
  type HomeownerProfile,
  type DesignerProfile,
  type ContractorProfile,
} from "../services/finishd-api.service"

// ============================================================================
// CONSTANTS
// ============================================================================

const CITIES = [
  "Delhi",
  "Gurgaon",
  "Noida",
  "Faridabad",
  "Ghaziabad",
  "Chandigarh",
  "Mohali",
  "Panchkula",
]

const DESIGNER_SERVICES = [
  "Full Home Design",
  "Room Redesign",
  "Kitchen Design",
  "Bathroom Design",
  "Living Room Design",
  "Bedroom Design",
  "Office Design",
  "Consultation Only",
]

const DESIGN_STYLES = [
  "Contemporary",
  "Modern",
  "Traditional",
  "Minimalist",
  "Industrial",
  "Scandinavian",
  "Bohemian",
  "Art Deco",
]

const CONTRACTOR_TRADES = [
  "Electrician",
  "Plumber",
  "Mason",
  "Carpenter",
  "Painter",
  "General Contractor",
  "False Ceiling",
  "Flooring",
  "HVAC",
]

// ============================================================================
// HELPERS
// ============================================================================

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-12 w-full" />
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// HOMEOWNER EDIT FORM
// ============================================================================

function HomeownerEditForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("")
  const [locality, setLocality] = useState("")

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const profile = await getHomeownerProfile()
      if (profile) {
        setName(profile.name || "")
        setEmail(profile.email || "")
        setCity(profile.city || "")
        setLocality(profile.locality || "")
      }
    } catch {
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await updateHomeownerProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        city: city || undefined,
        locality: locality.trim() || undefined,
      })
      if (result.success) {
        navigate("/finishd/dashboard")
      } else {
        setError(result.error || "Failed to save profile")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your homeowner profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a city</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locality">Locality</Label>
          <Input
            id="locality"
            type="text"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="e.g., Sector 50, DLF Phase 3"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          variant="primary"
          isLoading={isSaving}
          fullWidth
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// DESIGNER EDIT FORM
// ============================================================================

function DesignerEditForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [firmName, setFirmName] = useState("")
  const [bio, setBio] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [styles, setStyles] = useState<string[]>([])
  const [serviceCities, setServiceCities] = useState<string[]>([])
  const [priceRangeMin, setPriceRangeMin] = useState("")
  const [priceRangeMax, setPriceRangeMax] = useState("")

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const profile = await getDesignerProfile()
      if (profile) {
        setName(profile.name || "")
        setFirmName(profile.firmName || "")
        setBio(profile.bio || "")
        setExperienceYears(
          profile.experienceYears != null ? String(profile.experienceYears) : "",
        )
        setServices(profile.services || [])
        setStyles(profile.styles || [])
        setServiceCities(profile.serviceCities || [])
        setPriceRangeMin(
          profile.priceRangeMin != null ? String(profile.priceRangeMin) : "",
        )
        setPriceRangeMax(
          profile.priceRangeMax != null ? String(profile.priceRangeMax) : "",
        )
      }
    } catch {
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await updateDesignerProfile({
        name: name.trim(),
        firmName: firmName.trim() || undefined,
        bio: bio.trim() || undefined,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : undefined,
        services: services.length > 0 ? services : undefined,
        styles: styles.length > 0 ? styles : undefined,
        serviceCities: serviceCities.length > 0 ? serviceCities : undefined,
        priceRangeMin: priceRangeMin ? parseInt(priceRangeMin, 10) : undefined,
        priceRangeMax: priceRangeMax ? parseInt(priceRangeMax, 10) : undefined,
      })
      if (result.success) {
        navigate("/finishd/dashboard")
      } else {
        setError(result.error || "Failed to save profile")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your designer profile and services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="designer-name">Name</Label>
          <Input
            id="designer-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firm-name">Firm Name</Label>
          <Input
            id="firm-name"
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            placeholder="Your design firm name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designer-bio">Bio</Label>
          <Textarea
            id="designer-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell homeowners about your design philosophy and experience..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience-years">Experience Years</Label>
          <Input
            id="experience-years"
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g., 5"
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label>Services</Label>
          <ToggleChipGroup>
            {DESIGNER_SERVICES.map((service) => (
              <ToggleChip
                key={service}
                selected={services.includes(service)}
                onClick={() => setServices((prev) => toggleItem(prev, service))}
              >
                {service}
              </ToggleChip>
            ))}
          </ToggleChipGroup>
        </div>

        <div className="space-y-2">
          <Label>Design Styles</Label>
          <ToggleChipGroup>
            {DESIGN_STYLES.map((style) => (
              <ToggleChip
                key={style}
                selected={styles.includes(style)}
                onClick={() => setStyles((prev) => toggleItem(prev, style))}
              >
                {style}
              </ToggleChip>
            ))}
          </ToggleChipGroup>
        </div>

        <div className="space-y-2">
          <Label>Service Cities</Label>
          <ToggleChipGroup>
            {CITIES.map((c) => (
              <ToggleChip
                key={c}
                selected={serviceCities.includes(c)}
                onClick={() => setServiceCities((prev) => toggleItem(prev, c))}
              >
                {c}
              </ToggleChip>
            ))}
          </ToggleChipGroup>
        </div>

        <div className="space-y-2">
          <Label>Price Range (INR)</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={priceRangeMin}
              onChange={(e) => setPriceRangeMin(e.target.value)}
              placeholder="Min"
              min={0}
            />
            <Input
              type="number"
              value={priceRangeMax}
              onChange={(e) => setPriceRangeMax(e.target.value)}
              placeholder="Max"
              min={0}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          variant="primary"
          isLoading={isSaving}
          fullWidth
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// CONTRACTOR EDIT FORM
// ============================================================================

function ContractorEditForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [trades, setTrades] = useState<string[]>([])
  const [serviceAreas, setServiceAreas] = useState<string[]>([])

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const profile = await getContractorProfile()
      if (profile) {
        setName(profile.name || "")
        setBio(profile.bio || "")
        setExperienceYears(
          profile.experienceYears != null ? String(profile.experienceYears) : "",
        )
        setTrades(profile.trades || [])
        setServiceAreas(profile.serviceAreas || [])
      }
    } catch {
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await updateContractorProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : undefined,
        trades: trades.length > 0 ? trades : undefined,
        serviceAreas: serviceAreas.length > 0 ? serviceAreas : undefined,
      })
      if (result.success) {
        navigate("/finishd/dashboard")
      } else {
        setError(result.error || "Failed to save profile")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your contractor profile and trade skills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contractor-name">Name</Label>
          <Input
            id="contractor-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor-bio">Bio</Label>
          <Textarea
            id="contractor-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your skills, experience, and past work..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor-experience">Experience Years</Label>
          <Input
            id="contractor-experience"
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g., 8"
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label>Trades</Label>
          <ToggleChipGroup>
            {CONTRACTOR_TRADES.map((trade) => (
              <ToggleChip
                key={trade}
                selected={trades.includes(trade)}
                onClick={() => setTrades((prev) => toggleItem(prev, trade))}
              >
                {trade}
              </ToggleChip>
            ))}
          </ToggleChipGroup>
        </div>

        <div className="space-y-2">
          <Label>Service Areas</Label>
          <ToggleChipGroup>
            {CITIES.map((c) => (
              <ToggleChip
                key={c}
                selected={serviceAreas.includes(c)}
                onClick={() => setServiceAreas((prev) => toggleItem(prev, c))}
              >
                {c}
              </ToggleChip>
            ))}
          </ToggleChipGroup>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          variant="primary"
          isLoading={isSaving}
          fullWidth
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function EditProfilePage() {
  const navigate = useNavigate()
  const { user } = useFinishdAuthStore()

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/finishd/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-card transition-colors hover:bg-muted"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
        </div>

        {/* Form by user type */}
        {user?.userType === "homeowner" && <HomeownerEditForm />}
        {user?.userType === "designer" && <DesignerEditForm />}
        {user?.userType === "contractor" && <ContractorEditForm />}
        {!user?.userType && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Unable to determine your account type. Please return to the dashboard.
              </p>
              <Button
                onClick={() => navigate("/finishd/dashboard")}
                variant="outline"
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
