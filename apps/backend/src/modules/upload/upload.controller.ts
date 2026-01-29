/**
 * Upload Controller
 * HTTP request handlers for file uploads
 */

import type { Request, Response, NextFunction } from "express"
import { uploadFile, uploadMultipleFiles, deleteFile } from "./upload.service.js"

/**
 * POST /api/v1/upload
 * Upload single file
 */
export async function uploadSingleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file

    if (!file) {
      res.status(400).json({
        success: false,
        data: null,
        message: "No file provided",
        error: "VALIDATION_ERROR",
      })
      return
    }

    // Determine folder based on query param or default to 'images'
    const folder = (req.query.folder as string) || "images"

    const result = await uploadFile(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      folder,
    )

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "UPLOAD_FAILED",
      })
      return
    }

    res.status(201).json({
      success: true,
      data: {
        url: result.url,
        filename: result.filename,
      },
      message: "File uploaded successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/upload/multiple
 * Upload multiple files
 */
export async function uploadMultipleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        message: "No files provided",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const folder = (req.query.folder as string) || "images"

    const fileData = files.map((file) => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }))

    const result = await uploadMultipleFiles(fileData, folder)

    if (!result.success && result.errors && result.errors.length === files.length) {
      // All files failed
      res.status(400).json({
        success: false,
        data: null,
        message: "Failed to upload files",
        error: "UPLOAD_FAILED",
        errors: result.errors,
      })
      return
    }

    res.status(201).json({
      success: true,
      data: {
        urls: result.urls,
        errors: result.errors,
      },
      message: `${result.urls?.length || 0} file(s) uploaded successfully`,
      error: null,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/v1/upload
 * Delete file by URL
 */
export async function deleteFileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { url } = req.body

    if (!url) {
      res.status(400).json({
        success: false,
        data: null,
        message: "File URL is required",
        error: "VALIDATION_ERROR",
      })
      return
    }

    const result = await deleteFile(url)

    if (!result.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: result.error,
        error: "DELETE_FAILED",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "File deleted successfully",
      error: null,
    })
  } catch (error) {
    next(error)
  }
}
