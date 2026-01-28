/**
 * Homeowners Controller
 * HTTP request handlers for homeowner profile and property management
 */

import type { Request, Response, NextFunction } from "express"
import {
  getHomeownerProfile,
  createHomeownerProfile,
  updateHomeownerProfile,
  getHomeownerProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "./homeowners.service.js"

// ============================================================================
// PROFILE HANDLERS
// ============================================================================

/**
 * GET /api/v1/homeowners/me
 * Get current homeowner's profile
 */
export async function getMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const profile = await getHomeownerProfile(userId)

    if (!profile) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Profile not found. Please complete onboarding.",
        error: "NOT_FOUND",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { profile },
      message: "Profile retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/homeowners/me
 * Create homeowner profile (onboarding)
 */
export async function createMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const { name, email, city, locality, profilePictureUrl } = req.body

    if (!name) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Name is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await createHomeownerProfile(userId, {
      name,
      email,
      city,
      locality,
      profilePictureUrl,
    })

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "CREATE_FAILED",
      })
      return
    }

    res.status(201).json({
      success: true,
      data: { profile: result.profile },
      message: "Profile created successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/v1/homeowners/me
 * Update homeowner profile
 */
export async function updateMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const { name, email, city, locality, profilePictureUrl } = req.body

    const result = await updateHomeownerProfile(userId, {
      name,
      email,
      city,
      locality,
      profilePictureUrl,
    })

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "UPDATE_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { profile: result.profile },
      message: "Profile updated successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

// ============================================================================
// PROPERTY HANDLERS
// ============================================================================

/**
 * GET /api/v1/homeowners/me/properties
 * Get all properties for current homeowner
 */
export async function getPropertiesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    // Get homeowner profile first
    const profile = await getHomeownerProfile(userId)

    if (!profile) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Please complete onboarding first",
        error: "PROFILE_NOT_FOUND",
      })
      return
    }

    const propertyList = await getHomeownerProperties(profile.id)

    res.status(200).json({
      success: true,
      data: { properties: propertyList },
      message: "Properties retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/homeowners/me/properties/:id
 * Get single property by ID
 */
export async function getPropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId
    const { id: propertyId } = req.params

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const profile = await getHomeownerProfile(userId)

    if (!profile) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Please complete onboarding first",
        error: "PROFILE_NOT_FOUND",
      })
      return
    }

    const property = await getPropertyById(propertyId, profile.id)

    if (!property) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Property not found",
        error: "NOT_FOUND",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { property },
      message: "Property retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/homeowners/me/properties
 * Create new property
 */
export async function createPropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const profile = await getHomeownerProfile(userId)

    if (!profile) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Please complete onboarding first",
        error: "PROFILE_NOT_FOUND",
      })
      return
    }

    const { type, address, city, locality, sizeSqft, rooms } = req.body

    if (!type || !["apartment", "house", "villa"].includes(type)) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Valid property type is required (apartment, house, or villa)",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await createProperty(profile.id, {
      type,
      address,
      city,
      locality,
      sizeSqft,
      rooms,
    })

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "CREATE_FAILED",
      })
      return
    }

    res.status(201).json({
      success: true,
      data: { property: result.property },
      message: "Property created successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/v1/homeowners/me/properties/:id
 * Update property
 */
export async function updatePropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId
    const { id: propertyId } = req.params

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const profile = await getHomeownerProfile(userId)

    if (!profile) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Please complete onboarding first",
        error: "PROFILE_NOT_FOUND",
      })
      return
    }

    const { type, address, city, locality, sizeSqft, rooms } = req.body

    if (type && !["apartment", "house", "villa"].includes(type)) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Invalid property type. Must be: apartment, house, or villa",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await updateProperty(propertyId, profile.id, {
      type,
      address,
      city,
      locality,
      sizeSqft,
      rooms,
    })

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "UPDATE_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { property: result.property },
      message: "Property updated successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/v1/homeowners/me/properties/:id
 * Delete property
 */
export async function deletePropertyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId
    const { id: propertyId } = req.params

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const profile = await getHomeownerProfile(userId)

    if (!profile) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Please complete onboarding first",
        error: "PROFILE_NOT_FOUND",
      })
      return
    }

    const result = await deleteProperty(propertyId, profile.id)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "DELETE_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Property deleted successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}
