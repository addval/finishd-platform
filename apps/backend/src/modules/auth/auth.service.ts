/**
 * Auth Service
 * Handles phone OTP authentication flow for Finishd platform
 */

import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { db, users, type User, type NewUser } from "../../db/index.js"
import { generateOtp, storeOtp, verifyOtp, canSendOtp, deleteOtp } from "./otp.service.js"
import { sendOtpSms, validatePhoneNumber } from "./sms.service.js"

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "finishd-jwt-secret-dev"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "finishd-refresh-secret-dev"
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m"
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d"

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResult {
  success: boolean
  user?: User
  tokens?: TokenPair
  isNewUser?: boolean
  error?: string
}

export interface SendOtpResult {
  success: boolean
  message?: string
  error?: string
  retryAfterSeconds?: number
}

export interface VerifyOtpResult {
  success: boolean
  user?: User
  tokens?: TokenPair
  isNewUser?: boolean
  error?: string
}

/**
 * Send OTP to phone number
 * Creates or retrieves user after verification
 */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  // Validate phone number
  const validation = validatePhoneNumber(phone)
  if (!validation.valid || !validation.normalized) {
    return { success: false, error: validation.error }
  }

  const normalizedPhone = validation.normalized

  // Check rate limiting
  const rateLimit = await canSendOtp(normalizedPhone)
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Please wait before requesting another OTP`,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    }
  }

  // Generate and store OTP
  const otp = generateOtp()
  await storeOtp(normalizedPhone, otp)

  // Send SMS
  const smsResult = await sendOtpSms(normalizedPhone, otp)
  if (!smsResult.success) {
    await deleteOtp(normalizedPhone)
    return { success: false, error: smsResult.error || "Failed to send OTP" }
  }

  return {
    success: true,
    message: `OTP sent to ${normalizedPhone.slice(0, 3)}******${normalizedPhone.slice(-2)}`,
  }
}

/**
 * Verify OTP and authenticate user
 * Creates new user if phone number is not registered
 */
export async function verifyOtpAndAuthenticate(
  phone: string,
  otp: string,
): Promise<VerifyOtpResult> {
  // Validate phone number
  const validation = validatePhoneNumber(phone)
  if (!validation.valid || !validation.normalized) {
    return { success: false, error: validation.error }
  }

  const normalizedPhone = validation.normalized

  // Verify OTP
  const otpResult = await verifyOtp(normalizedPhone, otp)
  if (!otpResult.valid) {
    return { success: false, error: otpResult.error }
  }

  // Check if user exists
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.phone, normalizedPhone))
    .limit(1)

  let user: User
  let isNewUser = false

  if (existingUsers.length > 0) {
    // Existing user - update last login
    user = existingUsers[0]
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, user.id))
  } else {
    // New user - create account
    const newUserData: NewUser = {
      phone: normalizedPhone,
      languagePreference: "en",
    }

    const insertedUsers = await db.insert(users).values(newUserData).returning()
    user = insertedUsers[0]
    isNewUser = true

    console.log(`[Auth] New user created: ${user.id}`)
  }

  // Generate tokens
  const tokens = generateTokens(user)

  return {
    success: true,
    user,
    tokens,
    isNewUser,
  }
}

/**
 * Set user type after OTP verification
 * Called during onboarding to set homeowner/designer/contractor
 */
export async function setUserType(
  userId: string,
  userType: "homeowner" | "designer" | "contractor",
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const updatedUsers = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    if (updatedUsers.length === 0) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user: updatedUsers[0] }
  } catch (error) {
    console.error("[Auth] Failed to set user type:", error)
    return { success: false, error: "Failed to update user type" }
  }
}

/**
 * Generate JWT token pair (access + refresh)
 */
export function generateTokens(user: User): TokenPair {
  const payload = {
    userId: user.id,
    phone: user.phone,
    userType: user.userType,
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  })

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  })

  return { accessToken, refreshToken }
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): {
  valid: boolean
  payload?: jwt.JwtPayload
  error?: string
} {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    return { valid: true, payload }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Token expired" }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid token" }
    }
    return { valid: false, error: "Token verification failed" }
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): {
  valid: boolean
  payload?: jwt.JwtPayload
  error?: string
} {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload
    return { valid: true, payload }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Refresh token expired" }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid refresh token" }
    }
    return { valid: false, error: "Token verification failed" }
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  success: boolean
  tokens?: TokenPair
  error?: string
}> {
  const verification = verifyRefreshToken(refreshToken)
  if (!verification.valid || !verification.payload) {
    return { success: false, error: verification.error }
  }

  // Get user from database to ensure they still exist and are active
  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.id, verification.payload.userId))
    .limit(1)

  if (userResults.length === 0) {
    return { success: false, error: "User not found" }
  }

  const user = userResults[0]

  if (!user.isActive) {
    return { success: false, error: "Account is inactive" }
  }

  // Generate new tokens
  const tokens = generateTokens(user)

  return { success: true, tokens }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const userResults = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  return userResults.length > 0 ? userResults[0] : null
}

/**
 * Logout user (invalidate tokens)
 * In a production system, you would blacklist the tokens in Redis
 */
export async function logoutUser(userId: string): Promise<{ success: boolean }> {
  // TODO: Add token blacklisting in Redis for proper logout
  console.log(`[Auth] User ${userId} logged out`)
  return { success: true }
}
