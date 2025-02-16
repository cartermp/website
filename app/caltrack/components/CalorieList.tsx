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

  // Calculate overall average
  const average = calculateDailyAverage(dailyEntries)

  // Calculate 7-day rolling average
  const sevenDayEntries = useMemo(() => {
    return dailyEntries.slice(0, 7)
  }, [dailyEntries])

  const sevenDayAvg = calculateDailyAverage(sevenDayEntries)

  // Calculate trend (percentage difference from overall average)
  const trendPercent = average ? ((sevenDayAvg - average) / average) * 100 : 0
  const formatPercent = (num: number) => {
    const rounded = Math.round(num * 10) / 10
    return `${rounded >= 0 ? '+' : ''}${rounded}%`
  }

  // Get color classes based on values
  const getColorClass = (value: number) => {
    if (value > 0) return 'text-red-600 dark:text-red-400'
    if (value < 0) return 'text-green-600 dark:text-green-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getCalorieColorClass = (calories: number) => {
    if (calories > MAX_TDEE_CALORIES) return 'text-red-600 dark:text-red-400'
    if (calories > TARGET_CALORIES) return 'text-red-600 dark:text-red-400'
    return 'text-green-600 dark:text-green-400'
  }

  const today = getToday() // Get today's date on client side
  const todayEntry = dailyEntries.find(day => day.date === today)

  return (
    <>
      <PageHeader todayEntry={!!todayEntry} />

      <Card variant="stats" className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatDisplay
            label="Target"
            value={`${TARGET_CALORIES} calories`}
          />
          <StatDisplay
            label="7-Day Avg"
            value={`${Math.round(sevenDayAvg)} cal`}
            valueColor={getCalorieColorClass(sevenDayAvg)}
          />
          <StatDisplay
            label="vs Overall"
            value={formatPercent(trendPercent)}
            valueColor={getColorClass(trendPercent)}
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
