/**
 * Logger Utility
 * Winston logger for application logging
 */

import winston from "winston"

const logLevel = process.env.LOG_LEVEL || "info"
const logFile = process.env.LOG_FILE || "logs/app.log"

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "finishd-backend" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`
          if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`
          }
          return msg
        }),
      ),
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: logFile,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
})

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

export default logger
