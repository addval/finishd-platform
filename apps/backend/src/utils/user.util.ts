/**
 * User Utility Functions
 * Handles user-related database operations
 */

// Import models
import {
  Role as RoleModel,
  User as UserModel,
  UserPermission as UserPermissionModel,
} from "../models/index.js"
import type { Role, SafeUser, User, UserPermission } from "../types/index.js"
import logger from "./logger.js"

/**
 * Get user by where clause with optional associations
 * @param where - Where clause
 * @returns User with associations or null
 */
export const getUser = async (
  where: Record<string, unknown>,
): Promise<(User & { role?: Role; userPermission?: UserPermission }) | null> => {
  try {
    const user = await UserModel.findOne({
      where,
      include: [
        {
          model: RoleModel,
          as: "role",
          required: false,
          attributes: ["id", "name", "description"],
        },
        {
          model: UserPermissionModel,
          as: "userPermission",
          required: false,
        },
      ],
    })

    return user
  } catch (error) {
    logger.error("Error fetching user:", error)
    throw error
  }
}

/**
 * Get user by email
 * @param email - User email
 * @returns User with associations or null
 */
export const getUserByEmail = async (
  email: string,
): Promise<(User & { role?: Role; userPermission?: UserPermission }) | null> => {
  return getUser({ email: email.toLowerCase() })
}

/**
 * Get user by ID
 * @param id - User ID
 * @returns User with associations or null
 */
export const getUserById = async (
  id: string,
): Promise<(User & { role?: Role; userPermission?: UserPermission }) | null> => {
  return getUser({ id })
}

/**
 * Get user by username
 * @param username - Username
 * @returns User with associations or null
 */
export const getUserByUsername = async (
  username: string,
): Promise<(User & { role?: Role; userPermission?: UserPermission }) | null> => {
  return getUser({ username })
}

/**
 * Check if user exists by email
 * @param email - User email
 * @returns True if user exists, false otherwise
 */
export const userExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const count = await UserModel.count({
      where: { email: email.toLowerCase() },
    })

    return count > 0
  } catch (error) {
    logger.error("Error checking if user exists:", error)
    throw error
  }
}

/**
 * Check if user exists by username
 * @param username - Username
 * @returns True if user exists, false otherwise
 */
export const userExistsByUsername = async (username: string): Promise<boolean> => {
  try {
    const count = await UserModel.count({
      where: { username },
    })

    return count > 0
  } catch (error) {
    logger.error("Error checking if user exists:", error)
    throw error
  }
}

/**
 * Create a safe user object (remove sensitive fields)
 * @param user - User object
 * @returns Safe user object without sensitive fields
 */
export const createSafeUser = (user: User | null): SafeUser | null => {
  if (!user) return null

  const { dataValues } = user
  const safeUser = { ...dataValues }

  // Remove sensitive fields
  delete safeUser.passwordHash
  delete safeUser.emailVerificationCode
  delete safeUser.phoneVerificationCode
  delete safeUser.confirmationCode
  delete safeUser.passwordResetCode

  return safeUser
}

/**
 * Get multiple users with pagination
 * @param options - Query options (page, limit, where, order)
 * @returns Object with users and pagination info
 */
export const getUsers = async (options: {
  page?: number
  limit?: number
  where?: Record<string, unknown>
  order?: Array<[string, string]>
}): Promise<{ users: User[]; total: number; page: number; totalPages: number }> => {
  try {
    const page = options.page || 1
    const limit = options.limit || 10
    const offset = (page - 1) * limit

    const { count, rows } = await UserModel.findAndCountAll({
      where: options.where || {},
      include: [
        {
          model: RoleModel,
          as: "role",
          required: false,
          attributes: ["id", "name", "description"],
        },
      ],
      order: options.order || [["createdAt", "DESC"]],
      limit,
      offset,
    })

    return {
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    }
  } catch (error) {
    logger.error("Error fetching users:", error)
    throw error
  }
}
