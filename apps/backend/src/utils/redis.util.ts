/**
 * Redis Utility Functions
 * Handles Redis operations for session management and caching
 */

import redisClient from "../config/redis.js"
import logger from "./logger.js"

/**
 * Set refresh token in Redis
 * @param userId - User ID
 * @param deviceId - Device ID
 * @param token - Refresh token
 * @param expirySeconds - Expiry time in seconds (default: 7 days)
 */
export const setRefreshToken = async (
  userId: string,
  deviceId: string,
  token: string,
  expirySeconds: number = 7 * 24 * 60 * 60, // 7 days
): Promise<void> => {
  try {
    const key = `refresh_token:${userId}:${deviceId}`
    await redisClient.set(key, token, {
      EX: expirySeconds,
    })
    logger.debug(`Refresh token stored for user ${userId}, device ${deviceId}`)
  } catch (error) {
    logger.error("Error setting refresh token in Redis:", error)
    throw new Error("Failed to store refresh token")
  }
}

/**
 * Get refresh token from Redis
 * @param userId - User ID
 * @param deviceId - Device ID
 * @returns Refresh token or null
 */
export const getRefreshToken = async (userId: string, deviceId: string): Promise<string | null> => {
  try {
    const key = `refresh_token:${userId}:${deviceId}`
    const token = await redisClient.get(key)
    return token
  } catch (error) {
    logger.error("Error getting refresh token from Redis:", error)
    throw new Error("Failed to retrieve refresh token")
  }
}

/**
 * Delete refresh token from Redis
 * @param userId - User ID
 * @param deviceId - Device ID
 */
export const deleteRefreshToken = async (userId: string, deviceId: string): Promise<void> => {
  try {
    const key = `refresh_token:${userId}:${deviceId}`
    await redisClient.del(key)
    logger.debug(`Refresh token deleted for user ${userId}, device ${deviceId}`)
  } catch (error) {
    logger.error("Error deleting refresh token from Redis:", error)
    throw new Error("Failed to delete refresh token")
  }
}

/**
 * Delete all refresh tokens for a user
 * @param userId - User ID
 */
export const deleteAllUserTokens = async (userId: string): Promise<void> => {
  try {
    const pattern = `refresh_token:${userId}:*`
    const keys = await redisClient.keys(pattern)

    if (keys.length > 0) {
      await redisClient.del(keys)
      logger.debug(`Deleted ${keys.length} tokens for user ${userId}`)
    }
  } catch (error) {
    logger.error("Error deleting all user tokens from Redis:", error)
    throw new Error("Failed to delete all user tokens")
  }
}

/**
 * Check if refresh token exists and is valid
 * @param userId - User ID
 * @param deviceId - Device ID
 * @param token - Refresh token to validate
 * @returns True if token exists and matches, false otherwise
 */
export const validateRefreshToken = async (
  userId: string,
  deviceId: string,
  token: string,
): Promise<boolean> => {
  try {
    const storedToken = await getRefreshToken(userId, deviceId)
    return storedToken === token
  } catch (error) {
    logger.error("Error validating refresh token:", error)
    return false
  }
}

/**
 * Set rate limit counter in Redis
 * @param key - Rate limit key
 * @param windowSeconds - Time window in seconds
 * @returns Current count
 */
export const incrementRateLimit = async (key: string, windowSeconds: number): Promise<number> => {
  try {
    const count = await redisClient.incr(key)

    if (count === 1) {
      // First request, set expiry
      await redisClient.expire(key, windowSeconds)
    }

    return count
  } catch (error) {
    logger.error("Error incrementing rate limit:", error)
    throw new Error("Failed to check rate limit")
  }
}

/**
 * Get rate limit count
 * @param key - Rate limit key
 * @returns Current count or 0 if key doesn't exist
 */
export const getRateLimitCount = async (key: string): Promise<number> => {
  try {
    const count = await redisClient.get(key)
    return count ? Number.parseInt(count, 10) : 0
  } catch (error) {
    logger.error("Error getting rate limit count:", error)
    return 0
  }
}

/**
 * Set rate limit expiry
 * @param key - Rate limit key
 * @param seconds - Seconds until expiry
 */
export const setRateLimitExpiry = async (key: string, seconds: number): Promise<void> => {
  try {
    await redisClient.expire(key, seconds)
  } catch (error) {
    logger.error("Error setting rate limit expiry:", error)
  }
}

/**
 * Get TTL (time to live) for a key
 * @param key - Redis key
 * @returns TTL in seconds or -1 if key doesn't exist
 */
export const getKeyTTL = async (key: string): Promise<number> => {
  try {
    const ttl = await redisClient.ttl(key)
    return ttl
  } catch (error) {
    logger.error("Error getting key TTL:", error)
    return -1
  }
}

/**
 * Cache user data in Redis
 * @param userId - User ID
 * @param data - User data to cache
 * @param expirySeconds - Expiry time in seconds (default: 1 hour)
 */
export const cacheUserData = async (
  userId: string,
  data: Record<string, unknown>,
  expirySeconds: number = 60 * 60, // 1 hour
): Promise<void> => {
  try {
    const key = `user:${userId}`
    await redisClient.set(key, JSON.stringify(data), {
      EX: expirySeconds,
    })
    logger.debug(`User data cached for user ${userId}`)
  } catch (error) {
    logger.error("Error caching user data:", error)
    // Don't throw - caching is optional
  }
}

/**
 * Get cached user data from Redis
 * @param userId - User ID
 * @returns Cached user data or null
 */
export const getCachedUserData = async (
  userId: string,
): Promise<Record<string, unknown> | null> => {
  try {
    const key = `user:${userId}`
    const data = await redisClient.get(key)

    if (data) {
      return JSON.parse(data)
    }

    return null
  } catch (error) {
    logger.error("Error getting cached user data:", error)
    return null
  }
}

/**
 * Delete cached user data
 * @param userId - User ID
 */
export const deleteCachedUserData = async (userId: string): Promise<void> => {
  try {
    const key = `user:${userId}`
    await redisClient.del(key)
    logger.debug(`User data cache cleared for user ${userId}`)
  } catch (error) {
    logger.error("Error deleting cached user data:", error)
    // Don't throw - caching is optional
  }
}

/**
 * Check if Redis is connected and available
 * @returns True if Redis is ready, false otherwise
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    await redisClient.ping()
    return true
  } catch (_error) {
    logger.warn("Redis is not available")
    return false
  }
}
