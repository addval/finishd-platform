/**
 * Admin Service
 * Business logic for admin operations (verification queue management)
 */

import { eq } from "drizzle-orm"
import {
  db,
  designerProfiles,
  contractorProfiles,
  type DesignerProfile,
  type ContractorProfile,
} from "../../db/index.js"

// ============================================================================
// DESIGNER VERIFICATION QUEUE
// ============================================================================

/**
 * Get all unverified designer profiles
 */
export async function getUnverifiedDesigners(): Promise<DesignerProfile[]> {
  const designers = await db
    .select()
    .from(designerProfiles)
    .where(eq(designerProfiles.isVerified, false))

  return designers
}

/**
 * Reject a designer profile (deletes the profile)
 * Since there is no rejected flag in the schema, we delete the profile.
 */
export async function rejectDesigner(
  designerId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = await db
      .delete(designerProfiles)
      .where(eq(designerProfiles.id, designerId))
      .returning()

    if (deleted.length === 0) {
      return { success: false, error: "Designer not found" }
    }

    if (reason) {
      console.log(`[Admin] Designer ${designerId} rejected. Reason: ${reason}`)
    }

    return { success: true }
  } catch (error) {
    console.error("[Admin] Failed to reject designer:", error)
    return { success: false, error: "Failed to reject designer" }
  }
}

// ============================================================================
// CONTRACTOR VERIFICATION QUEUE
// ============================================================================

/**
 * Get all unverified contractor profiles
 */
export async function getUnverifiedContractors(): Promise<ContractorProfile[]> {
  const contractors = await db
    .select()
    .from(contractorProfiles)
    .where(eq(contractorProfiles.isVerified, false))

  return contractors
}

/**
 * Reject a contractor profile (deletes the profile)
 * Since there is no rejected flag in the schema, we delete the profile.
 */
export async function rejectContractor(
  contractorId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = await db
      .delete(contractorProfiles)
      .where(eq(contractorProfiles.id, contractorId))
      .returning()

    if (deleted.length === 0) {
      return { success: false, error: "Contractor not found" }
    }

    if (reason) {
      console.log(`[Admin] Contractor ${contractorId} rejected. Reason: ${reason}`)
    }

    return { success: true }
  } catch (error) {
    console.error("[Admin] Failed to reject contractor:", error)
    return { success: false, error: "Failed to reject contractor" }
  }
}
