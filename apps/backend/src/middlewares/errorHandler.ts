/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

import type { NextFunction, Request, Response } from "express"
import type { SequelizeError, SequelizeValidationErrorItem } from "../types/index.js"
import { AppError } from "../utils/errors.js"
import { logger } from "../utils/logger.js"

// Check if error is a Sequelize validation error
const isSequelizeValidationError = (error: unknown): error is SequelizeError => {
  const err = error as Error
  return err?.name === "SequelizeValidationError" || err?.name === "SequelizeUniqueConstraintError"
}

/**
 * Format Sequelize validation errors
 */
const formatSequelizeError = (error: SequelizeError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {}

  if (error.errors) {
    error.errors.forEach((err: SequelizeValidationErrorItem) => {
      const field = err.path || err.field || "unknown"
      formattedErrors[field] = err.message
    })
  }

  return formattedErrors
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log error
  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  // Handle Sequelize validation errors
  if (isSequelizeValidationError(error)) {
    const formattedErrors = formatSequelizeError(error)
    const errorMessage =
      error.name === "SequelizeUniqueConstraintError"
        ? "A record with this information already exists"
        : "Validation error"

    res.status(400).json({
      success: false,
      data: null,
      message: errorMessage,
      error: errorMessage,
      errors: formattedErrors,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    })
    return
  }

  // Handle operational errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      data: null,
      message: error.message,
      error: error.isOperational ? error.message : "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    })
    return
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      data: null,
      message: "Invalid token",
      error: "Authentication failed",
    })
    return
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      data: null,
      message: "Token expired",
      error: "Authentication failed",
    })
    return
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    data: null,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
}

export default errorHandler
