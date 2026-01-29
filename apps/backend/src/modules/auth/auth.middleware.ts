/**
 * Auth Middleware
 * JWT authentication middleware for protected routes
 */

import type { Request, Response, NextFunction } from "express"
import { verifyAccessToken, getUserById } from "./auth.service.js"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        phone: string
        userType: "homeowner" | "designer" | "contractor" | null
      }
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authorization header is required",
        error: "UNAUTHORIZED",
      })
      return
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        data: null,
        message: "Invalid authorization header format. Use: Bearer <token>",
        error: "UNAUTHORIZED",
      })
      return
    }

    const token = parts[1]

    // Verify token
    const verification = verifyAccessToken(token)

    if (!verification.valid || !verification.payload) {
      res.status(401).json({
        success: false,
        data: null,
        message: verification.error || "Invalid token",
        error: "UNAUTHORIZED",
      })
      return
    }

    // Check if user still exists and is active
    const user = await getUserById(verification.payload.userId)

    if (!user) {
      res.status(401).json({
        success: false,
        data: null,
        message: "User not found",
        error: "UNAUTHORIZED",
      })
      return
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        data: null,
        message: "Account is inactive",
        error: "FORBIDDEN",
      })
      return
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      phone: user.phone,
      userType: user.userType,
    }

    next()
  } catch (error) {
    console.error("[Auth Middleware] Error:", error)
    res.status(500).json({
      success: false,
      data: null,
      message: "Authentication error",
      error: "INTERNAL_ERROR",
    })
  }
}

/**
 * Optional auth middleware
 * Attaches user to request if token is present, but doesn't require auth
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      next()
      return
    }

    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      next()
      return
    }

    const token = parts[1]
    const verification = verifyAccessToken(token)

    if (verification.valid && verification.payload) {
      const user = await getUserById(verification.payload.userId)

      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          phone: user.phone,
          userType: user.userType,
        }
      }
    }

    next()
  } catch (error) {
    // Silent failure for optional auth
    next()
  }
}

/**
 * Require specific user type middleware
 * Must be used after authMiddleware
 */
export function requireUserType(...allowedTypes: Array<"homeowner" | "designer" | "contractor">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    if (!req.user.userType) {
      res.status(403).json({
        success: false,
        data: null,
        message: "Please complete onboarding to access this resource",
        error: "ONBOARDING_REQUIRED",
      })
      return
    }

    if (!allowedTypes.includes(req.user.userType)) {
      res.status(403).json({
        success: false,
        data: null,
        message: `This resource is only available for ${allowedTypes.join(" or ")} users`,
        error: "FORBIDDEN",
      })
      return
    }

    next()
  }
}

/**
 * Require onboarding complete middleware
 * Checks that user has set their user type
 */
export function requireOnboarding(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      data: null,
      message: "Authentication required",
      error: "UNAUTHORIZED",
    })
    return
  }

  if (!req.user.userType) {
    res.status(403).json({
      success: false,
      data: null,
      message: "Please complete onboarding first",
      error: "ONBOARDING_REQUIRED",
    })
    return
  }

  next()
}
