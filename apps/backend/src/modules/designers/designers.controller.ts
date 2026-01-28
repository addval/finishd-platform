/**
 * Designers Controller
 * HTTP request handlers for designer profile management
 */

import type { Request, Response, NextFunction } from "express"
import {
  getDesignerProfileByUserId,
  getDesignerById,
  createDesignerProfile,
  updateDesignerProfile,
  browseDesigners,
  getFeaturedDesigners,
} from "./designers.service.js"

// ============================================================================
// PUBLIC HANDLERS (browse/view)
// ============================================================================

/**
 * GET /api/v1/designers
 * Browse designers with filters
 */
export async function browseDesignersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      q: query,
      city,
      styles,
      budgetMin,
      budgetMax,
      page = "1",
      limit = "20",
    } = req.query

    const result = await browseDesigners({
      query: query as string,
      city: city as string,
      styles: styles ? (styles as string).split(",") : undefined,
      budgetMin: budgetMin ? Number.parseInt(budgetMin as string, 10) : undefined,
      budgetMax: budgetMax ? Number.parseInt(budgetMax as string, 10) : undefined,
      page: Number.parseInt(page as string, 10),
      limit: Number.parseInt(limit as string, 10),
      verifiedOnly: true,
    })

    res.status(200).json({
      success: true,
      data: result,
      message: "Designers retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/designers/featured
 * Get featured designers for homepage
 */
export async function getFeaturedDesignersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { city, limit = "5" } = req.query

    const designers = await getFeaturedDesigners(
      city as string,
      Number.parseInt(limit as string, 10),
    )

    res.status(200).json({
      success: true,
      data: { designers },
      message: "Featured designers retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/designers/:id
 * Get designer by ID (public view)
 */
export async function getDesignerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const designer = await getDesignerById(id)

    if (!designer) {
      res.status(404).json({
        success: false,
        data: null,
        message: "Designer not found",
        error: "NOT_FOUND",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { designer },
      message: "Designer retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

// ============================================================================
// AUTHENTICATED HANDLERS (own profile)
// ============================================================================

/**
 * GET /api/v1/designers/me
 * Get current designer's profile
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

    const profile = await getDesignerProfileByUserId(userId)

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
 * POST /api/v1/designers/me
 * Create designer profile (onboarding)
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

    const {
      name,
      firmName,
      bio,
      profilePictureUrl,
      portfolioImages,
      services,
      serviceCities,
      styles,
      priceRangeMin,
      priceRangeMax,
      experienceYears,
    } = req.body

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Name is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    if (!bio || bio.length < 50) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Bio must be at least 50 characters",
        error: "VALIDATION_ERROR",
      })
      return
    }

    if (!portfolioImages || portfolioImages.length < 3) {
      res.status(400).json({
        success: false,
        data: null,
        message: "At least 3 portfolio images are required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await createDesignerProfile(userId, {
      name,
      firmName,
      bio,
      profilePictureUrl,
      portfolioImages,
      services: services || [],
      serviceCities: serviceCities || [],
      styles: styles || [],
      priceRangeMin,
      priceRangeMax,
      experienceYears,
      isVerified: false, // Designers start unverified
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
 * PATCH /api/v1/designers/me
 * Update designer profile
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

    const {
      name,
      firmName,
      bio,
      profilePictureUrl,
      portfolioImages,
      services,
      serviceCities,
      styles,
      priceRangeMin,
      priceRangeMax,
      experienceYears,
    } = req.body

    // Validate bio length if provided
    if (bio !== undefined && bio.length < 50) {
      res.status(400).json({
        success: false,
        data: null,
        message: "Bio must be at least 50 characters",
        error: "VALIDATION_ERROR",
      })
      return
    }

    // Validate portfolio images if provided
    if (portfolioImages !== undefined && portfolioImages.length < 3) {
      res.status(400).json({
        success: false,
        data: null,
        message: "At least 3 portfolio images are required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await updateDesignerProfile(userId, {
      name,
      firmName,
      bio,
      profilePictureUrl,
      portfolioImages,
      services,
      serviceCities,
      styles,
      priceRangeMin,
      priceRangeMax,
      experienceYears,
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
