/**
 * Global TypeScript Type Definitions
 * Centralized type definitions for the application
 */

import type { Model } from "sequelize"

// ============================================================================
// MODEL TYPES
// ============================================================================

export interface Role extends Model {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface User extends Model {
  id: string
  roleId: string
  email: string
  passwordHash: string
  name: string | null
  username: string | null
  city: string | null
  phoneNumber: string | null
  countryCode: string | null
  timezone: string | null
  emailVerified: boolean
  emailVerifiedAt: Date | null
  emailVerificationCode: string | null
  emailVerificationCodeExpiresAt: Date | null
  phoneNumberVerified: boolean
  phoneNumberVerifiedAt: Date | null
  phoneVerificationCode: string | null
  phoneVerificationCodeExpiresAt: Date | null
  confirmationCode: string | null
  confirmationCodeExpiresAt: Date | null
  passwordResetCode: string | null
  passwordResetCodeExpiresAt: Date | null
  onboardingCompleted: boolean
  profileCreated: boolean
  profilePictureUrl: string | null
  bio: string | null
  status: "active" | "inactive"
  deleted: boolean
  deletedAt: Date | null
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  role?: Role
  userPermission?: UserPermission
  userDevices?: UserDevice[]
}

export type SafeUser = Omit<
  User,
  | "passwordHash"
  | "emailVerificationCode"
  | "phoneVerificationCode"
  | "confirmationCode"
  | "passwordResetCode"
>

export interface UserPermission extends Model {
  id: string
  userId: string
  calendarEnabled: boolean
  notificationsEnabled: boolean
  contactsEnabled: boolean
  locationEnabled: boolean
  marketingEmailsEnabled: boolean
  ritualRemindersEnabled: boolean
  communityUpdatesEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserDevice extends Model {
  id: string
  userId: string
  token: string
  refreshToken: string
  tokenExpiresAt: Date
  refreshTokenExpiresAt: Date
  deviceType: "mobile" | "desktop" | "tablet" | "unknown" | null
  deviceName: string | null
  userAgent: string | null
  ipAddress: string | null
  isActive: boolean
  lastUsedAt: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// EXPRESS REQUEST TYPES
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser
      deviceId?: string
    }
  }
}

// ============================================================================
// SEQUELIZE ERROR TYPES
// ============================================================================

export interface SequelizeValidationErrorItem {
  path?: string
  field?: string
  message: string
  type?: string
  validatorKey?: string
  validatorName?: string
  instance?: Model
}

export interface SequelizeValidationError extends Error {
  name: "SequelizeValidationError" | "SequelizeUniqueConstraintError"
  message: string
  errors?: SequelizeValidationErrorItem[]
  stack?: string
}

// Type guard for Sequelize validation errors
export type SequelizeError = Error & Partial<SequelizeValidationError>

// ============================================================================
// JOI VALIDATION TYPES
// ============================================================================

export interface JoiValidationErrorDetail {
  message: string
  path: (string | number)[]
  type: string
  context?: Record<string, unknown>
}

export interface JoiValidationError extends Error {
  details: JoiValidationErrorDetail[]
  isJoi: boolean
  annotate(): string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string
  error?: string | null
  errors?: Record<string, string> | null
}

export interface ApiError {
  success: false
  data: null
  message: string
  error: string
  errors?: Record<string, string>
  stack?: string
}

// ============================================================================
// RATE LIMITER TYPES
// ============================================================================

export interface RateLimitError {
  msBeforeNext?: number
  remainingPoints?: number
}

// ============================================================================
// HTTP SERVER TYPES
// ============================================================================

import type { Server as HttpServer } from "node:http"

export type HttpServerType = HttpServer
