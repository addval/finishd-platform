/**
 * Finishd Auth Store
 * Zustand-based authentication state for phone OTP auth
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import * as finishdAuthService from "../services/finishd-auth.service"
import type { FinishdUser } from "../services/finishd-auth.service"

// ============================================================================
// TYPES
// ============================================================================

type UserType = "homeowner" | "designer" | "contractor"

interface FinishdAuthState {
  // State
  user: FinishdUser | null
  isLoading: boolean
  error: string | null
  otpSent: boolean
  pendingPhone: string | null

  // Actions
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  setUserType: (userType: UserType) => Promise<void>
  setUser: (user: FinishdUser | null) => void
  clearError: () => void
  resetOtpState: () => void

  // Computed helpers
  isAuthenticated: () => boolean
  needsOnboarding: () => boolean
  getUserType: () => UserType | null
}

// ============================================================================
// STORE
// ============================================================================

export const useFinishdAuthStore = create<FinishdAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,
      otpSent: false,
      pendingPhone: null,

      /**
       * Send OTP to phone number
       */
      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null, otpSent: false })
        try {
          await finishdAuthService.sendOtp(phone)
          set({ otpSent: true, pendingPhone: phone, isLoading: false })
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } }
          const errorMessage = err.response?.data?.message || "Failed to send OTP"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      /**
       * Verify OTP and authenticate
       */
      verifyOtp: async (phone: string, otp: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await finishdAuthService.verifyOtp(phone, otp)
          set({
            user: response.data.user,
            isLoading: false,
            otpSent: false,
            pendingPhone: null,
          })
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } }
          const errorMessage = err.response?.data?.message || "Invalid OTP"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await finishdAuthService.logout()
        } finally {
          set({ user: null, otpSent: false, pendingPhone: null })
        }
      },

      /**
       * Set user type during onboarding
       */
      setUserType: async (userType: UserType) => {
        set({ isLoading: true, error: null })
        try {
          const response = await finishdAuthService.setUserType(userType)
          set({ user: response.data.user, isLoading: false })
        } catch (error) {
          const err = error as { response?: { data?: { message?: string } } }
          const errorMessage = err.response?.data?.message || "Failed to set user type"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      /**
       * Manually set user
       */
      setUser: (user) => set({ user }),

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),

      /**
       * Reset OTP state (for going back)
       */
      resetOtpState: () => set({ otpSent: false, pendingPhone: null }),

      /**
       * Check if user is authenticated
       */
      isAuthenticated: () => !!get().user,

      /**
       * Check if user needs onboarding (no user type set)
       */
      needsOnboarding: () => {
        const user = get().user
        return !!user && !user.userType
      },

      /**
       * Get current user type
       */
      getUserType: () => get().user?.userType || null,
    }),
    {
      name: "finishd-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // Don't persist: isLoading, error, otpSent, pendingPhone
      }),
    },
  ),
)
