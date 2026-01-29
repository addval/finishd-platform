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
