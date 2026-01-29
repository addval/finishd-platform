/**
 * Finishd Dashboard
 * User-specific dashboard based on user type
 */

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Plus, Search, CircleCheck, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFinishdAuthStore } from "../store/finishd-auth.store"
import {
  getProjects,
  getHomeownerProfile,
  getDesignerProfile,
  getContractorProfile,
  getFeaturedDesigners,
  type Project,
  type DesignerProfile,
} from "../services/finishd-api.service"

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)} Lakh`
  }
  return `₹${amount.toLocaleString("en-IN")}`
}

function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-muted text-foreground"
    case "seeking_designer":
      return "bg-accent text-accent-foreground"
    case "in_progress":
      return "bg-primary/10 text-primary"
    case "completed":
      return "bg-primary/10 text-primary"
    case "cancelled":
      return "bg-destructive/10 text-destructive"
    default:
      return "bg-muted text-foreground"
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

// ============================================================================
// HOMEOWNER DASHBOARD
// ============================================================================

function HomeownerDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [featuredDesigners, setFeaturedDesigners] = useState<DesignerProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [projectsData, profile, designers] = await Promise.all([
        getProjects(),
        getHomeownerProfile(),
        getFeaturedDesigners(),
      ])
      setProjects(projectsData)
      setProfileComplete(!!profile)
      setFeaturedDesigners(designers)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show onboarding prompt if profile not complete
  if (!profileComplete) {
    return (
      <div className="rounded-lg bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Complete your profile</h2>
        <p className="mt-2 text-muted-foreground">
          Set up your profile to start finding interior designers
        </p>
        <Button
          onClick={() => navigate("/finishd/onboarding/homeowner")}
          variant="primary"
          className="mt-4"
        >
          Complete Profile
        </Button>
      </div>
    )
  }

  const activeProjects = projects.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled",
  )

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => navigate("/finishd/projects/new")}
          className="flex items-center gap-4 rounded-lg bg-primary p-6 text-left text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">New Project</h3>
            <p className="text-sm text-primary-foreground/70">Start your interior journey</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/finishd/designers")}
          className="flex items-center gap-4 rounded-lg bg-card p-6 text-left shadow-sm transition-colors hover:bg-muted"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Search className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Find Designers</h3>
            <p className="text-sm text-muted-foreground">Browse verified professionals</p>
          </div>
        </button>
      </div>

      {/* Active Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          {projects.length > 0 && (
            <Link to="/finishd/projects" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">No projects yet</p>
            <button
              onClick={() => navigate("/finishd/projects/new")}
              className="mt-4 text-primary hover:text-primary/80"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeProjects.slice(0, 4).map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/finishd/projects/${project.id}`)}
                className="cursor-pointer rounded-lg bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {project.scope === "full_home" ? "Full Home" : "Partial"} •{" "}
                  {project.budgetMin && project.budgetMax
                    ? `${formatPrice(project.budgetMin)} - ${formatPrice(project.budgetMax)}`
                    : "Budget not set"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Designers */}
      {featuredDesigners.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Featured Designers</h2>
            <Link to="/finishd/designers" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDesigners.slice(0, 3).map((designer) => (
              <div
                key={designer.id}
                onClick={() => navigate(`/finishd/designers/${designer.id}`)}
                className="cursor-pointer rounded-lg bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg">
                    {designer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{designer.name}</h3>
                    {designer.firmName && (
                      <p className="text-sm text-muted-foreground">{designer.firmName}</p>
                    )}
                  </div>
                </div>
                {designer.styles && designer.styles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {designer.styles.slice(0, 2).map((style) => (
                      <span
                        key={style}
                        className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// DESIGNER DASHBOARD
// ============================================================================

function DesignerDashboard() {
  const navigate = useNavigate()
  const [profileComplete, setProfileComplete] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const profile = await getDesignerProfile()
      setProfileComplete(!!profile)
      setIsVerified(profile?.isVerified || false)
    } catch {
      console.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!profileComplete) {
    return (
      <div className="rounded-lg bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Complete your profile</h2>
        <p className="mt-2 text-muted-foreground">
          Set up your designer profile to start receiving project requests
        </p>
        <Button
          onClick={() => navigate("/finishd/onboarding/designer")}
          variant="primary"
          className="mt-4"
        >
          Complete Profile
        </Button>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="space-y-6">
        <Card className="border-accent">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground">Verification Pending</h2>
            <p className="mt-2 text-muted-foreground">
              Your profile is under review. Once verified, you'll start receiving project requests
              from homeowners. This usually takes 24-48 hours.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground">While you wait...</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-primary" />
                Add portfolio images to showcase your work
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-primary" />
                Complete your bio with more details
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-primary" />
                Add more service cities to reach more homeowners
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary bg-primary/5">
        <CardContent className="p-4">
          <p className="text-foreground">
            <strong>Profile verified!</strong> You're now visible to homeowners looking for designers.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
        <p className="mt-2 text-muted-foreground">
          No project requests yet. Make sure your profile is complete to attract more homeowners.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// CONTRACTOR DASHBOARD
// ============================================================================

function ContractorDashboard() {
  const navigate = useNavigate()
  const [profileComplete, setProfileComplete] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const profile = await getContractorProfile()
      setProfileComplete(!!profile)
      setIsVerified(profile?.isVerified || false)
    } catch {
      console.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!profileComplete) {
    return (
      <div className="rounded-lg bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Complete your profile</h2>
        <p className="mt-2 text-muted-foreground">
          Set up your contractor profile to get invited to projects
        </p>
        <Button
          onClick={() => navigate("/finishd/onboarding/contractor")}
          variant="primary"
          className="mt-4"
        >
          Complete Profile
        </Button>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <Card className="border-accent">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Verification Pending</h2>
          <p className="mt-2 text-muted-foreground">
            Your profile is under review. Once verified, designers will be able to invite you to
            projects. This usually takes 24-48 hours.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary bg-primary/5">
        <CardContent className="p-4">
          <p className="text-foreground">
            <strong>Profile verified!</strong> Designers can now invite you to projects.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Project Invitations</h2>
        <p className="mt-2 text-muted-foreground">
          No project invitations yet. Designers will contact you when they need your skills.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export function DashboardPage() {
  const { user, logout } = useFinishdAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/finishd/login")
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Finishd</h1>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {user?.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : "User"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {user?.userType === "homeowner" && <HomeownerDashboard />}
        {user?.userType === "designer" && <DesignerDashboard />}
        {user?.userType === "contractor" && <ContractorDashboard />}
        {!user?.userType && (
          <div className="rounded-lg bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Select your role</h2>
            <p className="mt-2 text-muted-foreground">Choose how you want to use Finishd</p>
            <Button
              onClick={() => navigate("/finishd/onboarding")}
              variant="primary"
              className="mt-4"
            >
              Get Started
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
