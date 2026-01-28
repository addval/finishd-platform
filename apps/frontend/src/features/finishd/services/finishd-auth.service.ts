/**
 * Finishd Auth Service
 * Phone OTP-based authentication for Finishd marketplace
 */

import { apiClient } from "@/lib/api-client"
import { setTokens, clearTokens } from "@/lib/token-manager"

const API_BASE = "/api/v1/auth"

// ============================================================================
// TYPES
// ============================================================================

export interface SendOtpRequest {
  phone: string
}

export interface SendOtpResponse {
  success: boolean
  data: {
    message: string
    expiresIn: number
  }
  message: string
}

export interface VerifyOtpRequest {
  phone: string
  otp: string
}

export interface FinishdUser {
  id: string
  phone: string
  userType: "homeowner" | "designer" | "contractor" | null
  languagePreference: "en" | "hi"
  isActive: boolean
  createdAt: string
  isNewUser: boolean
}

export interface VerifyOtpResponse {
  success: boolean
  data: {
    user: FinishdUser
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
  message: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    accessToken: string
  }
  message: string
}

export interface SetUserTypeRequest {
  userType: "homeowner" | "designer" | "contractor"
}

export interface SetUserTypeResponse {
  success: boolean
  data: {
    user: FinishdUser
  }
  message: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Send OTP to phone number
 * @param phone - 10-digit Indian phone number
 */
export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  // Format phone number (ensure it's clean)
  const cleanPhone = phone.replace(/\D/g, "").slice(-10)

  const response = await apiClient.post<SendOtpResponse>(`${API_BASE}/send-otp`, {
    phone: cleanPhone,
  })

  return response.data
}

/**
 * Verify OTP and authenticate
 * @param phone - Phone number
 * @param otp - 6-digit OTP (use "123456" in dev)
 */
export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10)

  const response = await apiClient.post<VerifyOtpResponse>(`${API_BASE}/verify-otp`, {
    phone: cleanPhone,
    otp,
  })

  // Store tokens
  if (response.data.success && response.data.data.tokens) {
    setTokens({
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
      deviceId: "", // Not used in Finishd
    })
  }

  return response.data
}

/**
 * Refresh access token
 * @param refreshToken - Current refresh token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>(`${API_BASE}/refresh-token`, {
    refreshToken,
  })

  return response.data
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(`${API_BASE}/logout`)
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    clearTokens()
  }
}

/**
 * Set user type (onboarding step)
 * @param userType - homeowner, designer, or contractor
 */
export async function setUserType(userType: "homeowner" | "designer" | "contractor"): Promise<SetUserTypeResponse> {
  const response = await apiClient.patch<SetUserTypeResponse>("/api/v1/users/me", {
    userType,
  })

  return response.data
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ success: boolean; data: { user: FinishdUser } }> {
  const response = await apiClient.get("/api/v1/users/me")
  return response.data
}
