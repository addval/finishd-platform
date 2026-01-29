/**
 * Proposals Page
 * Proposal management for designers (incoming requests + submit) and homeowners (review + accept/reject)
 */

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  IndianRupee,
  Send,
  XCircle,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import {
  getDesignerRequests,
  submitProposal,
  getProjects,
  getProjectProposals,
  acceptProposal,
  rejectProposal,
  type ProjectRequest,
  type Proposal,
  type ProjectProposalItem,
  type Project,
  type DesignerProfile,
} from "../services/finishd-api.service"

// ============================================================================
// HELPERS
// ============================================================================

function formatPrice(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} Lakh`
  return `₹${amount.toLocaleString("en-IN")}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getRequestStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800"
    case "proposal_submitted":
      return "bg-blue-100 text-blue-800"
    case "accepted":
      return "bg-emerald-100 text-emerald-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-muted text-foreground"
  }
}

function getRequestStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending"
    case "proposal_submitted":
      return "Proposal Submitted"
    case "accepted":
      return "Accepted"
    case "rejected":
      return "Rejected"
    default:
      return status
  }
}

// ============================================================================
// DESIGNER VIEW — Incoming Requests + Submit Proposals
// ============================================================================

function DesignerProposalsView() {
  const [requests, setRequests] = useState<ProjectRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [proposalForm, setProposalForm] = useState({
    costEstimate: "",
    timelineWeeks: "",
    scopeDescription: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getDesignerRequests()
      setRequests(data)
    } catch {
      console.error("Failed to load designer requests")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const resetForm = () => {
    setProposalForm({ costEstimate: "", timelineWeeks: "", scopeDescription: "" })
    setSubmitError(null)
  }

  const handleToggleForm = (requestId: string) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null)
    } else {
      setExpandedRequestId(requestId)
    }
    resetForm()
  }

  const handleSubmitProposal = async (requestId: string) => {
    const cost = parseFloat(proposalForm.costEstimate)
    const weeks = parseInt(proposalForm.timelineWeeks, 10)

    if (!cost || cost <= 0) {
      setSubmitError("Please enter a valid cost estimate")
      return
    }
    if (!weeks || weeks <= 0) {
      setSubmitError("Please enter a valid timeline in weeks")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitProposal(requestId, {
        costEstimate: cost,
        timelineWeeks: weeks,
        scopeDescription: proposalForm.scopeDescription || undefined,
      })

      if (result.success) {
        setExpandedRequestId(null)
        resetForm()
        await loadRequests()
      } else {
        setSubmitError(result.error || "Failed to submit proposal")
      }
    } catch {
      setSubmitError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mb-4 flex justify-center">
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No project requests yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          When homeowners send you project requests, they will appear here.
          Make sure your profile is complete to attract more clients.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Project Request</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Received {formatDate(request.createdAt)}
                </CardDescription>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  getRequestStatusColor(request.status),
                )}
              >
                {getRequestStatusLabel(request.status)}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {request.message ? (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-foreground">{request.message}</p>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No message from homeowner</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-4">
            {/* Pending — show Submit Proposal toggle */}
            {request.status === "pending" && (
              <>
                <Button
                  variant={expandedRequestId === request.id ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handleToggleForm(request.id)}
                  className="self-start"
                >
                  <Send className="h-4 w-4" />
                  {expandedRequestId === request.id ? "Cancel" : "Submit Proposal"}
                </Button>

                {expandedRequestId === request.id && (
                  <div className="w-full space-y-4 rounded-lg border border-border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`cost-${request.id}`}>Cost Estimate (₹)</Label>
                        <Input
                          id={`cost-${request.id}`}
                          type="number"
                          min="0"
                          placeholder="e.g. 500000"
                          value={proposalForm.costEstimate}
                          onChange={(e) =>
                            setProposalForm((prev) => ({
                              ...prev,
                              costEstimate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`timeline-${request.id}`}>Timeline (weeks)</Label>
                        <Input
                          id={`timeline-${request.id}`}
                          type="number"
                          min="1"
                          placeholder="e.g. 12"
                          value={proposalForm.timelineWeeks}
                          onChange={(e) =>
                            setProposalForm((prev) => ({
                              ...prev,
                              timelineWeeks: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`scope-${request.id}`}>Scope Description</Label>
                      <Textarea
                        id={`scope-${request.id}`}
                        placeholder="Describe what you will deliver, materials to be used, and any other relevant details..."
                        rows={4}
                        value={proposalForm.scopeDescription}
                        onChange={(e) =>
                          setProposalForm((prev) => ({
                            ...prev,
                            scopeDescription: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {submitError && (
                      <p className="text-sm text-destructive">{submitError}</p>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isSubmitting}
                      onClick={() => handleSubmitProposal(request.id)}
                    >
                      Submit Proposal
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Proposal Submitted */}
            {request.status === "proposal_submitted" && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <CheckCircle2 className="h-4 w-4" />
                Proposal submitted — awaiting homeowner response
              </div>
            )}

            {/* Accepted */}
            {request.status === "accepted" && (
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Your proposal was accepted
              </div>
            )}

            {/* Rejected */}
            {request.status === "rejected" && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                This request was declined
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// ============================================================================
// HOMEOWNER VIEW — Review Proposals + Accept/Reject
// ============================================================================

interface ProjectWithProposals {
  project: Project
  proposals: ProjectProposalItem[]
}

function HomeownerProposalsView() {
  const [projectProposals, setProjectProposals] = useState<ProjectWithProposals[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acceptedProposalId, setAcceptedProposalId] = useState<string | null>(null)

  const loadProposals = useCallback(async () => {
    setIsLoading(true)
    try {
      const projects = await getProjects()
      const seekingProjects = projects.filter((p) => p.status === "seeking_designer")

      const grouped: ProjectWithProposals[] = await Promise.all(
        seekingProjects.map(async (project) => {
          const items = (await getProjectProposals(project.id)) as ProjectProposalItem[]
          return { project, proposals: items }
        }),
      )

      // Only show projects that have at least one proposal with a submitted proposal
      setProjectProposals(grouped.filter((g) => g.proposals.length > 0))
    } catch {
      console.error("Failed to load proposals")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProposals()
  }, [loadProposals])

  const handleAccept = async (proposalId: string) => {
    setActionLoadingId(proposalId)
    setActionError(null)

    try {
      const result = await acceptProposal(proposalId)
      if (result.success) {
        setAcceptedProposalId(proposalId)
      } else {
        setActionError(result.error || "Failed to accept proposal")
      }
    } catch {
      setActionError("An unexpected error occurred")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (proposalId: string) => {
    setActionLoadingId(proposalId)
    setActionError(null)

    try {
      const result = await rejectProposal(proposalId)
      if (result.success) {
        await loadProposals()
      } else {
        setActionError(result.error || "Failed to reject proposal")
      }
    } catch {
      setActionError("An unexpected error occurred")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48 rounded" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-52 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // Success state after accepting a proposal
  if (acceptedProposalId) {
    return (
      <Card className="p-12 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Proposal Accepted!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The designer has been notified and your project is now in progress.
        </p>
        <Button
          variant="primary"
          size="sm"
          className="mt-6"
          onClick={() => {
            setAcceptedProposalId(null)
            loadProposals()
          }}
        >
          View More Proposals
        </Button>
      </Card>
    )
  }

  // Empty state
  if (projectProposals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mb-4 flex justify-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No proposals yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          When designers submit proposals for your projects, they will appear here.
          Try sending requests to more designers to get proposals faster.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {projectProposals.map(({ project, proposals }) => (
        <div key={project.id}>
          {/* Project heading */}
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground">{project.title}</h2>
            <p className="text-sm text-muted-foreground">
              {project.scope === "full_home" ? "Full Home" : "Partial"}
              {project.budgetMin && project.budgetMax
                ? ` — Budget: ${formatPrice(project.budgetMin)} - ${formatPrice(project.budgetMax)}`
                : ""}
            </p>
          </div>

          {/* Proposal cards for this project */}
          <div className="space-y-4">
            {proposals.map((item) => {
              const proposalId = item.proposal?.id
              const isCurrentAction = actionLoadingId === proposalId
              const canAct =
                item.request.status === "proposal_submitted" && item.proposal !== null

              return (
                <Card key={item.request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Designer avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {item.designer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{item.designer.name}</CardTitle>
                            {item.designer.isVerified && (
                              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                            )}
                          </div>
                          {item.designer.firmName && (
                            <CardDescription>{item.designer.firmName}</CardDescription>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                          getRequestStatusColor(item.request.status),
                        )}
                      >
                        {getRequestStatusLabel(item.request.status)}
                      </span>
                    </div>
                  </CardHeader>

                  {/* Proposal details */}
                  {item.proposal && (
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Cost Estimate</p>
                            <p className="font-semibold text-foreground">
                              {formatPrice(item.proposal.costEstimate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                            <p className="font-semibold text-foreground">
                              {item.proposal.timelineWeeks}{" "}
                              {item.proposal.timelineWeeks === 1 ? "week" : "weeks"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {item.proposal.scopeDescription && (
                        <div className="mt-4 rounded-lg bg-muted p-3">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Scope Description
                          </p>
                          <p className="text-sm text-foreground">
                            {item.proposal.scopeDescription}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}

                  {/* Accept / Reject buttons for actionable proposals */}
                  {canAct && (
                    <CardFooter className="flex flex-col items-stretch gap-3">
                      {actionError && isCurrentAction && (
                        <p className="text-sm text-destructive">{actionError}</p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isCurrentAction}
                          onClick={() => handleAccept(item.proposal!.id)}
                          disabled={!!actionLoadingId}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          isLoading={isCurrentAction}
                          onClick={() => handleReject(item.proposal!.id)}
                          disabled={!!actionLoadingId}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardFooter>
                  )}

                  {/* Terminal status indicators */}
                  {item.request.status === "accepted" && (
                    <CardFooter>
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Proposal accepted
                      </div>
                    </CardFooter>
                  )}

                  {item.request.status === "rejected" && (
                    <CardFooter>
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <XCircle className="h-4 w-4" />
                        Proposal rejected
                      </div>
                    </CardFooter>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function ProposalsPage() {
  const { user } = useFinishdAuthStore()
  const navigate = useNavigate()
  const isDesigner = user?.userType === "designer"

  return (
    <div className="min-h-screen bg-muted">
      {/* Page header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <button
            onClick={() => navigate("/finishd/dashboard")}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {isDesigner ? "Project Requests" : "Proposals"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isDesigner
              ? "Review incoming project requests and submit proposals"
              : "Review proposals from designers for your projects"}
          </p>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {isDesigner ? <DesignerProposalsView /> : <HomeownerProposalsView />}
      </div>
    </div>
  )
}
