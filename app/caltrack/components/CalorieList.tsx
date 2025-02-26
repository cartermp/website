'use client'

import { useMemo } from 'react'
import { compareDates, getToday } from '@/lib/dateUtils'
import { calculateDailyEntries, calculateDailyAverage, MAINTAIN_TARGET, LOWER_TARGET, UPPER_TARGET } from '@/lib/calorieUtils'
import { Card } from './ui/card'
import { StatDisplay } from './ui/stat-display'
import { CalorieListItem } from './CalorieListItem'
import { CalorieTrendChart } from './CalorieTrendChart'
import { PageHeader } from './PageHeader'
import type { CalorieData } from '@/lib/types'

interface CalorieListProps {
  initialData: CalorieData
}

export function CalorieList({ initialData }: CalorieListProps) {
  const { entries, overallAverage } = initialData

  const dailyEntries = useMemo(() =>
    calculateDailyEntries(entries)
      .sort((a, b) => -compareDates(a.date, b.date))
    , [entries])

  // Check if today's entry exists
  const today = getToday()
  const todayEntry = dailyEntries.some(entry => entry.date === today)

  // Calculate 7-day rolling average
  const sevenDayAvg = calculateDailyAverage(dailyEntries)

  // Calculate trend (percentage difference from overall average)
  const trendPercent = overallAverage ? ((sevenDayAvg - overallAverage) / overallAverage) * 100 : 0
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
    if (calories > MAINTAIN_TARGET) return 'text-red-600 dark:text-red-400'
    if (calories > UPPER_TARGET) return 'text-orange-600 dark:text-orange-400'
    if (calories < LOWER_TARGET) return 'text-green-600 dark:text-green-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-6">
      <PageHeader todayEntry={todayEntry} />

      <Card variant="stats" className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatDisplay
            label="7 Day Avg"
            value={`${Math.round(sevenDayAvg)} cal`}
            valueColor={getCalorieColorClass(sevenDayAvg)}
          />
          <StatDisplay
            label="Overall Avg"
            value={`${Math.round(overallAverage)} cal`}
            valueColor={getCalorieColorClass(overallAverage)}
          />
          <StatDisplay
            label="7-Day Trend"
            value={formatPercent(trendPercent)}
            valueColor={getColorClass(trendPercent)}
          />
          <StatDisplay
            label="Target"
            value={`${UPPER_TARGET} cal`}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Calorie Trends</h2>
        <Card className="p-6">
          <CalorieTrendChart
            entries={dailyEntries}
            lowerTarget={LOWER_TARGET}
            upperTarget={UPPER_TARGET}
            maintainCalories={MAINTAIN_TARGET}
          />
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Last 7 Days</h2>
        <ul className="space-y-4 list-none">
          {dailyEntries.map(entry => (
            <CalorieListItem
              key={entry.date}
              {...entry}
              targetCalories={UPPER_TARGET}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
