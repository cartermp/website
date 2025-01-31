import { getData } from '@/lib/getData'
import { getToday, compareDates } from '@/lib/dateUtils'
import { 
  calculateDailyEntries, 
  calculateDailyAverage, 
  TARGET_CALORIES 
} from '@/lib/calorieUtils'
import { PageHeader } from './components/PageHeader'
import { CalorieListItem } from './components/CalorieListItem'
import { Card } from './components/ui/card'
import { StatDisplay } from './components/ui/stat-display'
import type { CalorieEntry } from '@/lib/types'
import { CalorieTrendChart } from './components/CalorieTrendChart'

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function CalTrackPage() {
  const entries = await getData() as CalorieEntry[]
  
  // Calculate daily entries and sort by date
  const dailyEntries = calculateDailyEntries(entries)
    .sort((a, b) => -compareDates(a.date, b.date))
  
  const average = calculateDailyAverage(dailyEntries)
  const today = getToday()
  const todayEntry = dailyEntries.find(day => day.date === today)

  return (
    <div className="space-y-6">
      <PageHeader todayEntry={!!todayEntry} />

      <Card variant="stats" className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay
            label="Daily Target"
            value={`${TARGET_CALORIES} calories`}
          />
          <StatDisplay
            label="Daily Average"
            value={`${Math.round(average)} calories`}
          />
        </div>
      </Card>



      <Card variant="outline" className="p-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
          Calorie Intake Trends
        </h2>
        <CalorieTrendChart 
          entries={dailyEntries} 
          targetCalories={TARGET_CALORIES}
        />
      </Card>

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
