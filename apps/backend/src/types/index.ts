/**
 * Global TypeScript Type Definitions
 * Centralized type definitions for the Finishd application
 */

import type { Server as HttpServer } from "node:http"

// Re-export all types from schema
export type {
  User,
  NewUser,
  HomeownerProfile,
  NewHomeownerProfile,
  DesignerProfile,
  NewDesignerProfile,
  ContractorProfile,
  NewContractorProfile,
  Property,
  NewProperty,
  Project,
  NewProject,
  ProjectRequest,
  NewProjectRequest,
  Proposal,
  NewProposal,
  ProjectContractor,
  NewProjectContractor,
  Task,
  NewTask,
  Milestone,
  NewMilestone,
  CostEstimate,
  NewCostEstimate,
  ActivityLog,
  NewActivityLog,
} from "../db/schema.js"

// Note: Express Request type augmentation is defined in modules/auth/auth.middleware.ts
// The req.user object contains: { userId: string; phone: string; userType: ... }

// ============================================================================
// DATABASE ERROR TYPES (PostgreSQL)
// ============================================================================

export interface PostgresErrorDetail {
  column?: string
  constraint?: string
  dataType?: string
  detail?: string
  hint?: string
  schema?: string
  table?: string
}

export interface PostgresError extends Error {
  code?: string
  detail?: string
  constraint?: string
  column?: string
  table?: string
  schema?: string
}

// Common PostgreSQL error codes
export const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
} as const

// Type guard for PostgreSQL errors
export const isPostgresError = (error: unknown): error is PostgresError => {
  return error instanceof Error && "code" in error
}

// ============================================================================
// ZOD VALIDATION TYPES
// ============================================================================

export interface ZodValidationErrorDetail {
  message: string
  path: (string | number)[]
  code: string
}

export interface ZodValidationError extends Error {
  issues: ZodValidationErrorDetail[]
  name: "ZodError"
}

// ============================================================================
// JOI VALIDATION TYPES (for backwards compatibility)
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

export type HttpServerType = HttpServer
