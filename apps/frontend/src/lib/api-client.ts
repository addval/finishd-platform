/**
 * API Client
 * Configured axios instance with interceptors for authentication and token refresh
 */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios"
import {
  clearTokens,
  getAccessToken,
  getDeviceId,
  getRefreshToken,
  setTokens,
} from "./token-manager"

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

// Process queue after refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

/**
 * Request Interceptor
 * Adds access token to all requests
 * Automatically detects and adds user timezone
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Auto-detect user timezone and add to headers
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (userTimezone) {
      config.headers["x-timezone"] = userTimezone
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If no refresh token, just pass error through
    // This means user is not logged in yet (e.g., wrong credentials on login screen)
    // Don't redirect - let the component handle the error
    if (!getRefreshToken()) {
      return Promise.reject(error)
    }

    // If already refreshing, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
        .catch(err => {
          return Promise.reject(err)
        })
    }

    // Mark as refreshing
    isRefreshing = true
    originalRequest._retry = true

    try {
      // Call refresh token endpoint
      const refreshToken = getRefreshToken()
      const deviceId = getDeviceId()

      // Try Finishd API first, fall back to legacy
      const response = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
        refreshToken,
      })

      const { accessToken } = response.data.data

      // Update stored tokens (Finishd API returns only accessToken)
      setTokens({
        accessToken,
        refreshToken: refreshToken || "",
        deviceId: deviceId || "",
      })

      // Process queue with new token
      processQueue(null, accessToken)

      // Update original request and retry
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      return apiClient(originalRequest)
    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      processQueue(refreshError as Error, null)
      clearTokens()
      // Check if we're in Finishd context
      if (window.location.pathname.startsWith("/finishd")) {
        window.location.href = "/finishd/login"
      } else {
        window.location.href = "/login"
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
