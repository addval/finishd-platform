/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 */

import type { NextFunction, Request, Response } from "express"
import { MESSAGES } from "../constants/messages.js"
import * as userService from "../services/user.service.js"
import { successResponse } from "../utils/response.util.js"

/**
 * Get user profile
 * GET /users/profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const user = await userService.getUserProfile(req.user.id)

    successResponse(res, { user }, MESSAGES.USER.PROFILE_FETCHED)
  } catch (error) {
    next(error)
  }
}

/**
 * Create user profile
 * POST /users/profile
 */
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const { name, username, city, bio, timezone, phoneNumber, countryCode } = req.body

    const user = await userService.createUserProfile(req.user.id, {
      name,
      username,
      city,
      bio,
      timezone,
      phoneNumber,
      countryCode,
    })

    successResponse(res, { user }, MESSAGES.USER.PROFILE_CREATED)
  } catch (error) {
    next(error)
  }
}

/**
 * Update user profile
 * PUT /users/profile
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const { name, username, city, bio, timezone, phoneNumber, countryCode } = req.body

    const user = await userService.updateUserProfile(req.user.id, {
      name,
      username,
      city,
      bio,
      timezone,
      phoneNumber,
      countryCode,
    })

    successResponse(res, { user }, MESSAGES.USER.PROFILE_UPDATED)
  } catch (error) {
    next(error)
  }
}

/**
 * Change password
 * PUT /users/password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const { oldPassword, newPassword } = req.body

    const result = await userService.changePassword(req.user.id, {
      oldPassword,
      newPassword,
    })

    successResponse(res, null, result.message)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all user devices
 * GET /users/devices
 */
export const getDevices = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const devices = await userService.getAllUserDevices(req.user.id)

    successResponse(res, { devices }, "Devices retrieved successfully")
  } catch (error) {
    next(error)
  }
}

/**
 * Revoke a specific device
 * DELETE /users/devices/:deviceId
 */
export const revokeDevice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const { deviceId } = req.params

    const result = await userService.revokeDevice(req.user.id, deviceId)

    successResponse(res, null, result.message)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete user account
 * DELETE /users/account
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const result = await userService.deleteUserAccount(req.user.id)

    successResponse(res, null, result.message)
  } catch (error) {
    next(error)
  }
}

/**
 * Create user permission settings (onboarding)
 * POST /users/user-permission-settings
 */
export const createPermissionSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const permissionSettings = await userService.createUserPermissionSettings(req.user.id, req.body)

    successResponse(res, { permissionSettings }, MESSAGES.USER.PERMISSION_SETTINGS_CREATED)
  } catch (error) {
    next(error)
  }
}

/**
 * Update user permission settings
 * PUT /users/user-permission-settings
 */
export const updatePermissionSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const permissionSettings = await userService.updateUserPermissionSettings(req.user.id, req.body)

    successResponse(res, { permissionSettings }, MESSAGES.USER.PERMISSION_SETTINGS_UPDATED)
  } catch (error) {
    next(error)
  }
}

export default {
  getProfile,
  createProfile,
  updateProfile,
  changePassword,
  getDevices,
  revokeDevice,
  deleteAccount,
  createPermissionSettings,
  updatePermissionSettings,
}
