/**
 * Token Manager
 * Manages JWT token storage and retrieval
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  DEVICE_ID: "device_id",
  AUTH_STORE_KEY: "rituality-auth-store",
} as const

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
}

/**
 * Get stored device ID
 */
export function getDeviceId(): string | null {
  return localStorage.getItem(TOKEN_KEYS.DEVICE_ID)
}

/**
 * Set all tokens from login/signup response
 */
export function setTokens(tokens: {
  accessToken: string
  refreshToken: string
  deviceId: string
}): void {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken)
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken)
  localStorage.setItem(TOKEN_KEYS.DEVICE_ID, tokens.deviceId)
}

/**
 * Clear all tokens (logout)
 */
export function clearTokens(): void {
  // Clear JWT tokens
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(TOKEN_KEYS.DEVICE_ID)
  // Clear auth store from localStorage
  localStorage.removeItem(TOKEN_KEYS.AUTH_STORE_KEY)
}

/**
 * Check if user has valid access token
 */
export function hasAccessToken(): boolean {
  return !!getAccessToken()
}

/**
 * Check if user has refresh token
 */
export function hasRefreshToken(): boolean {
  return !!getRefreshToken()
}
