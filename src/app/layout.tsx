import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2d5a27' },
    { media: '(prefers-color-scheme: dark)', color: '#1a3d16' },
  ],
}

export const metadata: Metadata = {
  title: 'TCM Tongue Map - AI-Powered Tongue Diagnosis',
  description: 'Discover what your tongue reveals about your health with AI-powered Traditional Chinese Medicine diagnosis.',
  keywords: ['TCM', 'Traditional Chinese Medicine', 'tongue diagnosis', 'AI health', 'herbal medicine', 'wellness'],
  authors: [{ name: 'TCM Tongue Map' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TCM Tongue Map',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'TCM Tongue Map - AI-Powered Tongue Diagnosis',
    description: 'Discover what your tongue reveals about your health with AI-powered Traditional Chinese Medicine diagnosis.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <Navigation />
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
