/**
 * Profile Creation Schema
 * Zod schema for profile creation form
 */

import { z } from "zod"

/**
 * Profile creation schema
 * Validates profile creation input
 */
export const profileCreationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters"),
  phoneNumber: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),
  countryCode: z.string().min(2, "Please select a country code").max(5, "Invalid country code"),
})

export type ProfileCreationFormData = z.infer<typeof profileCreationSchema>
