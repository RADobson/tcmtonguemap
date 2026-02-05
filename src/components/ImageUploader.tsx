'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Camera, X, RefreshCw, ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (imageData: string, compressedFile?: File) => void
  selectedImage: string | null
  onClear: () => void
}

// Image compression utility
async function compressImage(
  file: File, 
  maxWidth: number = 1200, 
  maxHeight: number = 1200, 
  quality: number = 0.85
): Promise<{ dataUrl: string; compressedFile: File }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      let { width, height } = img
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      // Use better quality rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to data URL with compression
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      
      // Convert back to File for potential upload
      const byteString = atob(dataUrl.split(',')[1])
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      
      const compressedFile = new File([ab], file.name, { type: mimeString })
      
      resolve({ dataUrl, compressedFile })
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageUploader({ onImageSelect, selectedImage, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB')
      return
    }

    try {
      const { dataUrl } = await compressImage(file, 1200, 1200, 0.85)
      onImageSelect(dataUrl)
    } catch (error) {
      console.error('Image compression failed:', error)
      // Fallback to original file
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageSelect(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    try {
      const { dataUrl } = await compressImage(file, 1200, 1200, 0.85)
      onImageSelect(dataUrl)
    } catch (error) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageSelect(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      })
      setStream(mediaStream)
      setShowCamera(true)
      
      // Small delay to ensure video element is mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraError('Unable to access camera. Please check permissions or upload a photo instead.')
      // Fallback to file input with camera attribute
      cameraInputRef.current?.click()
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(video, 0, 0)
    
    // Compress the captured image
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onImageSelect(dataUrl)
    stopCamera()
  }, [onImageSelect, stopCamera])

  // Show captured image preview
  if (selectedImage) {
    return (
      <div className="w-full">
        <div className="relative aspect-[4/3] max-h-[60vh] overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
          <img
            src={selectedImage}
            alt="Tongue preview"
            className="w-full h-full object-contain"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors touch-manipulation"
            aria-label="Remove image"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ImageIcon size={16} />
          <span>Image ready for analysis</span>
        </div>
      </div>
    )
  }

  // Show camera interface
  if (showCamera) {
    return (
      <div className="w-full">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={stopCamera}
                className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors touch-manipulation"
                aria-label="Cancel"
              >
                <X size={24} />
              </button>
              <button
                onClick={capturePhoto}
                className="p-4 bg-white text-gray-900 rounded-full shadow-lg active:scale-95 transition-transform touch-manipulation"
                aria-label="Take photo"
              >
                <div className="w-12 h-12 border-4 border-gray-900 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Error message */}
      {cameraError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          {cameraError}
        </div>
      )}

      {/* Drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative p-8 sm:p-12 border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-200 ease-out
          ${isDragging 
            ? 'border-tcm-green bg-tcm-green/5 scale-[1.02]' 
            : 'border-gray-300 hover:border-tcm-green hover:bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-tcm-green/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-tcm-green" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragging ? 'Drop your image here' : 'Tap to upload a photo'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Camera button - prominent on mobile */}
      <button
        onClick={startCamera}
        className="w-full py-4 px-6 bg-tcm-green text-white rounded-xl font-semibold text-lg 
                   hover:bg-tcm-green-dark active:scale-[0.98] transition-all duration-200
                   flex items-center justify-center gap-3 shadow-md hover:shadow-lg
                   min-h-[56px] touch-manipulation"
      >
        <Camera size={24} />
        <span>Take Photo</span>
      </button>

      {/* Tips for best results */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <ImageIcon size={16} />
          Tips for best results:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use natural daylight if possible</li>
          <li>Stick your tongue out fully</li>
          <li>Keep the camera steady and in focus</li>
          <li>Capture the entire tongue surface</li>
        </ul>
      </div>
    </div>
  )
}
