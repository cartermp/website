'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const
type MealType = typeof MEAL_TYPES[number]

interface CalorieEntry {
  date: string
  meal_type: string
  meal_name: string
  calories: number
}

interface MealItem {
  name: string
  calories: string | number
}

interface MealGroup {
  type: MealType
  items: MealItem[]
}

interface EditCalorieFormProps {
  date: string
  initialEntries: CalorieEntry[]
}

export function EditCalorieForm({ date, initialEntries }: EditCalorieFormProps) {
  const router = useRouter()

  // Group initial entries by meal type
  const initialMealsByType: MealGroup[] = MEAL_TYPES.map(type => ({
    type,
    items: initialEntries
      .filter(entry => entry.meal_type === type)
      .map(entry => ({
        name: entry.meal_name,
        calories: entry.calories
      }))
  }))

  // Add empty item if a meal type has no entries
  initialMealsByType.forEach(meal => {
    if (meal.items.length === 0) {
      meal.items.push({ name: '', calories: '' })
    }
  })

  const [meals, setMeals] = useState<MealGroup[]>(initialMealsByType)

  const [errors, setErrors] = useState<{
    mealType: MealType;
    invalidItems: { index: number; nameError: string; caloriesError: string; }[];
  }[]>([])

  const addItem = (mealTypeIndex: number) => {
    const newMeals = [...meals]
    newMeals[mealTypeIndex].items.push({ name: '', calories: '' })
    setMeals(newMeals)
  }

  const removeItem = (mealTypeIndex: number, itemIndex: number) => {
    const newMeals = [...meals]
    newMeals[mealTypeIndex].items.splice(itemIndex, 1)
    if (newMeals[mealTypeIndex].items.length === 0) {
      newMeals[mealTypeIndex].items.push({ name: '', calories: '' })
    }
    setMeals(newMeals)
  }

  const updateItem = (mealTypeIndex: number, itemIndex: number, field: keyof MealItem, value: string) => {
    const newMeals = [...meals]
    newMeals[mealTypeIndex].items[itemIndex] = {
      ...newMeals[mealTypeIndex].items[itemIndex],
      [field]: value
    }
    setMeals(newMeals)
  }

  const validateForm = () => {
    // Check if any meal type has items with missing data
    const invalidMeals = meals.map((meal, mealIndex) => ({
      mealType: meal.type,
      invalidItems: meal.items
        .map((item, itemIndex) => ({
          index: itemIndex,
          nameError: !item.name.trim() ? "Name is required" : "",
          caloriesError: !item.calories ? "Calories are required" : ""
        }))
        .filter(item => item.nameError || item.caloriesError)
    })).filter(meal => meal.invalidItems.length > 0)

    return invalidMeals
  }

  const getTotalCalories = () => {
    return meals.reduce((total, meal) => {
      return total + meal.items.reduce((mealTotal, item) => {
        return mealTotal + (Number(item.calories) || 0)
      }, 0)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Prevent form submission on regular enter
      e.preventDefault()

      // Submit only if cmd/ctrl + enter
      if (e.metaKey || e.ctrlKey) {
        handleSubmit(e)
      }
    }
  }

  const [currentFieldRefs] = useState(MEAL_TYPES.map(() => ({
    nameRef: React.createRef<HTMLInputElement>(),
    caloriesRef: React.createRef<HTMLInputElement>()
  })))

  const handleItemKeyDown = (e: React.KeyboardEvent, mealTypeIndex: number, itemIndex: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const item = meals[mealTypeIndex].items[itemIndex]
      if (item.name && item.calories) {
        addItem(mealTypeIndex)
        setTimeout(() => {
          currentFieldRefs[mealTypeIndex].nameRef.current?.focus()
        }, 0)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (formErrors.length > 0) {
      setErrors(formErrors)
      return
    }

    setErrors([])
    try {
      // First, delete all entries for this date
      await fetch(`/api/caltrack/delete/${date}`, {
        method: 'DELETE'
      })

      // Then add the new entries
      const entries = meals.flatMap(meal =>
        meal.items
          .filter(item => item.name && item.calories)
          .map(item => ({
            date,
            meal_type: meal.type,
            meal_name: item.name,
            calories: Number(item.calories)
          }))
      )

      const res = await fetch('/api/caltrack/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      })

      if (res.ok) {
        router.push('/caltrack')
      }
    } catch (error) {
      console.error('Failed to save entries:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
      {meals.map((meal, mealIndex) => (
        <div key={meal.type} className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            {meal.type}
          </h2>

          <div className="space-y-4">
            {meal.items.map((item, itemIndex) => (
              <div key={itemIndex} className="grid grid-cols-[minmax(0,1fr),120px,40px] gap-4 items-start">
                <div className="flex flex-col w-full">
                  <input
                    ref={currentFieldRefs[mealIndex].nameRef}
                    onKeyDown={(e) => handleItemKeyDown(e, mealIndex, itemIndex)}
                    type="text"
                    placeholder="Meal name"
                    value={item.name}
                    onChange={(e) => {
                      updateItem(mealIndex, itemIndex, 'name', e.target.value)
                      setErrors([])
                    }}
                    className={`p-2 border rounded dark:bg-gray-800 dark:border-gray-700 ${errors.find(e => e.mealType === meal.type)?.invalidItems.find(i => i.index === itemIndex)?.nameError
                      ? 'border-red-500'
                      : ''
                      }`}
                  />
                  {errors.find(e => e.mealType === meal.type)?.invalidItems.find(i => i.index === itemIndex)?.nameError && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.find(e => e.mealType === meal.type)?.invalidItems.find(i => i.index === itemIndex)?.nameError}
                    </span>
                  )}
                </div>
                <div className="flex flex-col w-full">
                  <input
                    ref={currentFieldRefs[mealIndex].nameRef}
                    onKeyDown={(e) => handleItemKeyDown(e, mealIndex, itemIndex)}
                    type="number"
                    placeholder="Calories"
                    value={item.calories}
                    onChange={(e) => {
                      updateItem(mealIndex, itemIndex, 'calories', e.target.value)
                      setErrors([])
                    }}
                    className={`p-2 border rounded dark:bg-gray-800 dark:border-gray-700 ${errors.find(e => e.mealType === meal.type)?.invalidItems.find(i => i.index === itemIndex)?.caloriesError
                      ? 'border-red-500'
                      : ''
                      }`}
                  />
                  {errors.find(e => e.mealType === meal.type)?.invalidItems.find(i => i.index === itemIndex)?.caloriesError && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.find(e => e.mealType === meal.type)?.invalidItems.find(i => i.index === itemIndex)?.caloriesError}
                    </span>
                  )}
                </div>
                {itemIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeItem(mealIndex, itemIndex)}
                    className="text-red-500 hover:text-red-700 px-2 h-10"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addItem(mealIndex)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            + Add another item
          </button>
        </div>
      ))}

      <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <span className="text-lg font-medium">Total Calories:</span>
        <span className="text-lg">{getTotalCalories()}</span>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/caltrack')}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
