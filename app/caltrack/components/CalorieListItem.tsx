'use client'

import Link from 'next/link'
import { useState } from 'react'

interface MealEntry {
  meal_type: string
  meal_name: string
  calories: number
}

interface CalorieListItemProps {
  date: string
  entries: MealEntry[]
  totalCalories: number
  targetCalories: number
}

export function CalorieListItem({ date, entries, totalCalories, targetCalories }: CalorieListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Group entries by meal type
  const mealsByType = entries.reduce((acc, entry) => {
    if (!acc[entry.meal_type]) {
      acc[entry.meal_type] = []
    }
    acc[entry.meal_type].push(entry)
    return acc
  }, {} as Record<string, MealEntry[]>)

  // Calculate totals for each meal type
  const mealTypeTotals = Object.entries(mealsByType).map(([type, meals]) => ({
    type,
    total: meals.reduce((sum, meal) => sum + meal.calories, 0)
  }))

  return (
    <li className="group border rounded-lg overflow-hidden">
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
            {new Date(`${date}T12:00:00`).toLocaleDateString()}
          </span>
          <span className={`text-lg ${
            totalCalories > targetCalories 
              ? 'text-red-500 dark:text-red-400'
              : 'text-green-500 dark:text-green-400'
          }`}>
            {totalCalories} calories
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-12 pb-4 space-y-4">
          <div className="flex justify-end">
            <Link
              href={`/caltrack/edit/${date}`}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Edit Day
            </Link>
          </div>
          {mealTypeTotals.map(({ type, total }) => (
            <div key={type}>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">{type} ({total} cal)</h3>
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
    </li>
  )
}
