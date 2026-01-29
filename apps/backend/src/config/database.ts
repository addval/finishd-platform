/**
 * Database Configuration
 * Drizzle ORM with PostgreSQL
 */

import dotenv from "dotenv"
dotenv.config()

import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import * as schema from "../db/schema.js"
import { logger } from "../utils/logger.js"

const { Pool } = pg

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Create drizzle instance with schema
export const db = drizzle(pool, { schema })

// Export pool for raw queries if needed
export { pool }

// Export schema for convenience
export * from "../db/schema.js"

export const initDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect()
    await client.query("SELECT NOW()")
    client.release()
    logger.info("Database connection established successfully")
  } catch (error) {
    logger.error("Unable to connect to database:", error)
    throw error
  }
}

export const closeDatabase = async (): Promise<void> => {
  await pool.end()
  logger.info("Database connection closed")
}
