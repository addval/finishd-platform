/**
 * OTP Utility Functions
 * Handles One-Time Password generation, hashing, and validation
 */

import bcrypt from "bcrypt"
import logger from "./logger.js"

/**
 * Generate a 6-digit numeric verification code
 * @returns 6-digit verification code as string
 */
export const generateVerificationCode = (): string => {
  const min = 100000
  const max = 999999
  const code = Math.floor(Math.random() * (max - min + 1) + min)
  return code.toString().padStart(6, "0")
}

/**
 * Hash OTP code using bcrypt
 * @param code - Plain text OTP code
 * @returns Hashed OTP code
 */
export const hashOTP = async (code: string): Promise<string> => {
  try {
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedCode = await bcrypt.hash(code, salt)
    return hashedCode
  } catch (error) {
    logger.error("Error hashing OTP:", error)
    throw new Error("Failed to hash OTP code")
  }
}

/**
 * Verify OTP code against hash
 * @param code - Plain text OTP code
 * @param hash - Hashed OTP code
 * @returns True if code matches, false otherwise
 */
export const verifyOTP = async (code: string, hash: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(code, hash)
    return isMatch
  } catch (error) {
    logger.error("Error verifying OTP:", error)
    throw new Error("Failed to verify OTP code")
  }
}

/**
 * Check if verification code has expired
 * @param expiresAt - Expiration date
 * @returns True if expired, false otherwise
 */
export const isCodeExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) {
    return true
  }
  return new Date() > expiresAt
}

/**
 * Get verification code expiry time
 * @param minutes - Minutes until expiry (default: 60)
 * @returns Expiry date
 */
export const getCodeExpiry = (minutes: number = 60): Date => {
  const now = new Date()
  const expiry = new Date(now.getTime() + minutes * 60 * 1000)
  return expiry
}

/**
 * Generate verification code with expiry
 * @param minutes - Minutes until expiry (default: 60 for email verification)
 * @returns Object with code and expiry date
 */
export const generateVerificationCodeWithExpiry = (minutes: number = 60) => {
  const code = generateVerificationCode()
  const expiresAt = getCodeExpiry(minutes)

  return {
    code,
    expiresAt,
  }
}
