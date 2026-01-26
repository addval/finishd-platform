/**
 * User Routes
 * Defines all user management API endpoints
 */

import express from "express"
import * as userController from "../controllers/user.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"
import { validateBody, validateParams } from "../middlewares/validation.middleware.js"
import {
  changePasswordSchema,
  createProfileSchema,
  updateProfileSchema,
  userPermissionSettingsSchema,
} from "../validators/auth.validator.js"

const router = express.Router()

// All routes are protected (authentication required)

/**
 * @route   GET /users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", authenticate, userController.getProfile)

/**
 * @route   POST /users/profile
 * @desc    Create user profile
 * @access  Private
 */
router.post(
  "/profile",
  authenticate,
  validateBody(createProfileSchema),
  userController.createProfile,
)

/**
 * @route   PUT /users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticate,
  validateBody(updateProfileSchema),
  userController.updateProfile,
)

/**
 * @route   PUT /users/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  "/password",
  authenticate,
  validateBody(changePasswordSchema),
  userController.changePassword,
)

/**
 * @route   GET /users/devices
 * @desc    Get all user devices
 * @access  Private
 */
router.get("/devices", authenticate, userController.getDevices)

/**
 * @route   DELETE /users/devices/:deviceId
 * @desc    Revoke a specific device (logout from that device)
 * @access  Private
 */
router.delete(
  "/devices/:deviceId",
  authenticate,
  validateParams(
    Joi.object({
      deviceId: Joi.string().uuid().required(),
    }),
  ),
  userController.revokeDevice,
)

/**
 * @route   DELETE /users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete("/account", authenticate, userController.deleteAccount)

/**
 * @route   POST /users/user-permission-settings
 * @desc    Create user permission settings (onboarding)
 * @access  Private
 */
router.post(
  "/user-permission-settings",
  authenticate,
  validateBody(userPermissionSettingsSchema),
  userController.createPermissionSettings,
)

/**
 * @route   PUT /users/user-permission-settings
 * @desc    Update user permission settings
 * @access  Private
 */
router.put(
  "/user-permission-settings",
  authenticate,
  validateBody(userPermissionSettingsSchema),
  userController.updatePermissionSettings,
)

export default router

// Import Joi for params validation
import Joi from "joi"
