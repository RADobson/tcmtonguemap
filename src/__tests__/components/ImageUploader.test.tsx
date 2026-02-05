import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUploader from '@/components/ImageUploader'

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

describe('ImageUploader Component', () => {
  const mockOnImageSelect = jest.fn()
  const mockOnClear = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('renders upload zone when no image is selected', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Tap to upload a photo')).toBeInTheDocument()
      expect(screen.getByText('JPG, PNG up to 10MB')).toBeInTheDocument()
    })

    it('renders camera button', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Take Photo')).toBeInTheDocument()
    })

    it('renders tips for best results', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Tips for best results:')).toBeInTheDocument()
      expect(screen.getByText('Use natural daylight if possible')).toBeInTheDocument()
      expect(screen.getByText('Stick your tongue out fully')).toBeInTheDocument()
      expect(screen.getByText('Keep the camera steady and in focus')).toBeInTheDocument()
      expect(screen.getByText('Capture the entire tongue surface')).toBeInTheDocument()
    })
  })

  describe('Image Preview', () => {
    it('displays image preview when image is selected', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage="data:image/jpeg;base64,mockimage"
          onClear={mockOnClear}
        />
      )

      const image = screen.getByAltText('Tongue preview')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,mockimage')
    })

    it('shows clear button when image is selected', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage="data:image/jpeg;base64,mockimage"
          onClear={mockOnClear}
        />
      )

      const clearButton = screen.getByLabelText('Remove image')
      expect(clearButton).toBeInTheDocument()
    })

    it('calls onClear when clear button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage="data:image/jpeg;base64,mockimage"
          onClear={mockOnClear}
        />
      )

      const clearButton = screen.getByLabelText('Remove image')
      await user.click(clearButton)

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('shows image ready message', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage="data:image/jpeg;base64,mockimage"
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Image ready for analysis')).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    it('updates UI during drag over', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const uploadZone = screen.getByText('Tap to upload a photo').closest('div')
      expect(uploadZone).toBeInTheDocument()

      fireEvent.dragOver(uploadZone!, {
        preventDefault: jest.fn(),
      })

      expect(screen.getByText('Drop your image here')).toBeInTheDocument()
    })

    it('reverts UI on drag leave', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const uploadZone = screen.getByText('Tap to upload a photo').closest('div')

      // Trigger drag over
      fireEvent.dragOver(uploadZone!, {
        preventDefault: jest.fn(),
      })

      expect(screen.getByText('Drop your image here')).toBeInTheDocument()

      // Trigger drag leave
      fireEvent.dragLeave(uploadZone!, {
        preventDefault: jest.fn(),
      })

      expect(screen.getByText('Tap to upload a photo')).toBeInTheDocument()
    })

    it('handles file drop', async () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const uploadZone = screen.getByText('Tap to upload a photo').closest('div')
      
      const file = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' })
      
      fireEvent.drop(uploadZone!, {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: [file],
        },
      })

      // Wait for compression and callback
      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('ignores non-image files on drop', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const uploadZone = screen.getByText('Tap to upload a photo').closest('div')
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      fireEvent.drop(uploadZone!, {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: [file],
        },
      })

      // onImageSelect should NOT be called for non-image files
      expect(mockOnImageSelect).not.toHaveBeenCalled()
    })
  })

  describe('File Input', () => {
    it('triggers file input on upload zone click', async () => {
      const user = userEvent.setup()
      
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const uploadZone = screen.getByText('Tap to upload a photo')
      
      // Click should trigger file input
      await user.click(uploadZone)
      
      // File input should exist
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
    })

    it('handles file selection via input', async () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      fireEvent.change(fileInput, {
        target: { files: [file] },
      })

      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('validates file type', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation()
      
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      fireEvent.change(fileInput, {
        target: { files: [file] },
      })

      expect(alertMock).toHaveBeenCalledWith('Please select an image file')
      expect(mockOnImageSelect).not.toHaveBeenCalled()

      alertMock.mockRestore()
    })

    it('validates file size (max 10MB)', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation()
      
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement

      // Create a large file mock
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })
      
      fireEvent.change(fileInput, {
        target: { files: [largeFile] },
      })

      expect(alertMock).toHaveBeenCalledWith('Image size should be less than 10MB')
      expect(mockOnImageSelect).not.toHaveBeenCalled()

      alertMock.mockRestore()
    })
  })

  describe('Camera Functionality', () => {
    it('attempts to start camera when Take Photo is clicked', async () => {
      const user = userEvent.setup()
      const mockGetUserMedia = jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      })
      navigator.mediaDevices.getUserMedia = mockGetUserMedia

      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const cameraButton = screen.getByText('Take Photo')
      await user.click(cameraButton)

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: expect.objectContaining({
          facingMode: 'environment',
        }),
        audio: false,
      })
    })

    it('shows error message when camera access fails', async () => {
      const user = userEvent.setup()
      const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Camera access denied'))
      navigator.mediaDevices.getUserMedia = mockGetUserMedia

      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const cameraButton = screen.getByText('Take Photo')
      await user.click(cameraButton)

      await waitFor(() => {
        expect(screen.getByText(/Unable to access camera/)).toBeInTheDocument()
      })
    })

    it('provides fallback file input on camera error', async () => {
      const user = userEvent.setup()
      const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Camera access denied'))
      navigator.mediaDevices.getUserMedia = mockGetUserMedia

      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      const cameraButton = screen.getByText('Take Photo')
      await user.click(cameraButton)

      // Should have camera capture input as fallback
      const cameraInput = document.querySelector('input[capture="environment"]')
      expect(cameraInput).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage={null}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Take Photo')).toBeInTheDocument()
    })

    it('clear button has accessible label', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage="data:image/jpeg;base64,mockimage"
          onClear={mockOnClear}
        />
      )

      expect(screen.getByLabelText('Remove image')).toBeInTheDocument()
    })

    it('image preview has alt text', () => {
      render(
        <ImageUploader
          onImageSelect={mockOnImageSelect}
          selectedImage="data:image/jpeg;base64,mockimage"
          onClear={mockOnClear}
        />
      )

      expect(screen.getByAltText('Tongue preview')).toBeInTheDocument()
    })
  })
})
