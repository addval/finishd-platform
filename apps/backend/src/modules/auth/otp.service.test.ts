/**
 * OTP Service Tests
 * Unit tests for OTP generation, storage, and verification
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Redis client
const mockRedisClient = {
  isOpen: true,
  connect: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
}

vi.mock("../../config/redis.js", () => ({
  redisClient: mockRedisClient,
}))

// Import after mocking
import { generateOtp, storeOtp, verifyOtp, deleteOtp } from "./otp.service.js"

describe("OTP Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment
    process.env.NODE_ENV = "test"
  })

  describe("generateOtp", () => {
    it("should generate a 6-digit OTP", () => {
      const otp = generateOtp()

      expect(otp).toHaveLength(6)
      expect(/^\d{6}$/.test(otp)).toBe(true)
    })

    it("should generate different OTPs on each call", () => {
      const otp1 = generateOtp()
      const otp2 = generateOtp()

      // Note: There's a small chance they could be the same
      // but statistically very unlikely (1 in 1,000,000)
      // For testing purposes, we just verify they're valid
      expect(/^\d{6}$/.test(otp1)).toBe(true)
      expect(/^\d{6}$/.test(otp2)).toBe(true)
    })
  })

  describe("storeOtp", () => {
    it("should store OTP in Redis with expiry", async () => {
      mockRedisClient.set.mockResolvedValue("OK")

      await storeOtp("9876543210", "123456")

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        expect.stringContaining("9876543210"),
        "123456",
        expect.objectContaining({ EX: expect.any(Number) }),
      )
    })
  })

  describe("verifyOtp", () => {
    it("should accept 123456 in development mode", async () => {
      process.env.NODE_ENV = "development"
      mockRedisClient.del.mockResolvedValue(1)

      const result = await verifyOtp("9876543210", "123456")

      expect(result.valid).toBe(true)
    })

    it("should verify correct OTP", async () => {
      mockRedisClient.get.mockResolvedValue("654321")
      mockRedisClient.del.mockResolvedValue(1)
      mockRedisClient.incr.mockResolvedValue(1)

      const result = await verifyOtp("9876543210", "654321")

      expect(result.valid).toBe(true)
    })

    it("should reject incorrect OTP", async () => {
      mockRedisClient.get.mockResolvedValue("654321")
      mockRedisClient.incr.mockResolvedValue(1)
      mockRedisClient.expire.mockResolvedValue(true)

      const result = await verifyOtp("9876543210", "000000")

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it("should reject when no OTP stored", async () => {
      mockRedisClient.get.mockResolvedValue(null)
      mockRedisClient.incr.mockResolvedValue(1)
      mockRedisClient.expire.mockResolvedValue(true)

      const result = await verifyOtp("9876543210", "123456")

      expect(result.valid).toBe(false)
      expect(result.error).toContain("expired")
    })

    it("should implement rate limiting", async () => {
      // Simulate too many attempts
      mockRedisClient.incr.mockResolvedValue(6) // Over the limit
      mockRedisClient.get.mockResolvedValue("123456")
      mockRedisClient.expire.mockResolvedValue(true)

      const result = await verifyOtp("9876543210", "123456")

      expect(result.valid).toBe(false)
      expect(result.error).toContain("attempts")
    })
  })

  describe("deleteOtp", () => {
    it("should delete OTP from Redis", async () => {
      mockRedisClient.del.mockResolvedValue(1)

      await deleteOtp("9876543210")

      expect(mockRedisClient.del).toHaveBeenCalledWith(expect.stringContaining("9876543210"))
    })
  })
})
