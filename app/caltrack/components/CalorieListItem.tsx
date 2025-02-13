'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatDate } from '@/lib/dateUtils'
import { groupEntriesByMealType, calculateMealTypeTotals } from '@/lib/calorieUtils'
import { Card } from './ui/card'
import type { CalorieEntry } from '@/lib/types'
import { getCalorieColor } from '@/lib/colorUtils'

interface CalorieListItemProps {
  date: string
  entries: CalorieEntry[]
  totalCalories: number
  targetCalories: number
}

export function CalorieListItem({
  date,
  entries,
  totalCalories,
  targetCalories
}: CalorieListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Use utility functions for consistent data organization
  const mealsByType = groupEntriesByMealType(entries)
  const mealTypeTotals = calculateMealTypeTotals(mealsByType)

  // Watch for dark mode changes
  useEffect(() => {
    const updateDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    updateDarkMode()

    const observer = new MutationObserver(updateDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <Card<'li'>
      as="li"
      variant="outline"
      padding="none"
      className="overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-purple-700 dark:text-purple-300 text-lg transition-transform ${
              isExpanded ? 'transform rotate-90' : ''
            }`}>
              ❯
            </span>
            <span className="flex-1 font-medium text-lg text-gray-600 dark:text-gray-400">
              {formatDate(date)}
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 pl-6 sm:pl-0">
            <span
              className="text-lg font-medium"
              style={{ color: getCalorieColor(totalCalories, isDark) }}
            >
              {totalCalories} calories
            </span>
            <Link
              href={`/caltrack/edit/${date}`}
              className="text-lg text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Edit
            </Link>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 sm:px-12 pb-4 space-y-4">
          {mealTypeTotals.map(({ type, total }) => (
            <div key={type}>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                {type} ({total} cal)
              </h3>
              <ul className="mt-2 space-y-1">
                {mealsByType[type].map((meal, index) => (
                  <li 
                    key={index} 
                    className="text-gray-600 dark:text-gray-400 flex flex-col sm:flex-row justify-between gap-1 sm:gap-0"
                  >
                    <span className="break-words">{meal.meal_name}</span>
                    <span className="text-right">{meal.calories} cal</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
