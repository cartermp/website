import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { MealGroup, CalorieEntry } from '../types'
import { MEAL_TYPES } from '../types'

interface UseCalorieFormProps {
    date: string
    initialEntries?: CalorieEntry[]
    mode: 'add' | 'edit'
}

interface FormError {
    message: string;
}

export function useCalorieForm({ date, initialEntries = [], mode }: UseCalorieFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Initialize meals state
    const initialMealsByType: MealGroup[] = MEAL_TYPES.map(type => ({
        type,
        items: initialEntries
            .filter(entry => entry.meal_type === type)
            .map(entry => ({
                name: entry.meal_name,
                calories: entry.calories
            })) || [{ name: '', calories: '' }]
    }))

    // Add empty item if a meal type has no entries
    initialMealsByType.forEach(meal => {
        if (meal.items.length === 0) {
            meal.items.push({ name: '', calories: '' })
        }
    })

    const [meals, setMeals] = useState<MealGroup[]>(initialMealsByType)
    const [error, setError] = useState<FormError | null>(null)

    const currentFieldRefs = useRef(MEAL_TYPES.map(() => ({
        nameRef: { current: null } as React.RefObject<HTMLInputElement>,
        caloriesRef: { current: null } as React.RefObject<HTMLInputElement>
    })))

    const addItem = useCallback((mealTypeIndex: number) => {
        setMeals(prev => {
            const newMeals = [...prev]
            const newMeal = { name: '', calories: '' }
            newMeals[mealTypeIndex].items = [...newMeals[mealTypeIndex].items, newMeal]
            return newMeals
        })
    }, [])

    const removeItem = useCallback((mealTypeIndex: number, itemIndex: number) => {
        setMeals(prev => {
            const newMeals = [...prev]
            const currentItems = [...newMeals[mealTypeIndex].items]

            // Remove the specific item
            currentItems.splice(itemIndex, 1)

            // Ensure at least one empty item remains
            if (currentItems.length === 0) {
                currentItems.push({ name: '', calories: '' })
            }

            newMeals[mealTypeIndex] = {
                ...newMeals[mealTypeIndex],
                items: currentItems
            }

            return newMeals
        })
    }, [])

    const updateItem = useCallback((mealTypeIndex: number, itemIndex: number, field: keyof MealGroup['items'][number], value: string) => {
        setMeals(prev => {
            const newMeals = [...prev]
            const currentItems = [...newMeals[mealTypeIndex].items]
            currentItems[itemIndex] = {
                ...currentItems[itemIndex],
                [field]: value
            }

            newMeals[mealTypeIndex] = {
                ...newMeals[mealTypeIndex],
                items: currentItems
            }

            return newMeals
        })
        setSubmitError(null)
    }, [])

    const validateForm = useCallback(() => {
        // Check if there's at least one complete meal entry
        const hasCompleteMeal = meals.some(meal =>
            meal.items.some(item =>
                item.name.trim() && item.calories
            )
        )

        if (!hasCompleteMeal) {
            return { message: "Please add at least one meal with both name and calories" }
        }

        return null
    }, [meals])

    const getTotalCalories = useCallback(() => {
        return meals.reduce((total, meal) => {
            return total + meal.items.reduce((mealTotal, item) => {
                return mealTotal + (Number(item.calories) || 0)
            }, 0)
        }, 0)
    }, [meals])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)
        setError(null)

        const formError = validateForm()
        if (formError) {
            setError(formError)
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === 'edit') {
                const deleteRes = await fetch(`/api/caltrack/delete/${date}`, {
                    method: 'DELETE'
                })

                if (!deleteRes.ok) {
                    throw new Error('Failed to delete existing entries')
                }
            }

            // Filter out empty entries before submitting
            const entries = meals.flatMap(meal =>
                meal.items
                    .filter(item => item.name.trim() && item.calories)
                    .map(item => ({
                        date,
                        meal_type: meal.type,
                        meal_name: item.name.trim(),
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

            if (!res.ok) {
                throw new Error('Failed to save entries')
            }

            router.push('/caltrack')
        } catch (error) {
            console.error('Failed to save entries:', error)
            setSubmitError(error instanceof Error ? error.message : 'Failed to save entries')
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
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
    }
}
