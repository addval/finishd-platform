/**
 * Contractors Controller
 * HTTP request handlers for contractor profile management
 */

import type { Request, Response, NextFunction } from "express"
import {
  getContractorProfileByUserId,
  getContractorById,
  createContractorProfile,
  updateContractorProfile,
  browseContractors,
  getContractorsByTrade,
} from "./contractors.service.js"

// ============================================================================
// PUBLIC HANDLERS
// ============================================================================

/**
 * GET /api/v1/contractors
 * Browse contractors with filters
 */
export async function browseContractorsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q: query, trades, city, page = "1", limit = "20" } = req.query

    const result = await browseContractors({
      query: query as string,
      trades: trades ? (trades as string).split(",") : undefined,
      city: city as string,
      page: Number.parseInt(page as string, 10),
      limit: Number.parseInt(limit as string, 10),
      verifiedOnly: true,
    })

    res.status(200).json({
      success: true,
      data: result,
      message: "Contractors retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/contractors/by-trade/:trade
 * Get contractors by trade
 */
export async function getContractorsByTradeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { trade } = req.params
    const { limit = "10" } = req.query

    const contractors = await getContractorsByTrade(trade, Number.parseInt(limit as string, 10))

    res.status(200).json({
      success: true,
      data: { contractors },
      message: "Contractors retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/contractors/:id
 * Get contractor by ID
 */
export async function getContractorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const contractor = await getContractorById(id)

    if (!contractor) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Contractor not found",
        error: "NOT_FOUND",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { contractor },
      message: "Contractor retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

// ============================================================================
// AUTHENTICATED HANDLERS
// ============================================================================

/**
 * GET /api/v1/contractors/me
 * Get own profile
 */
export async function getMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const profile = await getContractorProfileByUserId(userId)

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
 * POST /api/v1/contractors/me
 * Create profile (onboarding)
 */
export async function createMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const { name, profilePictureUrl, trades, experienceYears, serviceAreas, workPhotos, bio } =
      req.body

    if (!name) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Name is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    if (!trades || trades.length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        message: "At least one trade is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    if (!workPhotos || workPhotos.length < 2) {
      res.status(400).json({
        success: false,
        data: null,
        message: "At least 2 work photos are required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await createContractorProfile(userId, {
      name,
      profilePictureUrl,
      trades,
      experienceYears,
      serviceAreas: serviceAreas || [],
      workPhotos,
      bio,
      isVerified: false,
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
      message: "Profile created successfully. Pending verification.",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/v1/contractors/me
 * Update profile
 */
export async function updateMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        data: null,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      })
      return
    }

    const { name, profilePictureUrl, trades, experienceYears, serviceAreas, workPhotos, bio } =
      req.body

    if (trades !== undefined && trades.length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        message: "At least one trade is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    if (workPhotos !== undefined && workPhotos.length < 2) {
      res.status(400).json({
        success: false,
        data: null,
        message: "At least 2 work photos are required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await updateContractorProfile(userId, {
      name,
      profilePictureUrl,
      trades,
      experienceYears,
      serviceAreas,
      workPhotos,
      bio,
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
