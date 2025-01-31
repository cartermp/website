import Link from 'next/link'
import { CalorieListItem } from './components/CalorieListItem'
import { getData } from '@/lib/getData'
import { PageHeader } from './components/PageHeader'
import { getToday, groupEntriesByDate, compareDates } from '@/lib/dateUtils'

export const revalidate = 0
export const dynamic = "force-dynamic"

const TARGET_CALORIES = 2400

export default async function CalTrackPage() {
  const entries = await getData() as CalorieEntry[]

  // Group entries by date using our utility function
  const entriesByDate = groupEntriesByDate(entries)

  // Calculate daily totals and sort by date
  const dailyEntries = Object.entries(entriesByDate)
    .map(([date, dayEntries]) => ({
      date,
      entries: dayEntries,
      totalCalories: dayEntries.reduce((sum, entry) => sum + entry.calories, 0)
    }))
    .sort((a, b) => -compareDates(a.date, b.date)) // Negative to sort in descending order

  // Calculate average
  const average = dailyEntries.length > 0
    ? dailyEntries.reduce((sum, day) => sum + day.totalCalories, 0) / dailyEntries.length
    : 0

  const today = getToday()
  const todayEntry = dailyEntries.find(day => day.date === today)

  return (
    <div className="space-y-6">
      <PageHeader todayEntry={!!todayEntry} />

      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Daily Target:</span>
          <span className="ml-2 font-medium">{TARGET_CALORIES} calories</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Daily Average:</span>
          <span className="ml-2 font-medium">{Math.round(average)} calories</span>
        </div>
      </div>

      <ul className="space-y-4">
        {dailyEntries.map((day) => (
          <CalorieListItem
            key={day.date}
            date={day.date}
            entries={day.entries}
            totalCalories={day.totalCalories}
            targetCalories={TARGET_CALORIES}
          />
        ))}
      </ul>
    </div>
  )
}
