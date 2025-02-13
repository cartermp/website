'use client'

import { useMemo } from 'react'
import { getToday, compareDates } from '@/lib/dateUtils'
import { calculateDailyEntries, calculateDailyAverage, TARGET_CALORIES, MAX_TDEE_CALORIES } from '@/lib/calorieUtils'
import { Card } from './ui/card'
import { StatDisplay } from './ui/stat-display'
import { CalorieListItem } from './CalorieListItem'
import { CalorieTrendChart } from './CalorieTrendChart'
import { PageHeader } from './PageHeader'
import type { CalorieEntry } from '@/lib/types'

interface CalorieListProps {
  initialEntries: CalorieEntry[]
}

export function CalorieList({ initialEntries }: CalorieListProps) {
  const dailyEntries = useMemo(() =>
    calculateDailyEntries(initialEntries)
      .sort((a, b) => -compareDates(a.date, b.date))
    , [initialEntries])

  const average = calculateDailyAverage(dailyEntries)
  const today = getToday() // Get today's date on client side
  const todayEntry = dailyEntries.find(day => day.date === today)

  return (
    <>
      <PageHeader todayEntry={!!todayEntry} />

      <Card variant="stats" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <StatDisplay
            label="Target"
            value={`${TARGET_CALORIES} calories`}
          />
          <StatDisplay
            label="Average"
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
          maxCalories={MAX_TDEE_CALORIES}
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
    </>
  )
}
