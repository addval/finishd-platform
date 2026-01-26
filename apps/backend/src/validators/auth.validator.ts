/**
 * Authentication Validation Schemas
 * Joi validators for authentication endpoints
 */

import Joi from "joi"

/**
 * Register schema
 * Validates user registration input
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base": "Password must contain both letters and numbers",
      "any.required": "Password is required",
    }),
})

/**
 * Login schema
 * Validates user login input
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
})

/**
 * Verify email schema (authenticated version)
 * Validates email verification input - only requires code since user is authenticated
 */
export const verifyEmailSchema = Joi.object({
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "Verification code must be 6 digits",
    "string.pattern.base": "Verification code must contain only numbers",
    "any.required": "Verification code is required",
  }),
})

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
})

/**
 * Refresh token schema
 * Validates refresh token input
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
  deviceId: Joi.string().uuid().required().messages({
    "string.guid": "Invalid device ID format",
    "any.required": "Device ID is required",
  }),
})

/**
 * Create profile schema
 * Validates profile creation input with required fields
 */
export const createProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  username: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username must not exceed 50 characters",
      "string.pattern.base": "Username can only contain letters, numbers, and underscores",
      "any.required": "Username is required",
    }),
  city: Joi.string().min(2).max(100).required().messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City must not exceed 100 characters",
    "any.required": "City is required",
  }),
  bio: Joi.string().max(500).optional().messages({
    "string.max": "Bio must not exceed 500 characters",
  }),
  timezone: Joi.string()
    .pattern(/^(Africa|America|Asia|Atlantic|Australia|Europe|Indian|Pacific)\/[A-Za-z0-9_]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid timezone format",
    }),
  // Phone number support
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be in E.164 format",
      "any.required": "Phone number is required",
    }),
  countryCode: Joi.string()
    .pattern(/^\+\d{1,4}$/)
    .required()
    .messages({
      "string.pattern.base": "Country code must be in format +XX or +XXX",
      "any.required": "Country code is required",
    }),
})

/**
 * Update profile schema
 * Validates profile update input
 */
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 100 characters",
  }),
  username: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .optional()
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username must not exceed 50 characters",
      "string.pattern.base": "Username can only contain letters, numbers, and underscores",
    }),
  city: Joi.string().min(2).max(100).optional().messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City must not exceed 100 characters",
  }),
  bio: Joi.string().max(500).optional().messages({
    "string.max": "Bio must not exceed 500 characters",
  }),
  timezone: Joi.string()
    .pattern(/^(Africa|America|Asia|Atlantic|Australia|Europe|Indian|Pacific)\/[A-Za-z0-9_]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid timezone format",
    }),
  // Phone number support
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be in E.164 format",
    }),
  countryCode: Joi.string()
    .pattern(/^\+\d{1,4}$/)
    .optional()
    .messages({
      "string.pattern.base": "Country code must be in format +XX or +XXX",
    }),
})

/**
 * Change password schema
 * Validates password change input
 */
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters long",
      "string.pattern.base": "New password must contain both letters and numbers",
      "any.required": "New password is required",
    }),
})

/**
 * User permission settings schema
 * Validates user permission settings input (for onboarding)
 */
export const userPermissionSettingsSchema = Joi.object({
  calendarEnabled: Joi.boolean().optional(),
  notificationsEnabled: Joi.boolean().optional(),
  contactsEnabled: Joi.boolean().optional(),
  locationEnabled: Joi.boolean().optional(),
  marketingEmailsEnabled: Joi.boolean().optional(),
  ritualRemindersEnabled: Joi.boolean().optional(),
  communityUpdatesEnabled: Joi.boolean().optional(),
})
