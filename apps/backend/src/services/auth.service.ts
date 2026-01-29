/**
 * Authentication Service
 * Handles all authentication business logic
 */

import { Role, User, UserDevice } from "../models/index"
import type { SafeUser } from "../types/index.js"
import type { DeviceInfo } from "../utils/device.util.js"
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/email.util.js"
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors.js"
import logger from "../utils/logger.js"
import {
  generateVerificationCodeWithExpiry,
  hashOTP,
  isCodeExpired,
  verifyOTP,
} from "../utils/otp.util.js"
import { comparePassword, hashPassword, validatePasswordStrength } from "../utils/password.util.js"
import { generateTokenPair } from "../utils/token.util.js"
import { createSafeUser, getUserByEmail, userExistsByEmail } from "../utils/user.util.js"

// Service interfaces
export interface RegisterDto {
  email: string
  password: string
  name?: string
  timezone?: string
}

export interface RegisterWithDeviceDto extends RegisterDto {
  deviceInfo: DeviceInfo
}

export interface LoginDto {
  email: string
  password: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}

/**
 * Register a new user (without device tracking - internal use)
 * @param data - Registration data
 * @returns Created user (without sensitive data)
 */
export const registerUser = async (data: RegisterDto): Promise<SafeUser> => {
  const { email, password, name, timezone } = data

  try {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)

    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.message || "Password validation failed")
    }

    // Check if user already exists
    const userExists = await userExistsByEmail(email)

    if (userExists) {
      throw new ConflictError("A user with this email already exists")
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate email verification code
    const { code, expiresAt } = generateVerificationCodeWithExpiry(60) // 60 minutes

    const hashedCode = await hashOTP(code)

    // Get default user role
    const userRole = await Role.findOne({
      where: { name: "user" },
    })

    if (!userRole) {
      throw new Error("Default user role not found. Please ensure roles are seeded.")
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      timezone,
      roleId: userRole.id,
      emailVerified: false,
      emailVerificationCode: hashedCode,
      emailVerificationCodeExpiresAt: expiresAt,
      status: "active", // User is active but email not verified
    })

    // Send verification email
    await sendVerificationEmail({
      to: email,
      code,
      expiryMinutes: 60,
      type: "email",
    })

    logger.info(`New user registered: ${email}`)

    // Return user without sensitive data
    const safeUser = createSafeUser(user)
    if (!safeUser) {
      throw new ConflictError("Failed to create user object")
    }

    return safeUser
  } catch (error) {
    logger.error("Error in registerUser:", error)
    throw error
  }
}

/**
 * Register a new user with device tracking (for registration from controller)
 * @param data - Registration data with device info
 * @returns Created user (without sensitive data) and tokens
 */
export const registerUserWithDevice = async (
  data: RegisterWithDeviceDto,
): Promise<SafeUser & { tokens: TokenPair }> => {
  const { email, password, name, timezone, deviceInfo } = data

  try {
    // First register the user without device tracking
    const user = await registerUser({ email, password, name, timezone })

    // Generate tokens FIRST
    const tokens = generateTokenPair(user.id, user.email, user.roleId)

    // Validate IP address format - if invalid, set to null
    let ipAddress: string | null = null
    if (deviceInfo.ip && deviceInfo.ip !== "Unknown" && deviceInfo.ip !== "::1") {
      ipAddress = deviceInfo.ip
    }

    await UserDevice.create({
      userId: user.id,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      userAgent: deviceInfo.userAgent,
      ipAddress: ipAddress,
      deviceType: deviceInfo.deviceType,
      isActive: true,
      lastUsedAt: new Date(),
    })

    // Return user AND tokens
    return { ...user, tokens }
  } catch (error) {
    logger.error("Error in registerUserWithDevice:", error)
    throw error
  }
}

/**
 * Verify email with OTP
 * @param email - User email
 * @param code - Verification code
 * @returns Success message
 */
export const verifyEmail = async (email: string, code: string): Promise<{ message: string }> => {
  try {
    // Find user by email
    const user = await getUserByEmail(email)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new ConflictError("Email is already verified")
    }

    // Check if code has expired
    if (isCodeExpired(user.emailVerificationCodeExpiresAt)) {
      throw new ValidationError("Verification code has expired. Please request a new one.")
    }

    // Verify code
    const isCodeValid = await verifyOTP(code, user.emailVerificationCode || "")

    if (!isCodeValid) {
      throw new ValidationError("Invalid verification code")
    }

    // Update user as verified
    await user.update({
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationCode: null,
      emailVerificationCodeExpiresAt: null,
    })

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || user.email.split("@")[0])

    logger.info(`Email verified for user: ${email}`)

    return { message: "Email verified successfully" }
  } catch (error) {
    logger.error("Error in verifyEmail:", error)
    throw error
  }
}

/**
 * Verify email with OTP (authenticated version)
 * @param userId - User ID (from authenticated session)
 * @param code - Verification code
 * @returns Success message
 */
export const verifyEmailById = async (
  userId: string,
  code: string,
): Promise<{ message: string }> => {
  try {
    // Find user by ID
    const user = await getUserById(userId)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new ConflictError("Email is already verified")
    }

    // Check if code has expired
    if (isCodeExpired(user.emailVerificationCodeExpiresAt)) {
      throw new ValidationError("Verification code has expired. Please request a new one.")
    }

    // Verify code
    const isCodeValid = await verifyOTP(code, user.emailVerificationCode || "")

    if (!isCodeValid) {
      throw new ValidationError("Invalid verification code")
    }

    // Update user as verified
    await user.update({
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationCode: null,
      emailVerificationCodeExpiresAt: null,
    })

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || user.email.split("@")[0])

    logger.info(`Email verified for user: ${user.email} (authenticated)`)

    return { message: "Email verified successfully" }
  } catch (error) {
    logger.error("Error in verifyEmailById:", error)
    throw error
  }
}

