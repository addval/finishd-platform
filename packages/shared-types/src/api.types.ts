/**
 * Shared API Types
 * Used by both frontend and backend for API contracts
 */

// Generic API Response format
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
  error: string | null
}

// API Error type for typed error handling
export interface ApiError {
  message: string
  code?: string
  field?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// User types
export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: "user" | "admin" | "super_admin"
  status: "active" | "inactive" | "suspended"
  createdAt: string
  updatedAt: string
}

// Frontend Auth User type (matches actual API response structure)
export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  profileCreated: boolean
  onboardingCompleted: boolean
  name?: string
  username?: string
  city?: string
  bio?: string
  timezone?: string
  phoneNumber?: string
  countryCode?: string
}

export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface UpdateUserInput {
  email?: string
  firstName?: string
  lastName?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// Post types
export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  authorId: number
  status: "draft" | "published" | "archived"
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  title: string
  content: string
  excerpt?: string
  status: "draft" | "published"
}

export interface UpdatePostInput {
  title?: string
  content?: string
  excerpt?: string
  status?: "draft" | "published"
}
