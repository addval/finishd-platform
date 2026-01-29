/**
 * Auth Service Tests
 * Unit tests for phone OTP authentication
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock dependencies before importing the module
vi.mock("../../db/index.js", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    onConflictDoNothing: vi.fn().mockReturnThis(),
  },
  users: {},
}))

vi.mock("./otp.service.js", () => ({
  generateOtp: vi.fn().mockResolvedValue("123456"),
  storeOtp: vi.fn().mockResolvedValue(undefined),
  verifyOtp: vi.fn(),
  deleteOtp: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("./sms.service.js", () => ({
  sendSms: vi.fn().mockResolvedValue({ success: true }),
  validateIndianPhone: vi.fn().mockReturnValue(true),
}))

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock-token"),
    verify: vi.fn().mockReturnValue({ userId: "test-user-id" }),
  },
}))

// Import after mocking
import * as otpService from "./otp.service.js"
import * as smsService from "./sms.service.js"
import { sendOtp, verifyOtpAndAuthenticate } from "./auth.service.js"
import { db } from "../../db/index.js"

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("sendOtp", () => {
    it("should send OTP successfully for valid phone number", async () => {
      const result = await sendOtp("9876543210")

      expect(result.success).toBe(true)
      expect(result.message).toContain("OTP sent")
      expect(otpService.generateOtp).toHaveBeenCalled()
      expect(otpService.storeOtp).toHaveBeenCalledWith("9876543210", "123456")
      expect(smsService.sendSms).toHaveBeenCalled()
    })

    it("should reject invalid phone numbers", async () => {
      vi.mocked(smsService.validateIndianPhone).mockReturnValueOnce(false)

      const result = await sendOtp("123")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Invalid")
    })
  })

  describe("verifyOtpAndAuthenticate", () => {
    it("should authenticate existing user with valid OTP", async () => {
      const mockUser = {
        id: "user-123",
        phone: "9876543210",
        userType: "homeowner",
        languagePreference: "en",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(otpService.verifyOtp).mockResolvedValueOnce({ valid: true })
      vi.mocked(db.select().from({}).where({}).limit(1)).mockResolvedValueOnce([mockUser])

      const result = await verifyOtpAndAuthenticate("9876543210", "123456")

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.tokens).toBeDefined()
      expect(result.isNewUser).toBe(false)
    })

    it("should create new user if not exists", async () => {
      const mockNewUser = {
        id: "new-user-123",
        phone: "9876543210",
        userType: null,
        languagePreference: "en",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(otpService.verifyOtp).mockResolvedValueOnce({ valid: true })
      // First call returns empty (user not found)
      vi.mocked(db.select().from({}).where({}).limit(1)).mockResolvedValueOnce([])
      // After insert, return the new user
      vi.mocked(db.insert({}).values({}).returning()).mockResolvedValueOnce([mockNewUser])

      const result = await verifyOtpAndAuthenticate("9876543210", "123456")

      expect(result.success).toBe(true)
      expect(result.isNewUser).toBe(true)
    })

    it("should reject invalid OTP", async () => {
      vi.mocked(otpService.verifyOtp).mockResolvedValueOnce({
        valid: false,
        error: "Invalid OTP",
      })

      const result = await verifyOtpAndAuthenticate("9876543210", "000000")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Invalid")
    })

    it("should handle rate limiting errors", async () => {
      vi.mocked(otpService.verifyOtp).mockResolvedValueOnce({
        valid: false,
        error: "Too many attempts",
      })

      const result = await verifyOtpAndAuthenticate("9876543210", "123456")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Too many")
    })
  })
})
