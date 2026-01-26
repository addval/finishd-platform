/**
 * Password Utility Functions
 * Handles password hashing, comparison, and validation
 */

import bcrypt from "bcrypt"
import logger from "./logger.js"

const SALT_ROUNDS = 12

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    logger.error("Error hashing password:", error)
    throw new Error("Failed to hash password")
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  } catch (error) {
    logger.error("Error comparing password:", error)
    throw new Error("Failed to compare password")
  }
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters long
 * - Contains both letters and numbers
 * - Optional: Special characters
 * @param password - Password to validate
 * @returns Object with isValid flag and message
 */
export const validatePasswordStrength = (
  password: string,
): { isValid: boolean; message?: string } => {
  // Check minimum length
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    }
  }

  // Check for letters
  const hasLetters = /[a-zA-Z]/.test(password)
  if (!hasLetters) {
    return {
      isValid: false,
      message: "Password must contain at least one letter",
    }
  }

  // Check for numbers
  const hasNumbers = /[0-9]/.test(password)
  if (!hasNumbers) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    }
  }

  return { isValid: true }
}
