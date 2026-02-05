import { DashboardSkeleton } from '@/components/ui/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <DashboardSkeleton />
      </div>
    </div>
  )
}
