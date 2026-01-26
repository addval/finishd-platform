/**
 * Public Authentication Routes
 * Defines all authentication-related API endpoints that do NOT require authentication
 */

import express from "express"
import * as authController from "../controllers/auth.controller.js"
import {
  authRateLimitMiddleware,
  loginRateLimitMiddleware,
} from "../middlewares/rateLimit.middleware.js"
import { validateBody } from "../middlewares/validation.middleware.js"
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendVerificationSchema,
} from "../validators/auth.validator.js"

const router = express.Router()

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authRateLimitMiddleware,
  validateBody(registerSchema),
  authController.register,
)

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginRateLimitMiddleware, validateBody(loginSchema), authController.login)

/**
 * @route   POST /auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  "/resend-verification",
  authRateLimitMiddleware,
  validateBody(resendVerificationSchema),
  authController.resendVerification,
)

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh-token", validateBody(refreshTokenSchema), authController.refreshToken)

export default router
