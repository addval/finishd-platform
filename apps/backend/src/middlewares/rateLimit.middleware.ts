/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request frequency using Redis
 */

import type { NextFunction, Request, Response } from "express"
import { RateLimiterRedis } from "rate-limiter-flexible"
import type { RateLimitError } from "../types/index.js"
import { AppError } from "../utils/errors.js"
import logger from "../utils/logger.js"
import { isRedisAvailable } from "../utils/redis.util.js"

// Get rate limit configuration from environment
const RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10) // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10)

/**
 * General rate limiter
 * Limits overall API requests (100 requests per 15 minutes)
 */
export const generalRateLimiter = new RateLimiterRedis({
  storeClient: () => import("../config/redis.js").then(m => m.redisClient),
  keyPrefix: "general_limit",
  points: RATE_LIMIT_MAX_REQUESTS,
  duration: Math.floor(RATE_LIMIT_WINDOW_MS / 1000), // Convert to seconds
})

/**
 * Authentication rate limiter
 * Stricter limits for auth endpoints (5 requests per 15 minutes)
 */
export const authRateLimiter = new RateLimiterRedis({
  storeClient: () => import("../config/redis.js").then(m => m.redisClient),
  keyPrefix: "auth_limit",
  points: 5,
  duration: 900, // 15 minutes
})

/**
 * Login rate limiter
 * Very strict limits for login endpoint (3 requests per 15 minutes)
 */
export const loginRateLimiter = new RateLimiterRedis({
  storeClient: () => import("../config/redis.js").then(m => m.redisClient),
  keyPrefix: "login_limit",
  points: 3,
  duration: 900, // 15 minutes
})

/**
 * Rate limiting middleware factory
 * @param rateLimiter - Rate limiter instance
 * @param keyGenerator - Optional custom key generator function
 * @returns Middleware function
 */
const createRateLimitMiddleware = (
  rateLimiter: RateLimiterRedis,
  keyGenerator?: (req: Request) => string,
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if Redis is available
      const redisAvailable = await isRedisAvailable()

      if (!redisAvailable) {
        // Redis is not available, skip rate limiting
        logger.warn("Redis is not available, skipping rate limiting")
        return next()
      }

      // Generate key for rate limiting
      const key = keyGenerator ? keyGenerator(req) : `${req.ip}_${req.path}`

      // Consume one point
      await rateLimiter.consume(key)

      next()
    } catch (rejRes: unknown) {
      const rateLimitError = rejRes as RateLimitError

      // Calculate retry-after time in seconds
      const retryAfter = rateLimitError.msBeforeNext
        ? Math.ceil(rateLimitError.msBeforeNext / 1000)
        : 60

      res.set("Retry-After", retryAfter.toString())

      throw new AppError(`Too many requests. Please try again in ${retryAfter} seconds.`, 429)
    }
  }
}

/**
 * General rate limiting middleware
 * Applied to most API endpoints
 */
export const rateLimitMiddleware = createRateLimitMiddleware(generalRateLimiter)

/**
 * Authentication rate limiting middleware
 * Applied to authentication endpoints
 */
export const authRateLimitMiddleware = createRateLimitMiddleware(
  authRateLimiter,
  req => `auth_${req.ip}`,
)

/**
 * Login rate limiting middleware
 * Applied to login endpoint
 */
export const loginRateLimitMiddleware = createRateLimitMiddleware(
  loginRateLimiter,
  req => `login_${req.ip}`,
)

/**
 * User-specific rate limiting middleware
 * Limits requests per user (requires authentication)
 * @param points - Number of requests allowed
 * @param duration - Duration in seconds
 * @returns Middleware function
 */
export const createUserRateLimitMiddleware = (points: number, duration: number) => {
  const userRateLimiter = new RateLimiterRedis({
    storeClient: () => import("../config/redis.js").then(m => m.redisClient),
    keyPrefix: "user_limit",
    points,
    duration,
  })

  return createRateLimitMiddleware(userRateLimiter, req => {
    // Use user ID if authenticated, otherwise use IP
    const userId = req.user?.id as string | undefined
    return userId || req.ip || "unknown"
  })
}

/**
 * IP-based rate limiting middleware
 * Limits requests based on IP address only
 * @param points - Number of requests allowed
 * @param duration - Duration in seconds
 * @returns Middleware function
 */
export const createIPRateLimitMiddleware = (points: number, duration: number) => {
  const ipRateLimiter = new RateLimiterRedis({
    storeClient: () => import("../config/redis.js").then(m => m.redisClient),
    keyPrefix: "ip_limit",
    points,
    duration,
  })

  return createRateLimitMiddleware(ipRateLimiter, req => req.ip || "unknown")
}
