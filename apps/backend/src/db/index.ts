/**
 * Database Connection
 * Drizzle ORM PostgreSQL client for Finishd platform
 */

import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import * as schema from "./schema.js"

const { Pool } = pg

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://shantanu:@localhost:5432/finishd_dev",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Create drizzle instance with schema
export const db = drizzle(pool, { schema })

// Export pool for raw queries if needed
export { pool }

// Export schema for convenience
export * from "./schema.js"

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query("SELECT NOW()")
    client.release()
    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

/**
 * Close database connection pool
 */
export async function closeConnection(): Promise<void> {
  await pool.end()
  console.log("Database connection pool closed")
}
