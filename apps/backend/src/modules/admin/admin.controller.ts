/**
 * Admin Controller
 * HTTP request handlers for admin verification queue management
 */

import type { Request, Response, NextFunction } from "express"
import {
  getUnverifiedDesigners,
  getUnverifiedContractors,
  rejectDesigner,
  rejectContractor,
} from "./admin.service.js"
import { verifyDesigner } from "../designers/designers.service.js"
import { verifyContractor } from "../contractors/contractors.service.js"

// ============================================================================
// DESIGNER VERIFICATION HANDLERS
// ============================================================================

/**
 * GET /api/v1/admin/designers/pending
 * Get all unverified designers
 */
export async function getUnverifiedDesignersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const designers = await getUnverifiedDesigners()

    res.status(200).json({
      success: true,
      data: { designers },
      message: "Unverified designers retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/designers/:id/verify
 * Verify a designer profile
 */
export async function verifyDesignerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const result = await verifyDesigner(id)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error || "Failed to verify designer",
        error: "VERIFY_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { profile: result.profile },
      message: "Designer verified successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/designers/:id/reject
 * Reject a designer profile
 */
export async function rejectDesignerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { reason } = req.body

    const result = await rejectDesigner(id, reason)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error || "Failed to reject designer",
        error: "REJECT_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Designer rejected successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

// ============================================================================
// CONTRACTOR VERIFICATION HANDLERS
// ============================================================================

/**
 * GET /api/v1/admin/contractors/pending
 * Get all unverified contractors
 */
export async function getUnverifiedContractorsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const contractors = await getUnverifiedContractors()

    res.status(200).json({
      success: true,
      data: { contractors },
      message: "Unverified contractors retrieved successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/contractors/:id/verify
 * Verify a contractor profile
 */
export async function verifyContractorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const result = await verifyContractor(id)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error || "Failed to verify contractor",
        error: "VERIFY_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { profile: result.profile },
      message: "Contractor verified successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/contractors/:id/reject
 * Reject a contractor profile
 */
export async function rejectContractorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { reason } = req.body

    const result = await rejectContractor(id, reason)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error || "Failed to reject contractor",
        error: "REJECT_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Contractor rejected successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}
