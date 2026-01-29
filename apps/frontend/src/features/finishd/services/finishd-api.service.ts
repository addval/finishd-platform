/**
 * Finishd API Service
 * API calls for profiles, projects, designers, contractors
 */

import { apiClient } from "@/lib/api-client"

const API_BASE = "/api/v1"

// ============================================================================
// TYPES
// ============================================================================

export interface HomeownerProfile {
  id: string
  userId: string
  name: string
  email?: string
  city?: string
  locality?: string
  profilePictureUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  homeownerId: string
  type: "apartment" | "house" | "villa"
  address?: string
  city?: string
  locality?: string
  sizeSqft?: number
  rooms?: {
    bedrooms?: number
    bathrooms?: number
    livingAreas?: number
  }
}

export interface DesignerProfile {
  id: string
  userId: string
  name: string
  firmName?: string
  bio?: string
  profilePictureUrl?: string
  portfolioImages?: string[]
  services?: string[]
  serviceCities?: string[]
  styles?: string[]
  priceRangeMin?: number
  priceRangeMax?: number
  experienceYears?: number
  projectsCompleted?: number
  isVerified: boolean
}

export interface ContractorProfile {
  id: string
  userId: string
  name: string
  profilePictureUrl?: string
  trades?: string[]
  experienceYears?: number
  serviceAreas?: string[]
  workPhotos?: string[]
  bio?: string
  isVerified: boolean
}

export interface Project {
  id: string
  homeownerId: string
  propertyId?: string
  designerId?: string
  title: string
  scope: "full_home" | "partial"
  scopeDetails?: {
    rooms?: string[]
    areas?: string[]
    notes?: string
  }
  status: "draft" | "seeking_designer" | "in_progress" | "completed" | "cancelled"
  budgetMin?: number
  budgetMax?: number
  timelineWeeks?: number
  startTimeline?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// HOMEOWNER API
// ============================================================================

export async function getHomeownerProfile(): Promise<HomeownerProfile | null> {
  try {
    const response = await apiClient.get(`${API_BASE}/homeowners/me`)
    return response.data.data.profile
  } catch (error: unknown) {
    console.error("Failed to fetch homeowner profile", error)
    return null
  }
}

export async function createHomeownerProfile(data: {
  name: string
  email?: string
  city?: string
  locality?: string
}): Promise<{ success: boolean; profile?: HomeownerProfile; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/homeowners/me`, data)
    return { success: true, profile: response.data.data.profile }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create profile" }
  }
}

export async function updateHomeownerProfile(data: Partial<HomeownerProfile>): Promise<{
  success: boolean
  profile?: HomeownerProfile
  error?: string
}> {
  try {
    const response = await apiClient.patch(`${API_BASE}/homeowners/me`, data)
    return { success: true, profile: response.data.data.profile }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to update profile" }
  }
}

export async function getProperties(): Promise<Property[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/homeowners/me/properties`)
    return response.data.data.properties
  } catch {
    return []
  }
}

export async function createProperty(data: Omit<Property, "id" | "homeownerId">): Promise<{
  success: boolean
  property?: Property
  error?: string
}> {
  try {
    const response = await apiClient.post(`${API_BASE}/homeowners/me/properties`, data)
    return { success: true, property: response.data.data.property }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create property" }
  }
}

// ============================================================================
// DESIGNER API
// ============================================================================

export async function getDesignerProfile(): Promise<DesignerProfile | null> {
  try {
    const response = await apiClient.get(`${API_BASE}/designers/me`)
    return response.data.data.profile
  } catch {
    return null
  }
}

export async function createDesignerProfile(data: {
  name: string
  firmName?: string
  bio?: string
  services?: string[]
  serviceCities?: string[]
  styles?: string[]
  priceRangeMin?: number
  priceRangeMax?: number
  experienceYears?: number
}): Promise<{ success: boolean; profile?: DesignerProfile; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/designers/me`, data)
    return { success: true, profile: response.data.data.profile }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create profile" }
  }
}

export async function browseDesigners(params?: {
  query?: string
  city?: string
  styles?: string[]
  budgetMin?: number
  budgetMax?: number
  page?: number
  limit?: number
}): Promise<{ designers: DesignerProfile[]; total: number; page: number; totalPages: number }> {
  try {
    const response = await apiClient.get(`${API_BASE}/designers`, { params })
    return response.data.data
  } catch {
    return { designers: [], total: 0, page: 1, totalPages: 0 }
  }
}

export async function getFeaturedDesigners(city?: string): Promise<DesignerProfile[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/designers/featured`, {
      params: city ? { city } : undefined,
    })
    return response.data.data.designers
  } catch {
    return []
  }
}

export async function getDesignerById(id: string): Promise<DesignerProfile | null> {
  try {
    const response = await apiClient.get(`${API_BASE}/designers/${id}`)
    return response.data.data.designer
  } catch {
    return null
  }
}

// ============================================================================
// CONTRACTOR API
// ============================================================================

export async function getContractorProfile(): Promise<ContractorProfile | null> {
  try {
    const response = await apiClient.get(`${API_BASE}/contractors/me`)
    return response.data.data.profile
  } catch {
    return null
  }
}