/**
 * Login user
 * @param data - Login credentials
 * @param deviceInfo - Device information
 * @returns User data and tokens
 */
export const loginUser = async (
  data: LoginDto,
  deviceInfo: DeviceInfo,
): Promise<{ user: SafeUser; tokens: TokenPair }> => {
  const { email, password } = data

  try {
    // Find user by email
    const user = await getUserByEmail(email)

    if (!user) {
      throw new UnauthorizedError("Invalid email or password")
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new UnauthorizedError("Account is not active")
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password")
    }

    // If email not verified, generate and send new OTP
    if (!user.emailVerified) {
      const { code, expiresAt } = generateVerificationCodeWithExpiry(60)
      const hashedCode = await hashOTP(code)

      await user.update({
        emailVerificationCode: hashedCode,
        emailVerificationCodeExpiresAt: expiresAt,
      })

      // Send verification email (don't fail login if email fails)
      await sendVerificationEmail({
        to: user.email,
        code,
        expiryMinutes: 60,
        type: "email",
      }).catch(error => {
        logger.error(`Failed to send verification email to ${user.email}:`, error)
      })

      logger.info(`Generated new verification code for unverified user: ${email}`)
    }

    // Check if device already exists
    let existingDevice = await UserDevice.findOne({
      where: {
        userId: user.id,
      },
    })

    // Generate token pair FIRST (before device operations)
    const tokens = generateTokenPair(user.id, user.email, user.roleId)

    // Create or update device record with CORRECT fields
    if (existingDevice) {
      // Update existing device
      await existingDevice.update({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        lastUsedAt: new Date(),
      })
    } else {
      // Create new device record - matching registerUserWithDevice pattern
      existingDevice = await UserDevice.create({
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ip,
        deviceType: deviceInfo.deviceType,
        isActive: true,
        lastUsedAt: new Date(),
      })
    }

    // Update user's last login
    await user.update({ lastLoginAt: new Date() })

    logger.info(`User logged in: ${email}`)

    // Return user and tokens
    const safeUser = createSafeUser(user)
    if (!safeUser) {
      throw new ConflictError("Failed to create user object")
    }
    return {
      user: safeUser,
      tokens,
    }
  } catch (error) {
    logger.error("Error in loginUser:", error)
    throw error
  }
}

/**
 * Refresh access token
 * @param refreshToken - Refresh token
 * @returns New token pair
 */
export const refreshToken = async (refreshToken: string): Promise<TokenPair> => {
  try {
    const { verifyRefreshToken } = await import("../utils/token.util.js")

    // Verify the refresh token JWT
    const decoded = verifyRefreshToken(refreshToken)
    const { userId } = decoded

    // Get user from database
    const user = await getUserById(userId)

    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("User account is inactive")
    }

    // Generate new token pair
    const newTokens = generateTokenPair(user.id, user.email, user.roleId)

    // Update UserDevice record with new tokens
    const existingDevice = await UserDevice.findOne({
      where: { userId: user.id },
    })

    if (existingDevice) {
      await existingDevice.update({
        token: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        tokenExpiresAt: newTokens.accessTokenExpiresAt,
        refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt,
        lastUsedAt: new Date(),
      })
    }

    logger.info(`Token refreshed for user: ${user.email}`)

    return newTokens
  } catch (error) {
    logger.error("Error in refreshToken:", error)
    throw error
  }
}

/**
 * Logout user from current device
 * @param userId - User ID
 */
export const logoutUser = async (userId: string): Promise<{ message: string }> => {
  try {
    // Delete the UserDevice record
    await UserDevice.destroy({
      where: { userId },
    })

    logger.info(`User logged out: ${userId}`)

    return { message: "Logged out successfully" }
  } catch (error) {
    logger.error("Error in logoutUser:", error)
    throw error
  }
}

/**
 * Logout user from all devices
 * @param userId - User ID
 */
export const logoutAllDevices = async (userId: string): Promise<{ message: string }> => {
  try {
    // Delete the UserDevice record
    await UserDevice.destroy({
      where: { userId },
    })

    logger.info(`User logged out from all devices: ${userId}`)

    return { message: "Logged out from all devices successfully" }
  } catch (error) {
    logger.error("Error in logoutAllDevices:", error)
    throw error
  }
}

/**
 * Resend verification email
 * @param email - User email
 */
export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  try {
    // Find user by email
    const user = await getUserByEmail(email)

    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new ConflictError("Email is already verified")
    }

    // Generate new verification code
    const { code, expiresAt } = generateVerificationCodeWithExpiry(60) // 60 minutes
    const hashedCode = await hashOTP(code)

    // Update user with new code
    await user.update({
      emailVerificationCode: hashedCode,
      emailVerificationCodeExpiresAt: expiresAt,
    })

    // Send verification email
    await sendVerificationEmail({
      to: email,
      code,
      expiryMinutes: 60,
      type: "email",
    })

    logger.info(`Verification email resent to: ${email}`)

    return { message: "Verification email sent successfully" }
  } catch (error) {
    logger.error("Error in resendVerificationEmail:", error)
    throw error
  }
}

// Import getUserById at the end to avoid circular dependency
const getUserById = async (id: string) => {
  const { getUserById: fetchUserById } = await import("../utils/user.util.js")
  return fetchUserById(id)
}
