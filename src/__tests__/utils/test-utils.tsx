import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/AuthProvider'
import React, { ReactElement } from 'react'

/**
 * Custom render function that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withAuth = true, ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withAuth) {
      return <AuthProvider>{children}</AuthProvider>
    }
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Create a mock file for testing uploads
 */
export function createMockFile(
  content: string = 'test',
  name: string = 'test.jpg',
  type: string = 'image/jpeg',
  size?: number
): File {
  const blob = new Blob([content], { type })
  const file = new File([blob], name, { type })
  
  if (size !== undefined) {
    Object.defineProperty(file, 'size', { value: size })
  }
  
  return file
}

/**
 * Create a mock image data URL
 */
export function createMockImageDataUrl(format: string = 'jpeg'): string {
  return `data:image/${format};base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigD/9k=`
}

/**
 * Mock analysis result for testing
 */
export const mockAnalysisResult = {
  analysisMetadata: {
    version: '2.0',
    confidence: 'high',
    imageQuality: 'good',
    analysisTimestamp: new Date().toISOString(),
  },
  eightPrinciples: {
    exteriorInterior: { classification: 'interior', confidence: 0.85, evidence: ['test'] },
    hotCold: { classification: 'cold', confidence: 0.8, evidence: ['test'] },
    excessDeficiency: { classification: 'deficiency', confidence: 0.9, evidence: ['test'] },
    yinYang: { classification: 'yang', confidence: 0.75, evidence: ['test'] },
  },
  zangFuDiagnosis: {
    primaryOrgan: { organ: 'spleen', pathology: 'qi_deficiency', confidence: 0.92 },
    secondaryOrgans: [],
  },
  patternDifferentiation: {
    primaryPattern: {
      name: 'Spleen Qi Deficiency',
      chineseName: 'Pi Qi Xu',
      chineseCharacters: '脾气虚',
      confidence: 0.88,
      severity: 'moderate',
      evidence: ['Pale tongue', 'Teeth marks'],
      clinicalManifestations: ['Fatigue', 'Poor appetite'],
    },
    secondaryPatterns: [],
  },
  tongueExamination: {
    overallAssessment: {
      color: 'Pale',
      shape: 'Swollen',
      moisture: 'Normal',
    },
    coating: {
      color: 'white',
      colorConfidence: 0.9,
      thickness: 'thin',
      thicknessConfidence: 0.85,
      moisture: 'normal',
      moistureConfidence: 0.8,
      distribution: 'even',
      rooted: 'rooted',
      description: 'Thin white coating',
    },
    body: {
      color: 'pale',
      colorConfidence: 0.88,
      shape: 'swollen',
      shapeConfidence: 0.9,
      features: [],
      description: 'Swollen pale body',
    },
    zones: {
      tip: { description: 'Normal', organCorrelation: 'Heart/Lungs', findings: [] },
      center: { description: 'Pale', organCorrelation: 'Spleen/Stomach', findings: [] },
      sides: { description: 'Teeth marks', organCorrelation: 'Liver/Gallbladder', findings: [] },
      root: { description: 'Normal', organCorrelation: 'Kidneys/Bladder', findings: [] },
    },
  },
  treatmentPrinciples: {
    primary: 'Tonify Spleen Qi',
    secondary: ['Resolve dampness'],
    contraindications: ['Cold foods'],
  },
  herbalFormula: {
    recommended: {
      name: 'Si Jun Zi Tang',
      chineseName: 'Si Jun Zi Tang',
      chineseCharacters: '四君子汤',
      confidence: 0.85,
      rationale: 'Tonifies spleen qi',
    },
    modifications: [],
    alternatives: [],
  },
  acupuncture: {
    primaryPoints: [],
    supplementaryPoints: [],
    moxibustion: { recommended: false, points: [], rationale: '' },
  },
  lifestyleRecommendations: {
    diet: {
      general: 'Warm cooked foods',
      foodsToEmphasize: ['Congee'],
      foodsToAvoid: ['Cold drinks'],
      eatingHabits: ['Regular meals'],
    },
    exercise: {
      recommendedTypes: ['Walking'],
      intensity: 'gentle',
      timing: 'Morning',
      cautions: [],
    },
    emotionalHealth: {
      relevantEmotions: ['Worry'],
      recommendations: ['Meditation'],
    },
    sleep: {
      recommendations: ['Early bedtime'],
      idealHours: '8 hours',
    },
    dailyRoutine: {
      morning: ['Warm water'],
      evening: ['Light dinner'],
    },
  },
  prognosis: {
    expectedRecoveryTime: '2-3 months',
    factorsAffectingRecovery: ['Diet'],
    warningSigns: ['Persistent symptoms'],
  },
  followUp: {
    recommendedTimeline: 'Weekly',
    expectedChanges: ['More energy'],
    tongueChanges: ['Teeth marks fading'],
  },
}

/**
 * Mock scan status for testing
 */
export const mockScanStatus = {
  canScan: true,
  tier: 'free',
  scansToday: 0,
  scansRemaining: 3,
  message: 'Scan available',
}

/**
 * Mock subscription status for testing
 */
export const mockSubscriptionStatus = {
  tier: 'free',
  status: 'active',
  hasPremium: false,
}

/**
 * Create mock fetch implementation
 */
export function createMockFetch(responses: Record<string, any>) {
  return jest.fn((url: string, options?: any) => {
    const method = options?.method || 'GET'
    const key = `${method}:${url}`
    
    // Try exact match first
    if (responses[key]) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responses[key]),
      })
    }
    
    // Try URL only match
    if (responses[url]) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responses[url]),
      })
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    })
  })
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingToComplete(timeout: number = 5000) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

/**
 * Mock window.scrollTo
 */
export function mockScrollTo() {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  })
}

/**
 * Mock window.alert
 */
export function mockAlert() {
  const alertMock = jest.spyOn(window, 'alert').mockImplementation()
  return alertMock
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const consoleMocks = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
  }
  
  return {
    mocks: consoleMocks,
    restore: () => {
      consoleMocks.log.mockRestore()
      consoleMocks.error.mockRestore()
      consoleMocks.warn.mockRestore()
    },
  }
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
