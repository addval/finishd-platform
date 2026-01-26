/**
 * Database Configuration
 * Sequelize ORM with PostgreSQL
 */

// Load environment variables FIRST
import dotenv from "dotenv"

dotenv.config()

import { Sequelize } from "sequelize"
import { logger } from "../utils/logger.js"

// Validate required environment variables
const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"]
const missingEnvVars = requiredEnvVars.filter(varName => process.env[varName] === undefined)

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingEnvVars.join(", ")}
Please set the following in your .env file:
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD`,
  )
}

// Warn if DB_PASSWORD is empty (only in development)
if (process.env.NODE_ENV === "development" && !process.env.DB_PASSWORD) {
  logger.warn(
    "⚠️  DB_PASSWORD is empty. Ensure your PostgreSQL allows passwordless connections (trust auth).",
  )
}

const sequelizeInstance = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: msg => logger.debug(msg),
  pool: {
    min: Number.parseInt(process.env.DB_POOL_MIN || "2", 10),
    max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    timestamps: true,
    paranoid: true,
  },
})

export const sequelize = sequelizeInstance
export default sequelizeInstance

export const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    logger.info("Database connection established successfully")
  } catch (error) {
    logger.error("Unable to connect to database:", error)
    throw error
  }
}

export const closeDatabase = async (): Promise<void> => {
  await sequelize.close()
  logger.info("Database connection closed")
}
