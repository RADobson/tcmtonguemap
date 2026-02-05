/**
 * Image compression utility for optimizing images before sending to OpenAI
 * Reduces file size while maintaining quality for analysis
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/jpeg' | 'image/webp' | 'image/png'
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'image/jpeg'
}

/**
 * Compress an image file and return both data URL and File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; file: File; originalSize: number; compressedSize: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      // Clean up object URL
      URL.revokeObjectURL(objectUrl)
      
      let { width, height } = img
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      
      canvas.width = width
      canvas.height = height
      
      // Use better quality rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Fill white background for JPEG (to handle transparency)
      if (opts.format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to data URL with compression
      const dataUrl = canvas.toDataURL(opts.format, opts.quality)
      
      // Convert back to File
      const byteString = atob(dataUrl.split(',')[1])
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      
      const compressedFile = new File([ab], file.name, { type: mimeString })
      
      resolve({
        dataUrl,
        file: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }
    
    img.src = objectUrl
  })
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file needs compression (larger than threshold)
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  return file.size > maxSizeMB * 1024 * 1024
}

/**
 * Get optimal compression options based on file size
 */
export function getOptimalCompressionOptions(file: File): CompressionOptions {
  const sizeMB = file.size / (1024 * 1024)
  
  if (sizeMB > 5) {
    // Very large file - aggressive compression
    return {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.75,
      format: 'image/jpeg'
    }
  } else if (sizeMB > 2) {
    // Large file - moderate compression
    return {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'image/jpeg'
    }
  } else {
    // Smaller file - light compression
    return {
      maxWidth: 1400,
      maxHeight: 1400,
      quality: 0.9,
      format: 'image/jpeg'
    }
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file (JPG, PNG, etc.)' }
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image size should be less than 10MB' }
  }
  
  return { valid: true }
}

/**
 * Quick image processing for mobile devices
 * Uses more aggressive compression for slower connections
 */
export async function compressImageForMobile(
  file: File,
  connectionType?: string
): Promise<{ dataUrl: string; file: File }> {
  // Adjust compression based on connection
  let options = getOptimalCompressionOptions(file)
  
  if (connectionType === '2g' || connectionType === 'slow-2g') {
    options = {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.7,
      format: 'image/jpeg'
    }
  } else if (connectionType === '3g') {
    options = {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      format: 'image/jpeg'
    }
  }
  
  const result = await compressImage(file, options)
  return { dataUrl: result.dataUrl, file: result.file }
}
