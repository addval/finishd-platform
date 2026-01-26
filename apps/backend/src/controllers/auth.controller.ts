/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import type { NextFunction, Request, Response } from "express"
import { MESSAGES } from "../constants/messages.js"
import * as authService from "../services/auth.service.js"
import { extractDeviceInfo } from "../utils/device.util.js"
import { createdResponse, successResponse } from "../utils/response.util.js"

/**
 * Register new user
 * POST /auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body

    // Extract timezone from header
    const timezone = ((req.headers["x-timezone"] || req.headers.timezone) as string) || "UTC"

    // Extract device info
    const deviceInfo = extractDeviceInfo(req)

    const result = await authService.registerUserWithDevice({
      email,
      password,
      timezone,
      deviceInfo,
    })

    // Extract user and tokens from result
    const { tokens, ...user } = result

    createdResponse(
      res,
      {
        user,
        tokens,
        deviceId: deviceInfo.deviceId,
      },
      MESSAGES.AUTH.REGISTER_SUCCESS,
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 * POST /auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body

    // Extract device info from request
    const deviceInfo = extractDeviceInfo(req)

    const result = await authService.loginUser(
      {
        email,
        password,
      },
      deviceInfo,
    )

    successResponse(
      res,
      {
        user: result.user,
        tokens: result.tokens,
        deviceId: deviceInfo.deviceId,
      },
      MESSAGES.AUTH.LOGIN_SUCCESS,
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Verify email
 * POST /auth/verify-email (requires authentication)
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // User is authenticated, req.user is available from authenticate middleware
    if (!req.user) {
      throw new Error("User not authenticated")
    }

    const { code } = req.body
    const userId = req.user.id

    // Verify email OTP with userId
    await authService.verifyEmailById(userId, code)

    // Get updated user
    const { getUserById } = await import("../utils/user.util.js")
    const user = await getUserById(userId)

    if (!user) {
      throw new Error("User not found after verification")
    }

    user.passwordHash = "" // Remove password hash before sending user object

    // Return user only (no new tokens - registration tokens remain valid)
    successResponse(
      res,
      {
        user,
      },
      "Email verified successfully",
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Resend verification email
 * POST /auth/resend-verification
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body

    const result = await authService.resendVerificationEmail(email)

    successResponse(res, null, result.message)
  } catch (error) {
    next(error)
  }
}

/**
 * Refresh access token
 * POST /auth/refresh-token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body

    const tokens = await authService.refreshToken(refreshToken)

    successResponse(res, { tokens }, "Token refreshed successfully")
  } catch (error) {
    next(error)
  }
}

/**
 * Logout from current device
 * POST /auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const result = await authService.logoutUser(req.user.id)

    successResponse(res, null, result.message)
  } catch (error) {
    next(error)
  }
}

/**
 * Logout from all devices
 * POST /auth/logout-all
 */
export const logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error("User information not found in request")
    }

    const result = await authService.logoutAllDevices(req.user.id)

    successResponse(res, null, result.message)
  } catch (error) {
    next(error)
  }
}

export default {
  register,
  login,
  verifyEmail,
  resendVerification,
  refreshToken,
  logout,
  logoutAll,
}
