/**
 * Search Controller
 * HTTP request handlers for Typesense search
 */

import type { Request, Response, NextFunction } from "express"
import { searchDesigners, searchContractors } from "./search.service.js"

/**
 * GET /api/v1/search/designers
 * Search designers with full-text search and filters
 */
export async function searchDesignersHandler(
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
      perPage = "20",
    } = req.query

    const result = await searchDesigners({
      query: (query as string) || "*",
      city: city as string,
      styles: styles ? (styles as string).split(",") : undefined,
      budgetMin: budgetMin ? Number.parseInt(budgetMin as string, 10) : undefined,
      budgetMax: budgetMax ? Number.parseInt(budgetMax as string, 10) : undefined,
      verifiedOnly: true,
      page: Number.parseInt(page as string, 10),
      perPage: Number.parseInt(perPage as string, 10),
    })

    res.status(200).json({
      success: true,
      data: result,
      message: "Search completed successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/search/contractors
 * Search contractors with full-text search and filters
 */
export async function searchContractorsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q: query, trades, city, page = "1", perPage = "20" } = req.query

    const result = await searchContractors({
      query: (query as string) || "*",
      trades: trades ? (trades as string).split(",") : undefined,
      city: city as string,
      verifiedOnly: true,
      page: Number.parseInt(page as string, 10),
      perPage: Number.parseInt(perPage as string, 10),
    })

    res.status(200).json({
      success: true,
      data: result,
      message: "Search completed successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}
