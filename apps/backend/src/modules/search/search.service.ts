/**
 * Search Service
 * Typesense search operations for designers and contractors
 */

import type { DesignerProfile, ContractorProfile } from "../../db/schema.js"
import {
  typesenseClient,
  DESIGNERS_COLLECTION,
  CONTRACTORS_COLLECTION,
} from "./typesense.config.js"

// ============================================================================
// DESIGNER INDEXING
// ============================================================================

/**
 * Index designer in Typesense
 */
export async function indexDesigner(designer: DesignerProfile): Promise<void> {
  try {
    const document = {
      id: designer.id,
      userId: designer.userId,
      name: designer.name,
      firmName: designer.firmName || "",
      bio: designer.bio || "",
      profilePictureUrl: designer.profilePictureUrl || "",
      portfolioImages: (designer.portfolioImages as string[]) || [],
      services: (designer.services as string[]) || [],
      serviceCities: (designer.serviceCities as string[]) || [],
      styles: (designer.styles as string[]) || [],
      priceRangeMin: designer.priceRangeMin || 0,
      priceRangeMax: designer.priceRangeMax || 0,
      experienceYears: designer.experienceYears || 0,
      projectsCompleted: designer.projectsCompleted || 0,
      isVerified: designer.isVerified,
      createdAt: designer.createdAt.getTime(),
    }

    await typesenseClient
      .collections(DESIGNERS_COLLECTION)
      .documents()
      .upsert(document)

    console.log(`[Search] Indexed designer: ${designer.id}`)
  } catch (error) {
    console.error(`[Search] Failed to index designer ${designer.id}:`, error)
    // Don't throw - indexing failure shouldn't break the app
  }
}

/**
 * Remove designer from Typesense
 */
export async function removeDesignerFromIndex(designerId: string): Promise<void> {
  try {
    await typesenseClient
      .collections(DESIGNERS_COLLECTION)
      .documents(designerId)
      .delete()

    console.log(`[Search] Removed designer from index: ${designerId}`)
  } catch (error) {
    console.error(`[Search] Failed to remove designer ${designerId}:`, error)
  }
}

// ============================================================================
// CONTRACTOR INDEXING
// ============================================================================

/**
 * Index contractor in Typesense
 */
export async function indexContractor(contractor: ContractorProfile): Promise<void> {
  try {
    const document = {
      id: contractor.id,
      userId: contractor.userId,
      name: contractor.name,
      profilePictureUrl: contractor.profilePictureUrl || "",
      trades: (contractor.trades as string[]) || [],
      experienceYears: contractor.experienceYears || 0,
      serviceAreas: (contractor.serviceAreas as string[]) || [],
      workPhotos: (contractor.workPhotos as string[]) || [],
      bio: contractor.bio || "",
      isVerified: contractor.isVerified,
      createdAt: contractor.createdAt.getTime(),
    }

    await typesenseClient
      .collections(CONTRACTORS_COLLECTION)
      .documents()
      .upsert(document)

    console.log(`[Search] Indexed contractor: ${contractor.id}`)
  } catch (error) {
    console.error(`[Search] Failed to index contractor ${contractor.id}:`, error)
  }
}

/**
 * Remove contractor from Typesense
 */
export async function removeContractorFromIndex(contractorId: string): Promise<void> {
  try {
    await typesenseClient
      .collections(CONTRACTORS_COLLECTION)
      .documents(contractorId)
      .delete()

    console.log(`[Search] Removed contractor from index: ${contractorId}`)
  } catch (error) {
    console.error(`[Search] Failed to remove contractor ${contractorId}:`, error)
  }
}

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

export interface DesignerSearchParams {
  query?: string
  city?: string
  styles?: string[]
  budgetMin?: number
  budgetMax?: number
  verifiedOnly?: boolean
  page?: number
  perPage?: number
}

export interface DesignerSearchResult {
  designers: Array<{
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
  }>
  total: number
  page: number
  totalPages: number
}

/**
 * Search designers with filters
 */
