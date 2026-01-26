/**
 * Authentication Types
 * Type definitions for authentication-related data structures
 */

/**
 * API Response Types
 */
export interface AuthResponse {
  success: boolean
  data: {
    user: {
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
    }
    tokens: {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
    deviceId: string
  }
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  code: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface RefreshTokenRequest {
  refreshToken: string
  deviceId: string
}

/**
 * Auth State Types
 */
export interface User {
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
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  deviceId: string
}
