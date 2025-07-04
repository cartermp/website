'use client'

import { useMemo } from 'react'
import { Card } from '../ui/card'
import { StatDisplay } from '../ui/stat-display'
import { groupEntriesByMealType } from '@/lib/calorieUtils'
import type { CalorieEntry } from '@/lib/types'

interface PatternsAnalyticsProps {
  entries: CalorieEntry[]
}

export function PatternsAnalytics({ entries }: PatternsAnalyticsProps) {
  // Day of week analysis
  const dayOfWeekStats = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayStats = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      dayName: dayNames[i],
      totalCalories: 0,
      entryCount: 0,
      dates: new Set<string>()
    }))

    entries.forEach(entry => {
      const date = new Date(entry.date)
      const dayOfWeek = date.getDay()
      dayStats[dayOfWeek].totalCalories += entry.calories
      dayStats[dayOfWeek].entryCount += 1
      dayStats[dayOfWeek].dates.add(entry.date)
    })

    return dayStats.map(stat => ({
      ...stat,
      avgCalories: stat.dates.size > 0 ? Math.round(stat.totalCalories / stat.dates.size) : 0,
      daysCount: stat.dates.size
    })).filter(stat => stat.daysCount > 0)
  }, [entries])

  // Weekend vs Weekday analysis
  const weekendVsWeekday = useMemo(() => {
    const weekdayStats = { totalCalories: 0, dates: new Set<string>() }
    const weekendStats = { totalCalories: 0, dates: new Set<string>() }

    entries.forEach(entry => {
      const date = new Date(entry.date)
      const dayOfWeek = date.getDay()
      
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        weekendStats.totalCalories += entry.calories
        weekendStats.dates.add(entry.date)
      } else {
        weekdayStats.totalCalories += entry.calories
        weekdayStats.dates.add(entry.date)
      }
    })

    return {
      weekday: {
        avgCalories: weekdayStats.dates.size > 0 ? Math.round(weekdayStats.totalCalories / weekdayStats.dates.size) : 0,
        daysCount: weekdayStats.dates.size
      },
      weekend: {
        avgCalories: weekendStats.dates.size > 0 ? Math.round(weekendStats.totalCalories / weekendStats.dates.size) : 0,
        daysCount: weekendStats.dates.size
      }
    }
  }, [entries])

  // Meal timing patterns
  const mealPatterns = useMemo(() => {
    const dailyEntries = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = []
      }
      acc[entry.date].push(entry)
      return acc
    }, {} as Record<string, CalorieEntry[]>)

    const mealTypeStats = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(mealType => {
      const daysWithMeal = Object.values(dailyEntries).filter(dayEntries => 
        dayEntries.some(entry => entry.meal_type === mealType)
      ).length
      
      const totalEntries = entries.filter(entry => entry.meal_type === mealType)
      const avgCalories = totalEntries.length > 0 ? 
        Math.round(totalEntries.reduce((sum, entry) => sum + entry.calories, 0) / totalEntries.length) : 0
      
      const frequency = Object.keys(dailyEntries).length > 0 ? 
        Math.round((daysWithMeal / Object.keys(dailyEntries).length) * 100) : 0

      return {
        mealType,
        frequency,
        avgCalories,
        totalEntries: totalEntries.length,
        daysWithMeal
      }
    })

    return mealTypeStats.filter(stat => stat.totalEntries > 0)
  }, [entries])

  // Calorie distribution
  const calorieDistribution = useMemo(() => {
    const dailyTotals = entries.reduce((acc, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.calories
      return acc
    }, {} as Record<string, number>)

    const totals = Object.values(dailyTotals)
    const totalDays = totals.length

    if (totalDays === 0) return []

    const ranges = [
      { label: 'Very Low (<1400)', min: 0, max: 1399 },
      { label: 'Low (1400-1799)', min: 1400, max: 1799 },
      { label: 'Moderate (1800-2199)', min: 1800, max: 2199 },
      { label: 'High (2200-2799)', min: 2200, max: 2799 },
      { label: 'Very High (2800+)', min: 2800, max: Infinity }
    ]

    return ranges.map(range => {
      const daysInRange = totals.filter(total => total >= range.min && total <= range.max).length
      const percentage = Math.round((daysInRange / totalDays) * 100)
      
      return {
        range: range.label,
        daysCount: daysInRange,
        percentage
      }
    }).filter(item => item.daysCount > 0)
  }, [entries])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Eating Patterns</h2>
        
        {/* Weekend vs Weekday */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Weekend vs Weekday</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {weekendVsWeekday.weekday.avgCalories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Weekday Avg ({weekendVsWeekday.weekday.daysCount} days)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {weekendVsWeekday.weekend.avgCalories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Weekend Avg ({weekendVsWeekday.weekend.daysCount} days)
              </div>
            </div>
          </div>
        </Card>

        {/* Day of Week Patterns */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Day of Week Patterns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayOfWeekStats.map(stat => (
              <div key={stat.day} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {stat.dayName}
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.avgCalories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  avg ({stat.daysCount} days)
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Meal Timing Patterns */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Meal Frequency & Average Calories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealPatterns.map(pattern => (
              <div key={pattern.mealType} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {pattern.mealType}
                </div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {pattern.frequency}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  frequency
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {pattern.avgCalories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  avg calories
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Calorie Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Calorie Distribution</h3>
          <div className="space-y-3">
            {calorieDistribution.map(item => (
              <div key={item.range} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {item.range}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.daysCount} days
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[3rem] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}