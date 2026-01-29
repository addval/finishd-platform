/**
 * Designer Detail Page
 * Shows a designer's full profile when a homeowner clicks from the browse page.
 * Homeowners can send a project request directly from this page.
 */

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Clock,
  CircleCheck,
  ImageIcon,
  IndianRupee,
  MapPin,
  Palette,
  Send,
  X,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  getDesignerById,
  getProjects,
  sendRequestToDesigner,
  type DesignerProfile,
  type Project,
} from "../services/finishd-api.service"
import { useFinishdAuthStore } from "../store/finishd-auth.store"

// ============================================================================
// HELPERS
// ============================================================================

function formatPrice(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} Lakh`
  return `₹${amount.toLocaleString("en-IN")}`
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function DesignerDetailSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-card border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Profile header skeleton */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </Card>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>

        {/* Details skeleton */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </Card>

        {/* Portfolio skeleton */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="aspect-square rounded-lg" />
          </div>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// NOT FOUND STATE
// ============================================================================

function DesignerNotFound(): React.ReactElement {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-card border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/finishd/designers")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Designers
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="p-12 text-center">
          <CardContent className="space-y-4 p-0">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Designer Not Found</CardTitle>
            <CardDescription className="text-base">
              The designer profile you are looking for does not exist or may have been removed.
            </CardDescription>
            <Button
              variant="primary"
              onClick={() => navigate("/finishd/designers")}
            >
              Browse Designers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// SEND REQUEST DIALOG (Card Overlay)
// ============================================================================

interface SendRequestDialogProps {
  designer: DesignerProfile
  onClose: () => void
  onSuccess: () => void
}

function SendRequestDialog({
  designer,
  onClose,
  onSuccess,
}: SendRequestDialogProps): React.ReactElement {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects(): Promise<void> {
      setIsLoadingProjects(true)
      try {
        const allProjects = await getProjects()
        // Only show projects that are in a state where a designer can be requested
        const eligibleProjects = allProjects.filter(
          (p) => p.status === "draft" || p.status === "seeking_designer"
        )
        setProjects(eligibleProjects)
        if (eligibleProjects.length > 0) {
          setSelectedProjectId(eligibleProjects[0].id)
        }
      } catch {
        setError("Failed to load projects")
      } finally {
        setIsLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  async function handleSendRequest(): Promise<void> {
    if (!selectedProjectId) {
      setError("Please select a project")
      return
    }

    setIsSending(true)
    setError(null)

    const result = await sendRequestToDesigner({
      projectId: selectedProjectId,
      designerId: designer.id,
      message: message.trim() || undefined,
    })

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || "Failed to send request")
    }

    setIsSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Send Request</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription>
            Send a project request to {designer.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label>Select Project</Label>
            {isLoadingProjects ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : projects.length === 0 ? (
              <Card className="p-4 text-center">
                <CardDescription>
                  No eligible projects found. Create a project first before sending a request.
                </CardDescription>
              </Card>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={cn(
                      "cursor-pointer p-3 transition-colors",
                      selectedProjectId === project.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-4 w-4 shrink-0 rounded-full border-2",
                          selectedProjectId === project.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.scope === "full_home" ? "Full Home" : "Partial"}
                          {project.budgetMin && project.budgetMax && (
                            <> &middot; {formatPrice(project.budgetMin)} - {formatPrice(project.budgetMax)}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="request-message">Message (optional)</Label>
            <Textarea
              id="request-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your requirements or ask the designer a question..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <Card className="border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}
        </CardContent>

        <CardFooter className="gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSendRequest}
            isLoading={isSending}
            disabled={projects.length === 0 || !selectedProjectId}
            className="flex-1"
          >
            <Send className="h-4 w-4" />
            Send Request
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export function DesignerDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useFinishdAuthStore()

  const [designer, setDesigner] = useState<DesignerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const isHomeowner = user?.userType === "homeowner"

  useEffect(() => {
    async function fetchDesigner(): Promise<void> {
      if (!id) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const result = await getDesignerById(id)

      if (result) {
        setDesigner(result)
      } else {
        setNotFound(true)
      }

      setIsLoading(false)
    }

    fetchDesigner()
  }, [id])

  // Loading state
  if (isLoading) {
    return <DesignerDetailSkeleton />
  }

  // Not found state
  if (notFound || !designer) {
    return <DesignerNotFound />
  }

  function handleRequestSuccess(): void {
    setShowRequestDialog(false)
    setRequestSent(true)
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/finishd/designers")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Designers
          </Button>

          {isHomeowner && !requestSent && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRequestDialog(true)}
            >
              <Send className="h-4 w-4" />
              Send Request
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Success banner after sending request */}
        {requestSent && (
          <Card className="border-green-300 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CircleCheck className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Request sent successfully!
                </p>
                <p className="text-sm text-green-700">
                  {designer.name} will review your request and respond soon.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted text-3xl font-semibold">
                {designer.profilePictureUrl ? (
                  <img
                    src={designer.profilePictureUrl}
                    alt={designer.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  designer.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {designer.name}
                  </h1>
                  {designer.isVerified && (
                    <BadgeCheck className="h-6 w-6 text-primary shrink-0" />
                  )}
                </div>

                {designer.firmName && (
                  <p className="mt-1 text-base text-muted-foreground">
                    {designer.firmName}
                  </p>
                )}

                {designer.bio && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {designer.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Experience */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-lg font-semibold text-foreground">
                  {designer.experienceYears
                    ? `${designer.experienceYears} Years`
                    : "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Projects Completed */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CircleCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projects Completed</p>
                <p className="text-lg font-semibold text-foreground">
                  {designer.projectsCompleted != null
                    ? designer.projectsCompleted
                    : "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Range</p>
                <p className="text-lg font-semibold text-foreground">
                  {designer.priceRangeMin && designer.priceRangeMax
                    ? `${formatPrice(designer.priceRangeMin)} - ${formatPrice(designer.priceRangeMax)}`
                    : "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Cities */}
        {designer.serviceCities && designer.serviceCities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Service Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {designer.serviceCities.map((city) => (
                  <span
                    key={city}
                    className={cn(
                      "inline-flex items-center rounded-full bg-muted px-3 py-1.5",
                      "text-sm font-medium text-foreground"
                    )}
                  >
                    {city}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Design Styles */}
        {designer.styles && designer.styles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-muted-foreground" />
                Design Styles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {designer.styles.map((style) => (
                  <span
                    key={style}
                    className={cn(
                      "inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5",
                      "text-sm font-medium text-primary"
                    )}
                  >
                    {style}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Offered */}
        {designer.services && designer.services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {designer.services.map((service) => (
                  <li key={service} className="flex items-center gap-2 text-sm text-foreground">
                    <CircleCheck className="h-4 w-4 text-primary shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {designer.portfolioImages && designer.portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {designer.portfolioImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={imageUrl}
                      alt={`${designer.name} portfolio ${index + 1}`}
                      className="aspect-square w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No portfolio images yet
                </p>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Bottom CTA for homeowners */}
        {isHomeowner && !requestSent && (
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Interested in working with {designer.name}?
                </p>
                <p className="text-sm text-muted-foreground">
                  Send a request to start the conversation about your project.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowRequestDialog(true)}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
                Send Request
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Send Request Dialog Overlay */}
      {showRequestDialog && (
        <SendRequestDialog
          designer={designer}
          onClose={() => setShowRequestDialog(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  )
}
