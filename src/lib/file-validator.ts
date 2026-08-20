/**
 * Utility for validating image & document uploads before uploading to Cloudinary
 */

export interface ValidationOptions {
  maxSizeMB?: number
  allowedTypes?: string[]
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateUploadFile(
  file: File,
  options: ValidationOptions = {}
): ValidationResult {
  const maxSizeMB = options.maxSizeMB ?? 5
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const allowedTypes = options.allowedTypes ?? [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf"
  ]

  // Check file size
  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File is too large (${sizeInMB} MB). Maximum allowed size is ${maxSizeMB} MB.`
    }
  }

  // Check file format
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith("/*")) {
      const baseType = type.split("/")[0]
      return file.type.startsWith(`${baseType}/`)
    }
    return file.type.toLowerCase() === type.toLowerCase()
  })

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: "Invalid file format. Please upload a JPG, PNG, WebP image, or PDF document."
    }
  }

  return { valid: true }
}
