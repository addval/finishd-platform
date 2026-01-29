/**
 * Upload Service
 * File upload handling with local storage (dev) or S3 (production)
 */

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"
const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE || "10485760", 10) // 10MB default
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp").split(",")
const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000"

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export interface UploadResult {
  success: boolean
  url?: string
  filename?: string
  error?: string
}

export interface FileData {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

/**
 * Validate file before upload
 */
export function validateFile(file: FileData): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`,
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted types: ${ALLOWED_TYPES.join(", ")}`,
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename
 */
export function generateFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase()
  const hash = crypto.randomBytes(16).toString("hex")
  const timestamp = Date.now()
  return `${timestamp}-${hash}${ext}`
}

/**
 * Upload file to local storage
 */
export async function uploadFile(file: FileData, folder = "images"): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const filename = generateFilename(file.originalname)

    // Create folder if it doesn't exist
    const folderPath = path.join(UPLOAD_DIR, folder)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }

    // Write file to disk
    const filePath = path.join(folderPath, filename)
    await fs.promises.writeFile(filePath, file.buffer)

    // Generate URL
    const url = `/uploads/${folder}/${filename}`

    console.log(`[Upload] File saved: ${filePath}`)

    return {
      success: true,
      url,
      filename,
    }
  } catch (error) {
    console.error("[Upload] Failed to upload file:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: FileData[],
  folder = "images",
): Promise<{
  success: boolean
  urls?: string[]
  errors?: string[]
}> {
  const results = await Promise.all(files.map((file) => uploadFile(file, folder)))

  const urls: string[] = []
  const errors: string[] = []

  for (const result of results) {
    if (result.success && result.url) {
      urls.push(result.url)
    } else if (result.error) {
      errors.push(result.error)
    }
  }

  return {
    success: errors.length === 0,
    urls,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract path from URL
    const relativePath = url.replace(/^\/uploads\//, "")
    const filePath = path.join(UPLOAD_DIR, relativePath)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return { success: false, error: "File not found" }
    }

    // Delete file
    await fs.promises.unlink(filePath)

    console.log(`[Upload] File deleted: ${filePath}`)

    return { success: true }
  } catch (error) {
    console.error("[Upload] Failed to delete file:", error)
    return { success: false, error: "Failed to delete file" }
  }
}

/**
 * Get file info
 */
export function getFileInfo(url: string): {
  exists: boolean
  size?: number
  path?: string
} {
  const relativePath = url.replace(/^\/uploads\//, "")
  const filePath = path.join(UPLOAD_DIR, relativePath)

  if (!fs.existsSync(filePath)) {
    return { exists: false }
  }

  const stats = fs.statSync(filePath)
  return {
    exists: true,
    size: stats.size,
    path: filePath,
  }
}
