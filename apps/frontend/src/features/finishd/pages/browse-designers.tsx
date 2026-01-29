/**
 * Browse Designers Page
 * Search and filter interior designers
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BadgeCheck, Clock, CircleCheck, IndianRupee } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleChip } from "@/components/ui/toggle-chip"
import { browseDesigners, type DesignerProfile } from "../services/finishd-api.service"

const CITIES = [
  { value: "", label: "All Cities" },
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
]

const BUDGET_RANGES = [
  { value: "", label: "Any Budget" },
  { value: "500000", label: "Up to ₹5 Lakh" },
  { value: "1500000", label: "Up to ₹15 Lakh" },
  { value: "3000000", label: "Up to ₹30 Lakh" },
  { value: "5000000", label: "Up to ₹50 Lakh" },
]

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakh`
  }
  return `₹${amount.toLocaleString("en-IN")}`
}

function DesignerCard({ designer }: { designer: DesignerProfile }) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer p-6 transition-shadow hover:shadow-md"
      onClick={() => navigate(`/finishd/designers/${designer.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-2xl">
          {designer.profilePictureUrl ? (
            <img
              src={designer.profilePictureUrl}
              alt={designer.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            designer.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground truncate">{designer.name}</h3>
            {designer.isVerified && (
              <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
            )}
          </div>

          {designer.firmName && (
            <p className="text-sm text-muted-foreground truncate">{designer.firmName}</p>
          )}

          {designer.bio && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{designer.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {designer.experienceYears && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {designer.experienceYears} yrs exp
          </span>
        )}

        {designer.projectsCompleted && designer.projectsCompleted > 0 && (
          <span className="flex items-center gap-1">
            <CircleCheck className="h-4 w-4" />
            {designer.projectsCompleted} projects
          </span>
        )}

        {designer.priceRangeMin && designer.priceRangeMax && (
          <span className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            {formatPrice(designer.priceRangeMin)} - {formatPrice(designer.priceRangeMax)}
          </span>
        )}
      </div>

      {/* Styles */}
      {designer.styles && designer.styles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {designer.styles.slice(0, 3).map((style) => (
            <span
              key={style}
              className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {style}
            </span>
          ))}
          {designer.styles.length > 3 && (
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              +{designer.styles.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Cities */}
      {designer.serviceCities && designer.serviceCities.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Serves: {designer.serviceCities.join(", ")}
        </div>
      )}
    </Card>
  )
}

export function BrowseDesignersPage() {
  const [designers, setDesigners] = useState<DesignerProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [budgetMax, setBudgetMax] = useState("")

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    )
  }

  const fetchDesigners = async () => {
    setIsLoading(true)
    try {
      const result = await browseDesigners({
        query: searchQuery || undefined,
        city: selectedCity || undefined,
        styles: selectedStyles.length > 0 ? selectedStyles : undefined,
        budgetMax: budgetMax ? parseInt(budgetMax) : undefined,
        page,
        limit: 12,
      })
      setDesigners(result.designers)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      console.error("Failed to fetch designers")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigners()
  }, [page, selectedCity, selectedStyles, budgetMax])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchDesigners()
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCity("")
    setSelectedStyles([])
    setBudgetMax("")
    setPage(1)
  }

  const hasFilters = searchQuery || selectedCity || selectedStyles.length > 0 || budgetMax

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Find Interior Designers</h1>
          <p className="mt-1 text-muted-foreground">
            Discover talented designers for your home project
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <Card className="p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designers..."
                  className="text-sm"
                />
              </form>

              {/* City */}
              <div className="mb-4">
                <Label className="mb-1 block">City</Label>
                <Select value={selectedCity || "__all__"} onValueChange={(value) => { setSelectedCity(value === "__all__" ? "" : value); setPage(1) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city.value || "__all__"} value={city.value || "__all__"}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="mb-4">
                <Label className="mb-1 block">Budget</Label>
                <Select value={budgetMax || "__any__"} onValueChange={(value) => { setBudgetMax(value === "__any__" ? "" : value); setPage(1) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range.value || "__any__"} value={range.value || "__any__"}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Design Styles */}
              <div>
                <Label className="mb-2 block">
                  Design Style
                </Label>
                <div className="flex flex-wrap gap-1">
                  {DESIGN_STYLES.map((style) => (
                    <ToggleChip
                      key={style}
                      selected={selectedStyles.includes(style)}
                      onClick={() => {
                        toggleStyle(style)
                        setPage(1)
                      }}
                      className="px-2 py-1 text-xs"
                    >
                      {style}
                    </ToggleChip>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${total} designers found`}
              </p>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : designers.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No designers found matching your criteria</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-primary hover:text-primary/80"
                  >
                    Clear filters
                  </button>
                )}
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {designers.map((designer) => (
                    <DesignerCard key={designer.id} designer={designer} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-md border border-input px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-md border border-input px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
