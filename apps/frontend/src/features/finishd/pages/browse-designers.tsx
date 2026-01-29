/**
 * Browse Designers Page
 * Search and filter interior designers
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
      onClick={() => navigate(`/finishd/designers/${designer.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl">
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
            <h3 className="text-lg font-semibold text-gray-900 truncate">{designer.name}</h3>
            {designer.isVerified && (
              <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {designer.firmName && (
            <p className="text-sm text-gray-600 truncate">{designer.firmName}</p>
          )}

          {designer.bio && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{designer.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {designer.experienceYears && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {designer.experienceYears} yrs exp
          </span>
        )}

        {designer.projectsCompleted && designer.projectsCompleted > 0 && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {designer.projectsCompleted} projects
          </span>
        )}

        {designer.priceRangeMin && designer.priceRangeMax && (
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
            >
              {style}
            </span>
          ))}
          {designer.styles.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              +{designer.styles.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Cities */}
      {designer.serviceCities && designer.serviceCities.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Serves: {designer.serviceCities.join(", ")}
        </div>
      )}
    </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Find Interior Designers</h1>
          <p className="mt-1 text-gray-600">
            Discover talented designers for your home project
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designers..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </form>

              {/* City */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {CITIES.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Budget</label>
                <select
                  value={budgetMax}
                  onChange={(e) => {
                    setBudgetMax(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {BUDGET_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Design Styles */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Design Style
                </label>
                <div className="flex flex-wrap gap-1">
                  {DESIGN_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        toggleStyle(style)
                        setPage(1)
                      }}
                      className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                        selectedStyles.includes(style)
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {isLoading ? "Loading..." : `${total} designers found`}
              </p>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : designers.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center">
                <p className="text-gray-500">No designers found matching your criteria</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
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
                      className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
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
