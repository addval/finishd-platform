/**
 * Redis Configuration
 * Used for caching and session management
 */

import { createClient, type RedisClientType } from "redis"
import { logger } from "../utils/logger.js"

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  password: process.env.REDIS_PASSWORD || undefined,
}) as RedisClientType

redisClient.on("error", err => logger.error("Redis Client Error:", err))
redisClient.on("connect", () => logger.info("Redis Client Connected"))
redisClient.on("ready", () => logger.info("Redis Client Ready"))
redisClient.on("disconnect", () => logger.warn("Redis Client Disconnected"))

export const initRedis = async (): Promise<void> => {
  try {
    await redisClient.connect()
    logger.info("Redis initialized successfully")
  } catch (error) {
    logger.error("Failed to initialize Redis:", error)
    // Don't throw - Redis is optional
  }
}

export default redisClient
