'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { compareDates, getToday } from '@/lib/dateUtils'
import { calculateDailyEntries, calculateDailyAverage, MAINTAIN_TARGET, LOWER_TARGET, UPPER_TARGET } from '@/lib/calorieUtils'
import { Card } from './ui/card'
import { StatDisplay } from './ui/stat-display'
import { CalorieTrendChart } from './CalorieTrendChart'
import { OverallCalorieTrendChart } from '@/app/caltrack/components/OverallCalorieTrendChart'
import type { CalorieData } from '@/lib/types'

interface StatsContentProps {
  initialData: CalorieData
}

export function StatsContent({ initialData }: StatsContentProps) {
  const { entries, overallAverage } = initialData

  const dailyEntries = useMemo(() =>
    calculateDailyEntries(entries)
      .sort((a, b) => -compareDates(a.date, b.date))
    , [entries])

  // Get recent entries for 7-day chart
  const recentEntries = useMemo(() => 
    dailyEntries.slice(0, 7)
  , [dailyEntries])

  // Calculate 7-day rolling average
  const sevenDayAvg = calculateDailyAverage(recentEntries)

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

  // Calculate how many days of data we have
  const totalDays = dailyEntries.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Calorie Statistics</h1>
        <Link
          href="/caltrack/api-keys"
          className="w-full sm:w-auto text-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          API Keys
        </Link>
      </div>

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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent 7-Day Trend</h2>
        <Card className="p-6">
          <CalorieTrendChart
            entries={recentEntries}
            lowerTarget={LOWER_TARGET}
            upperTarget={UPPER_TARGET}
            maintainCalories={MAINTAIN_TARGET}
          />
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">6-Month Calorie Trend ({totalDays} days)</h2>
        <Card className="p-6">
          <OverallCalorieTrendChart
            entries={dailyEntries}
            lowerTarget={LOWER_TARGET}
            upperTarget={UPPER_TARGET}
            maintainCalories={MAINTAIN_TARGET}
          />
        </Card>
      </div>
    </div>
  )
}
