/**
 * Auth Routes
 * API endpoints for phone OTP authentication
 */

import { Router } from "express"
import {
  sendOtpHandler,
  verifyOtpHandler,
  setUserTypeHandler,
  refreshTokenHandler,
  logoutHandler,
} from "./auth.controller.js"
import { authMiddleware } from "./auth.middleware.js"

const router = Router()

/**
 * Public routes (no auth required)
 */

// POST /api/v1/auth/send-otp
// Send OTP to phone number
router.post("/send-otp", sendOtpHandler)

// POST /api/v1/auth/verify-otp
// Verify OTP and get tokens
router.post("/verify-otp", verifyOtpHandler)

// POST /api/v1/auth/refresh-token
// Refresh access token
router.post("/refresh-token", refreshTokenHandler)

/**
 * Protected routes (auth required)
 */

// POST /api/v1/auth/logout
// Logout user
router.post("/logout", authMiddleware, logoutHandler)

export default router
