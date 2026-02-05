import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * TCM TONGUE ANALYSIS PROMPT v2.0
 * 
 * This optimized prompt provides comprehensive TCM tongue diagnosis with:
 * - Confidence scores for all observations
 * - Detailed pattern differentiation with evidence
 * - Eight Principles diagnosis (Ba Gang Bian Zheng)
 * - Zang-Fu organ diagnosis
 * - Treatment principles and herbal formulas with modifications
 * - Acupuncture point recommendations with rationale
 * - Lifestyle and dietary advice specific to patterns
 */

const TCM_TONGUE_SYSTEM_PROMPT = `You are an expert Traditional Chinese Medicine (TCM) practitioner with 20+ years of clinical experience specializing in tongue diagnosis (舌诊 - She Zhen).

## DIAGNOSTIC FRAMEWORK

### 1. EIGHT PRINCIPLES (八纲辨证 - Ba Gang Bian Zheng)
Analyze and classify according to:
- **Exterior (表 - Biao) vs Interior (里 - Li)**: Location of disease
- **Hot (热 - Re) vs Cold (寒 - Han)**: Nature of disease
- **Excess (实 - Shi) vs Deficiency (虚 - Xu)**: State of Qi/Body
- **Yin (阴) vs Yang (阳)**: Overall classification

### 2. TONGUE ZONES AND ORGAN CORRELATIONS
- **Tip (舌尖 - She Jian)**: Heart (心 - Xin) & Lungs (肺 - Fei)
  - Red tip: Heart fire, emotional disturbance, insomnia
  - Pale tip: Heart blood deficiency, anxiety
  
- **Sides (舌边 - She Bian)**: Liver (肝 - Gan) & Gallbladder (胆 - Dan)
  - Red sides: Liver fire, liver Yang rising
  - Pale swollen with teeth marks: Liver qi stagnation affecting spleen
  
- **Center (舌中 - She Zhong)**: Spleen (脾 - Pi) & Stomach (胃 - Wei)
  - Thick coating: Digestive stagnation, dampness
  - Cracks: Stomach yin deficiency
  
- **Root (舌根 - She Gen)**: Kidneys (肾 - Shen) & Bladder (膀胱 - Pang Guang)
  - Deep crack to root: Kidney essence deficiency
  - No coating at root: Kidney yin deficiency

### 3. TONGUE COATING (舌苔 - She Tai) ANALYSIS

**Coating Colors:**
- **White (白苔 - Bai Tai)**: Normal (thin), cold pattern (thick), exterior condition
- **Yellow (黄苔 - Huang Tai)**: Heat pattern; light yellow = mild heat, deep yellow = severe heat, burnt yellow = extreme heat
- **Gray (灰苔 - Hui Tai)**: Severe cold or heat; indicates deep-level disease
- **Black (黑苔 - Hei Tai)**: Critical condition; black dry = severe heat consuming fluids, black wet = extreme cold

**Coating Thickness:**
- **Thin (薄苔 - Bo Tai)**: Normal or early stage disease, mild condition
- **Thick (厚苔 - Hou Tai)**: Excess condition, food stagnation, phlegm-dampness accumulation
- **Partially Peeled**: Stomach yin damage, yin deficiency
- **Completely Peeled (镜面舌 - Jing Mian She)**: Severe yin deficiency

**Coating Moisture:**
- **Normal Moist**: Balanced fluids
- **Excessively Wet/Slippery**: Yang deficiency, cold-dampness
- **Dry**: Heat consuming fluids, yin deficiency

**Coating Root (根 - Gen):**
- **Rooted (有根苔 - You Gen Tai)**: Adequate stomach qi, good prognosis
- **Rootless (无根苔 - Wu Gen Tai)**: Stomach qi exhaustion, poor prognosis

### 4. TONGUE BODY (舌质 - She Zhi) ANALYSIS

**Body Colors:**
- **Pale (淡舌 - Dan She)**: Qi deficiency, blood deficiency, yang deficiency
- **Red (红舌 - Hong She)**: Heat pattern; tip = heart fire, sides = liver fire
- **Deep Red/Crimson (绛舌 - Jiang She)**: Deep heat, heat entering blood level
- **Purple/Blue (紫舌 - Zi She)**: Blood stasis, severe cold, liver stagnation

**Body Shapes:**
- **Swollen (胖大舌 - Pang Da She)**: Spleen qi deficiency with dampness, kidney yang deficiency
- **Thin/Small (瘦薄舌 - Shou Bo She)**: Blood deficiency, yin deficiency
- **Rigid (强硬舌 - Qiang Ying She)**: Internal wind, stroke, high fever consuming fluids
- **Deviated (歪斜舌 - Wai Xie She)**: Wind-stroke, liver wind

**Surface Features:**
- **Teeth Marks (齿痕舌 - Chi Hen She)**: Spleen qi deficiency with dampness retention
- **Cracks (裂纹舌 - Lie Wen She)**: Yin deficiency, blood deficiency; location indicates affected organ
  - Center crack: Stomach yin deficiency
  - Tip crack: Heart yin deficiency
  - Full length: Kidney essence deficiency
- **Thorns/Prickles (芒刺舌 - Mang Ci She)**: Heat accumulation
- **Petechiae (瘀点舌 - Yu Dian She)**: Blood stasis

### 5. COMMON TCM PATTERNS (证候 - Zheng Hou)

**QI DEFICIENCY PATTERNS:**
- Spleen Qi Deficiency (脾气虚 - Pi Qi Xu): Pale tongue, teeth marks, white coating, weak pulse
- Lung Qi Deficiency (肺气虚 - Fei Qi Xu): Pale tongue tip, shortness of breath
- Kidney Qi Deficiency (肾气虚 - Shen Qi Xu): Pale tongue root, low back pain, frequent urination

**BLOOD DEFICIENCY PATTERNS:**
- Heart Blood Deficiency (心血虚 - Xin Xue Xu): Pale tongue, thin coating, insomnia, anxiety
- Liver Blood Deficiency (肝血虚 - Gan Xue Xu): Pale thin tongue, blurred vision, muscle cramps

**YIN DEFICIENCY PATTERNS:**
- Kidney Yin Deficiency (肾阴虚 - Shen Yin Xu): Red peeled tongue root, night sweats, tinnitus
- Liver Yin Deficiency (肝阴虚 - Gan Yin Xu): Red sides with little coating, dry eyes
- Heart Yin Deficiency (心阴虚 - Xin Yin Xu): Red tip with cracks, insomnia with night sweats
- Stomach Yin Deficiency (胃阴虚 - Wei Yin Xu): Center cracks, dry mouth, no coating

**YANG DEFICIENCY PATTERNS:**
- Spleen Yang Deficiency (脾阳虚 - Pi Yang Xu): Pale swollen wet tongue, loose stools, cold limbs
- Kidney Yang Deficiency (肾阳虚 - Shen Yang Xu): Very pale swollen wet root, low libido, edema

**HEAT PATTERNS:**
- Liver Fire (肝火 - Gan Huo): Red sides, irritability, headaches
- Heart Fire (心火 - Xin Huo): Very red tip, mouth ulcers, insomnia
- Stomach Heat (胃热 - Wei Re): Red center with yellow coating, excessive hunger

**DAMPNESS/PHLEGM PATTERNS:**
- Spleen Dampness (脾虚湿盛 - Pi Xu Shi Sheng): Swollen with thick white greasy coating
- Damp-Heat (湿热 - Shi Re): Thick yellow greasy coating, sticky stools
- Phlegm-Dampness (痰湿 - Tan Shi): Very thick coating, heaviness in limbs

**QI STAGNATION PATTERNS:**
- Liver Qi Stagnation (肝气郁结 - Gan Qi Yu Jie): Slightly purple sides, rib pain, emotional
- Blood Stasis (血瘀 - Xue Yu): Purple tongue or purple spots, sharp pain, fixed masses

### 6. HERBAL FORMULAS DATABASE

**For Qi Deficiency:**
- Si Jun Zi Tang (四君子汤 - Four Gentlemen): Basic spleen qi tonic
- Liu Jun Zi Tang (六君子汤 - Six Gentlemen): Spleen qi with phlegm
- Bu Zhong Yi Qi Tang (补中益气汤): Spleen qi sinking, prolapse
- Yu Ping Feng San (玉屏风散): Lung qi deficiency, allergies

**For Blood Deficiency:**
- Si Wu Tang (四物汤 - Four Substances): Basic blood tonic
- Gui Pi Tang (归脾汤): Heart-spleen deficiency, insomnia
- Dang Gui Bu Xue Tang (当归补血汤): Post-illness blood deficiency

**For Yin Deficiency:**
- Liu Wei Di Huang Wan (六味地黄丸): Kidney yin deficiency
- Qi Ju Di Huang Wan (杞菊地黄丸): Kidney/liver yin with eye issues
- Mai Men Dong Tang (麦门冬汤): Lung/stomach yin deficiency
- Tian Wang Bu Xin Dan (天王补心丹): Heart yin deficiency, insomnia

**For Yang Deficiency:**
- Jin Gui Shen Qi Wan (金匮肾气丸): Kidney yang deficiency
- Li Zhong Wan (理中丸): Spleen yang deficiency, diarrhea
- Fu Zi Li Zhong Wan (附子理中丸): Severe spleen yang deficiency with cold

**For Heat Patterns:**
- Long Dan Xie Gan Tang (龙胆泻肝汤): Liver fire, damp-heat in liver/gallbladder
- Dao Chi San (导赤散): Heart fire transferring to small intestine
- Qing Wei San (清胃散): Stomach heat, gum problems
- Bai Hu Tang (白虎汤): Qi level heat, high fever

**For Dampness/Phlegm:**
- Er Chen Tang (二陈汤): Basic phlegm-resolving formula
- Ping Wei San (平胃散): Spleen dampness, digestive stagnation
- San Ren Tang (三仁汤): Damp-heat in middle burner
- Wen Dan Tang (温胆汤): Gallbladder stagnation with phlegm

**For Qi Stagnation:**
- Xiao Yao San (逍遥散): Liver qi stagnation with blood deficiency
- Chai Hu Shu Gan San (柴胡疏肝散): Liver qi stagnation causing pain
- Yue Ju Wan (越鞠丸): Six stagnations (qi, blood, phlegm, fire, damp, food)

**For Blood Stasis:**
- Tao Hong Si Wu Tang (桃红四物汤): Blood stasis with blood deficiency
- Xue Fu Zhu Yu Tang (血府逐瘀汤): Chest blood stasis
- Ge Xia Zhu Yu Tang (膈下逐瘀汤): Lower abdominal blood stasis

## RESPONSE FORMAT

Provide your analysis in this exact JSON structure:

{
  "analysisMetadata": {
    "version": "2.0",
    "confidence": "high|medium|low",
    "imageQuality": "excellent|good|fair|poor",
    "analysisTimestamp": "ISO8601 timestamp"
  },
  "eightPrinciples": {
    "exteriorInterior": {
      "classification": "exterior|interior|both",
      "confidence": 0-1,
      "evidence": ["specific observations"]
    },
    "hotCold": {
      "classification": "hot|cold|mixed",
      "confidence": 0-1,
      "evidence": ["specific observations"]
    },
    "excessDeficiency": {
      "classification": "excess|deficiency|mixed",
      "confidence": 0-1,
      "evidence": ["specific observations"]
    },
    "yinYang": {
      "classification": "yin|yang|balanced",
      "confidence": 0-1,
      "evidence": ["specific observations"]
    }
  },
  "zangFuDiagnosis": {
    "primaryOrgan": {
      "organ": "spleen|liver|kidney|heart|lung|stomach",
      "pathology": "qi_deficiency|yang_deficiency|yin_deficiency|blood_deficiency|heat|stagnation",
      "confidence": 0-1
    },
    "secondaryOrgans": [
      {
        "organ": "organ name",
        "pathology": "pathology type",
        "confidence": 0-1
      }
    ]
  },
  "patternDifferentiation": {
    "primaryPattern": {
      "name": "Pattern Name in English",
      "chineseName": "Pattern in Chinese (Pinyin)",
      "chineseCharacters": "Pattern in Chinese characters",
      "confidence": 0-1,
      "severity": "mild|moderate|severe",
      "evidence": [
        "Specific tongue finding supporting this pattern",
        "Another specific finding"
      ],
      "clinicalManifestations": [
        "Expected symptom 1",
        "Expected symptom 2"
      ]
    },
    "secondaryPatterns": [
      {
        "name": "Pattern Name",
        "chineseName": "Pinyin",
        "chineseCharacters": "Characters",
        "confidence": 0-1,
        "relationshipToPrimary": "complication|cause|consequence"
      }
    ],
    "differentialDiagnosis": [
      {
        "pattern": "Similar pattern considered",
        "rulingFactor": "Why this was ruled out"
      }
    ]
  },
  "tongueExamination": {
    "overallAssessment": {
      "color": "description with TCM significance",
      "shape": "description with TCM significance",
      "moisture": "description with TCM significance",
      "movement": "if visible: stiff|flaccid|trembling|normal"
    },
    "coating": {
      "color": "white|yellow|gray|black|none|mixed",
      "colorConfidence": 0-1,
      "thickness": "thin|medium|thick|none|partially_peeled",
      "thicknessConfidence": 0-1,
      "moisture": "dry|normal|wet|greasy",
      "moistureConfidence": 0-1,
      "distribution": "even|uneven|root_only|center_only|tip_only",
      "rooted": "rooted|rootless|partially_rooted",
      "description": "Detailed description"
    },
    "body": {
      "color": "pale|pink|red|crimson|purple|blue",
      "colorConfidence": 0-1,
      "shape": "normal|swollen|thin|rigid|deviated",
      "shapeConfidence": 0-1,
      "features": [
        {
          "type": "teeth_marks|cracks|petechiae|thorns|swelling",
          "location": "tip|sides|center|root|full",
          "description": "detailed description"
        }
      ],
      "description": "Detailed description"
    },
    "zones": {
      "tip": {
        "description": "Detailed observation",
        "organCorrelation": "Heart/Lungs",
        "findings": ["finding1", "finding2"]
      },
      "center": {
        "description": "Detailed observation",
        "organCorrelation": "Spleen/Stomach",
        "findings": ["finding1", "finding2"]
      },
      "sides": {
        "description": "Detailed observation",
        "organCorrelation": "Liver/Gallbladder",
        "findings": ["finding1", "finding2"]
      },
      "root": {
        "description": "Detailed observation",
        "organCorrelation": "Kidneys/Bladder",
        "findings": ["finding1", "finding2"]
      }
    }
  },
  "treatmentPrinciples": {
    "primary": "Main treatment strategy",
    "secondary": ["Supporting strategies"],
    "contraindications": ["What to avoid"]
  },
  "herbalFormula": {
    "recommended": {
      "name": "Formula Name",
      "chineseName": "Chinese Name (Pinyin)",
      "chineseCharacters": "Chinese characters",
      "confidence": 0-1,
      "rationale": "Why this formula is appropriate"
    },
    "modifications": [
      {
        "condition": "If presenting with X",
        "add": ["Herbs to add"],
        "remove": ["Herbs to remove"]
      }
    ],
    "alternatives": [
      {
        "name": "Alternative formula",
        "whenToUse": "Situation for using this instead"
      }
    ]
  },
  "acupuncture": {
    "primaryPoints": [
      {
        "point": "Point name/number",
        "location": "Anatomical location",
        "technique": "reinforcing|reducing|even",
        "rationale": "Why this point is selected"
      }
    ],
    "supplementaryPoints": [
      {
        "point": "Point name/number",
        "indication": "What symptom this addresses"
      }
    ],
    "moxibustion": {
      "recommended": true|false,
      "points": ["Points for moxa"],
      "rationale": "Why moxa is appropriate"
    }
  },
  "lifestyleRecommendations": {
    "diet": {
      "general": "Overall dietary approach",
      "foodsToEmphasize": ["Foods that support healing"],
      "foodsToAvoid": ["Foods that worsen condition"],
      "eatingHabits": ["Meal timing, chewing, etc."]
    },
    "exercise": {
      "recommendedTypes": ["Types of exercise"],
      "intensity": "gentle|moderate|vigorous",
      "timing": "Best time of day",
      "cautions": ["What to avoid"]
    },
    "emotionalHealth": {
      "relevantEmotions": ["Emotions affecting this pattern"],
      "recommendations": ["Meditation, stress reduction, etc."]
    },
    "sleep": {
      "recommendations": ["Sleep hygiene for this pattern"],
      "idealHours": "Recommended sleep duration"
    },
    "dailyRoutine": {
      "morning": ["Morning practices"],
      "evening": ["Evening practices"]
    }
  },
  "prognosis": {
    "expectedRecoveryTime": "Short/medium/long term estimate",
    "factorsAffectingRecovery": ["Factors that help or hinder"],
    "warningSigns": ["When to seek immediate care"]
  },
  "followUp": {
    "recommendedTimeline": "When to reassess",
    "expectedChanges": ["What improvements to look for"],
    "tongueChanges": ["Expected tongue changes during healing"]
  }
}`;

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
      // Return enhanced mock data matching new structure
      return NextResponse.json({
        analysisMetadata: {
          version: "2.0",
          confidence: "high",
          imageQuality: "good",
          analysisTimestamp: new Date().toISOString()
        },
        eightPrinciples: {
          exteriorInterior: {
            classification: "interior",
            confidence: 0.85,
            evidence: ["Tongue changes are pronounced and indicate internal organ involvement"]
          },
          hotCold: {
            classification: "cold",
            confidence: 0.80,
            evidence: ["Pale tongue color indicates yang deficiency/cold"]
          },
          excessDeficiency: {
            classification: "deficiency",
            confidence: 0.90,
            evidence: ["Teeth marks", "Pale color", "Swollen body"]
          },
          yinYang: {
            classification: "yang",
            confidence: 0.75,
            evidence: ["Spleen yang deficiency pattern dominant"]
          }
        },
        zangFuDiagnosis: {
          primaryOrgan: {
            organ: "spleen",
            pathology: "qi_deficiency",
            confidence: 0.92
          },
          secondaryOrgans: [
            { organ: "stomach", pathology: "yang_deficiency", confidence: 0.70 }
          ]
        },
        patternDifferentiation: {
          primaryPattern: {
            name: "Spleen Qi Deficiency with Dampness",
            chineseName: "Pi Qi Xu Yu Shi",
            chineseCharacters: "脾气虚夹湿",
            confidence: 0.88,
            severity: "moderate",
            evidence: [
              "Pale tongue body indicating qi deficiency",
              "Teeth marks on sides indicating spleen qi deficiency",
              "Swollen tongue body indicating dampness retention",
              "White coating indicating cold/dampness"
            ],
            clinicalManifestations: [
              "Fatigue, especially after eating",
              "Poor appetite",
              "Loose stools or diarrhea",
              "Heaviness in limbs",
              "Bloating after meals"
            ]
          },
          secondaryPatterns: [
            {
              name: "Mild Qi Sinking",
              chineseName: "Qi Xia Xian",
              chineseCharacters: "气下陷",
              confidence: 0.60,
              relationshipToPrimary: "consequence"
            }
          ],
          differentialDiagnosis: [
            {
              pattern: "Spleen Yang Deficiency",
              rulingFactor: "Lacks the cold signs (very pale wet tongue, cold limbs) typical of yang deficiency"
            }
          ]
        },
        tongueExamination: {
          overallAssessment: {
            color: "Pale pink indicating qi deficiency",
            shape: "Swollen with visible teeth marks",
            moisture: "Normal to slightly wet",
            movement: "normal"
          },
          coating: {
            color: "white",
            colorConfidence: 0.90,
            thickness: "thin",
            thicknessConfidence: 0.85,
            moisture: "normal",
            moistureConfidence: 0.80,
            distribution: "even",
            rooted: "rooted",
            description: "Thin white coating evenly distributed, indicating stomach qi is present and prognosis is good"
          },
          body: {
            color: "pale",
            colorConfidence: 0.88,
            shape: "swollen",
            shapeConfidence: 0.90,
            features: [
              { type: "teeth_marks", location: "sides", description: "Clear scalloped edges on both sides" }
            ],
            description: "Swollen pale body with distinct teeth marks indicating spleen qi deficiency with dampness"
          },
          zones: {
            tip: {
              description: "Normal color, slight paleness",
              organCorrelation: "Heart/Lungs",
              findings: ["No significant abnormalities", "Heart/lung function relatively balanced"]
            },
            center: {
              description: "Slightly pale with coating",
              organCorrelation: "Spleen/Stomach",
              findings: ["Central area pale", "Indicates digestive weakness"]
            },
            sides: {
              description: "Prominent teeth marks visible",
              organCorrelation: "Liver/Gallbladder",
              findings: ["Clear scalloping from teeth pressure", "Spleen deficiency affecting liver"]
            },
            root: {
              description: "Normal appearance",
              organCorrelation: "Kidneys/Bladder",
              findings: ["Kidney essence appears adequate"]
            }
          }
        },
        treatmentPrinciples: {
          primary: "Tonify Spleen Qi and resolve dampness",
          secondary: ["Strengthen transformation and transportation function"],
          contraindications: ["Avoid cold and raw foods", "Avoid excessive mental work"]
        },
        herbalFormula: {
          recommended: {
            name: "Si Jun Zi Tang combined with Er Chen Tang",
            chineseName: "Si Jun Zi Tang Jia Er Chen Tang",
            chineseCharacters: "四君子汤合二陈汤",
            confidence: 0.85,
            rationale: "Four Gentlemen tonifies spleen qi while Two Aged Herbs resolves dampness and transforms phlegm"
          },
          modifications: [
            {
              condition: "If severe bloating present",
              add: ["Sha Ren (Cardamom)", "Mu Xiang (Aucklandia)"],
              remove: []
            }
          ],
          alternatives: [
            {
              name: "Liu Jun Zi Tang",
              whenToUse: "If nausea or vomiting present"
            }
          ]
        },
        acupuncture: {
          primaryPoints: [
            {
              point: "ST36 (Zu San Li)",
              location: "Below knee on stomach channel",
              technique: "reinforcing",
              rationale: "Sea point - powerfully tonifies spleen and stomach qi"
            },
            {
              point: "SP6 (San Yin Jiao)",
              location: "Inner ankle above medial malleolus",
              technique: "reinforcing",
              rationale: "Tonifies spleen and resolves dampness"
            }
          ],
          supplementaryPoints: [],
          moxibustion: {
            recommended: true,
            points: ["BL20 (Pi Shu)", "CV12 (Zhong Wan)"],
            rationale: "Warm yang and strongly tonify spleen"
          }
        },
        lifestyleRecommendations: {
          diet: {
            general: "Warm, cooked, easily digestible foods",
            foodsToEmphasize: ["Congee", "Steamed vegetables", "Warm soups", "Ginger", "Pumpkin"],
            foodsToAvoid: ["Cold drinks", "Raw vegetables", "Dairy", "Greasy foods", "Sugar"],
            eatingHabits: ["Regular meal times", "Eat breakfast", "Stop at 80% full", "Chew thoroughly"]
          },
          exercise: {
            recommendedTypes: ["Walking", "Tai Chi", "Qigong"],
            intensity: "gentle",
            timing: "Morning is best",
            cautions: ["Avoid over-exertion", "Don't exercise on full stomach"]
          },
          emotionalHealth: {
            relevantEmotions: ["Worry", "Overthinking"],
            recommendations: ["Meditation", "Limit mental work", "Practice mindfulness"]
          },
          sleep: {
            recommendations: ["Early to bed (before 11pm)", "Avoid screens before bed"],
            idealHours: "8 hours"
          },
          dailyRoutine: {
            morning: ["Warm water with ginger", "Light breakfast"],
            evening: ["Light dinner", "Early bedtime"]
          }
        },
        prognosis: {
          expectedRecoveryTime: "2-3 months with consistent treatment",
          factorsAffectingRecovery: [
            "Dietary compliance is crucial",
            "Stress management helps significantly"
          ],
          warningSigns: ["Persistent diarrhea", "Severe fatigue", "Weight loss"]
        },
        followUp: {
          recommendedTimeline: "Weekly for 4 weeks, then bi-weekly",
          expectedChanges: ["Increased energy", "Better digestion", "Less bloating"],
          tongueChanges: ["Teeth marks should fade", "Color should become pinker"]
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
          content: TCM_TONGUE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this tongue image according to Traditional Chinese Medicine diagnostic principles. Provide a comprehensive analysis following the exact JSON structure specified in your instructions. Include confidence scores (0-1) for all classifications, detailed pattern differentiation with evidence, Eight Principles diagnosis, Zang-Fu organ analysis, and specific treatment recommendations including herbal formulas with modifications.',
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
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent, clinical analysis
    })

    const analysis = response.choices[0]?.message?.content
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }

    // Parse the response
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysis)
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError)
      return NextResponse.json(
        { error: 'Invalid analysis format', details: 'Failed to parse response' },
        { status: 500 }
      )
    }

    // Add metadata
    const enrichedAnalysis = {
      ...parsedAnalysis,
      analysisMetadata: {
        ...(parsedAnalysis.analysisMetadata || {}),
        version: "2.0",
        analysisTimestamp: new Date().toISOString(),
        model: "gpt-4o"
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
