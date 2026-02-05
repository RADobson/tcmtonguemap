import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Headers(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(),
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(),
} as any

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillStyle: '',
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
})) as any

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,mockdata')

// Mock Image
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 100
  height = 100

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

global.Image = MockImage as any

// Mock FileReader
class MockFileReader {
  onloadend: (() => void) | null = null
  result: string | ArrayBuffer | null = null

  readAsDataURL(file: File) {
    this.result = 'data:image/jpeg;base64,mockdata'
    setTimeout(() => {
      if (this.onloadend) this.onloadend()
    }, 0)
  }

  readAsText(file: File) {
    this.result = 'mock text content'
    setTimeout(() => {
      if (this.onloadend) this.onloadend()
    }, 0)
  }
}

global.FileReader = MockFileReader as any

// Mock fetch
global.fetch = jest.fn()

// Suppress console errors during tests
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: act'))
  ) {
    return
  }
  originalConsoleError(...args)
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
