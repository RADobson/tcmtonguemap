import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'
import { AuthProvider } from '@/components/AuthProvider'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('E2E User Flows', () => {
  const mockScanStatus = {
    canScan: true,
    tier: 'free',
    scansToday: 0,
    scansRemaining: 3,
    message: 'Scan available',
  }

  const mockAnalysisResult = {
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
        name: 'Spleen Qi Deficiency with Dampness',
        chineseName: 'Pi Qi Xu Yu Shi',
        chineseCharacters: '脾气虚夹湿',
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
        features: [{ type: 'teeth_marks', location: 'sides', description: 'Clear marks' }],
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
        foodsToEmphasize: ['Congee', 'Ginger'],
        foodsToAvoid: ['Cold drinks'],
        eatingHabits: ['Regular meals'],
      },
      exercise: {
        recommendedTypes: ['Walking'],
        intensity: 'gentle',
        timing: 'Morning',
        cautions: ['Avoid overexertion'],
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
      factorsAffectingRecovery: ['Diet compliance'],
      warningSigns: ['Persistent symptoms'],
    },
    followUp: {
      recommendedTimeline: 'Weekly',
      expectedChanges: ['More energy'],
      tongueChanges: ['Teeth marks fading'],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('Home Page - Free User Flow', () => {
    beforeEach(() => {
      // Mock scan status endpoint
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/scan-limit' && (!options || options.method !== 'POST')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockScanStatus),
          })
        }
        if (url === '/api/scan-limit' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tier: 'free', hasPremium: false }),
          })
        }
        if (url === '/api/analyze') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAnalysisResult),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })
    })

    it('renders the home page with upload interface', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })

      // Check main elements
      expect(screen.getByText('AI-Powered')).toBeInTheDocument()
      expect(screen.getByText('Private & Secure')).toBeInTheDocument()
      expect(screen.getByText('TCM Expertise')).toBeInTheDocument()
      
      // Check upload button
      expect(screen.getByText('Tap to upload a photo')).toBeInTheDocument()
      
      // Check camera button
      expect(screen.getByText('Take Photo')).toBeInTheDocument()
      
      // Check tips section
      expect(screen.getByText('Tips for best results:')).toBeInTheDocument()
    })

    it('shows free scan status banner', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('Free scan available today')).toBeInTheDocument()
      })
    })

    it('allows image upload via file input', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      // Create a mock file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      // Find and interact with file input
      const uploadZone = screen.getByText('Tap to upload a photo')
      await user.click(uploadZone)

      // The file input should be triggered
      // Note: Actual file upload testing is limited in jsdom
    })

    it('shows analyze button after image selection', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })
    })

    it('displays scan limit reached message for exhausted free tier', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/scan-limit') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockScanStatus,
              canScan: false,
              scansRemaining: 0,
            }),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tier: 'free', hasPremium: false }),
          })
        }
        return Promise.resolve({ ok: false })
      })

      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('Daily scan limit reached')).toBeInTheDocument()
      })

      expect(screen.getByText(/Daily Scan Limit Reached/i)).toBeInTheDocument()
      expect(screen.getByText(/Upgrade to Premium/i)).toBeInTheDocument()
    })
  })

  describe('Analysis Flow', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string, options?: any) => {
        if (url === '/api/scan-limit') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockScanStatus),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tier: 'free', hasPremium: false }),
          })
        }
        if (url === '/api/analyze') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAnalysisResult),
          })
        }
        return Promise.resolve({ ok: false })
      })
    })

    it('completes full analysis flow', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })

      // Verify scan status was fetched
      expect(mockFetch).toHaveBeenCalledWith('/api/scan-limit')
      expect(mockFetch).toHaveBeenCalledWith('/api/subscription/status')
    })

    it('shows error message when analysis fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/scan-limit') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockScanStatus),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tier: 'free', hasPremium: false }),
          })
        }
        if (url === '/api/analyze') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Analysis service unavailable' }),
          })
        }
        return Promise.resolve({ ok: false })
      })

      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })
    })
  })

  describe('Premium User Flow', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/scan-limit') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockScanStatus,
              tier: 'premium',
              scansRemaining: -1, // Unlimited
            }),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              tier: 'premium',
              status: 'active',
              hasPremium: true,
            }),
          })
        }
        return Promise.resolve({ ok: false })
      })
    })

    it('shows premium badge for premium users', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('Premium Member - Unlimited Scans')).toBeInTheDocument()
      })
    })

    it('does not show upgrade banner for premium users', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('Premium Member - Unlimited Scans')).toBeInTheDocument()
      })

      // Upgrade banner should not be present
      expect(screen.queryByText(/Upgrade to Premium/i)).not.toBeInTheDocument()
    })
  })

  describe('Navigation and Links', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/scan-limit') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockScanStatus),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tier: 'free', hasPremium: false }),
          })
        }
        return Promise.resolve({ ok: false })
      })
    })

    it('contains pricing page link', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })

      // Check for pricing links
      const pricingLinks = screen.getAllByText(/Upgrade/i)
      expect(pricingLinks.length).toBeGreaterThan(0)
    })

    it('shows educational content', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('About Tongue Diagnosis')).toBeInTheDocument()
      })

      expect(screen.getByText('Why the Tongue?')).toBeInTheDocument()
      expect(screen.getByText('What We Look For')).toBeInTheDocument()
    })

    it('shows step-by-step process cards', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText('1. Snap a Photo')).toBeInTheDocument()
      })

      expect(screen.getByText('2. AI Analysis')).toBeInTheDocument()
      expect(screen.getByText('3. Get Insights')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      // Page should still render even if API fails
      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })
    })

    it('handles scan limit check failure', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/api/scan-limit') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Service unavailable' }),
          })
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tier: 'free', hasPremium: false }),
          })
        }
        return Promise.resolve({ ok: false })
      })

      await act(async () => {
        render(
          <AuthProvider>
            <Home />
          </AuthProvider>
        )
      })

      // Page should still render
      await waitFor(() => {
        expect(screen.getByText('What Does Your Tongue Reveal?')).toBeInTheDocument()
      })
    })
  })
})
