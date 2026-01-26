/**
 * Authentication Validation Schemas
 * Zod schemas for authentication forms
 */

import { z } from "zod"

/**
 * Login schema
 * Validates user login input
 */
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(8, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Signup schema
 * Validates user registration input
 */
export const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export type SignupFormData = z.infer<typeof signupSchema>

/**
 * Verify email schema
 * Validates email verification OTP input
 */
export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
})

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>
