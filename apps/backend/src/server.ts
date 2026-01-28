/**
 * Backend Server Entry Point
 * Express.js server with TypeScript, PostgreSQL, Sequelize
 */

// Load environment variables FIRST (before any imports that use env vars)
import dotenv from "dotenv"

dotenv.config()

import { createServer } from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import compression from "compression"
import cors from "cors"
import express, { type Application } from "express"
import helmet from "helmet"
import type { HttpServerType } from "./types/index.js"

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Server {
  private app: Application
  private httpServer: HttpServerType | null = null
  private PORT: number

  constructor() {
    this.app = express()
    this.PORT = Number.parseInt(process.env.PORT || "3000", 10)
  }

  private async initializeMiddlewares(): Promise<void> {
    // Import middlewares using dynamic import for CommonJS modules
    const { requestLogger } = await import("./middlewares/requestLogger.js")

    // Security middleware
    this.app.use(helmet())

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
        credentials: true,
      }),
    )

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }))
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }))

    // Compression middleware
    this.app.use(compression())

    // Static file serving for uploads
    const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads")
    this.app.use("/uploads", express.static(uploadsDir))

    // Request logging
    this.app.use(requestLogger)
  }

  private async initializeRoutes(): Promise<void> {
    // Import routes
    const routes = await import("./routes/index.js")

    // Log route loading for debugging
    const { default: logger } = await import("./utils/logger.js")
    logger.info("Loading application routes...")

    // Mount routes at root level (routes are already prefixed in routes/index.ts)
    this.app.use("/", routes.default)

    logger.info("Application routes loaded successfully")
  }

  private async initializeErrorHandling(): Promise<void> {
    // Import error handler using dynamic import for CommonJS module
    const { errorHandler } = await import("./middlewares/errorHandler.js")

    // Register error handler (must have 4 parameters for Express to recognize it)
    this.app.use(errorHandler)

    // 404 handler (must be AFTER error handler)
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        data: null,
        message: "Route not found",
        error: "Not Found",
      })
    })
  }

  public async start(): Promise<void> {
    try {
      // Import database and logger using dynamic import for CommonJS modules
      const { initDatabase } = await import("./config/database.js")
      const { default: logger } = await import("./utils/logger.js")

      // Initialize all middlewares
      await this.initializeMiddlewares()
      await this.initializeRoutes() // Add await here
      await this.initializeErrorHandling()

      // Initialize database
      await initDatabase()

      // Initialize models and setup associations
      const { initializeModels } = await import("./models/index.js")
      initializeModels()

      // Initialize Redis (optional)
      if (process.env.REDIS_URL) {
        const { initRedis } = await import("./config/redis.js")
        await initRedis()
      }

      // Start HTTP server
      this.httpServer = createServer(this.app)
      this.httpServer.listen(this.PORT, () => {
        logger.info(`Server running on port ${this.PORT}`)
      })

      // Graceful shutdown
      process.on("SIGTERM", () => this.shutdown())
      process.on("SIGINT", () => this.shutdown())
    } catch (error) {
      const { default: logger } = await import("./utils/logger.js")
      logger.error("Failed to start server:", error)
      process.exit(1)
    }
  }

  private async shutdown(): Promise<void> {
    const { default: logger } = await import("./utils/logger.js")
    logger.info("Shutting down gracefully...")

    if (this.httpServer) {
      this.httpServer.close(async () => {
        try {
          // Close database connection
          const { sequelize } = await import("./config/database.js")
          await sequelize.close()
          logger.info("Database connection closed")

          // Close Redis connection
          if (process.env.REDIS_URL) {
            const { redisClient } = await import("./config/redis.js")
            await redisClient.quit()
            logger.info("Redis connection closed")
          }

          logger.info("Server shut down successfully")
          process.exit(0)
        } catch (error) {
          logger.error("Error during shutdown:", error)
          process.exit(1)
        }
      })
    } else {
      process.exit(0)
    }
  }
}

// Start the server
const server = new Server()
server.start()

export default server
