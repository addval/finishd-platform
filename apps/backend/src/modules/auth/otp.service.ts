/**
 * OTP Service
 * Handles OTP generation, storage, and verification using Redis
 */

import { createClient, type RedisClientType } from "redis"

// OTP Configuration
const OTP_LENGTH = Number.parseInt(process.env.OTP_LENGTH || "6", 10)
const OTP_EXPIRY_SECONDS = Number.parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10) * 60
const OTP_DEV_CODE = process.env.OTP_DEV_CODE || "123456"
const IS_DEV = process.env.NODE_ENV !== "production"

// Redis client
let redisClient: RedisClientType | null = null

/**
 * Initialize Redis connection for OTP storage
 */
export async function initOtpRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

  redisClient = createClient({ url: redisUrl })

  redisClient.on("error", (err) => {
    console.error("Redis OTP client error:", err)
  })

  redisClient.on("connect", () => {
    console.log("Redis OTP client connected")
  })

  await redisClient.connect()
}

/**
 * Get Redis client (initialize if needed)
 */
async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient || !redisClient.isOpen) {
    await initOtpRedis()
  }
  return redisClient as RedisClientType
}

/**
 * Generate a random numeric OTP
 */
export function generateOtp(): string {
  const digits = "0123456789"
  let otp = ""
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  return otp
}

/**
 * Store OTP in Redis with expiry
 * @param phone Phone number (E.164 format)
 * @param otp Generated OTP code
 */
export async function storeOtp(phone: string, otp: string): Promise<void> {
  const client = await getRedisClient()
  const key = `otp:${phone}`

  // Store OTP with expiry
  await client.setEx(key, OTP_EXPIRY_SECONDS, otp)

  // Track attempts (max 3 verification attempts)
  const attemptsKey = `otp_attempts:${phone}`
  await client.setEx(attemptsKey, OTP_EXPIRY_SECONDS, "0")

  console.log(`[OTP] Stored for ${phone}, expires in ${OTP_EXPIRY_SECONDS}s`)
}

/**
 * Verify OTP for a phone number
 * @param phone Phone number (E.164 format)
 * @param inputOtp OTP code entered by user
 * @returns true if OTP is valid, false otherwise
 */
export async function verifyOtp(phone: string, inputOtp: string): Promise<{
  valid: boolean
  error?: string
}> {
  // In development, always accept the dev code
  if (IS_DEV && inputOtp === OTP_DEV_CODE) {
    console.log(`[OTP] Dev code accepted for ${phone}`)
    await deleteOtp(phone)
    return { valid: true }
  }

  const client = await getRedisClient()
  const key = `otp:${phone}`
  const attemptsKey = `otp_attempts:${phone}`

  // Check attempts
  const attemptsStr = await client.get(attemptsKey)
  const attempts = Number.parseInt(attemptsStr || "0", 10)

  if (attempts >= 3) {
    await deleteOtp(phone)
    return { valid: false, error: "Too many attempts. Please request a new OTP." }
  }

  // Get stored OTP
  const storedOtp = await client.get(key)

  if (!storedOtp) {
    return { valid: false, error: "OTP expired or not found. Please request a new OTP." }
  }

  // Verify OTP
  if (storedOtp === inputOtp) {
    await deleteOtp(phone)
    console.log(`[OTP] Verified successfully for ${phone}`)
    return { valid: true }
  }

  // Increment attempts on failure
  await client.incr(attemptsKey)
  console.log(`[OTP] Verification failed for ${phone}, attempt ${attempts + 1}`)

  return { valid: false, error: "Invalid OTP. Please try again." }
}

/**
 * Delete OTP and attempts from Redis
 */
export async function deleteOtp(phone: string): Promise<void> {
  const client = await getRedisClient()
  const key = `otp:${phone}`
  const attemptsKey = `otp_attempts:${phone}`

  await client.del(key)
  await client.del(attemptsKey)
}

/**
 * Check if OTP was recently sent (rate limiting)
 * @param phone Phone number
 * @returns true if OTP can be sent, false if rate limited
 */
export async function canSendOtp(phone: string): Promise<{
  allowed: boolean
  retryAfterSeconds?: number
}> {
  const client = await getRedisClient()
  const cooldownKey = `otp_cooldown:${phone}`

  const ttl = await client.ttl(cooldownKey)

  if (ttl > 0) {
    return { allowed: false, retryAfterSeconds: ttl }
  }

  // Set 60-second cooldown between OTP requests
  await client.setEx(cooldownKey, 60, "1")

  return { allowed: true }
}

/**
 * Close Redis connection
 */
export async function closeOtpRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit()
    console.log("Redis OTP client closed")
  }
}
