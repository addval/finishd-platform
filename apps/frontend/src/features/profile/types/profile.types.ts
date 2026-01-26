/**
 * Profile Types
 * Type definitions for user profile and permission-related data structures
 */

/**
 * User Profile Types
 */
export interface UserProfile {
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
  profilePictureUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProfileRequest {
  name: string
  username: string
  city: string
  bio?: string
  timezone?: string
  phoneNumber: string
  countryCode: string
}

export interface UpdateProfileRequest {
  name?: string
  username?: string
  city?: string
  bio?: string
  timezone?: string
  phoneNumber?: string
  countryCode?: string
}

/**
 * Permission Types
 */
export interface PermissionSettings {
  calendarEnabled: boolean
  notificationsEnabled: boolean
  contactsEnabled: boolean
  locationEnabled: boolean
  marketingEmailsEnabled: boolean
  ritualRemindersEnabled: boolean
  communityUpdatesEnabled: boolean
}

export interface UpdatePermissionsRequest {
  calendarEnabled?: boolean
  notificationsEnabled?: boolean
  contactsEnabled?: boolean
  locationEnabled?: boolean
  marketingEmailsEnabled?: boolean
  ritualRemindersEnabled?: boolean
  communityUpdatesEnabled?: boolean
}
