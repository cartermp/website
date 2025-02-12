import { getData } from '@/lib/getData'
import { CalorieList } from './components/CalorieList'
import type { CalorieEntry } from '@/lib/types'
import { Suspense } from 'react'
import Loading from './loading'

export const revalidate = 0
export const dynamic = "force-dynamic"

// Use the special Next.js async component type
const CalorieListWrapper = async () => {
  const entries = await getData() as CalorieEntry[]
  return <CalorieList initialEntries={entries} />
}

export default function CalTrackPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading />}>
        {/* @ts-expect-error Async Server Component */}
        <CalorieListWrapper />
      </Suspense>
    </div>
  )
}
