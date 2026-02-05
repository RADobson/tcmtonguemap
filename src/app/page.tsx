'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, Loader2 } from 'lucide-react'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage }),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tcm-green to-emerald-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            What Does Your Tongue Reveal?
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-emerald-100">
            Discover insights about your health through the ancient wisdom of 
            Traditional Chinese Medicine, powered by modern AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-tcm-green px-8 py-4 rounded-full font-semibold text-lg hover:bg-emerald-50 transition flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Upload Photo
            </button>
            <button className="bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2">
              <Camera size={20} />
              Take Photo
            </button>
          </div>
          <p className="mt-4 text-sm text-emerald-200">
            Free basic analysis • No account required
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {selectedImage && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Tongue Photo</h2>
            <div className="relative aspect-video max-h-96 overflow-hidden rounded-xl bg-gray-100">
              <img
                src={selectedImage}
                alt="Tongue"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 bg-tcm-green text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  'Analyze My Tongue'
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setResult(null)
                }}
                className="px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Your TCM Tongue Analysis</h2>
            
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-tcm-green">Primary Pattern</h3>
                <p className="text-gray-700">{result.primaryPattern || 'Analysis complete'}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-xl">
                  <h4 className="font-medium text-amber-800 mb-1">Tongue Coat</h4>
                  <p className="text-sm text-gray-600">{result.coat || 'Analyzed'}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl">
                  <h4 className="font-medium text-rose-800 mb-1">Body Color</h4>
                  <p className="text-sm text-gray-600">{result.color || 'Analyzed'}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-1">Shape</h4>
                  <p className="text-sm text-gray-600">{result.shape || 'Analyzed'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-medium text-purple-800 mb-1">Moisture</h4>
                  <p className="text-sm text-gray-600">{result.moisture || 'Analyzed'}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Recommended Herbal Formula</h3>
                <div className="bg-gradient-to-r from-tcm-brown to-amber-700 text-white p-6 rounded-xl">
                  <p className="text-lg font-medium mb-2">{result.recommendedFormula || 'Custom TCM Formula'}</p>
                  <p className="text-amber-100 text-sm mb-4">
                    Based on your tongue diagnosis, this formula may help address the identified patterns.
                  </p>
                  <button className="bg-white text-tcm-brown px-6 py-2 rounded-lg font-semibold hover:bg-amber-50 transition">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-tcm-green rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">1</div>
              <h3 className="font-semibold text-lg mb-2">Snap a Photo</h3>
              <p className="text-gray-600">Take a clear photo of your tongue in natural light</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-tcm-green rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">2</div>
              <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes tongue coat, color, shape, and moisture</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-tcm-green rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Insights</h3>
              <p className="text-gray-600">Receive personalized TCM insights and herbal recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4">© 2026 TCM Tongue Map. All rights reserved.</p>
          <p className="text-sm">
            This app provides educational information only and is not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </main>
  )
}
