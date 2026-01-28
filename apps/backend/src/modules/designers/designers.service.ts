/**
 * Designers Service
 * Business logic for designer profile management
 */

import { eq, and, ilike, or, inArray, gte, lte, sql } from "drizzle-orm"
import {
  db,
  designerProfiles,
  type DesignerProfile,
  type NewDesignerProfile,
} from "../../db/index.js"
import { indexDesigner } from "../search/search.service.js"

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Get designer profile by user ID
 */
export async function getDesignerProfileByUserId(userId: string): Promise<DesignerProfile | null> {
  const profiles = await db
    .select()
    .from(designerProfiles)
    .where(eq(designerProfiles.userId, userId))
    .limit(1)

  return profiles[0] || null
}

/**
 * Get designer profile by ID (public view)
 */
export async function getDesignerById(designerId: string): Promise<DesignerProfile | null> {
  const profiles = await db
    .select()
    .from(designerProfiles)
    .where(eq(designerProfiles.id, designerId))
    .limit(1)

  return profiles[0] || null
}

/**
 * Create designer profile
 */
export async function createDesignerProfile(
  userId: string,
  data: Omit<NewDesignerProfile, "userId">,
): Promise<{ success: boolean; profile?: DesignerProfile; error?: string }> {
  try {
    // Check if profile already exists
    const existing = await getDesignerProfileByUserId(userId)
    if (existing) {
      return { success: false, error: "Profile already exists" }
    }

    const profiles = await db
      .insert(designerProfiles)
      .values({ ...data, userId })
      .returning()

    // Index in Typesense (async, don't await)
    indexDesigner(profiles[0]).catch((err) => console.error("[Designers] Index failed:", err))

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Designers] Failed to create profile:", error)
    return { success: false, error: "Failed to create profile" }
  }
}

/**
 * Update designer profile
 */
export async function updateDesignerProfile(
  userId: string,
  data: Partial<Omit<DesignerProfile, "id" | "userId" | "createdAt" | "isVerified" | "verifiedAt">>,
): Promise<{ success: boolean; profile?: DesignerProfile; error?: string }> {
  try {
    const profiles = await db
      .update(designerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(designerProfiles.userId, userId))
      .returning()

    if (profiles.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    // Re-index in Typesense (async, don't await)
    indexDesigner(profiles[0]).catch((err) => console.error("[Designers] Index failed:", err))

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Designers] Failed to update profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// ============================================================================
// BROWSE/SEARCH OPERATIONS
// ============================================================================

export interface DesignerSearchParams {
  query?: string
  city?: string
  styles?: string[]
  budgetMin?: number
  budgetMax?: number
  verifiedOnly?: boolean
  page?: number
  limit?: number
}

export interface DesignerListResult {
  designers: DesignerProfile[]
  total: number
  page: number
  totalPages: number
}

/**
 * Browse designers with filters
 * Returns only verified designers for public browse
 */
export async function browseDesigners(params: DesignerSearchParams): Promise<DesignerListResult> {
  const { query, city, styles, budgetMin, budgetMax, verifiedOnly = true, page = 1, limit = 20 } = params

  const offset = (page - 1) * limit

  // Build where conditions
  const conditions = []

  // Only show verified designers in public browse
  if (verifiedOnly) {
    conditions.push(eq(designerProfiles.isVerified, true))
  }

  // Text search on name, firm name, bio
  if (query) {
    conditions.push(
      or(
        ilike(designerProfiles.name, `%${query}%`),
        ilike(designerProfiles.firmName, `%${query}%`),
        ilike(designerProfiles.bio, `%${query}%`),
      ),
    )
  }

  // Filter by budget range
  if (budgetMin !== undefined) {
    conditions.push(gte(designerProfiles.priceRangeMax, budgetMin))
  }

  if (budgetMax !== undefined) {
    conditions.push(lte(designerProfiles.priceRangeMin, budgetMax))
  }

  // Base query
  let designerQuery = db.select().from(designerProfiles)

  if (conditions.length > 0) {
    designerQuery = designerQuery.where(and(...conditions)) as typeof designerQuery
  }

  // Note: JSONB array filters (city, styles) would need raw SQL or Typesense
  // For now, we'll filter these in application code for simplicity

  const designers = await designerQuery.limit(limit).offset(offset)

  // Filter by city if specified (application-level filtering for JSONB)
  let filteredDesigners = designers
  if (city) {
    filteredDesigners = designers.filter(
      (d) => d.serviceCities && (d.serviceCities as string[]).includes(city),
    )
  }

  // Filter by styles if specified
  if (styles && styles.length > 0) {
    filteredDesigners = filteredDesigners.filter(
      (d) => d.styles && styles.some((s) => (d.styles as string[]).includes(s)),
    )
  }

  // Get total count (simplified - would need proper count query for production)
  const total = filteredDesigners.length

  return {
    designers: filteredDesigners,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get featured designers for homepage
 */
export async function getFeaturedDesigners(city?: string, limit = 5): Promise<DesignerProfile[]> {
  const designers = await db
    .select()
    .from(designerProfiles)
    .where(eq(designerProfiles.isVerified, true))
    .limit(limit * 2) // Get more to filter

  // Filter by city if specified
  if (city) {
    return designers
      .filter((d) => d.serviceCities && (d.serviceCities as string[]).includes(city))
      .slice(0, limit)
  }

  return designers.slice(0, limit)
}

// ============================================================================
// ADMIN OPERATIONS (for future use)
// ============================================================================

/**
 * Verify designer (admin only)
 */
export async function verifyDesigner(
  designerId: string,
): Promise<{ success: boolean; profile?: DesignerProfile; error?: string }> {
  try {
    const profiles = await db
      .update(designerProfiles)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(designerProfiles.id, designerId))
      .returning()

    if (profiles.length === 0) {
      return { success: false, error: "Designer not found" }
    }

    // Re-index in Typesense (now verified, will appear in search)
    indexDesigner(profiles[0]).catch((err) => console.error("[Designers] Index failed:", err))

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Designers] Failed to verify designer:", error)
    return { success: false, error: "Failed to verify designer" }
  }
}
