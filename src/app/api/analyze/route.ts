import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Traditional Chinese Medicine (TCM) tongue diagnosis expert. 
Analyze the tongue image and provide insights based on TCM principles.

Focus on:
1. Tongue coat (color, thickness, distribution)
2. Tongue body color (pale, red, purple, etc.)
3. Tongue shape (swollen, thin, cracked, etc.)
4. Moisture level
5. Any distinctive features

Provide your analysis in this JSON format:
{
  "primaryPattern": "The main TCM pattern observed (e.g., Spleen Qi Deficiency, Liver Heat, Damp-Heat)",
  "coat": "Description of tongue coating",
  "color": "Description of tongue body color",
  "shape": "Description of tongue shape",
  "moisture": "Description of moisture level",
  "recommendations": "General wellness recommendations based on TCM principles",
  "recommendedFormula": "A TCM herbal formula name that might be appropriate (educational only)"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this tongue image according to Traditional Chinese Medicine principles.',
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
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const analysis = response.choices[0]?.message?.content
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }

    const parsedAnalysis = JSON.parse(analysis)

    return NextResponse.json(parsedAnalysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
