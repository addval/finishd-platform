/**
 * Typesense Configuration
 * Search engine client setup for Finishd platform
 */

import Typesense from "typesense"

// Configuration
const TYPESENSE_HOST = process.env.TYPESENSE_HOST || "localhost"
const TYPESENSE_PORT = Number.parseInt(process.env.TYPESENSE_PORT || "8108", 10)
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || "http"
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || "finishd-typesense-api-key"

// Create Typesense client
export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 5,
  retryIntervalSeconds: 0.1,
  numRetries: 3,
})

// Collection schemas
export const DESIGNERS_COLLECTION = "designers"
export const CONTRACTORS_COLLECTION = "contractors"

/**
 * Designer document schema for Typesense
 */
export const designerSchema = {
  name: DESIGNERS_COLLECTION,
  fields: [
    { name: "id", type: "string" as const },
    { name: "userId", type: "string" as const },
    { name: "name", type: "string" as const },
    { name: "firmName", type: "string" as const, optional: true },
    { name: "bio", type: "string" as const, optional: true },
    { name: "profilePictureUrl", type: "string" as const, optional: true },
    { name: "portfolioImages", type: "string[]" as const, optional: true },
    { name: "services", type: "string[]" as const, optional: true },
    { name: "serviceCities", type: "string[]" as const, optional: true },
    { name: "styles", type: "string[]" as const, optional: true },
    { name: "priceRangeMin", type: "int32" as const, optional: true },
    { name: "priceRangeMax", type: "int32" as const, optional: true },
    { name: "experienceYears", type: "int32" as const, optional: true },
    { name: "projectsCompleted", type: "int32" as const, optional: true },
    { name: "isVerified", type: "bool" as const },
    { name: "createdAt", type: "int64" as const },
  ],
  default_sorting_field: "createdAt",
}

/**
 * Contractor document schema for Typesense
 */
export const contractorSchema = {
  name: CONTRACTORS_COLLECTION,
  fields: [
    { name: "id", type: "string" as const },
    { name: "userId", type: "string" as const },
    { name: "name", type: "string" as const },
    { name: "profilePictureUrl", type: "string" as const, optional: true },
    { name: "trades", type: "string[]" as const, optional: true },
    { name: "experienceYears", type: "int32" as const, optional: true },
    { name: "serviceAreas", type: "string[]" as const, optional: true },
    { name: "workPhotos", type: "string[]" as const, optional: true },
    { name: "bio", type: "string" as const, optional: true },
    { name: "isVerified", type: "bool" as const },
    { name: "createdAt", type: "int64" as const },
  ],
  default_sorting_field: "createdAt",
}

/**
 * Initialize Typesense collections
 */
export async function initTypesenseCollections(): Promise<void> {
  try {
    // Create designers collection
    try {
      await typesenseClient.collections(DESIGNERS_COLLECTION).retrieve()
      console.log(`[Typesense] Collection ${DESIGNERS_COLLECTION} already exists`)
    } catch {
      await typesenseClient.collections().create(designerSchema)
      console.log(`[Typesense] Created collection ${DESIGNERS_COLLECTION}`)
    }

    // Create contractors collection
    try {
      await typesenseClient.collections(CONTRACTORS_COLLECTION).retrieve()
      console.log(`[Typesense] Collection ${CONTRACTORS_COLLECTION} already exists`)
    } catch {
      await typesenseClient.collections().create(contractorSchema)
      console.log(`[Typesense] Created collection ${CONTRACTORS_COLLECTION}`)
    }

    console.log("[Typesense] Collections initialized successfully")
  } catch (error) {
    console.error("[Typesense] Failed to initialize collections:", error)
    // Don't throw - search is optional, app should still work
  }
}

/**
 * Check Typesense health
 */
export async function checkTypesenseHealth(): Promise<boolean> {
  try {
    await typesenseClient.health.retrieve()
    return true
  } catch {
    return false
  }
}
