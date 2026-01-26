/**
 * Request Logger Middleware
 * Logs all incoming requests
 */

import type { NextFunction, Request, Response } from "express"
import { logger } from "../utils/logger.js"

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()

  // Log request
  res.on("finish", () => {
    const duration = Date.now() - startTime
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })
  })

  next()
}

export default requestLogger
