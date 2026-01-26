/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import type { User } from "@/features/auth/store/authStore"
import { apiClient } from "@/lib/api-client"
import { clearTokens, setTokens } from "@/lib/token-manager"
import { type BackendUser, transformUserResponse } from "@/lib/user-transformer"
import type {
  LoginRequest,
  ResendVerificationRequest,
  SignupRequest,
  VerifyEmailRequest,
} from "../types/auth.types"

// Transformed auth response with clean User object
export interface AuthResponse {
  user: User
  message: string
}

// Export types for convenience
export type { LoginRequest, SignupRequest, VerifyEmailRequest, ResendVerificationRequest }

/**
 * Register a new user
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await apiClient.post<{
    success: boolean
    data: {
      user: BackendUser
      tokens: { accessToken: string; refreshToken: string; expiresIn: number }
      deviceId: string
    }
    message: string
  }>("/auth/register", data)

  // Store tokens
  if (response.data.success) {
    setTokens({
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
      deviceId: response.data.data.deviceId,
    })
  }

  // Transform user response to remove Date objects
  const user = transformUserResponse(response.data.data.user)

  return { user, message: response.data.message }
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<{
    success: boolean
    data: {
      user: BackendUser
      tokens: { accessToken: string; refreshToken: string; expiresIn: number }
      deviceId: string
    }
    message: string
  }>("/auth/login", data)

  // Store tokens
  if (response.data.success) {
    setTokens({
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
      deviceId: response.data.data.deviceId,
    })
  }

  // Transform user response to remove Date objects
  const user = transformUserResponse(response.data.data.user)

  return { user, message: response.data.message }
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
  const response = await apiClient.post<{
    success: boolean
    data: { user: BackendUser }
    message: string
  }>("/api/verify-email", data)

  // Transform user response to remove Date objects
  const user = transformUserResponse(response.data.data.user)

  return { user, message: response.data.message }
}

/**
 * Resend verification email
 */
export async function resendVerification(
  data: ResendVerificationRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>("/auth/resend-verification", data)
  return response.data
}

/**
 * Logout from current device
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/logout")
  } finally {
    // Always clear tokens, even if API call fails
    clearTokens()
  }
}

/**
 * Logout from all devices
 */
export async function logoutAll(): Promise<void> {
  try {
    await apiClient.post("/api/logout-all")
  } finally {
    // Always clear tokens, even if API call fails
    clearTokens()
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string, deviceId: string): Promise<AuthResponse> {
  const response = await apiClient.post<{
    success: boolean
    data: {
      user: BackendUser
      tokens: { accessToken: string; refreshToken: string; expiresIn: number }
      deviceId: string
    }
    message: string
  }>("/api/refresh-token", {
    refreshToken,
    deviceId,
  })

  // Update stored tokens
  if (response.data.success) {
    setTokens({
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
      deviceId: response.data.data.deviceId,
    })
  }

  // Transform user response to remove Date objects
  const user = transformUserResponse(response.data.data.user)

  return { user, message: response.data.message }
}
