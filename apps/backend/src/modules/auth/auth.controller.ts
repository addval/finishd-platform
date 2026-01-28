/**
 * Auth Controller
 * HTTP request handlers for phone OTP authentication
 */

import type { Request, Response, NextFunction } from "express"
import {
  sendOtp,
  verifyOtpAndAuthenticate,
  setUserType,
  refreshAccessToken,
  logoutUser,
} from "./auth.service.js"

/**
 * POST /api/v1/auth/send-otp
 * Send OTP to phone number
 */
export async function sendOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { phone } = req.body

    if (!phone) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Phone number is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await sendOtp(phone)

    if (!result.success) {
      const statusCode = result.retryAfterSeconds ? 429 : 400
      res.status(statusCode).json({
        success: false,
        data: result.retryAfterSeconds ? { retryAfterSeconds: result.retryAfterSeconds } : null,
        message: result.error,
        error: result.retryAfterSeconds ? "RATE_LIMITED" : "SEND_OTP_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { message: result.message },
      message: "OTP sent successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP and authenticate user
 */
export async function verifyOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { phone, otp } = req.body

    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Phone number and OTP are required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await verifyOtpAndAuthenticate(phone, otp)

    if (!result.success) {
      res.status(401).json({
        success: false,
        data: null,
        message: result.error,
        error: "VERIFY_OTP_FAILED",
      })
      return
    }

    // Sanitize user data (remove sensitive fields)
    const userData = {
      id: result.user?.id,
      phone: result.user?.phone,
      userType: result.user?.userType,
      languagePreference: result.user?.languagePreference,
      createdAt: result.user?.createdAt,
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        tokens: result.tokens,
        isNewUser: result.isNewUser,
      },
      message: result.isNewUser ? "Account created successfully" : "Login successful",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/v1/users/me
 * Update user type (during onboarding)
 */
export async function setUserTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const { userType } = req.body

    if (!userType || !["homeowner", "designer", "contractor"].includes(userType)) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Valid user type is required (homeowner, designer, or contractor)",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await setUserType(userId, userType)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "UPDATE_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: result.user?.id,
          phone: result.user?.phone,
          userType: result.user?.userType,
          languagePreference: result.user?.languagePreference,
        },
      },
      message: "User type updated successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/auth/refresh-token
 * Refresh access token using refresh token
 */
export async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Refresh token is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await refreshAccessToken(refreshToken)

    if (!result.success) {
      res.status(401).json({
        success: false,
        data: null,
        message: result.error,
        error: "REFRESH_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { tokens: result.tokens },
      message: "Tokens refreshed successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/auth/logout
 * Logout user (invalidate tokens)
 */
export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    await logoutUser(userId)

    res.status(200).json({
      success: true,
      data: null,
      message: "Logged out successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}
