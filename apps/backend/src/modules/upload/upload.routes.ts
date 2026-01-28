/**
 * Upload Routes
 * API endpoints for file uploads
 */

import { Router } from "express"
import multer from "multer"
import { uploadSingleHandler, uploadMultipleHandler, deleteFileHandler } from "./upload.controller.js"
import { authMiddleware } from "../auth/auth.middleware.js"

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10, // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."))
    }
  },
})

// All upload routes require authentication
router.use(authMiddleware)

// POST /api/v1/upload - Upload single file
router.post("/", upload.single("file"), uploadSingleHandler)

// POST /api/v1/upload/multiple - Upload multiple files
router.post("/multiple", upload.array("files", 10), uploadMultipleHandler)

// DELETE /api/v1/upload - Delete file
router.delete("/", deleteFileHandler)

export default router
