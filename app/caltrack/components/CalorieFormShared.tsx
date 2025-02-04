'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCalorieForm } from '@/lib/hooks/useCalorieForm'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { StatDisplay } from './ui/stat-display'
import type { CalorieEntry } from '@/lib/types'
import { getToday } from '@/lib/dateUtils'

interface CalorieFormSharedProps {
  date?: string
  initialEntries?: CalorieEntry[]
  mode: 'add' | 'edit'
}

export function CalorieFormShared({ date = getToday(), initialEntries = [], mode }: CalorieFormSharedProps) {
  const router = useRouter()
  const {
    meals,
    error,
    isSubmitting,
    submitError,
    currentFieldRefs,
    addItem,
    removeItem,
    updateItem,
    getTotalCalories,
    handleSubmit
  } = useCalorieForm({ date, initialEntries, mode })

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    // Only handle Cmd/Ctrl + Enter for form submission
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleItemKeyDown = (e: React.KeyboardEvent, mealTypeIndex: number, itemIndex: number) => {
    // Handle regular Enter for new item creation
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()

      const item = meals[mealTypeIndex].items[itemIndex]
      const isLastItem = itemIndex === meals[mealTypeIndex].items.length - 1

      if (item.name.trim() && item.calories && isLastItem) {
        addItem(mealTypeIndex)
        setTimeout(() => {
          const nameRef = currentFieldRefs.current[mealTypeIndex].nameRef.current
          if (nameRef) {
            nameRef.focus()
          }
        }, 0)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
      {meals.map((meal, mealIndex) => (
        <Card key={meal.type} className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            {meal.type}
          </h2>

          <div className="space-y-4">
            {meal.items.map((item, itemIndex) => (
              <div key={itemIndex} className="grid grid-cols-[minmax(0,1fr),120px,40px] gap-4 items-start">
                <div className="flex flex-col w-full">
                  <input
                    ref={currentFieldRefs.current[mealIndex].nameRef}
                    onKeyDown={(e) => handleItemKeyDown(e, mealIndex, itemIndex)}
                    type="text"
                    placeholder="Meal name"
                    value={item.name}
                    onChange={(e) => {
                      updateItem(mealIndex, itemIndex, 'name', e.target.value)
                    }}
                    disabled={isSubmitting}
                    className={`p-2 border rounded dark:bg-gray-800 dark:border-gray-700 
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <input
                    ref={currentFieldRefs.current[mealIndex].caloriesRef}
                    onKeyDown={(e) => handleItemKeyDown(e, mealIndex, itemIndex)}
                    type="number"
                    placeholder="Calories"
                    value={item.calories}
                    onChange={(e) => {
                      updateItem(mealIndex, itemIndex, 'calories', e.target.value)
                    }}
                    disabled={isSubmitting}
                    className={`p-2 border rounded dark:bg-gray-800 dark:border-gray-700 
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                {itemIndex > 0 && (
                  <Button
                    type="button"
                    variant="ghost-danger"
                    size="xs"
                    onClick={() => removeItem(mealIndex, itemIndex)}
                    disabled={isSubmitting}
                    className="self-center"
                    aria-label="Remove item"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => addItem(mealIndex)}
            disabled={isSubmitting}
          >
            + Add another item
          </Button>
        </Card>
      ))}

      <Card>
        <StatDisplay
          label="Total Calories"
          value={getTotalCalories()}
        />
      </Card>

      {(error || submitError) && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error?.message || submitError}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          variant="secondary"
          onClick={() => router.push('/caltrack')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
