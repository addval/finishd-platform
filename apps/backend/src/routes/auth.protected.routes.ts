/**
 * Protected Authentication Routes
 * Defines all authentication-related API endpoints that require authentication
 */

import express from "express"
import * as authController from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"
import { validateBody } from "../middlewares/validation.middleware.js"
import { verifyEmailSchema } from "../validators/auth.validator.js"

const router = express.Router()

/**
 * @route   POST /logout
 * @desc    Logout from current device
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout)

/**
 * @route   POST /auth/verify-email
 * @desc    Verify email with OTP (requires authentication)
 * @access  Private
 */
router.post(
  "/verify-email",
  authenticate,
  validateBody(verifyEmailSchema),
  authController.verifyEmail,
)

/**
 * @route   POST /logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post("/logout-all", authenticate, authController.logoutAll)

export default router
