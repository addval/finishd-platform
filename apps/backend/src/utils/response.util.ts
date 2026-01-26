/**
 * Response Utility Functions
 * Provides helper functions for consistent API responses
 * Matches reference backend pattern for cleaner controller code
 */

import type { Response } from "express"

interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string
}

/**
 * Send success response with data
 * @param res - Express response object
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 * @returns JSON response with success format
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string,
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>)
}

/**
 * Send created response (201)
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Success message
 * @returns JSON response with 201 status
 */
export const createdResponse = <T>(res: Response, data: T, message: string) => {
  return successResponse(res, data, message, 201)
}

/**
 * Send error response
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @returns JSON response with error format
 */
export const errorResponse = (res: Response, message: string, statusCode: number = 500) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
  } as ApiResponse<null>)
}

/**
 * Send bad request response (400)
 * @param res - Express response object
 * @param message - Error message
 * @returns JSON response with 400 status
 */
export const badRequestResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 400)
}

/**
 * Send unauthorized response (401)
 * @param res - Express response object
 * @param message - Error message
 * @returns JSON response with 401 status
 */
export const unauthorizedResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 401)
}

/**
 * Send forbidden response (403)
 * @param res - Express response object
 * @param message - Error message
 * @returns JSON response with 403 status
 */
export const forbiddenResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 403)
}

/**
 * Send not found response (404)
 * @param res - Express response object
 * @param message - Error message
 * @returns JSON response with 404 status
 */
export const notFoundResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 404)
}

/**
 * Send conflict response (409)
 * @param res - Express response object
 * @param message - Error message
 * @returns JSON response with 409 status
 */
export const conflictResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 409)
}

/**
 * Send unprocessable entity response (422)
 * @param res - Express response object
 * @param message - Error message
 * @returns JSON response with 422 status
 */
export const unprocessableEntityResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 422)
}
