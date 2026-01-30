/**
 * Users Controller
 * HTTP request handlers for user management
 */

import type { Request, Response, NextFunction } from "express"
import { getUserWithProfile, updateUserLanguage, deactivateUser } from "./users.service.js"
import { setUserType } from "../auth/auth.service.js"

/**
 * GET /api/v1/users/me
 * Get current user profile
 */
export async function getMeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const result = await getUserWithProfile(userId)

    if (!result) {
      res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        error: "NOT_FOUND",
      })
      return
    }

    // Format response
    const userData = {
      id: result.user.id,
      phone: result.user.phone,
      userType: result.user.userType,
      languagePreference: result.user.languagePreference,
      createdAt: result.user.createdAt,
      profile: result.profile,
    }

    res.status(200).json({
      success: true,
      data: { user: userData },
      message: "User profile retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/v1/users/me
 * Update current user
 */
export async function updateMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const { userType, languagePreference } = req.body

    // Update user type if provided
    if (userType) {
      if (!["homeowner", "designer", "contractor"].includes(userType)) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Invalid user type. Must be: homeowner, designer, or contractor",
          error: "VALIDATION_ERROR",
        })
        return
      }

      const typeResult = await setUserType(userId, userType)
      if (!typeResult.success) {
        res.status(400).json({
          success: false,
          data: null,
          message: typeResult.error,
          error: "UPDATE_FAILED",
        })
        return
      }
    }

    // Update language preference if provided
    if (languagePreference) {
      if (!["en", "hi"].includes(languagePreference)) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Invalid language. Must be: en or hi",
          error: "VALIDATION_ERROR",
        })
        return
      }

      const langResult = await updateUserLanguage(userId, languagePreference)
      if (!langResult.success) {
        res.status(400).json({
          success: false,
          data: null,
          message: langResult.error,
          error: "UPDATE_FAILED",
        })
        return
      }
    }

    // Get updated user
    const result = await getUserWithProfile(userId)

    if (!result) {
      res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        error: "NOT_FOUND",
      })
      return
    }

    const userData = {
      id: result.user.id,
      phone: result.user.phone,
      userType: result.user.userType,
      languagePreference: result.user.languagePreference,
      createdAt: result.user.createdAt,
    }

    res.status(200).json({
      success: true,
      data: { user: userData },
      message: "User updated successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/v1/users/me
 * Deactivate current user account
 */
export async function deleteMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const result = await deactivateUser(userId)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "DEACTIVATE_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Account deactivated successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}
