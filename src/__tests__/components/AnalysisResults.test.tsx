import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnalysisResults from '@/components/AnalysisResults'
import { AuthProvider } from '@/components/AuthProvider'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('AnalysisResults Component', () => {
  const mockOnReset = jest.fn()

  const mockResult = {
    analysisMetadata: {
      version: '2.0',
      confidence: 'high',
      imageQuality: 'good',
      analysisTimestamp: new Date().toISOString(),
    },
    eightPrinciples: {
      exteriorInterior: { classification: 'interior', confidence: 0.85, evidence: ['Internal condition'] },
      hotCold: { classification: 'cold', confidence: 0.8, evidence: ['Pale tongue'] },
      excessDeficiency: { classification: 'deficiency', confidence: 0.9, evidence: ['Teeth marks'] },
      yinYang: { classification: 'yang', confidence: 0.75, evidence: ['Yang deficiency'] },
    },
    zangFuDiagnosis: {
      primaryOrgan: { organ: 'spleen', pathology: 'qi_deficiency', confidence: 0.92 },
      secondaryOrgans: [{ organ: 'stomach', pathology: 'yang_deficiency', confidence: 0.7 }],
    },
    patternDifferentiation: {
      primaryPattern: {
        name: 'Spleen Qi Deficiency with Dampness',
        chineseName: 'Pi Qi Xu Yu Shi',
        chineseCharacters: '脾气虚夹湿',
        confidence: 0.88,
        severity: 'moderate',
        evidence: ['Pale tongue body', 'Teeth marks on sides', 'White coating'],
        clinicalManifestations: ['Fatigue after eating', 'Poor appetite', 'Loose stools'],
      },
      secondaryPatterns: [
        {
          name: 'Mild Qi Sinking',
          chineseName: 'Qi Xia Xian',
          chineseCharacters: '气下陷',
          confidence: 0.6,
          relationshipToPrimary: 'consequence',
        },
      ],
      differentialDiagnosis: [
        { pattern: 'Spleen Yang Deficiency', rulingFactor: 'No cold signs' },
      ],
    },
    tongueExamination: {
      overallAssessment: {
        color: 'Pale pink indicating qi deficiency',
        shape: 'Swollen with teeth marks',
        moisture: 'Normal to slightly wet',
        movement: 'normal',
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
        description: 'Thin white coating evenly distributed',
      },
      body: {
        color: 'pale',
        colorConfidence: 0.88,
        shape: 'swollen',
        shapeConfidence: 0.9,
        features: [
          { type: 'teeth_marks', location: 'sides', description: 'Clear scalloped edges' },
        ],
        description: 'Swollen pale body with teeth marks',
      },
      zones: {
        tip: { description: 'Normal color', organCorrelation: 'Heart/Lungs', findings: ['Balanced'] },
        center: { description: 'Slightly pale', organCorrelation: 'Spleen/Stomach', findings: ['Digestive weakness'] },
        sides: { description: 'Teeth marks visible', organCorrelation: 'Liver/Gallbladder', findings: ['Spleen affecting liver'] },
        root: { description: 'Normal', organCorrelation: 'Kidneys/Bladder', findings: ['Kidney adequate'] },
      },
    },
    treatmentPrinciples: {
      primary: 'Tonify Spleen Qi and resolve dampness',
      secondary: ['Strengthen transformation function'],
      contraindications: ['Avoid cold foods', 'Avoid excessive mental work'],
    },
    herbalFormula: {
      recommended: {
        name: 'Si Jun Zi Tang combined with Er Chen Tang',
        chineseName: 'Si Jun Zi Tang Jia Er Chen Tang',
        chineseCharacters: '四君子汤合二陈汤',
        confidence: 0.85,
        rationale: 'Four Gentlemen tonifies spleen qi while Two Aged Herbs resolves dampness',
      },
      modifications: [
        { condition: 'If severe bloating', add: ['Sha Ren', 'Mu Xiang'], remove: [] },
      ],
      alternatives: [
        { name: 'Liu Jun Zi Tang', whenToUse: 'If nausea present' },
      ],
    },
    acupuncture: {
      primaryPoints: [
        { point: 'ST36', location: 'Below knee', technique: 'reinforcing', rationale: 'Tonifies spleen' },
        { point: 'SP6', location: 'Inner ankle', technique: 'reinforcing', rationale: 'Resolves dampness' },
      ],
      supplementaryPoints: [
        { point: 'CV12', indication: 'Digestive support' },
      ],
      moxibustion: {
        recommended: true,
        points: ['BL20', 'CV12'],
        rationale: 'Warm yang and tonify spleen',
      },
    },
    lifestyleRecommendations: {
      diet: {
        general: 'Warm, cooked, easily digestible foods',
        foodsToEmphasize: ['Congee', 'Steamed vegetables', 'Ginger', 'Pumpkin'],
        foodsToAvoid: ['Cold drinks', 'Raw vegetables', 'Dairy', 'Sugar'],
        eatingHabits: ['Regular meal times', 'Stop at 80% full'],
      },
      exercise: {
        recommendedTypes: ['Walking', 'Tai Chi', 'Qigong'],
        intensity: 'gentle',
        timing: 'Morning is best',
        cautions: ['Avoid over-exertion'],
      },
      emotionalHealth: {
        relevantEmotions: ['Worry', 'Overthinking'],
        recommendations: ['Meditation', 'Mindfulness'],
      },
      sleep: {
        recommendations: ['Early to bed', 'Avoid screens'],
        idealHours: '8 hours',
      },
      dailyRoutine: {
        morning: ['Warm water', 'Light breakfast'],
        evening: ['Light dinner', 'Early bedtime'],
      },
    },
    prognosis: {
      expectedRecoveryTime: '2-3 months with consistent treatment',
      factorsAffectingRecovery: ['Dietary compliance', 'Stress management'],
      warningSigns: ['Persistent diarrhea', 'Severe fatigue'],
    },
    followUp: {
      recommendedTimeline: 'Weekly for 4 weeks',
      expectedChanges: ['Increased energy', 'Better digestion'],
      tongueChanges: ['Teeth marks should fade', 'Color becomes pinker'],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderWithAuth = (component: React.ReactNode) => {
    return render(<AuthProvider>{component}</AuthProvider>)
  }

  describe('Header Section', () => {
    it('renders report title', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('TCM Tongue Diagnosis Report')).toBeInTheDocument()
      expect(screen.getByText(/中医舌诊报告/)).toBeInTheDocument()
    })

    it('displays analysis metadata', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('v2.0')).toBeInTheDocument()
      expect(screen.getByText('good image')).toBeInTheDocument()
      expect(screen.getByText('high confidence')).toBeInTheDocument()
    })
  })

  describe('Primary Pattern Display', () => {
    it('displays primary pattern name', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Spleen Qi Deficiency with Dampness')).toBeInTheDocument()
    })

    it('displays Chinese name and characters', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText(/Pi Qi Xu Yu Shi/)).toBeInTheDocument()
      expect(screen.getByText(/脾气虚夹湿/)).toBeInTheDocument()
    })

    it('displays confidence score', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('88% confidence')).toBeInTheDocument()
    })

    it('displays severity badge', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText(/Moderate Severity/i)).toBeInTheDocument()
    })

    it('displays evidence list', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Pale tongue body')).toBeInTheDocument()
      expect(screen.getByText('Teeth marks on sides')).toBeInTheDocument()
    })

    it('displays clinical manifestations', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Fatigue after eating')).toBeInTheDocument()
      expect(screen.getByText('Poor appetite')).toBeInTheDocument()
    })
  })

  describe('Secondary Patterns', () => {
    it('displays secondary patterns', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Mild Qi Sinking')).toBeInTheDocument()
    })
  })

  describe('Accordion Sections', () => {
    it('renders Eight Principles section', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Eight Principles (八纲)')).toBeInTheDocument()
    })

    it('renders Organ Diagnosis section', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Organ Diagnosis (脏腑)')).toBeInTheDocument()
    })

    it('renders Tongue Examination section', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Detailed Tongue Examination')).toBeInTheDocument()
    })

    it('renders Tongue Zone Map section', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Tongue Zone Map (舌分区)')).toBeInTheDocument()
    })

    it('expands accordion on click', async () => {
      const user = userEvent.setup()
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      const eightPrinciplesButton = screen.getByText('Eight Principles (八纲)')
      await user.click(eightPrinciplesButton)

      // Content should be visible
      expect(screen.getByText('Exterior/Interior')).toBeInTheDocument()
    })
  })

  describe('Tongue Zone Map', () => {
    it('renders zone buttons', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Tip')).toBeInTheDocument()
      expect(screen.getByText('Center')).toBeInTheDocument()
      expect(screen.getByText('Root')).toBeInTheDocument()
      expect(screen.getByText('Sides')).toBeInTheDocument()
    })

    it('shows zone details on click', async () => {
      const user = userEvent.setup()
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      const tipButton = screen.getByText('Tip')
      await user.click(tipButton)

      expect(screen.getByText('Normal color')).toBeInTheDocument()
    })
  })

  describe('Herbal Formula Section', () => {
    it('displays recommended formula', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Si Jun Zi Tang combined with Er Chen Tang')).toBeInTheDocument()
      expect(screen.getByText('四君子汤合二陈汤')).toBeInTheDocument()
    })

    it('displays formula rationale', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText(/Four Gentlemen tonifies spleen qi/)).toBeInTheDocument()
    })
  })

  describe('Treatment Principles', () => {
    it('displays primary treatment strategy', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Tonify Spleen Qi and resolve dampness')).toBeInTheDocument()
    })
  })

  describe('Lifestyle Recommendations', () => {
    it('displays diet recommendations', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      // Expand the lifestyle section first
      const lifestyleSection = screen.getByText('Lifestyle Recommendations')
      fireEvent.click(lifestyleSection)

      expect(screen.getByText('Congee')).toBeInTheDocument()
      expect(screen.getByText('Cold drinks')).toBeInTheDocument()
    })
  })

  describe('Prognosis Section', () => {
    it('displays expected recovery time', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      // Expand prognosis section
      const prognosisSection = screen.getByText('Prognosis & Follow-up')
      fireEvent.click(prognosisSection)

      expect(screen.getByText('2-3 months with consistent treatment')).toBeInTheDocument()
    })

    it('displays warning signs', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      const prognosisSection = screen.getByText('Prognosis & Follow-up')
      fireEvent.click(prognosisSection)

      expect(screen.getByText('Persistent diarrhea')).toBeInTheDocument()
    })
  })

  describe('Disclaimer', () => {
    it('displays medical disclaimer', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Important Medical Disclaimer')).toBeInTheDocument()
      expect(screen.getByText(/educational purposes only/)).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('displays analyze another button', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Analyze Another Photo')).toBeInTheDocument()
    })

    it('calls onReset when analyze another is clicked', async () => {
      const user = userEvent.setup()
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      const resetButton = screen.getByText('Analyze Another Photo')
      await user.click(resetButton)

      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })

    it('displays save report button', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Save Report')).toBeInTheDocument()
    })
  })

  describe('User Authentication States', () => {
    it('shows sign up prompt for unauthenticated users', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      expect(screen.getByText('Track Your Health Journey')).toBeInTheDocument()
      expect(screen.getByText('Create Free Account')).toBeInTheDocument()
    })
  })

  describe('Legacy Format Support', () => {
    it('handles legacy result format', () => {
      const legacyResult = {
        primaryPattern: 'Qi Deficiency',
        coat: 'white',
        color: 'pale',
        shape: 'normal',
        moisture: 'normal',
        recommendations: 'Rest and eat warm foods',
        recommendedFormula: 'Si Jun Zi Tang',
      }

      renderWithAuth(<AnalysisResults result={legacyResult} onReset={mockOnReset} />)

      expect(screen.getByText('Qi Deficiency')).toBeInTheDocument()
    })
  })

  describe('Confidence Badge', () => {
    it('displays green badge for high confidence', () => {
      renderWithAuth(<AnalysisResults result={mockResult} onReset={mockOnReset} />)

      const highConfidenceBadge = screen.getByText('88% confidence')
      expect(highConfidenceBadge).toHaveClass('bg-emerald-100')
    })
  })
})
