import { POST as analyzePOST } from '@/app/api/analyze/route'
import { GET as scanLimitGET, POST as scanLimitPOST } from '@/app/api/scan-limit/route'

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'

describe('API Routes - Integration Tests', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  describe('POST /api/analyze', () => {
    it('returns error when no image provided', async () => {
      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No image provided')
    })

    it('returns mock data when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY

      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,mockimage' }),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('analysisMetadata')
      expect(data).toHaveProperty('eightPrinciples')
      expect(data).toHaveProperty('patternDifferentiation')
      expect(data).toHaveProperty('tongueExamination')
    })

    it('returns mock data with valid structure', async () => {
      delete process.env.OPENAI_API_KEY

      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,mockimage' }),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      // Verify structure matches expected response format
      expect(data.analysisMetadata).toMatchObject({
        version: '2.0',
        confidence: expect.any(String),
        imageQuality: expect.any(String),
        analysisTimestamp: expect.any(String),
      })

      expect(data.eightPrinciples).toMatchObject({
        exteriorInterior: expect.objectContaining({
          classification: expect.any(String),
          confidence: expect.any(Number),
          evidence: expect.any(Array),
        }),
        hotCold: expect.any(Object),
        excessDeficiency: expect.any(Object),
        yinYang: expect.any(Object),
      })

      expect(data.patternDifferentiation.primaryPattern).toMatchObject({
        name: expect.any(String),
        chineseName: expect.any(String),
        chineseCharacters: expect.any(String),
        confidence: expect.any(Number),
        severity: expect.any(String),
        evidence: expect.any(Array),
        clinicalManifestations: expect.any(Array),
      })

      expect(data.tongueExamination).toMatchObject({
        overallAssessment: expect.any(Object),
        coating: expect.any(Object),
        body: expect.any(Object),
        zones: expect.any(Object),
      })

      expect(data.treatmentPrinciples).toMatchObject({
        primary: expect.any(String),
        secondary: expect.any(Array),
        contraindications: expect.any(Array),
      })

      expect(data.herbalFormula.recommended).toMatchObject({
        name: expect.any(String),
        chineseName: expect.any(String),
        chineseCharacters: expect.any(String),
        confidence: expect.any(Number),
        rationale: expect.any(String),
      })
    })

    it('calls OpenAI when API key is set', async () => {
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              analysisMetadata: { confidence: 'high', imageQuality: 'good' },
              patternDifferentiation: {
                primaryPattern: {
                  name: 'Test Pattern',
                  chineseName: '测试',
                  chineseCharacters: '测试',
                  confidence: 0.9,
                  severity: 'mild',
                  evidence: ['evidence1'],
                  clinicalManifestations: ['symptom1'],
                },
              },
            }),
          },
        }],
      }

      const OpenAI = (await import('openai')).default
      const mockCreate = jest.fn().mockResolvedValue(mockOpenAIResponse)
      ;(OpenAI as jest.Mock).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      }))

      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,mockimage' }),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalled()
      expect(data.analysisMetadata.model).toBe('gpt-4o')
    })

    it('handles OpenAI API errors', async () => {
      const OpenAI = (await import('openai')).default
      ;(OpenAI as jest.Mock).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('OpenAI API error')),
          },
        },
      }))

      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,mockimage' }),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Analysis failed')
    })

    it('handles invalid JSON from OpenAI', async () => {
      const OpenAI = (await import('openai')).default
      ;(OpenAI as jest.Mock).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: 'invalid json',
                },
              }],
            }),
          },
        },
      }))

      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,mockimage' }),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Invalid analysis format')
    })

    it('handles empty OpenAI response', async () => {
      const OpenAI = (await import('openai')).default
      ;(OpenAI as jest.Mock).mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [],
            }),
          },
        },
      }))

      const request = new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,mockimage' }),
      })

      const response = await analyzePOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Analysis failed')
    })
  })

  describe('GET /api/scan-limit', () => {
    it('returns anonymous user scan status when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = new Request('http://localhost/api/scan-limit')
      const response = await scanLimitGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        canScan: true,
        tier: 'anonymous',
        scansToday: 0,
        scansRemaining: 1,
        message: 'Anonymous user - limited scan available',
      })
    })

    it('returns scan status for authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: [{
          can_scan: true,
          tier: 'free',
          scans_today: 0,
          scans_remaining: 3,
          max_daily_scans: 3,
        }],
        error: null,
      })

      const request = new Request('http://localhost/api/scan-limit')
      const response = await scanLimitGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('can_user_scan', {
        p_user_id: 'user123',
      })
      expect(data).toEqual({
        can_scan: true,
        tier: 'free',
        scans_today: 0,
        scans_remaining: 3,
        max_daily_scans: 3,
      })
    })

    it('handles database error gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      })

      const request = new Request('http://localhost/api/scan-limit')
      const response = await scanLimitGET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to check scan availability')
    })
  })

  describe('POST /api/scan-limit', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = new Request('http://localhost/api/scan-limit', {
        method: 'POST',
      })
      const response = await scanLimitPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('records scan for authenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: [{
          success: true,
          scans_remaining: 2,
        }],
        error: null,
      })

      const request = new Request('http://localhost/api/scan-limit', {
        method: 'POST',
      })
      const response = await scanLimitPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('record_scan', {
        p_user_id: 'user123',
      })
      expect(data).toEqual({
        success: true,
        scans_remaining: 2,
      })
    })

    it('handles database error when recording scan', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      })

      const request = new Request('http://localhost/api/scan-limit', {
        method: 'POST',
      })
      const response = await scanLimitPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to record scan')
    })
  })
})
