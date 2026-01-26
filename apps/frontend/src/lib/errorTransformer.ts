/**
 * Error Transformer
 * Centralized error handling for transforming API errors into user-friendly messages
 */

import type { ApiError } from "@shared-types/api.types"
import type { AxiosError } from "axios"

/**
 * Transform API error into user-friendly message
 *
 * @param error - Axios error object
 * @returns User-friendly error message
 */
export function transformApiError(error: AxiosError<ApiError>): string {
  const status = error.response?.status
  const data = error.response?.data

  switch (status) {
    case 400:
      // Validation error - check for field errors
      if (data?.errors && Object.keys(data.errors).length > 0) {
        const firstField = Object.keys(data.errors)[0]
        const fieldError = data.errors[firstField]
        return typeof fieldError === "string"
          ? fieldError
          : Array.isArray(fieldError)
            ? fieldError[0]
            : "Invalid input. Please check your data."
      }
      return data?.message || "Invalid input. Please check your data."

    case 401:
      // Check for specific auth error messages first
      if (data?.message) {
        return data.message
      }
      return "Session expired. Please login again."

    case 403:
      return "You do not have permission to perform this action."

    case 404:
      return "The requested resource was not found."

    case 409:
      // Conflict - usually duplicate resource
      if (data?.message) {
        return data.message
      }
      if (error.config?.url?.includes("/auth/login")) {
        return "Invalid email or password"
      }
      if (error.config?.url?.includes("/auth/signup")) {
        return "An account with this email already exists"
      }
      return "A conflict occurred. Please refresh and try again."

    case 422:
      return data?.message || "Unable to process your request. Please check your input."

    case 429:
      return "Too many requests. Please wait a moment and try again."

    case 500:
      return "Server error. Please try again later."

    case 503:
      return "Service temporarily unavailable. Please try again later."

    default:
      // Network errors or unknown errors
      if (error.code === "ERR_NETWORK") {
        return "Network error. Please check your internet connection."
      }
      if (error.code === "ECONNABORTED") {
        return "Request timeout. Please try again."
      }
      return data?.message || "An unexpected error occurred. Please try again."
  }
}

/**
 * Extract field-level errors from API response
 *
 * @param error - Axios error object
 * @returns Object mapping field names to error messages, or null if no field errors
 */
export function getFieldErrors(error: AxiosError<ApiError>): Record<string, string> | null {
  if (error.response?.status === 400 || error.response?.status === 422) {
    const data = error.response?.data
    const errors = (data as ApiError & { errors?: Record<string, unknown> })?.errors

    if (errors && typeof errors === "object") {
      // Convert error objects/arrays to strings
      const fieldErrors: Record<string, string> = {}
      for (const [field, errorValue] of Object.entries(errors)) {
        fieldErrors[field] =
          typeof errorValue === "string"
            ? errorValue
            : Array.isArray(errorValue)
              ? errorValue[0]
              : "Invalid value"
      }
      return fieldErrors
    }
  }
  return null
}

/**
 * Check if error is a network error
 *
 * @param error - Any error object
 * @returns True if error is network-related
 */
export function isNetworkError(error: { code?: string; response?: unknown }): boolean {
  return error?.code === "ERR_NETWORK" || error?.code === "ECONNABORTED" || !error?.response
}

/**
 * Check if error is a server error (5xx)
 *
 * @param error - Axios error object
 * @returns True if status code is 5xx
 */
export function isServerError(error: AxiosError): boolean {
  const status = error.response?.status
  return status !== undefined && status >= 500 && status < 600
}

/**
 * Check if error is a client error (4xx)
 *
 * @param error - Axios error object
 * @returns True if status code is 4xx
 */
export function isClientError(error: AxiosError): boolean {
  const status = error.response?.status
  return status !== undefined && status >= 400 && status < 500
}
