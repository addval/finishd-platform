/**
 * User Service
 * Handles user profile and permission-related API calls
 */

import type { User } from "@/features/auth/store/authStore"
import { apiClient } from "@/lib/api-client"
import { type BackendUser, transformUserResponse } from "@/lib/user-transformer"
import type {
  CreateProfileRequest,
  PermissionSettings,
  UpdatePermissionsRequest,
  UpdateProfileRequest,
} from "../types/profile.types"

// Export types for convenience
export type {
  CreateProfileRequest,
  UpdateProfileRequest,
  PermissionSettings,
  UpdatePermissionsRequest,
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<{ user: User }> {
  const response = await apiClient.get<{
    success: boolean
    data: { user: BackendUser }
    message: string
  }>("/api/users/profile")
  const user = transformUserResponse(response.data.data.user)
  return { user }
}

/**
 * Create user profile
 */
export async function createProfile(data: CreateProfileRequest): Promise<{ user: User }> {
  const response = await apiClient.post<{
    success: boolean
    data: { user: BackendUser }
    message: string
  }>("/api/users/profile", data)
  const user = transformUserResponse(response.data.data.user)
  return { user }
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<{ user: User }> {
  const response = await apiClient.put<{
    success: boolean
    data: { user: BackendUser }
    message: string
  }>("/api/users/profile", data)
  const user = transformUserResponse(response.data.data.user)
  return { user }
}

/**
 * Update user permission settings
 */
export async function updatePermissionSettings(
  data: UpdatePermissionsRequest,
): Promise<{ permissionSettings: PermissionSettings }> {
  const response = await apiClient.post<{
    success: boolean
    data: { permissionSettings: PermissionSettings }
    message: string
  }>("/api/users/user-permission-settings", data)
  return { permissionSettings: response.data.data.permissionSettings }
}
