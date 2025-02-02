import { getData } from '@/lib/getData'
import { CalorieList } from './components/CalorieList'
import type { CalorieEntry } from '@/lib/types'

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function CalTrackPage() {
  const entries = await getData() as CalorieEntry[]

  for (const entry of entries) {
    console.log(entry.date)
  }
  
  return (
    <div className="space-y-6">
      <CalorieList initialEntries={entries} />
    </div>
  )
}
