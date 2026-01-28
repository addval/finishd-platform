/**
 * Contractors Service
 * Business logic for contractor profile management
 */

import { eq, and, ilike, or } from "drizzle-orm"
import {
  db,
  contractorProfiles,
  type ContractorProfile,
  type NewContractorProfile,
} from "../../db/index.js"

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Get contractor profile by user ID
 */
export async function getContractorProfileByUserId(userId: string): Promise<ContractorProfile | null> {
  const profiles = await db
    .select()
    .from(contractorProfiles)
    .where(eq(contractorProfiles.userId, userId))
    .limit(1)

  return profiles[0] || null
}

/**
 * Get contractor profile by ID (public view)
 */
export async function getContractorById(contractorId: string): Promise<ContractorProfile | null> {
  const profiles = await db
    .select()
    .from(contractorProfiles)
    .where(eq(contractorProfiles.id, contractorId))
    .limit(1)

  return profiles[0] || null
}

/**
 * Create contractor profile
 */
export async function createContractorProfile(
  userId: string,
  data: Omit<NewContractorProfile, "userId">,
): Promise<{ success: boolean; profile?: ContractorProfile; error?: string }> {
  try {
    const existing = await getContractorProfileByUserId(userId)
    if (existing) {
      return { success: false, error: "Profile already exists" }
    }

    const profiles = await db
      .insert(contractorProfiles)
      .values({ ...data, userId })
      .returning()

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Contractors] Failed to create profile:", error)
    return { success: false, error: "Failed to create profile" }
  }
}

/**
 * Update contractor profile
 */
export async function updateContractorProfile(
  userId: string,
  data: Partial<Omit<ContractorProfile, "id" | "userId" | "createdAt" | "isVerified" | "verifiedAt">>,
): Promise<{ success: boolean; profile?: ContractorProfile; error?: string }> {
  try {
    const profiles = await db
      .update(contractorProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contractorProfiles.userId, userId))
      .returning()

    if (profiles.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Contractors] Failed to update profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// ============================================================================
// BROWSE/SEARCH OPERATIONS
// ============================================================================

export interface ContractorSearchParams {
  query?: string
  trades?: string[]
  city?: string
  verifiedOnly?: boolean
  page?: number
  limit?: number
}

export interface ContractorListResult {
  contractors: ContractorProfile[]
  total: number
  page: number
  totalPages: number
}

/**
 * Browse contractors with filters
 */
export async function browseContractors(params: ContractorSearchParams): Promise<ContractorListResult> {
  const { query, trades, city, verifiedOnly = true, page = 1, limit = 20 } = params
  const offset = (page - 1) * limit

  const conditions = []

  if (verifiedOnly) {
    conditions.push(eq(contractorProfiles.isVerified, true))
  }

  if (query) {
    conditions.push(
      or(
        ilike(contractorProfiles.name, `%${query}%`),
        ilike(contractorProfiles.bio, `%${query}%`),
      ),
    )
  }

  let contractorQuery = db.select().from(contractorProfiles)

  if (conditions.length > 0) {
    contractorQuery = contractorQuery.where(and(...conditions)) as typeof contractorQuery
  }

  const contractors = await contractorQuery.limit(limit).offset(offset)

  // Filter by trades and city in application code (JSONB fields)
  let filteredContractors = contractors

  if (trades && trades.length > 0) {
    filteredContractors = contractors.filter(
      (c) => c.trades && trades.some((t) => (c.trades as string[]).includes(t)),
    )
  }

  if (city) {
    filteredContractors = filteredContractors.filter(
      (c) => c.serviceAreas && (c.serviceAreas as string[]).includes(city),
    )
  }

  const total = filteredContractors.length

  return {
    contractors: filteredContractors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get contractors by trade
 */
export async function getContractorsByTrade(trade: string, limit = 10): Promise<ContractorProfile[]> {
  const contractors = await db
    .select()
    .from(contractorProfiles)
    .where(eq(contractorProfiles.isVerified, true))
    .limit(limit * 2)

  return contractors
    .filter((c) => c.trades && (c.trades as string[]).includes(trade))
    .slice(0, limit)
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * Verify contractor (admin only)
 */
export async function verifyContractor(
  contractorId: string,
): Promise<{ success: boolean; profile?: ContractorProfile; error?: string }> {
  try {
    const profiles = await db
      .update(contractorProfiles)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contractorProfiles.id, contractorId))
      .returning()

    if (profiles.length === 0) {
      return { success: false, error: "Contractor not found" }
    }

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Contractors] Failed to verify contractor:", error)
    return { success: false, error: "Failed to verify contractor" }
  }
}
