'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDate } from '@/lib/dateUtils'
import { groupEntriesByMealType, calculateMealTypeTotals } from '@/lib/calorieUtils'
import { Card } from './ui/card'
import type { CalorieEntry } from '@/lib/types'

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

  // Use utility functions for consistent data organization
  const mealsByType = groupEntriesByMealType(entries)
  const mealTypeTotals = calculateMealTypeTotals(mealsByType)

  // Determine color based on calorie comparison
  const calorieColor = totalCalories > targetCalories
    ? 'text-red-500 dark:text-red-400'
    : 'text-green-500 dark:text-green-400'

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
        <div className="flex items-baseline justify-between gap-4">
          <span className={`text-purple-700 dark:text-purple-300 text-lg transition-transform ${
            isExpanded ? 'transform rotate-90' : ''
          }`}>
            ❯
          </span>
          <span className="flex-1 font-medium text-lg text-gray-600 dark:text-gray-400">
            {formatDate(date)}
          </span>
          <div className="flex items-center gap-4">
            <span className={`text-lg ${calorieColor}`}>
              {totalCalories} calories
            </span>
            <Link href={`/caltrack/edit/${date}`}>
              <span className="text-lg text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                Edit
              </span>
            </Link>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-12 pb-4 space-y-4">
          {mealTypeTotals.map(({ type, total }) => (
            <div key={type}>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                {type} ({total} cal)
              </h3>
              <ul className="mt-2 space-y-1">
                {mealsByType[type].map((meal, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>{meal.meal_name}</span>
                    <span>{meal.calories} cal</span>
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
