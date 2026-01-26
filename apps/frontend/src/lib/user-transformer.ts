/**
 * User Response Transformer
 *
 * Transforms backend user response to frontend User interface
 * Removes Date objects and other non-serializable data before Zustand persistence
 */

import type { User } from "@/features/auth/store/authStore"

// Backend user response type (before transformation)
export type BackendUser = {
  id: string
  email: string
  name?: string
  username?: string
  city?: string
  bio?: string
  timezone?: string
  phoneNumber?: string
  countryCode?: string
  emailVerified: boolean
  profileCreated: boolean
  onboardingCompleted: boolean
  [key: string]: unknown // Allow additional fields
}

/**
 * Transform backend user response to frontend User schema
 * Filters out Date objects and ensures JSON-serializable data only
 *
 * @param backendUser - User object from backend API response
 * @returns Transformed User object compatible with Zustand persist
 */
export function transformUserResponse(backendUser: BackendUser): User {
  if (!backendUser) {
    throw new Error("transformUserResponse: backendUser is null or undefined")
  }

  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name || undefined,
    username: backendUser.username || undefined,
    city: backendUser.city || undefined,
    bio: backendUser.bio || undefined,
    timezone: backendUser.timezone || undefined,
    phoneNumber: backendUser.phoneNumber || undefined,
    countryCode: backendUser.countryCode || undefined,
    emailVerified: Boolean(backendUser.emailVerified),
    profileCreated: Boolean(backendUser.profileCreated),
    onboardingCompleted: Boolean(backendUser.onboardingCompleted),
  }
}
