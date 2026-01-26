/**
 * Cryptographic Utilities
 * Provides token encryption/decryption using AES-256-GCM
 */

import crypto from "node:crypto"

const ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY
const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 16

// Validate encryption key on startup
if (!ENCRYPTION_KEY) {
  throw new Error("JWT_ENCRYPTION_KEY environment variable is not set")
}

if (ENCRYPTION_KEY.length < 32) {
  throw new Error("JWT_ENCRYPTION_KEY must be at least 32 characters long")
}

// Type guard for error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Encrypt a JWT token using AES-256-GCM
 * @param token - Plain JWT token string
 * @returns Encrypted token in format: iv:salt:tag:encrypted
 */
export function encryptToken(token: string): string {
  try {
    // Generate random IV and salt
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)

    // Derive key from password + salt using PBKDF2
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256")

    // Encrypt the token
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(token, "utf8", "hex")
    encrypted += cipher.final("hex")

    // Get authentication tag
    const tag = cipher.getAuthTag()

    // Combine all components: iv:salt:tag:encrypted
    return `${iv.toString("hex")}:${salt.toString("hex")}:${tag.toString("hex")}:${encrypted}`
  } catch (error) {
    throw new Error(`Token encryption failed: ${getErrorMessage(error)}`)
  }
}

/**
 * Decrypt an encrypted JWT token
 * @param encryptedToken - Encrypted token in format: iv:salt:tag:encrypted
 * @returns Plain JWT token string
 * @throws Error if token format is invalid or decryption fails
 */
export function decryptToken(encryptedToken: string): string {
  try {
    // Split the token into components
    const parts = encryptedToken.split(":")
    if (parts.length !== 4) {
      throw new Error("Invalid token format")
    }

    const iv = Buffer.from(parts[0], "hex")
    const salt = Buffer.from(parts[1], "hex")
    const tag = Buffer.from(parts[2], "hex")
    const encrypted = parts[3]

    // Derive key from password + salt
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256")

    // Decrypt the token
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unsupported state")) {
      throw new Error("Invalid token format or corrupted token")
    }
    throw new Error(`Token decryption failed: ${getErrorMessage(error)}`)
  }
}
