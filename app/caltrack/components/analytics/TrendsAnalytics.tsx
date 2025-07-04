'use client'

import { useMemo } from 'react'
import { Card } from '../ui/card'
import { StatDisplay } from '../ui/stat-display'
import { CalorieTrendChart } from '../CalorieTrendChart'
import { OverallCalorieTrendChart } from '../OverallCalorieTrendChart'
import { calculateDailyEntries, calculateDailyAverage, MAINTAIN_TARGET, LOWER_TARGET, UPPER_TARGET } from '@/lib/calorieUtils'
import { compareDates } from '@/lib/dateUtils'
import type { CalorieData } from '@/lib/types'

interface TrendsAnalyticsProps {
  data: CalorieData
}

export function TrendsAnalytics({ data }: TrendsAnalyticsProps) {
  const { entries, overallAverage } = data

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

  // Calculate monthly stats
  const monthlyEntries = useMemo(() => 
    dailyEntries.slice(0, 30)
  , [dailyEntries])

  const monthlyAvg = calculateDailyAverage(monthlyEntries)
  const monthlyTrend = overallAverage ? ((monthlyAvg - overallAverage) / overallAverage) * 100 : 0

  // Calculate how many days of data we have
  const totalDays = dailyEntries.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Calorie Trends</h2>
        
        {/* Summary Stats */}
        <Card variant="stats" className="p-3 sm:p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatDisplay
              label="7 Day Avg"
              value={`${Math.round(sevenDayAvg)} cal`}
              valueColor={getCalorieColorClass(sevenDayAvg)}
            />
            <StatDisplay
              label="30 Day Avg"
              value={`${Math.round(monthlyAvg)} cal`}
              valueColor={getCalorieColorClass(monthlyAvg)}
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
          </div>
        </Card>

        {/* Extended Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {Math.round(monthlyAvg - sevenDayAvg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                30d vs 7d Avg
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatPercent(monthlyTrend)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                30-Day Trend
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {totalDays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Days Tracked
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {UPPER_TARGET}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Target Calories
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent 7-Day Trend</h3>
            <Card className="p-6">
              <CalorieTrendChart
                entries={recentEntries}
                lowerTarget={LOWER_TARGET}
                upperTarget={UPPER_TARGET}
                maintainCalories={MAINTAIN_TARGET}
              />
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">6-Month Overview ({totalDays} days)</h3>
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
      </div>
    </div>
  )
}