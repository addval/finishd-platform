/**
 * Image Upload Component
 * Reusable image upload with preview for profiles and portfolios
 */

import { useState, useRef } from "react"
import { Upload, X, Loader2, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { uploadFile, uploadMultipleFiles } from "../services/finishd-api.service"

interface SingleImageUploadProps {
  label?: string
  currentUrl?: string
  onUpload: (url: string) => void
  onRemove?: () => void
  className?: string
}

export function SingleImageUpload({
  label = "Upload Image",
  currentUrl,
  onUpload,
  onRemove,
  className,
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB")
      return
    }

    setError(null)
    setIsUploading(true)
    const result = await uploadFile(file)
    setIsUploading(false)

    if (result.success && result.url) {
      onUpload(result.url)
    } else {
      setError(result.error || "Upload failed")
    }

    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}

      {currentUrl ? (
        <div className="relative inline-block">
          <img
            src={currentUrl}
            alt="Uploaded"
            className="h-32 w-32 rounded-lg object-cover border"
          />
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <Card
          className={cn(
            "cursor-pointer border-dashed hover:border-primary/50 transition-colors",
            isUploading && "pointer-events-none opacity-60",
          )}
          onClick={() => inputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Click to upload"}
            </p>
          </CardContent>
        </Card>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

interface MultiImageUploadProps {
  label?: string
  currentUrls: string[]
  maxImages?: number
  onUpload: (urls: string[]) => void
  onRemove: (index: number) => void
  className?: string
}

export function MultiImageUpload({
  label = "Upload Images",
  currentUrls,
  maxImages = 10,
  onUpload,
  onRemove,
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remaining = maxImages - currentUrls.length
    if (files.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining === 1 ? "" : "s"}`)
      return
    }

    const invalidFiles = files.filter((f) => !f.type.startsWith("image/"))
    if (invalidFiles.length > 0) {
      setError("Please select only image files")
      return
    }

    const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError("Each image must be less than 10MB")
      return
    }

    setError(null)
    setIsUploading(true)
    const result = await uploadMultipleFiles(files)
    setIsUploading(false)

    if (result.success && result.urls) {
      onUpload(result.urls)
    } else {
      setError(result.error || "Upload failed")
    }

    if (inputRef.current) inputRef.current.value = ""
  }

  const canAddMore = currentUrls.length < maxImages

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-foreground">
          {label} ({currentUrls.length}/{maxImages})
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {currentUrls.map((url, index) => (
          <div key={url} className="group relative aspect-square">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="h-full w-full rounded-lg object-cover border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {canAddMore && (
          <Card
            className={cn(
              "aspect-square cursor-pointer border-dashed hover:border-primary/50 transition-colors",
              isUploading && "pointer-events-none opacity-60",
            )}
            onClick={() => inputRef.current?.click()}
          >
            <CardContent className="flex h-full flex-col items-center justify-center p-2">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
              <p className="mt-1 text-xs text-muted-foreground text-center">
                {isUploading ? "Uploading..." : "Add"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFilesSelect}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
