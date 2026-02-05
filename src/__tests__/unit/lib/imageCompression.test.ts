import {
  compressImage,
  formatFileSize,
  needsCompression,
  getOptimalCompressionOptions,
  validateImageFile,
  compressImageForMobile,
  type CompressionOptions,
} from '@/lib/imageCompression'

describe('imageCompression', () => {
  const createMockFile = (size: number, type: string = 'image/jpeg', name: string = 'test.jpg'): File => {
    const blob = new Blob(['x'.repeat(size)], { type })
    return new File([blob], name, { type })
  }

  describe('formatFileSize', () => {
    it('returns "0 Bytes" for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
    })

    it('formats KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(2048)).toBe('2 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('formats MB correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
    })

    it('formats GB correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })

  describe('needsCompression', () => {
    it('returns true for files larger than threshold', () => {
      const file = createMockFile(2 * 1024 * 1024) // 2MB
      expect(needsCompression(file, 1)).toBe(true)
    })

    it('returns false for files smaller than threshold', () => {
      const file = createMockFile(0.5 * 1024 * 1024) // 0.5MB
      expect(needsCompression(file, 1)).toBe(false)
    })

    it('returns false for files equal to threshold', () => {
      const file = createMockFile(1 * 1024 * 1024) // 1MB
      expect(needsCompression(file, 1)).toBe(false)
    })

    it('uses custom threshold when provided', () => {
      const file = createMockFile(3 * 1024 * 1024) // 3MB
      expect(needsCompression(file, 5)).toBe(false)
      expect(needsCompression(file, 2)).toBe(true)
    })
  })

  describe('getOptimalCompressionOptions', () => {
    it('returns aggressive compression for very large files (>5MB)', () => {
      const file = createMockFile(6 * 1024 * 1024)
      const options = getOptimalCompressionOptions(file)

      expect(options.maxWidth).toBe(1024)
      expect(options.maxHeight).toBe(1024)
      expect(options.quality).toBe(0.75)
      expect(options.format).toBe('image/jpeg')
    })

    it('returns moderate compression for large files (2-5MB)', () => {
      const file = createMockFile(3 * 1024 * 1024)
      const options = getOptimalCompressionOptions(file)

      expect(options.maxWidth).toBe(1200)
      expect(options.maxHeight).toBe(1200)
      expect(options.quality).toBe(0.8)
    })

    it('returns light compression for smaller files (<2MB)', () => {
      const file = createMockFile(1 * 1024 * 1024)
      const options = getOptimalCompressionOptions(file)

      expect(options.maxWidth).toBe(1400)
      expect(options.maxHeight).toBe(1400)
      expect(options.quality).toBe(0.9)
    })
  })

  describe('validateImageFile', () => {
    it('returns valid for valid image file', () => {
      const file = createMockFile(1024, 'image/jpeg')
      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('returns invalid for non-image file', () => {
      const file = createMockFile(1024, 'application/pdf', 'test.pdf')
      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid image file')
    })

    it('returns invalid for files larger than 10MB', () => {
      const file = createMockFile(11 * 1024 * 1024, 'image/jpeg')
      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('less than 10MB')
    })

    it('returns valid for files exactly at 10MB', () => {
      const file = createMockFile(10 * 1024 * 1024, 'image/jpeg')
      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
    })
  })

  describe('compressImage', () => {
    it('compresses image with default options', async () => {
      const file = createMockFile(1024 * 1024, 'image/jpeg')
      const result = await compressImage(file)

      expect(result).toHaveProperty('dataUrl')
      expect(result).toHaveProperty('file')
      expect(result).toHaveProperty('originalSize')
      expect(result).toHaveProperty('compressedSize')
      expect(result.originalSize).toBe(file.size)
    })

    it('compresses image with custom options', async () => {
      const file = createMockFile(1024 * 1024, 'image/jpeg')
      const options: CompressionOptions = {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
        format: 'image/webp',
      }

      const result = await compressImage(file, options)

      expect(result.dataUrl).toContain('data:image/webp')
      expect(result.file.type).toBe('image/webp')
    })

    it('handles PNG format with white background', async () => {
      const file = createMockFile(1024 * 1024, 'image/png')
      const options: CompressionOptions = {
        format: 'image/jpeg',
      }

      const result = await compressImage(file, options)

      // Should fill white background for JPEG conversion
      expect(result).toBeDefined()
    })

    it('rejects when canvas context is not available', async () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null)

      const file = createMockFile(1024 * 1024)

      await expect(compressImage(file)).rejects.toThrow('Could not get canvas context')

      HTMLCanvasElement.prototype.getContext = originalGetContext
    })

    it('rejects when image fails to load', async () => {
      const originalImage = global.Image
      global.Image = jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100,
        set onerror(handler: () => void) {
          setTimeout(handler, 0)
        },
      })) as any

      const file = createMockFile(1024 * 1024)

      await expect(compressImage(file)).rejects.toThrow('Failed to load image')

      global.Image = originalImage
    })
  })

  describe('compressImageForMobile', () => {
    it('uses default options for fast connections', async () => {
      const file = createMockFile(1024 * 1024)
      const result = await compressImageForMobile(file, '4g')

      expect(result).toHaveProperty('dataUrl')
      expect(result).toHaveProperty('file')
    })

    it('uses aggressive compression for slow 2g', async () => {
      const file = createMockFile(1024 * 1024)
      const result = await compressImageForMobile(file, '2g')

      expect(result).toBeDefined()
    })

    it('uses moderate compression for 3g', async () => {
      const file = createMockFile(1024 * 1024)
      const result = await compressImageForMobile(file, '3g')

      expect(result).toBeDefined()
    })

    it('handles undefined connection type', async () => {
      const file = createMockFile(1024 * 1024)
      const result = await compressImageForMobile(file)

      expect(result).toBeDefined()
    })
  })
})