export async function createContractorProfile(data: {
  name: string
  trades?: string[]
  bio?: string
  serviceAreas?: string[]
  experienceYears?: number
}): Promise<{ success: boolean; profile?: ContractorProfile; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/contractors/me`, data)
    return { success: true, profile: response.data.data.profile }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create profile" }
  }
}

export async function browseContractors(params?: {
  query?: string
  trades?: string[]
  city?: string
  page?: number
  limit?: number
}): Promise<{ contractors: ContractorProfile[]; total: number; page: number; totalPages: number }> {
  try {
    const response = await apiClient.get(`${API_BASE}/contractors`, { params })
    return response.data.data
  } catch {
    return { contractors: [], total: 0, page: 1, totalPages: 0 }
  }
}

// ============================================================================
// PROJECT API
// ============================================================================

export async function getProjects(status?: string): Promise<Project[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/projects`, {
      params: status ? { status } : undefined,
    })
    return response.data.data.projects
  } catch {
    return []
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const response = await apiClient.get(`${API_BASE}/projects/${id}`)
    return response.data.data.project
  } catch {
    return null
  }
}

export async function createProject(data: {
  title: string
  scope: "full_home" | "partial"
  propertyId?: string
  scopeDetails?: { rooms?: string[]; areas?: string[]; notes?: string }
  budgetMin?: number
  budgetMax?: number
  timelineWeeks?: number
  startTimeline?: string
}): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/projects`, data)
    return { success: true, project: response.data.data.project }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create project" }
  }
}

export async function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const response = await apiClient.patch(`${API_BASE}/projects/${id}`, data)
    return { success: true, project: response.data.data.project }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to update project" }
  }
}

// ============================================================================
// REQUEST API
// ============================================================================

export async function sendRequestToDesigner(data: {
  projectId: string
  designerId: string
  message?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/requests`, data)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to send request" }
  }
}

export async function getProjectProposals(projectId: string): Promise<
  Array<{
    request: { id: string; status: string }
    proposal: { id: string; costEstimate: number; timelineWeeks: number } | null
    designer: DesignerProfile
  }>
> {
  try {
    const response = await apiClient.get(`${API_BASE}/requests/project/${projectId}/proposals`)
    return response.data.data.proposals
  } catch {
    return []
  }
}

// ============================================================================
// REQUEST & PROPOSAL EXTENDED API
// ============================================================================

export interface ProjectRequest {
  id: string
  projectId: string
  designerId: string
  homeownerId: string
  message?: string
  status: "pending" | "proposal_submitted" | "accepted" | "rejected"
  createdAt: string
}

export interface Proposal {
  id: string
  requestId: string
  designerId: string
  costEstimate: number
  timelineWeeks: number
  scopeDescription?: string
  costBreakdown?: Record<string, number>
  createdAt: string
}

export interface ProjectProposalItem {
  request: ProjectRequest
  proposal: Proposal | null
  designer: DesignerProfile
}

export async function getDesignerRequests(): Promise<ProjectRequest[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/requests/designer`)
    return response.data.data.requests
  } catch {
    return []
  }
}

export async function getProjectRequests(projectId: string): Promise<ProjectRequest[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/requests/project/${projectId}`)
    return response.data.data.requests
  } catch {
    return []
  }
}

export async function submitProposal(
  requestId: string,
  data: {
    costEstimate: number
    timelineWeeks: number
    scopeDescription?: string
    costBreakdown?: Record<string, number>
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/requests/${requestId}/proposal`, data)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to submit proposal" }
  }
}

export async function acceptProposal(
  proposalId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/proposals/${proposalId}/accept`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to accept proposal" }
  }
}

export async function rejectProposal(
  proposalId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/proposals/${proposalId}/reject`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to reject proposal" }
  }
}

// ============================================================================
// PROJECT ACTIONS API
// ============================================================================

export async function completeProject(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/projects/${id}/complete`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to complete project" }
  }
}

export async function cancelProject(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/projects/${id}/cancel`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to cancel project" }
  }
}

// ============================================================================
// TASKS API
// ============================================================================

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "completed"
  assignedTo?: string
  dueDate?: string
  createdAt: string
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/projects/${projectId}/tasks`)
    return response.data.data.tasks
  } catch {
    return []
  }
}

export async function createTask(
  projectId: string,
  data: { title: string; description?: string; assignedTo?: string; dueDate?: string },
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/projects/${projectId}/tasks`, data)
    return { success: true, task: response.data.data.task }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create task" }
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: Task["status"],
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`${API_BASE}/tasks/${taskId}/status`, { status })
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to update task" }
  }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.delete(`${API_BASE}/tasks/${taskId}`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to delete task" }
  }
}

// ============================================================================
// MILESTONES API
// ============================================================================

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string
  amount: number
  dueDate?: string
  isPaid: boolean
  paidAt?: string
  createdAt: string
}

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/projects/${projectId}/milestones`)
    return response.data.data.milestones
  } catch {
    return []
  }
}

