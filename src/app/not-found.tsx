import { Metadata } from 'next'
import { NotFoundPage } from '@/components/ui/ErrorPages'

export const metadata: Metadata = {
  title: 'Page Not Found - TCM Tongue Map',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return <NotFoundPage />
}
