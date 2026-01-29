/**
 * Database Migration Script
 * Runs Drizzle ORM migrations for the Finishd platform
 */

import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import pg from "pg"

dotenv.config()

const { Pool } = pg

async function runMigrations() {
  console.log("Starting database migrations...")

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://finishd:finishd123@localhost:5432/finishd_db",
  })

  const db = drizzle(pool)

  try {
    await migrate(db, { migrationsFolder: "./drizzle" })
    console.log("Migrations completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
