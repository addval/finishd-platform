/**
 * Auth Store - Zustand-based authentication state management
 * Replaces React Context with persistent, performant state management
 */

import type { ApiError } from "@shared-types/api.types"
import type { AxiosError } from "axios"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { AuthResponse } from "@/features/auth/services/auth.service"
import * as authService from "@/features/auth/services/auth.service"

/**
 * User interface matching backend response
 */
export interface User {
  id: string
  email: string
  name?: string
  username?: string
  city?: string
  bio?: string
  timezone?: string
  phoneNumber?: string
  countryCode?: string
  emailVerified: boolean
  profileCreated: boolean
  onboardingCompleted: boolean
}

/**
 * Auth Store State Interface
 */
interface AuthState {
  // State
  user: User | null
  accessToken: string | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void

  // Role/Status methods
  isAuthenticated: () => boolean
  isProfileCreated: () => boolean
  isOnboardingCompleted: () => boolean
}

/**
 * Auth Store with localStorage persistence
 * Only persists non-sensitive data (user object, not tokens)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      /**
       * Login action
       * Authenticates user and updates store state
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response: AuthResponse = await authService.login({ email, password })
          // response.user is already transformed by the service
          set({ user: response.user, isLoading: false })
        } catch (error) {
          const err = error as AxiosError<ApiError>
          const errorMessage = err.response?.data?.message || "Login failed"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      /**
       * Signup action
       * Creates new user account and updates store state
       */
      signup: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response: AuthResponse = await authService.signup({ email, password })
          // response.user is already transformed by the service
          set({ user: response.user, isLoading: false })
        } catch (error) {
          const err = error as AxiosError<ApiError>
          const errorMessage = err.response?.data?.message || "Signup failed"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      /**
       * Logout action
       * Clears user data and tokens from store and storage
       */
      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error("Logout error:", error)
        } finally {
          set({ user: null, accessToken: null })
        }
      },

      /**
       * Refresh token action
       * Token refresh is primarily handled by axios interceptor
       * This method is available for manual refresh if needed
       */
      refreshToken: async () => {
        // Token refresh is handled by axios interceptor in api-client.ts
        console.log("Token refresh handled by axios interceptor")
      },

      /**
       * Set user manually
       * Useful for updating user data without full authentication flow
       */
      setUser: user => set({ user }),

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),

      /**
       * Check if user is authenticated
       */
      isAuthenticated: () => !!get().user,

      /**
       * Check if user has created profile
       */
      isProfileCreated: () => !!get().user?.profileCreated,

      /**
       * Check if user has completed onboarding
       */
      isOnboardingCompleted: () => !!get().user?.onboardingCompleted,
    }),
    {
      name: "rituality-auth-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data
      // Tokens are managed by token-manager.ts
      partialize: state => ({
        user: state.user,
        // NOT: accessToken, refreshToken (security)
      }),
    },
  ),
)
