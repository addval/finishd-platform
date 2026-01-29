/**
 * Admin Panel Page
 * Verify or reject unverified designers and contractors
 */

import { useState, useEffect, useCallback } from "react"
import {
  ShieldCheck,
  ShieldX,
  UserCheck,
  Users,
  Briefcase,
  BadgeCheck,
  Clock,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  getUnverifiedDesigners,
  getUnverifiedContractors,
  verifyDesigner,
  rejectDesigner,
  verifyContractor,
  rejectContractor,
  type DesignerProfile,
  type ContractorProfile,
} from "../services/finishd-api.service"

// ============================================================================
// HELPERS
// ============================================================================

type ActiveTab = "designers" | "contractors"

function formatPrice(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} Lakh`
  return `₹${amount.toLocaleString("en-IN")}`
}

// ============================================================================
// DESIGNER CARD
// ============================================================================

function DesignerReviewCard({
  designer,
  onVerified,
  onRejected,
}: {
  designer: DesignerProfile
  onVerified: (id: string) => void
  onRejected: (id: string) => void
}) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    onVerified(designer.id)
    const result = await verifyDesigner(designer.id)
    if (!result.success) {
      console.error("Failed to verify designer:", result.error)
    }
    setIsVerifying(false)
  }

  const handleReject = async () => {
    setIsRejecting(true)
    onRejected(designer.id)
    const result = await rejectDesigner(designer.id, rejectReason || undefined)
    if (!result.success) {
      console.error("Failed to reject designer:", result.error)
    }
    setIsRejecting(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {designer.profilePictureUrl ? (
                <img
                  src={designer.profilePictureUrl}
                  alt={designer.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                designer.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <CardTitle className="text-base">{designer.name}</CardTitle>
              {designer.firmName && (
                <CardDescription>{designer.firmName}</CardDescription>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Experience */}
        {designer.experienceYears != null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 shrink-0" />
            <span>{designer.experienceYears} years experience</span>
          </div>
        )}

        {/* Services */}
        {designer.services && designer.services.length > 0 && (
          <div className="text-sm">
            <span className="font-medium text-foreground">Services: </span>
            <span className="text-muted-foreground">
              {designer.services.join(", ")}
            </span>
          </div>
        )}

        {/* Design Styles */}
        {designer.styles && designer.styles.length > 0 && (
          <div className="text-sm">
            <span className="font-medium text-foreground">Styles: </span>
            <span className="text-muted-foreground">
              {designer.styles.join(", ")}
            </span>
          </div>
        )}

        {/* Service Cities */}
        {designer.serviceCities && designer.serviceCities.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {designer.serviceCities.join(", ")}
            </span>
          </div>
        )}

        {/* Price Range */}
        {designer.priceRangeMin != null && designer.priceRangeMax != null && (
          <div className="text-sm">
            <span className="font-medium text-foreground">Price Range: </span>
            <span className="text-muted-foreground">
              {formatPrice(designer.priceRangeMin)} &ndash;{" "}
              {formatPrice(designer.priceRangeMax)}
            </span>
          </div>
        )}

        {/* Bio */}
        {designer.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {designer.bio}
          </p>
        )}

        {/* Rejection Reason Form */}
        {showRejectForm && (
          <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">
              Rejection reason (optional)
            </p>
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                isLoading={isRejecting}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectReason("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {!showRejectForm && (
        <CardFooter className="gap-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={isVerifying}
            onClick={handleVerify}
          >
            <ShieldCheck className="h-4 w-4" />
            Verify
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectForm(true)}
          >
            <ShieldX className="h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// ============================================================================
// CONTRACTOR CARD
// ============================================================================

function ContractorReviewCard({
  contractor,
  onVerified,
  onRejected,
}: {
  contractor: ContractorProfile
  onVerified: (id: string) => void
  onRejected: (id: string) => void
}) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)
    onVerified(contractor.id)
    const result = await verifyContractor(contractor.id)
    if (!result.success) {
      console.error("Failed to verify contractor:", result.error)
    }
    setIsVerifying(false)
  }

  const handleReject = async () => {
    setIsRejecting(true)
    onRejected(contractor.id)
    const result = await rejectContractor(contractor.id, rejectReason || undefined)
    if (!result.success) {
      console.error("Failed to reject contractor:", result.error)
    }
    setIsRejecting(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {contractor.profilePictureUrl ? (
                <img
                  src={contractor.profilePictureUrl}
                  alt={contractor.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                contractor.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <CardTitle className="text-base">{contractor.name}</CardTitle>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Trades */}
        {contractor.trades && contractor.trades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {contractor.trades.map((trade) => (
              <span
                key={trade}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {trade}
              </span>
            ))}
          </div>
        )}

        {/* Experience */}
        {contractor.experienceYears != null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 shrink-0" />
            <span>{contractor.experienceYears} years experience</span>
          </div>
        )}

        {/* Service Areas */}
        {contractor.serviceAreas && contractor.serviceAreas.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {contractor.serviceAreas.join(", ")}
            </span>
          </div>
        )}

        {/* Bio */}
        {contractor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {contractor.bio}
          </p>
        )}

        {/* Rejection Reason Form */}
        {showRejectForm && (
          <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">
              Rejection reason (optional)
            </p>
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                isLoading={isRejecting}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectReason("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {!showRejectForm && (
        <CardFooter className="gap-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={isVerifying}
            onClick={handleVerify}
          >
            <ShieldCheck className="h-4 w-4" />
            Verify
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectForm(true)}
          >
            <ShieldX className="h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// ============================================================================
// SKELETON CARDS
// ============================================================================

function ReviewCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// ADMIN PANEL PAGE
// ============================================================================

export function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("designers")

  const [designers, setDesigners] = useState<DesignerProfile[]>([])
  const [contractors, setContractors] = useState<ContractorProfile[]>([])
  const [isLoadingDesigners, setIsLoadingDesigners] = useState(true)
  const [isLoadingContractors, setIsLoadingContractors] = useState(true)

  const fetchDesigners = useCallback(async () => {
    setIsLoadingDesigners(true)
    try {
      const data = await getUnverifiedDesigners()
      setDesigners(data)
    } catch {
      console.error("Failed to fetch unverified designers")
    } finally {
      setIsLoadingDesigners(false)
    }
  }, [])

  const fetchContractors = useCallback(async () => {
    setIsLoadingContractors(true)
    try {
      const data = await getUnverifiedContractors()
      setContractors(data)
    } catch {
      console.error("Failed to fetch unverified contractors")
    } finally {
      setIsLoadingContractors(false)
    }
  }, [])

  useEffect(() => {
    fetchDesigners()
    fetchContractors()
  }, [fetchDesigners, fetchContractors])

  const handleDesignerVerified = (id: string) => {
    setDesigners((prev) => prev.filter((d) => d.id !== id))
  }

  const handleDesignerRejected = (id: string) => {
    setDesigners((prev) => prev.filter((d) => d.id !== id))
  }

  const handleContractorVerified = (id: string) => {
    setContractors((prev) => prev.filter((c) => c.id !== id))
  }

  const handleContractorRejected = (id: string) => {
    setContractors((prev) => prev.filter((c) => c.id !== id))
  }

  const designerCount = designers.length
  const contractorCount = contractors.length

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                {designerCount + contractorCount} pending verifications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-card p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("designers")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "designers"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Designers
            {!isLoadingDesigners && designerCount > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  activeTab === "designers"
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {designerCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("contractors")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "contractors"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="h-4 w-4" />
            Contractors
            {!isLoadingContractors && contractorCount > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  activeTab === "contractors"
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {contractorCount}
              </span>
            )}
          </button>
        </div>

        {/* Designers Tab Content */}
        {activeTab === "designers" && (
          <div>
            {isLoadingDesigners ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <ReviewCardSkeleton key={i} />
                ))}
              </div>
            ) : designers.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <UserCheck className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    No pending designers to review
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {designers.map((designer) => (
                  <DesignerReviewCard
                    key={designer.id}
                    designer={designer}
                    onVerified={handleDesignerVerified}
                    onRejected={handleDesignerRejected}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contractors Tab Content */}
        {activeTab === "contractors" && (
          <div>
            {isLoadingContractors ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <ReviewCardSkeleton key={i} />
                ))}
              </div>
            ) : contractors.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <UserCheck className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    No pending contractors to review
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {contractors.map((contractor) => (
                  <ContractorReviewCard
                    key={contractor.id}
                    contractor={contractor}
                    onVerified={handleContractorVerified}
                    onRejected={handleContractorRejected}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
