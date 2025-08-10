import { getStaticData } from '@/lib/getData'
import { CalorieList } from './components/CalorieList'
import type { CalorieData } from '@/lib/types'
import { Suspense } from 'react'
import Loading from './loading'

export const revalidate = 0
export const dynamic = "force-dynamic"

// Use the special Next.js async component type
const CalorieListWrapper = async () => {
  const data = await getStaticData()
  return <CalorieList initialData={data} />
}

export default function CalTrackPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading />}>
        <CalorieListWrapper />
      </Suspense>
    </div>
  )
}
