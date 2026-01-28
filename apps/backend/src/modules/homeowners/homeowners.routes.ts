/**
 * Homeowners Routes
 * API endpoints for homeowner profile and property management
 */

import { Router } from "express"
import {
  getMyProfileHandler,
  createMyProfileHandler,
  updateMyProfileHandler,
  getPropertiesHandler,
  getPropertyHandler,
  createPropertyHandler,
  updatePropertyHandler,
  deletePropertyHandler,
} from "./homeowners.controller.js"
import { authMiddleware, requireUserType } from "../auth/auth.middleware.js"

const router = Router()

// All homeowner routes require authentication
router.use(authMiddleware)

// Profile routes
router.get("/me", getMyProfileHandler)
router.post("/me", createMyProfileHandler)
router.patch("/me", updateMyProfileHandler)

// Property routes (require homeowner user type)
router.get("/me/properties", requireUserType("homeowner"), getPropertiesHandler)
router.get("/me/properties/:id", requireUserType("homeowner"), getPropertyHandler)
router.post("/me/properties", requireUserType("homeowner"), createPropertyHandler)
router.patch("/me/properties/:id", requireUserType("homeowner"), updatePropertyHandler)
router.delete("/me/properties/:id", requireUserType("homeowner"), deletePropertyHandler)

export default router
