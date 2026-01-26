/**
 * Authentication Middleware
 * Handles JWT authentication and authorization
 */

import type { NextFunction, Request, Response } from "express"
import type { SafeUser } from "../types/index.js"
import { AppError } from "../utils/errors.js"
import type { TokenPayload } from "../utils/token.util.js"
import { extractTokenFromHeader, verifyAccessToken } from "../utils/token.util.js"
import { getUserById } from "../utils/user.util.js"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization)

    if (!token) {
      throw new AppError("No authentication token provided", 401)
    }

    // Verify token
    let decoded: TokenPayload
    try {
      decoded = verifyAccessToken(token)
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 401)
      }
      throw new AppError("Invalid authentication token", 401)
    }

    // Get user from database
    const user = await getUserById(decoded.userId)

    if (!user) {
      throw new AppError("User not found", 401)
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new AppError("Account is not active", 403)
    }

    // Attach user to request
    req.user = user

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)

    if (token) {
      const decoded = verifyAccessToken(token)
      const user = await getUserById(decoded.userId)

      if (user && user.status === "active") {
        req.user = user
      }
    }

    next()
  } catch (_error) {
    // Don't throw error - this is optional auth
    next()
  }
}

/**
 * Require verified email middleware
 * Ensures user has verified their email address
 */
export const requireVerifiedEmail = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401)
    }

    if (!req.user.emailVerified) {
      throw new AppError("Email verification required. Please verify your email address.", 403)
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Role-based authorization middleware factory
 * @param roles - Allowed roles
 * @returns Middleware function
 */
export const authorize =
  (...roles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401)
      }

      if (!req.user.role) {
        throw new AppError("User role not found", 403)
      }

      const userRoleName = req.user.role.name

      if (!roles.includes(userRoleName)) {
        throw new AppError("You do not have permission to access this resource", 403)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

/**
 * Admin only middleware
 * Shortcut for authorize('admin')
 */
export const adminOnly = authorize("admin")
