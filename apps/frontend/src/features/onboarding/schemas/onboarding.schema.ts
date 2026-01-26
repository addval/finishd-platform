/**
 * Onboarding Validation Schemas
 * Zod schemas for onboarding forms
 */

import { z } from "zod"

/**
 * User permission settings schema
 * Validates permission settings input
 */
export const userPermissionSettingsSchema = z.object({
  calendarEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  contactsEnabled: z.boolean().optional(),
  locationEnabled: z.boolean().optional(),
  marketingEmailsEnabled: z.boolean().optional(),
  ritualRemindersEnabled: z.boolean().optional(),
  communityUpdatesEnabled: z.boolean().optional(),
})

export type UserPermissionSettingsFormData = z.infer<typeof userPermissionSettingsSchema>
