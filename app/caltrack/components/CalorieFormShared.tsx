'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCalorieForm } from '@/lib/hooks/useCalorieForm'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { StatDisplay } from './ui/stat-display'
import type { CalorieEntry } from '@/lib/types'
import { getToday } from '@/lib/dateUtils'
import { FoodAutocomplete } from './FoodAutocomplete'

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
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6 sm:space-y-8">
      {meals.map((meal, mealIndex) => (
        <Card key={meal.type} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
            {meal.type}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {meal.items.map((item, itemIndex) => (
              <div 
                key={itemIndex} 
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr),120px,40px] gap-2 sm:gap-4 items-start"
              >
                <FoodAutocomplete
                  value={item.name}
                  calories={item.calories}
                  onNameChange={(value) => updateItem(mealIndex, itemIndex, 'name', value)}
                  onCaloriesChange={(value) => updateItem(mealIndex, itemIndex, 'calories', value)}
                  onKeyDown={(e) => handleItemKeyDown(e, mealIndex, itemIndex)}
                  disabled={isSubmitting}
                  nameRef={currentFieldRefs.current[mealIndex].nameRef}
                  caloriesRef={currentFieldRefs.current[mealIndex].caloriesRef}
                />
                <div className="flex gap-2 items-start">
                  <div className="flex-1 sm:flex-none">
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
                      className={`p-2 w-full text-base sm:text-base border rounded dark:bg-gray-800 dark:border-gray-700 
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
                      className="self-center mt-1"
                      aria-label="Remove item"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => addItem(mealIndex)}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-base"
          >
            + Add another item
          </Button>
        </Card>
      ))}

      <Card className="p-3 sm:p-4">
        <StatDisplay
          label="Total Calories"
          value={`${getTotalCalories()} calories`}
          valueColor={getTotalCalories() > 2000 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
          className="text-base sm:text-lg"
        />
      </Card>

      {(error || submitError) && (
        <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm sm:text-base">
          {error?.message || submitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        <Button
          variant="secondary"
          onClick={() => router.push('/caltrack')}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-base"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full sm:w-auto text-base"
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
