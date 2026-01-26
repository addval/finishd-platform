/**
 * User Service
 * Handles user management business logic
 */

import { Op } from "sequelize"
import { User, UserDevice, UserPermission } from "../models/index.js"
import type { SafeUser } from "../types/index.js"
import { getUserDevices } from "../utils/device.util.js"
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js"
import logger from "../utils/logger.js"
import { comparePassword, hashPassword, validatePasswordStrength } from "../utils/password.util.js"
import { createSafeUser, getUserById } from "../utils/user.util.js"

// Service interfaces
export interface CreateProfileDto {
  name: string
  username: string
  city: string
  bio?: string
  timezone?: string
  phoneNumber: string
  countryCode: string
}

export interface UpdateProfileDto {
  name?: string
  username?: string
  city?: string
  bio?: string
  timezone?: string
  phoneNumber?: string
  countryCode?: string
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

export interface CreatePermissionSettingsDto {
  calendarEnabled?: boolean
  notificationsEnabled?: boolean
  contactsEnabled?: boolean
  locationEnabled?: boolean
  marketingEmailsEnabled?: boolean
  ritualRemindersEnabled?: boolean
  communityUpdatesEnabled?: boolean
}

/**
 * Get user profile
 * @param userId - User ID
 * @returns User profile data
 */
export const getUserProfile = async (userId: string): Promise<SafeUser> => {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    const safeUser = createSafeUser(user)
    if (!safeUser) {
      throw new NotFoundError("Failed to create user object")
    }
    return safeUser
  } catch (error) {
    logger.error("Error in getUserProfile:", error)
    throw error
  }
}

/**
 * Create user profile
 * @param userId - User ID
 * @param data - Profile data to create
 * @returns Created user profile
 */
export const createUserProfile = async (
  userId: string,
  data: CreateProfileDto,
): Promise<SafeUser> => {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check if profile already exists
    if (user.profileCreated) {
      throw new ConflictError("Profile already exists. Use update instead.")
    }

    // Check if username is already taken
    const existingUser = await User.findOne({
      where: {
        username: data.username,
        id: { [Op.ne]: userId },
      },
    })

    if (existingUser) {
      throw new ConflictError("Username is already taken")
    }

    // Check if phone number is already taken
    const existingUserWithPhone = await User.findOne({
      where: {
        phone_number: data.phoneNumber,
        id: { [Op.ne]: userId },
      },
    })

    if (existingUserWithPhone) {
      throw new ConflictError("Phone number already in use")
    }

    // Create profile with profileCreated: true
    await user.update({
      ...data,
      profileCreated: true,
    })

    logger.info(`User profile created: ${userId}`)

    const safeUser = createSafeUser(user)
    if (!safeUser) {
      throw new NotFoundError("Failed to create user object")
    }
    return safeUser
  } catch (error) {
    logger.error("Error in createUserProfile:", error)
    throw error
  }
}

/**
 * Update user profile
 * @param userId - User ID
 * @param data - Profile data to update
 * @returns Updated user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileDto,
): Promise<SafeUser> => {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check if username is being updated and if it's already taken
    if (data.username && data.username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          username: data.username,
          id: { [Op.ne]: userId },
        },
      })

      if (existingUser) {
        throw new ConflictError("Username is already taken")
      }
    }

    // Check if phone number is being updated and if it's already taken
    if (data.phoneNumber) {
      const existingUserWithPhone = await User.findOne({
        where: {
          phone_number: data.phoneNumber,
          id: { [Op.ne]: userId },
        },
      })

      if (existingUserWithPhone) {
        throw new ConflictError("Phone number already in use")
      }
    }

    // Update user
    await user.update(data)

    // Check if profile is complete (has all required fields)
    const hasProfile = !!(user.name && user.username && user.city && user.phoneNumber)
    if (hasProfile && !user.profileCreated) {
      await user.update({ profileCreated: true })
    }

    logger.info(`User profile updated: ${userId}`)

    const safeUser = createSafeUser(user)
    if (!safeUser) {
      throw new NotFoundError("Failed to create user object")
    }
    return safeUser
  } catch (error) {
    logger.error("Error in updateUserProfile:", error)
    throw error
  }
}

/**
 * Change user password
 * @param userId - User ID
 * @param data - Password change data
 * @returns Success message
 */
