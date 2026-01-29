/**
 * Users Service
 * Business logic for user management
 */

import { eq } from "drizzle-orm"
import {
  db,
  users,
  homeownerProfiles,
  designerProfiles,
  contractorProfiles,
  type User,
  type HomeownerProfile,
  type DesignerProfile,
  type ContractorProfile,
} from "../../db/index.js"

export interface UserWithProfile {
  user: User
  profile: HomeownerProfile | DesignerProfile | ContractorProfile | null
}

/**
 * Get user by ID with their profile
 */
export async function getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
  const userResults = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (userResults.length === 0) {
    return null
  }

  const user = userResults[0]
  let profile: HomeownerProfile | DesignerProfile | ContractorProfile | null = null

  // Get profile based on user type
  if (user.userType === "homeowner") {
    const profiles = await db
      .select()
      .from(homeownerProfiles)
      .where(eq(homeownerProfiles.userId, userId))
      .limit(1)
    profile = profiles[0] || null
  } else if (user.userType === "designer") {
    const profiles = await db
      .select()
      .from(designerProfiles)
      .where(eq(designerProfiles.userId, userId))
      .limit(1)
    profile = profiles[0] || null
  } else if (user.userType === "contractor") {
    const profiles = await db
      .select()
      .from(contractorProfiles)
      .where(eq(contractorProfiles.userId, userId))
      .limit(1)
    profile = profiles[0] || null
  }

  return { user, profile }
}

/**
 * Update user language preference
 */
export async function updateUserLanguage(
  userId: string,
  language: "en" | "hi",
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const updatedUsers = await db
      .update(users)
      .set({ languagePreference: language, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    if (updatedUsers.length === 0) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user: updatedUsers[0] }
  } catch (error) {
    console.error("[Users] Failed to update language:", error)
    return { success: false, error: "Failed to update language" }
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId))

    return { success: true }
  } catch (error) {
    console.error("[Users] Failed to deactivate user:", error)
    return { success: false, error: "Failed to deactivate account" }
  }
}
