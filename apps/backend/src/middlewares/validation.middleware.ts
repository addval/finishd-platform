/**
 * Validation Middleware
 * Handles request validation using Joi schemas
 */

import type { NextFunction, Request, Response } from "express"
import type Joi from "joi"
import type { ApiResponse, JoiValidationError } from "../types/index.js"
import { ValidationError } from "../utils/errors.js"

/**
 * Generic validation middleware factory
 * Validates request data against a Joi schema
 * @param schema - Joi validation schema
 * @param property - Request property to validate ('body', 'query', 'params')
 * @returns Middleware function
 */
export const validate =
  (schema: Joi.ObjectSchema, property: "body" | "query" | "params" = "body") =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[property]
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(", ")
        throw new ValidationError(errorMessage)
      }

      // Replace request data with validated and sanitized data
      req[property] = value
      next()
    } catch (error) {
      next(error)
    }
  }

/**
 * Validate request body
 * @param schema - Joi validation schema for request body
 * @returns Middleware function
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return validate(schema, "body")
}

/**
 * Validate request query parameters
 * @param schema - Joi validation schema for query parameters
 * @returns Middleware function
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate(schema, "query")
}

/**
 * Validate request parameters
 * @param schema - Joi validation schema for URL parameters
 * @returns Middleware function
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return validate(schema, "params")
}

/**
 * Validation error formatter
 * Formats Joi validation errors into a consistent response
 * @param error - Joi validation error
 * @returns Formatted error object
 */
export const formatValidationError = (error: unknown): ApiResponse<null> => {
  const joiError = error as JoiValidationError

  if (!joiError.details) {
    return {
      success: false,
      data: null,
      message: "Validation failed",
      error: "Invalid input data",
    }
  }

  const formattedErrors: Record<string, string> = {}

  joiError.details.forEach(detail => {
    const key = detail.path.join(".")
    formattedErrors[key] = detail.message
  })

  return {
    success: false,
    data: null,
    message: "Validation failed",
    error: "Invalid input data",
    errors: formattedErrors,
  }
}
