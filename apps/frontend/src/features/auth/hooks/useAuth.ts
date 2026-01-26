/**
 * Authentication Hooks
 * React Query hooks for authentication operations
 */

import type { ApiError } from "@shared-types/api.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { useAuthStore } from "@/features/auth/store/authStore"
import * as userService from "@/features/profile/services/user.service"
import * as authService from "../services/auth.service"

/**
 * Login Hook
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: data => {
      // Update user in cache
      queryClient.setQueryData(["user"], data.user)
      toast.success("Login successful")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Login failed"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Signup Hook
 */
export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: data => {
      // Update user in cache
      queryClient.setQueryData(["user"], data.user)
      toast.success("Account created successfully")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Signup failed"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Verify Email Hook
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)

  return useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: data => {
      // Update user in Zustand store
      setUser(data.user)
      // Also update query cache for consistency
      queryClient.setQueryData(["user"], data.user)
      toast.success("Email verified successfully")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Verification failed"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Resend Verification Hook
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
      toast.success("Verification code sent")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Failed to resend code"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Refresh Token Hook
 */
export function useRefreshToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refreshToken, deviceId }: { refreshToken: string; deviceId: string }) =>
      authService.refreshToken(refreshToken, deviceId),
    onSuccess: data => {
      // Update user in cache
      queryClient.setQueryData(["user"], data.user)
    },
    onError: (error: unknown) => {
      // Token refresh failed, user will need to login again
      toast.error("Session expired. Please login again.")
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Get Profile Hook
 */
export function useProfile() {
  return useQuery({
    queryKey: ["user"],
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Update Profile Hook
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: data => {
      // Update user in cache with profileCreated = true
      queryClient.setQueryData(["user"], (old: { user: unknown } | undefined) => ({
        ...old,
        user: {
          ...old.user,
          ...data.user,
          profileCreated: true,
        },
      }))
      toast.success("Profile updated successfully")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Failed to update profile"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Create Profile Hook
 */
export function useCreateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)

  return useMutation({
    mutationFn: userService.createProfile,
    onSuccess: data => {
      // Update user in Zustand store
      setUser(data.user)
      // Also update query cache for consistency
      queryClient.setQueryData(["user"], data.user)
      toast.success("Profile created successfully")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Failed to create profile"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}

/**
 * Update Permissions Hook
 */
export function useUpdatePermissions() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)
  const user = useAuthStore(state => state.user)

  return useMutation({
    mutationFn: userService.updatePermissionSettings,
    onSuccess: () => {
      // Update user's onboardingCompleted flag in auth store
      if (user) {
        setUser({ ...user, onboardingCompleted: true })
      }

      // Update query cache
      queryClient.setQueryData(["user"], (old: { user: unknown } | undefined) => {
        if (!old?.user) return old
        return {
          ...old,
          user: { ...old.user, onboardingCompleted: true },
        }
      })

      toast.success("Preferences saved")
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<ApiError>
      const message = err.response?.data?.message || "Failed to save preferences"
      toast.error(message)
      // Throw error so calling component can handle it
      throw error
    },
  })
}