export async function searchDesigners(params: DesignerSearchParams): Promise<DesignerSearchResult> {
  const {
    query = "*",
    city,
    styles,
    budgetMin,
    budgetMax,
    verifiedOnly = true,
    page = 1,
    perPage = 20,
  } = params

  try {
    // Build filter conditions
    const filterConditions: string[] = []

    if (verifiedOnly) {
      filterConditions.push("isVerified:=true")
    }

    if (city) {
      filterConditions.push(`serviceCities:=[${city}]`)
    }

    if (styles && styles.length > 0) {
      filterConditions.push(`styles:=[${styles.join(",")}]`)
    }

    if (budgetMin !== undefined) {
      filterConditions.push(`priceRangeMax:>=${budgetMin}`)
    }

    if (budgetMax !== undefined) {
      filterConditions.push(`priceRangeMin:<=${budgetMax}`)
    }

    const searchParams: Record<string, unknown> = {
      q: query,
      query_by: "name,firmName,bio,services,styles",
      page,
      per_page: perPage,
      sort_by: "createdAt:desc",
    }

    if (filterConditions.length > 0) {
      searchParams.filter_by = filterConditions.join(" && ")
    }

    const result = await typesenseClient
      .collections(DESIGNERS_COLLECTION)
      .documents()
      .search(searchParams)

    const designers = (result.hits || []).map((hit: { document: Record<string, unknown> }) => ({
      id: hit.document.id as string,
      userId: hit.document.userId as string,
      name: hit.document.name as string,
      firmName: hit.document.firmName as string | undefined,
      bio: hit.document.bio as string | undefined,
      profilePictureUrl: hit.document.profilePictureUrl as string | undefined,
      portfolioImages: hit.document.portfolioImages as string[] | undefined,
      services: hit.document.services as string[] | undefined,
      serviceCities: hit.document.serviceCities as string[] | undefined,
      styles: hit.document.styles as string[] | undefined,
      priceRangeMin: hit.document.priceRangeMin as number | undefined,
      priceRangeMax: hit.document.priceRangeMax as number | undefined,
      experienceYears: hit.document.experienceYears as number | undefined,
      projectsCompleted: hit.document.projectsCompleted as number | undefined,
      isVerified: hit.document.isVerified as boolean,
    }))

    const total = result.found || 0
    const totalPages = Math.ceil(total / perPage)

    return { designers, total, page, totalPages }
  } catch (error) {
    console.error("[Search] Designer search failed:", error)
    return { designers: [], total: 0, page, totalPages: 0 }
  }
}

export interface ContractorSearchParams {
  query?: string
  trades?: string[]
  city?: string
  verifiedOnly?: boolean
  page?: number
  perPage?: number
}

export interface ContractorSearchResult {
  contractors: Array<{
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
  }>
  total: number
  page: number
  totalPages: number
}

/**
 * Search contractors with filters
 */
export async function searchContractors(
  params: ContractorSearchParams,
): Promise<ContractorSearchResult> {
  const { query = "*", trades, city, verifiedOnly = true, page = 1, perPage = 20 } = params

  try {
    const filterConditions: string[] = []

    if (verifiedOnly) {
      filterConditions.push("isVerified:=true")
    }

    if (trades && trades.length > 0) {
      filterConditions.push(`trades:=[${trades.join(",")}]`)
    }

    if (city) {
      filterConditions.push(`serviceAreas:=[${city}]`)
    }

    const searchParams: Record<string, unknown> = {
      q: query,
      query_by: "name,bio,trades",
      page,
      per_page: perPage,
      sort_by: "createdAt:desc",
    }

    if (filterConditions.length > 0) {
      searchParams.filter_by = filterConditions.join(" && ")
    }

    const result = await typesenseClient
      .collections(CONTRACTORS_COLLECTION)
      .documents()
      .search(searchParams)

    const contractors = (result.hits || []).map((hit: { document: Record<string, unknown> }) => ({
      id: hit.document.id as string,
      userId: hit.document.userId as string,
      name: hit.document.name as string,
      profilePictureUrl: hit.document.profilePictureUrl as string | undefined,
      trades: hit.document.trades as string[] | undefined,
      experienceYears: hit.document.experienceYears as number | undefined,
      serviceAreas: hit.document.serviceAreas as string[] | undefined,
      workPhotos: hit.document.workPhotos as string[] | undefined,
      bio: hit.document.bio as string | undefined,
      isVerified: hit.document.isVerified as boolean,
    }))

    const total = result.found || 0
    const totalPages = Math.ceil(total / perPage)

    return { contractors, total, page, totalPages }
  } catch (error) {
    console.error("[Search] Contractor search failed:", error)
    return { contractors: [], total: 0, page, totalPages: 0 }
  }
}
