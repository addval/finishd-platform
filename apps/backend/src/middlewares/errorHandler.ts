/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

import type { NextFunction, Request, Response } from "express"
import { isPostgresError, PG_ERROR_CODES, type PostgresError } from "../types/index.js"
import { AppError } from "../utils/errors.js"
import { logger } from "../utils/logger.js"

/**
 * Format PostgreSQL constraint errors into user-friendly messages
 */
const formatPostgresError = (error: PostgresError): { message: string; errors: Record<string, string> } => {
  const formattedErrors: Record<string, string> = {}
  let message = "Database error"

  switch (error.code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      message = "A record with this information already exists"
      if (error.constraint) {
        // Extract field name from constraint (e.g., "users_phone_key" -> "phone")
        const field = error.constraint.replace(/_key$/, "").split("_").pop() || "field"
        formattedErrors[field] = `This ${field} is already in use`
      }
      break
    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      message = "Referenced record does not exist"
      if (error.constraint) {
        formattedErrors[error.constraint] = "Invalid reference"
      }
      break
    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      message = "Required field is missing"
      if (error.column) {
        formattedErrors[error.column] = `${error.column} is required`
      }
      break
    case PG_ERROR_CODES.CHECK_VIOLATION:
      message = "Invalid value provided"
      if (error.constraint) {
        formattedErrors[error.constraint] = "Value does not meet requirements"
      }
      break
  }

  return { message, errors: formattedErrors }
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

  // Handle PostgreSQL errors
  if (isPostgresError(error)) {
    const { message, errors } = formatPostgresError(error)

    res.status(400).json({
      success: false,
      data: null,
      message,
      error: message,
      errors,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    })
    return
  }

  // Handle Zod validation errors
  if (error.name === "ZodError") {
    const zodError = error as Error & { issues: Array<{ path: (string | number)[]; message: string }> }
    const formattedErrors: Record<string, string> = {}

    zodError.issues.forEach(issue => {
      const field = issue.path.join(".") || "value"
      formattedErrors[field] = issue.message
    })

    res.status(400).json({
      success: false,
      data: null,
      message: "Validation error",
      error: "Validation error",
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
