/**
 * Project Detail Page
 * Full project view with tabs for overview, tasks, milestones, costs, and activity
 */

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Clock,
  Calendar,
  User,
  IndianRupee,
  ClipboardList,
  CircleDot,
  Circle,
  CircleCheckBig,
  Play,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import {
  getProjectById,
  completeProject,
  cancelProject,
  getProjectTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  getProjectMilestones,
  createMilestone,
  markMilestonePaid,
  getProjectCosts,
  createCostEstimate,
  getProjectActivity,
  getProjectProposals,
  type Project,
  type Task,
  type Milestone,
  type CostEstimate,
  type ActivityLog,
  type ProjectProposalItem,
} from "../services/finishd-api.service"

// ============================================================================
// HELPERS
// ============================================================================

type TabKey = "overview" | "tasks" | "milestones" | "costs" | "activity"

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "milestones", label: "Milestones" },
  { key: "costs", label: "Costs" },
  { key: "activity", label: "Activity" },
]

const COST_CATEGORIES: { value: CostEstimate["category"]; label: string }[] = [
  { value: "design_fees", label: "Design Fees" },
  { value: "labor", label: "Labor" },
  { value: "materials", label: "Materials" },
  { value: "miscellaneous", label: "Miscellaneous" },
]

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `\u20B9${(amount / 10000000).toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    return `\u20B9${(amount / 100000).toFixed(1)} Lakh`
  }
  return `\u20B9${amount.toLocaleString("en-IN")}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN")
}

function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-muted text-muted-foreground"
    case "seeking_designer":
      return "bg-yellow-100 text-yellow-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft"
    case "seeking_designer":
      return "Seeking Designer"
    case "in_progress":
      return "In Progress"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