export async function createMilestone(
  projectId: string,
  data: { title: string; description?: string; amount: number; dueDate?: string },
): Promise<{ success: boolean; milestone?: Milestone; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/projects/${projectId}/milestones`, data)
    return { success: true, milestone: response.data.data.milestone }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create milestone" }
  }
}

export async function markMilestonePaid(
  milestoneId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/milestones/${milestoneId}/mark-paid`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to mark milestone paid" }
  }
}

// ============================================================================
// COST ESTIMATES API
// ============================================================================

export interface CostEstimate {
  id: string
  projectId: string
  category: "design_fees" | "labor" | "materials" | "miscellaneous"
  description: string
  amount: number
  createdAt: string
}

export async function getProjectCosts(projectId: string): Promise<CostEstimate[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/projects/${projectId}/costs`)
    return response.data.data.costs
  } catch {
    return []
  }
}

export async function createCostEstimate(
  projectId: string,
  data: { category: CostEstimate["category"]; description: string; amount: number },
): Promise<{ success: boolean; cost?: CostEstimate; error?: string }> {
  try {
    const response = await apiClient.post(`${API_BASE}/projects/${projectId}/costs`, data)
    return { success: true, cost: response.data.data.cost }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to create cost estimate" }
  }
}

// ============================================================================
// ACTIVITY LOG API
// ============================================================================

export interface ActivityLog {
  id: string
  projectId: string
  userId: string
  action: string
  details?: string
  createdAt: string
}

export async function getProjectActivity(projectId: string): Promise<ActivityLog[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/projects/${projectId}/activity`)
    return response.data.data.activities
  } catch {
    return []
  }
}

// ============================================================================
// PROFILE UPDATE API
// ============================================================================

export async function updateDesignerProfile(
  data: Partial<Omit<DesignerProfile, "id" | "userId" | "isVerified">>,
): Promise<{ success: boolean; profile?: DesignerProfile; error?: string }> {
  try {
    const response = await apiClient.patch(`${API_BASE}/designers/me`, data)
    return { success: true, profile: response.data.data.profile }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to update profile" }
  }
}

export async function updateContractorProfile(
  data: Partial<Omit<ContractorProfile, "id" | "userId" | "isVerified">>,
): Promise<{ success: boolean; profile?: ContractorProfile; error?: string }> {
  try {
    const response = await apiClient.patch(`${API_BASE}/contractors/me`, data)
    return { success: true, profile: response.data.data.profile }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to update profile" }
  }
}

// ============================================================================
// UPLOAD API
// ============================================================================

export async function uploadFile(
  file: File,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post(`${API_BASE}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return { success: true, url: response.data.data.url }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to upload file" }
  }
}

export async function uploadMultipleFiles(
  files: File[],
): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    const response = await apiClient.post(`${API_BASE}/upload/multiple`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return { success: true, urls: response.data.data.urls }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to upload files" }
  }
}

// ============================================================================
// ADMIN API
// ============================================================================

export async function getUnverifiedDesigners(): Promise<DesignerProfile[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/admin/designers/pending`)
    return response.data.data.designers
  } catch {
    return []
  }
}

export async function getUnverifiedContractors(): Promise<ContractorProfile[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/admin/contractors/pending`)
    return response.data.data.contractors
  } catch {
    return []
  }
}

export async function verifyDesigner(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/admin/designers/${id}/verify`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to verify designer" }
  }
}

export async function rejectDesigner(
  id: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/admin/designers/${id}/reject`, { reason })
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to reject designer" }
  }
}

export async function verifyContractor(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/admin/contractors/${id}/verify`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to verify contractor" }
  }
}

export async function rejectContractor(
  id: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/admin/contractors/${id}/reject`, { reason })
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to reject contractor" }
  }
}

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  data?: Record<string, unknown>
  createdAt: string
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/notifications`)
    return response.data.data.notifications
  } catch {
    return []
  }
}

export async function markNotificationRead(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`${API_BASE}/notifications/${id}/read`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to mark notification read" }
  }
}

export async function markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`${API_BASE}/notifications/read-all`)
    return { success: true }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    return { success: false, error: err.response?.data?.message || "Failed to mark all read" }
  }
}

// ============================================================================
// SEARCH API (Typesense)
// ============================================================================

export async function searchDesigners(params: {
  query?: string
  city?: string
  styles?: string[]
  budgetMin?: number
  budgetMax?: number
  page?: number
  perPage?: number
}): Promise<{ designers: DesignerProfile[]; total: number; page: number; totalPages: number }> {
  try {
    const response = await apiClient.get(`${API_BASE}/search/designers`, { params })
    return response.data.data
  } catch {
    return { designers: [], total: 0, page: 1, totalPages: 0 }
  }
}

export async function searchContractors(params: {
  query?: string
  trades?: string[]
  city?: string
  page?: number
  perPage?: number
}): Promise<{ contractors: ContractorProfile[]; total: number; page: number; totalPages: number }> {
  try {
    const response = await apiClient.get(`${API_BASE}/search/contractors`, { params })
    return response.data.data
  } catch {
    return { contractors: [], total: 0, page: 1, totalPages: 0 }
  }
}
