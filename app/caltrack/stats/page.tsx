import { getData } from '@/lib/getData'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import type { CalorieData } from '@/lib/types'
import { Suspense } from 'react'
import Loading from '../loading'

export const revalidate = 0
export const dynamic = "force-dynamic"

// Use the special Next.js async component type
const AnalyticsDashboardWrapper = async () => {
  const data = await getData() as CalorieData
  return <AnalyticsDashboard initialData={data} />
}

export default function CalTrackStatsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading />}>
        <AnalyticsDashboardWrapper />
      </Suspense>
    </div>
  )
}
