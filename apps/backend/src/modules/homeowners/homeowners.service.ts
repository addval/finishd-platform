/**
 * Homeowners Service
 * Business logic for homeowner profile and property management
 */

import { eq, and } from "drizzle-orm"
import {
  db,
  homeownerProfiles,
  properties,
  type HomeownerProfile,
  type NewHomeownerProfile,
  type Property,
  type NewProperty,
} from "../../db/index.js"

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Get homeowner profile by user ID
 */
export async function getHomeownerProfile(userId: string): Promise<HomeownerProfile | null> {
  const profiles = await db
    .select()
    .from(homeownerProfiles)
    .where(eq(homeownerProfiles.userId, userId))
    .limit(1)

  return profiles[0] || null
}

/**
 * Create or update homeowner profile
 * Uses upsert pattern - if profile exists (e.g., placeholder from user type selection), update it
 */
export async function createHomeownerProfile(
  userId: string,
  data: Omit<NewHomeownerProfile, "userId">,
): Promise<{ success: boolean; profile?: HomeownerProfile; error?: string }> {
  try {
    // Check if profile already exists
    const existing = await getHomeownerProfile(userId)
    if (existing) {
      // Profile exists (could be placeholder from setUserType), update it
      const profiles = await db
        .update(homeownerProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(homeownerProfiles.userId, userId))
        .returning()
      return { success: true, profile: profiles[0] }
    }

    // Create new profile
    const profiles = await db
      .insert(homeownerProfiles)
      .values({ ...data, userId })
      .returning()

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Homeowners] Failed to create profile:", error)
    return { success: false, error: "Failed to create profile" }
  }
}

/**
 * Update homeowner profile
 */
export async function updateHomeownerProfile(
  userId: string,
  data: Partial<Omit<HomeownerProfile, "id" | "userId" | "createdAt">>,
): Promise<{ success: boolean; profile?: HomeownerProfile; error?: string }> {
  try {
    const profiles = await db
      .update(homeownerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(homeownerProfiles.userId, userId))
      .returning()

    if (profiles.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    return { success: true, profile: profiles[0] }
  } catch (error) {
    console.error("[Homeowners] Failed to update profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// ============================================================================
// PROPERTY OPERATIONS
// ============================================================================

/**
 * Get all properties for a homeowner
 */
export async function getHomeownerProperties(homeownerId: string): Promise<Property[]> {
  return db.select().from(properties).where(eq(properties.homeownerId, homeownerId))
}

/**
 * Get property by ID (with ownership check)
 */
export async function getPropertyById(
  propertyId: string,
  homeownerId: string,
): Promise<Property | null> {
  const results = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.homeownerId, homeownerId)))
    .limit(1)

  return results[0] || null
}

/**
 * Create new property
 */
export async function createProperty(
  homeownerId: string,
  data: Omit<NewProperty, "homeownerId">,
): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const newProperties = await db
      .insert(properties)
      .values({ ...data, homeownerId })
      .returning()

    return { success: true, property: newProperties[0] }
  } catch (error) {
    console.error("[Homeowners] Failed to create property:", error)
    return { success: false, error: "Failed to create property" }
  }
}

/**
 * Update property
 */
export async function updateProperty(
  propertyId: string,
  homeownerId: string,
  data: Partial<Omit<Property, "id" | "homeownerId" | "createdAt">>,
): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const updatedProperties = await db
      .update(properties)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(properties.id, propertyId), eq(properties.homeownerId, homeownerId)))
      .returning()

    if (updatedProperties.length === 0) {
      return { success: false, error: "Property not found" }
    }

    return { success: true, property: updatedProperties[0] }
  } catch (error) {
    console.error("[Homeowners] Failed to update property:", error)
    return { success: false, error: "Failed to update property" }
  }
}

/**
 * Delete property
 */
export async function deleteProperty(
  propertyId: string,
  homeownerId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await db
      .delete(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.homeownerId, homeownerId)))
      .returning()

    if (result.length === 0) {
      return { success: false, error: "Property not found" }
    }

    return { success: true }
  } catch (error) {
    console.error("[Homeowners] Failed to delete property:", error)
    return { success: false, error: "Failed to delete property" }
  }
}
