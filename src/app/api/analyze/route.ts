import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set, returning mock data for development')
      // Return mock data for development/testing
      return NextResponse.json({
        primaryPattern: 'Spleen Qi Deficiency with Dampness',
        secondaryPatterns: ['Liver Qi Stagnation', 'Mild Blood Deficiency'],
        coat: 'White, slightly thick coating indicating dampness accumulation in the middle burner',
        color: 'Pale pink with slightly swollen appearance, indicating qi deficiency',
        shape: 'Mild teeth marks on sides, slightly swollen body, indicating spleen qi deficiency with dampness retention',
        moisture: 'Normal moisture level, neither too dry nor excessively wet',
        recommendations: 'Focus on strengthening digestion with warm, cooked foods. Avoid cold drinks and raw vegetables. Regular meal times are essential. Practice gentle exercise like tai chi or walking to support spleen function. Manage stress as it affects liver qi, which in turn impacts digestion.',
        recommendedFormula: 'Si Jun Zi Tang combined with Er Chen Tang (Four Gentlemen plus Two Aged Herbs)',
        severity: 'moderate',
        tongueZones: {
          tip: 'Normal color, indicating heart function is relatively balanced',
          center: 'Thick white coating present, indicating spleen/stomach dampness',
          root: 'Normal appearance, suggesting kidney essence is adequate',
          sides: 'Teeth marks visible, indicating liver/spleen disharmony with qi stagnation'
        }
      })
    }

    // Dynamic import OpenAI to avoid build-time initialization
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey })

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Traditional Chinese Medicine (TCM) practitioner specializing in tongue diagnosis (舌诊 - She Zhen).

Analyze the tongue image thoroughly and provide a comprehensive TCM diagnosis.

TONGUE ZONES AND THEIR ORGAN CORRELATIONS:
- Tip (front 1/3): Heart and Lungs - reflects emotional state, cardiovascular health
- Center (middle 1/3): Spleen and Stomach - reflects digestive health
- Root (back 1/3): Kidneys - reflects kidney essence, reproductive health, vitality
- Sides (left and right edges): Liver and Gallbladder - reflects liver function, stress levels

ANALYSIS CATEGORIES:
1. Tongue Coat (苔 - Tai): Color, thickness, distribution, moisture
   - White = cold or normal
   - Yellow = heat
   - Gray/Black = severe heat or cold
   - Thick = excess/dampness
   - Thin = normal or deficiency
   - No coat = yin deficiency

2. Body Color (质 - Zhi):
   - Pale = qi/blood deficiency
   - Red = heat
   - Purple = blood stasis or cold
   - Blue = severe cold or stagnation

3. Shape:
   - Swollen = fluid retention, spleen deficiency
   - Thin = blood/yin deficiency
   - Teeth marks = spleen qi deficiency with dampness
   - Cracks = yin deficiency, chronic dryness

4. Moisture:
   - Normal = balanced
   - Excessive wet = yang deficiency, dampness
   - Dry = heat or yin deficiency

SEVERITY ASSESSMENT:
- Mild: Minor variations from normal, early stage patterns
- Moderate: Clear pattern present, some symptoms likely
- Significant: Strong pattern manifestation, health concerns present

Provide your analysis in this exact JSON format:
{
  "primaryPattern": "Main TCM pattern (choose from known patterns or describe)",
  "secondaryPatterns": ["Array of 1-3 secondary patterns observed"],
  "coat": "Detailed description of tongue coating with TCM significance",
  "color": "Detailed description of tongue body color with TCM significance",
  "shape": "Detailed description of tongue shape with TCM significance",
  "moisture": "Detailed description of moisture level with TCM significance",
  "recommendations": "Comprehensive wellness recommendations based on TCM principles including diet, lifestyle, and habits",
  "recommendedFormula": "Specific TCM herbal formula name",
  "severity": "mild|moderate|significant",
  "tongueZones": {
    "tip": "Description of heart/lung zone",
    "center": "Description of spleen/stomach zone", 
    "root": "Description of kidney zone",
    "sides": "Description of liver/gallbladder zones"
  }
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this tongue image according to Traditional Chinese Medicine diagnostic principles. Provide a comprehensive analysis including all zones, patterns, severity assessment, and specific herbal formula recommendations.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const analysis = response.choices[0]?.message?.content
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }

    const parsedAnalysis = JSON.parse(analysis)

    // Ensure all required fields are present
    const enrichedAnalysis = {
      primaryPattern: parsedAnalysis.primaryPattern || 'Qi Deficiency Pattern',
      secondaryPatterns: parsedAnalysis.secondaryPatterns || [],
      coat: parsedAnalysis.coat || 'Analysis of coating not available',
      color: parsedAnalysis.color || 'Analysis of color not available',
      shape: parsedAnalysis.shape || 'Analysis of shape not available',
      moisture: parsedAnalysis.moisture || 'Analysis of moisture not available',
      recommendations: parsedAnalysis.recommendations || 'Consult a licensed TCM practitioner for personalized recommendations.',
      recommendedFormula: parsedAnalysis.recommendedFormula || 'Consult practitioner for formula recommendation',
      severity: parsedAnalysis.severity || 'mild',
      tongueZones: parsedAnalysis.tongueZones || {
        tip: 'Heart/Lung zone analysis',
        center: 'Spleen/Stomach zone analysis',
        root: 'Kidney zone analysis',
        sides: 'Liver/Gallbladder zone analysis'
      }
    }

    return NextResponse.json(enrichedAnalysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
