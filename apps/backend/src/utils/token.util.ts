/**
 * Token Utility Functions
 * Handles JWT token generation and validation with encryption
 */

import jwt from "jsonwebtoken"
import { decryptToken, encryptToken } from "./crypto.util.js"
import logger from "./logger.js"

// Token payload interface
export interface TokenPayload {
  userId: string
  email: string
  roleId: string
}

// Token pair interface
export interface TokenPair {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}

/**
 * Generate JWT access token
 * @param payload - Token payload
 * @returns Encrypted access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const secret = process.env.JWT_ACCESS_SECRET
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined")
    }

    // Generate JWT token
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY ?? "15m",
    } as jwt.SignOptions)

    // Encrypt the token
    const encryptedToken = encryptToken(token)

    return encryptedToken
  } catch (error) {
    logger.error("Error generating access token:", error)
    throw new Error("Failed to generate access token")
  }
}

/**
 * Generate JWT refresh token
 * @param payload - Token payload
 * @returns Encrypted refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is not defined")
    }

    // Generate JWT token
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY ?? "7d",
    } as jwt.SignOptions)

    // Encrypt the token
    const encryptedToken = encryptToken(token)

    return encryptedToken
  } catch (error) {
    logger.error("Error generating refresh token:", error)
    throw new Error("Failed to generate refresh token")
  }
}

/**
 * Generate both access and refresh tokens
 * @param userId - User ID
 * @param email - User email
 * @param roleId - User role ID
 * @returns Token pair with expiry dates
 */
export const generateTokenPair = (userId: string, email: string, roleId: string): TokenPair => {
  const payload: TokenPayload = {
    userId,
    email,
    roleId,
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Calculate expiry dates
  const accessExpiryMs = getExpiryMs(process.env.JWT_ACCESS_EXPIRY || "15m")
  const refreshExpiryMs = getExpiryMs(process.env.JWT_REFRESH_EXPIRY || "7d")

  const now = Date.now()
  const accessTokenExpiresAt = new Date(now + accessExpiryMs)
  const refreshTokenExpiresAt = new Date(now + refreshExpiryMs)

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  }
}

/**
 * Verify JWT access token
 * @param token - Encrypted access token
 * @returns Decoded token payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const secret = process.env.JWT_ACCESS_SECRET
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined")
    }

    // Decrypt the token
    const decryptedToken = decryptToken(token)

    // Verify the decrypted JWT
    const decoded = jwt.verify(decryptedToken, secret) as TokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token has expired")
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token")
    }
    logger.error("Error verifying access token:", error)
    throw new Error("Failed to verify access token")
  }
}

/**
 * Verify JWT refresh token
 * @param token - Encrypted refresh token
 * @returns Decoded token payload
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is not defined")
    }

    // Decrypt the token
    const decryptedToken = decryptToken(token)

    // Verify the decrypted JWT
    const decoded = jwt.verify(decryptedToken, secret) as TokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired")
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token")
    }
    logger.error("Error verifying refresh token:", error)
    throw new Error("Failed to verify refresh token")
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null
  }

  return parts[1]
}

/**
 * Convert expiry string to milliseconds
 * @param expiry - Expiry string (e.g., "15m", "7d", "1h")
 * @returns Milliseconds
 */
const getExpiryMs = (expiry: string): number => {
  const unit = expiry.slice(-1)
  const value = Number.parseInt(expiry.slice(0, -1), 10)

  switch (unit) {
    case "s":
      return value * 1000
    case "m":
      return value * 60 * 1000
    case "h":
      return value * 60 * 60 * 1000
    case "d":
      return value * 24 * 60 * 60 * 1000
    default:
      return 15 * 60 * 1000 // Default to 15 minutes
  }
}