export const changePassword = async (
  userId: string,
  data: ChangePasswordDto,
): Promise<{ message: string }> => {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Verify old password
    const isPasswordValid = await comparePassword(data.oldPassword, user.passwordHash)

    if (!isPasswordValid) {
      throw new ValidationError("Current password is incorrect")
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(data.newPassword)
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.message || "Password validation failed")
    }

    // Check if new password is same as old password
    if (data.oldPassword === data.newPassword) {
      throw new ValidationError("New password must be different from current password")
    }

    // Hash new password
    const passwordHash = await hashPassword(data.newPassword)

    // Update password
    await user.update({
      passwordHash,
    })

    // Logout from all devices (security best practice)
    const { logoutAllDevices } = await import("./auth.service.js")
    await logoutAllDevices(userId)

    logger.info(`Password changed for user: ${userId}`)

    return { message: "Password changed successfully. Please login again." }
  } catch (error) {
    logger.error("Error in changePassword:", error)
    throw error
  }
}

/**
 * Get all user devices
 * @param userId - User ID
 * @returns List of user devices
 */
export const getAllUserDevices = async (userId: string): Promise<UserDevice[]> => {
  try {
    const devices = await getUserDevices(userId)
    return devices
  } catch (error) {
    logger.error("Error in getAllUserDevices:", error)
    throw error
  }
}

/**
 * Revoke device (logout from device)
 * @param userId - User ID
 * @param deviceId - Device ID to revoke
 * @returns Success message
 */
export const revokeDevice = async (
  userId: string,
  deviceId: string,
): Promise<{ message: string }> => {
  try {
    // Delete the specific UserDevice record (logs out user from that device)
    const device = await UserDevice.findOne({
      where: {
        id: deviceId,
        userId,
      },
    })

    if (!device) {
      throw new NotFoundError("Device not found")
    }

    await device.destroy()

    logger.info(`Device revoked for user: ${userId}, device: ${deviceId}`)

    return { message: "Device revoked successfully" }
  } catch (error) {
    logger.error("Error in revokeDevice:", error)
    throw error
  }
}

/**
 * Delete user account (soft delete)
 * @param userId - User ID
 * @returns Success message
 */
export const deleteUserAccount = async (userId: string): Promise<{ message: string }> => {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Soft delete user
    await user.update({
      deleted: true,
      deletedAt: new Date(),
      status: "inactive",
    })

    // Logout from all devices
    const { logoutAllDevices } = await import("./auth.service.js")
    await logoutAllDevices(userId)

    // Delete cached user data from Redis
    const { deleteCachedUserData } = await import("../utils/redis.util.js")
    await deleteCachedUserData(userId)

    logger.info(`User account deleted: ${userId}`)

    return { message: "Account deleted successfully" }
  } catch (error) {
    logger.error("Error in deleteUserAccount:", error)
    throw error
  }
}

/**
 * Create user permission settings (onboarding)
 * @param userId - User ID
 * @param data - Permission settings data
 * @returns Created permission settings
 */
export const createUserPermissionSettings = async (
  userId: string,
  data: CreatePermissionSettingsDto,
): Promise<UserPermission> => {
  try {
    // Check if permission settings already exist
    const existing = await UserPermission.findOne({
      where: { userId },
    })

    if (existing) {
      throw new ConflictError("Permission settings already exist. Use update instead.")
    }

    // Create permission settings with provided values or model defaults
    const permissionSettings = await UserPermission.create({
      userId,
      ...data,
    })

    // Mark user's onboarding as completed
    await User.update({ onboardingCompleted: true }, { where: { id: userId } })

    logger.info(`User permission settings created: ${userId}`)
    logger.info(`User onboarding completed: ${userId}`)

    return permissionSettings
  } catch (error) {
    logger.error("Error in createUserPermissionSettings:", error)
    throw error
  }
}

/**
 * Update user permission settings
 * @param userId - User ID
 * @param data - Permission settings data to update
 * @returns Updated permission settings
 */
export const updateUserPermissionSettings = async (
  userId: string,
  data: CreatePermissionSettingsDto,
): Promise<UserPermission> => {
  try {
    const permissionSettings = await UserPermission.findOne({
      where: { userId },
    })

    if (!permissionSettings) {
      throw new NotFoundError("Permission settings not found. Please create settings first.")
    }

    // Update only provided fields
    await permissionSettings.update(data)

    logger.info(`User permission settings updated: ${userId}`)

    return permissionSettings
  } catch (error) {
    logger.error("Error in updateUserPermissionSettings:", error)
    throw error
  }
}