function getTaskStatusIcon(status: Task["status"]): React.ReactNode {
  switch (status) {
    case "todo":
      return <Circle className="h-4 w-4 text-muted-foreground" />
    case "in_progress":
      return <CircleDot className="h-4 w-4 text-blue-600" />
    case "completed":
      return <CircleCheckBig className="h-4 w-4 text-green-600" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ProjectDetailSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="mx-auto max-w-4xl px-4">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-2 h-10 w-3/4" />
        <div className="mb-6 flex gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="mb-8 h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({
  project,
  proposals,
  proposalsLoading,
}: {
  project: Project
  proposals: ProjectProposalItem[]
  proposalsLoading: boolean
}): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Scope</dt>
              <dd className="mt-1 text-foreground">
                {project.scope === "full_home" ? "Full Home" : "Partial"}
              </dd>
            </div>
            {project.scopeDetails?.rooms && project.scopeDetails.rooms.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Rooms</dt>
                <dd className="mt-1 text-foreground">
                  {project.scopeDetails.rooms.join(", ")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Budget</dt>
              <dd className="mt-1 text-foreground">
                {project.budgetMin != null && project.budgetMax != null
                  ? `${formatPrice(project.budgetMin)} - ${formatPrice(project.budgetMax)}`
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Timeline</dt>
              <dd className="mt-1 text-foreground">
                {project.timelineWeeks ? `${project.timelineWeeks} weeks` : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
              <dd className="mt-1 text-foreground">
                {project.startTimeline ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-foreground">{formatDate(project.createdAt)}</dd>
            </div>
            {project.scopeDetails?.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="mt-1 text-foreground">{project.scopeDetails.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Assigned Designer */}
      {project.designerId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assigned Designer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Designer ID: {project.designerId}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
          <CardDescription>
            Designer proposals for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposalsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No proposals received yet.
            </p>
          ) : (
            <div className="space-y-4">
              {proposals.map((item) => (
                <Card key={item.request.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.designer.name}
                        </p>
                        {item.designer.firmName && (
                          <p className="text-sm text-muted-foreground">
                            {item.designer.firmName}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          item.request.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : item.request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : item.request.status === "proposal_submitted"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.request.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {item.proposal && (
                      <div className="mt-3 flex gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Estimate: </span>
                          <span className="font-medium">
                            {formatPrice(item.proposal.costEstimate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timeline: </span>
                          <span className="font-medium">
                            {item.proposal.timelineWeeks} weeks
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// TASKS TAB
// ============================================================================

function TasksTab({
  projectId,
  tasks,
  onRefresh,
}: {
  projectId: string
  tasks: Task[]
  onRefresh: () => void
}): React.ReactElement {
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return
    setIsSubmitting(true)
    try {
      const result = await createTask(projectId, {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      })
      if (result.success) {
        setNewTitle("")
        setNewDescription("")
        setShowForm(false)
        onRefresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    const result = await updateTaskStatus(taskId, status)
    if (result.success) {
      onRefresh()
    }
  }

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result.success) {
      onRefresh()
    }
  }

  const nextStatus: Record<Task["status"], Task["status"]> = {
    todo: "in_progress",
    in_progress: "completed",
    completed: "todo",
  }

  const renderTaskGroup = (
    title: string,
    groupTasks: Task[],
    emptyMessage: string,
  ) => (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({groupTasks.length})
      </h3>
      {groupTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {groupTasks.map((task) => (
            <Card key={task.id} className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <button
                  onClick={() => handleStatusChange(task.id, nextStatus[task.status])}
                  className="shrink-0"
                  title={`Move to ${getStatusLabel(nextStatus[task.status])}`}
                >
                  {getTaskStatusIcon(task.status)}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-medium",
                      task.status === "completed" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {task.status === "todo" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "in_progress")}
                      title="Start task"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {task.status === "in_progress" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "completed")}
                      title="Complete task"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Tasks ({tasks.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1 block">Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div>
              <Label className="mb-1 block">Description</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTask}
              isLoading={isSubmitting}
            >
              Create Task
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setNewTitle("")
                setNewDescription("")
              }}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {renderTaskGroup("To Do", todoTasks, "No tasks in to-do.")}
      {renderTaskGroup("In Progress", inProgressTasks, "No tasks in progress.")}
      {renderTaskGroup("Completed", completedTasks, "No completed tasks.")}
    </div>
  )
}

// ============================================================================
// MILESTONES TAB
// ============================================================================

function MilestonesTab({
  projectId,
  milestones,
  onRefresh,
}: {
  projectId: string
  milestones: Milestone[]
  onRefresh: () => void
}): React.ReactElement {
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalAmount = milestones.reduce((sum, m) => sum + (m.paymentAmount ?? 0), 0)
  const totalPaid = milestones
    .filter((m) => m.paymentStatus === "paid")
    .reduce((sum, m) => sum + (m.paymentAmount ?? 0), 0)

  const handleCreateMilestone = async () => {
    if (!newTitle.trim() || !newAmount) return
    setIsSubmitting(true)
    try {
      const result = await createMilestone(projectId, {
        title: newTitle.trim(),
        paymentAmount: parseFloat(newAmount),
        targetDate: newDueDate || undefined,
      })
      if (result.success) {
        setNewTitle("")
        setNewAmount("")
        setNewDueDate("")
        setShowForm(false)
        onRefresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkPaid = async (milestoneId: string) => {
    const result = await markMilestonePaid(milestoneId)
    if (result.success) {
      onRefresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Milestones ({milestones.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold text-green-700">
                {formatPrice(totalPaid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold text-foreground">
                {formatPrice(totalAmount)}
              </p>
            </div>
          </div>
          {totalAmount > 0 && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-600 transition-all"
                style={{
                  width: `${Math.min(100, (totalPaid / totalAmount) * 100)}%`,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Milestone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1 block">Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Milestone title"
              />
            </div>
            <div>
              <Label className="mb-1 block">Amount (Rs.)</Label>
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="e.g., 50000"
              />
              {newAmount && !isNaN(parseFloat(newAmount)) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatPrice(parseFloat(newAmount))}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1 block">Due Date</Label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateMilestone}
              isLoading={isSubmitting}
            >
              Create Milestone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setNewTitle("")
                setNewAmount("")
                setNewDueDate("")
              }}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No milestones created yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {milestone.title}
                      </p>
                      {milestone.paymentStatus === "paid" ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {formatPrice(milestone.paymentAmount ?? 0)}
                    </p>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      {milestone.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Due: {formatDate(milestone.targetDate)}
                        </span>
                      )}
                      {milestone.paymentStatus === "paid" && milestone.paidAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          Paid: {formatDate(milestone.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {milestone.paymentStatus !== "paid" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarkPaid(milestone.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COSTS TAB
// ============================================================================

function CostsTab({
  projectId,
  costs,
  onRefresh,
}: {
  projectId: string
  costs: CostEstimate[]
  onRefresh: () => void
}): React.ReactElement {
  const [showForm, setShowForm] = useState(false)
  const [newCategory, setNewCategory] =
    useState<CostEstimate["category"]>("design_fees")
  const [newDescription, setNewDescription] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalCost = costs.reduce((sum, c) => sum + c.estimatedAmount, 0)

  const costsByCategory = COST_CATEGORIES.map((cat) => {
    const items = costs.filter((c) => c.category === cat.value)
    const subtotal = items.reduce((sum, c) => sum + c.estimatedAmount, 0)
    return { ...cat, items, subtotal }
  }).filter((group) => group.items.length > 0)

  const handleCreateCost = async () => {
    if (!newDescription.trim() || !newAmount) return
    setIsSubmitting(true)
    try {
      const result = await createCostEstimate(projectId, {
        category: newCategory,
        description: newDescription.trim(),
        estimatedAmount: parseFloat(newAmount),
      })
      if (result.success) {
        setNewDescription("")
        setNewAmount("")
        setNewCategory("design_fees")
        setShowForm(false)
        onRefresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Cost Estimates ({costs.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
          Add Cost
        </Button>
      </div>

      {/* Total Summary */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(totalCost)}
          </p>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Cost Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1 block">Category</Label>
              <Select
                value={newCategory}
                onValueChange={(val) =>
                  setNewCategory(val as CostEstimate["category"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Description</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g., Living room furniture"
              />
            </div>
            <div>
              <Label className="mb-1 block">Amount (Rs.)</Label>
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="e.g., 75000"
              />
              {newAmount && !isNaN(parseFloat(newAmount)) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatPrice(parseFloat(newAmount))}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCost}
              isLoading={isSubmitting}
            >
              Add Cost
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setNewDescription("")
                setNewAmount("")
                setNewCategory("design_fees")
              }}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Cost Groups */}
      {costsByCategory.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No cost estimates added yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        costsByCategory.map((group) => (
          <Card key={group.value}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{group.label}</CardTitle>
                <span className="font-semibold text-foreground">
                  {formatPrice(group.subtotal)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {group.items.map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {cost.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cost.createdAt)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      {formatPrice(cost.estimatedAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

// ============================================================================
// ACTIVITY TAB
// ============================================================================

function ActivityTab({
  activities,
}: {
  activities: ActivityLog[]
}): React.ReactElement {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">
        Activity ({activities.length})
      </h2>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="relative space-y-0">
              {activities.map((log, index) => (
                <div key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-[9px] top-5 h-full w-px bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2 border-primary bg-card" />
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{log.action}</p>
                    {log.details && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {log.details}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export function ProjectDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useFinishdAuthStore()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [costs, setCosts] = useState<CostEstimate[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [proposals, setProposals] = useState<ProjectProposalItem[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("overview")

  // --------------------------------------------------------------------------
  // Data Loading
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (id) {
      loadProject()
    }
  }, [id])

  useEffect(() => {
    if (id && !isLoading && project) {
      loadTabData()
    }
  }, [activeTab, id, isLoading, project])

  const loadProject = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const projectData = await getProjectById(id)
      setProject(projectData)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTabData = async () => {
    if (!id) return

    switch (activeTab) {
      case "overview": {
        setProposalsLoading(true)
        try {
          const proposalData = await getProjectProposals(id)
          setProposals(proposalData)
        } finally {
          setProposalsLoading(false)
        }
        break
      }
      case "tasks": {
        const taskData = await getProjectTasks(id)
        setTasks(taskData)
        break
      }
      case "milestones": {
        const milestoneData = await getProjectMilestones(id)
        setMilestones(milestoneData)
        break
      }
      case "costs": {
        const costData = await getProjectCosts(id)
        setCosts(costData)
        break
      }
      case "activity": {
        const activityData = await getProjectActivity(id)
        setActivities(activityData)
        break
      }
    }
  }

  const refreshTasks = async () => {
    if (!id) return
    const taskData = await getProjectTasks(id)
    setTasks(taskData)
  }

  const refreshMilestones = async () => {
    if (!id) return
    const milestoneData = await getProjectMilestones(id)
    setMilestones(milestoneData)
  }

  const refreshCosts = async () => {
    if (!id) return
    const costData = await getProjectCosts(id)
    setCosts(costData)
  }

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  const handleComplete = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      const result = await completeProject(id)
      if (result.success) {
        await loadProject()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      const result = await cancelProject(id)
      if (result.success) {
        await loadProject()
      }
    } finally {
      setActionLoading(false)
    }
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  if (isLoading) {
    return <ProjectDetailSkeleton />
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/finishd/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Project Not Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                The project you are looking for does not exist or you do not have
                access.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/finishd/dashboard")}
                className="mt-6"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isTerminal =
    project.status === "completed" || project.status === "cancelled"

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/finishd/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {project.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    getStatusColor(project.status),
                  )}
                >
                  {getStatusLabel(project.status)}
                </span>
                {project.budgetMin != null && project.budgetMax != null && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {formatPrice(project.budgetMin)} -{" "}
                    {formatPrice(project.budgetMax)}
                  </span>
                )}
                {project.timelineWeeks && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {project.timelineWeeks} weeks
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {project.scope === "full_home" ? "Full Home" : "Partial"}
                </span>
              </div>
            </div>

            {/* Status Actions */}
            <div className="flex gap-2">
              {project.status === "in_progress" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleComplete}
                  isLoading={actionLoading}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              {!isTerminal && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                  isLoading={actionLoading}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab
            project={project}
            proposals={proposals}
            proposalsLoading={proposalsLoading}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            projectId={project.id}
            tasks={tasks}
            onRefresh={refreshTasks}
          />
        )}
        {activeTab === "milestones" && (
          <MilestonesTab
            projectId={project.id}
            milestones={milestones}
            onRefresh={refreshMilestones}
          />
        )}
        {activeTab === "costs" && (
          <CostsTab
            projectId={project.id}
            costs={costs}
            onRefresh={refreshCosts}
          />
        )}
        {activeTab === "activity" && <ActivityTab activities={activities} />}
      </div>
    </div>
  )
}
