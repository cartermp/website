import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { MealGroup, CalorieEntry, MealType } from '../types'
import { MEAL_TYPES } from '../types'

interface UseCalorieFormProps {
    date: string
    initialEntries?: CalorieEntry[]
    mode: 'add' | 'edit'
}

interface FormError {
    mealType: MealType
    invalidItems: {
        index: number
        nameError: string
        caloriesError: string
    }[]
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
    const [errors, setErrors] = useState<FormError[]>([])

    const currentFieldRefs = useRef(MEAL_TYPES.map(() => ({
        nameRef: { current: null } as React.RefObject<HTMLInputElement>,
        caloriesRef: { current: null } as React.RefObject<HTMLInputElement>
    })))

    const addItem = useCallback((mealTypeIndex: number) => {
        console.log('Adding item to meal type:', mealTypeIndex) // Debug log

        setMeals(prev => {
            const newMeals = [...prev]
            // Explicitly create a new items array with a single new item
            const currentItems = [...newMeals[mealTypeIndex].items]
            currentItems.push({ name: '', calories: '' })

            newMeals[mealTypeIndex] = {
                ...newMeals[mealTypeIndex],
                items: currentItems
            }

            return newMeals
        })
    }, [])

    const removeItem = useCallback((mealTypeIndex: number, itemIndex: number) => {
        setMeals(prev => {
            const newMeals = [...prev]
            const mealGroup = [...newMeals[mealTypeIndex].items]

            // Remove the specific item
            mealGroup.splice(itemIndex, 1)

            // Ensure at least one empty item remains
            if (mealGroup.length === 0) {
                mealGroup.push({ name: '', calories: '' })
            }

            newMeals[mealTypeIndex] = {
                ...newMeals[mealTypeIndex],
                items: mealGroup
            }

            return newMeals
        })
    }, [])

    const updateItem = useCallback((mealTypeIndex: number, itemIndex: number, field: keyof MealGroup['items'][number], value: string) => {
        setMeals(prev => {
            const newMeals = [...prev]
            newMeals[mealTypeIndex].items = [...newMeals[mealTypeIndex].items]
            newMeals[mealTypeIndex].items[itemIndex] = {
                ...newMeals[mealTypeIndex].items[itemIndex],
                [field]: value
            }
            return newMeals
        })
        setSubmitError(null)
    }, [])

    const validateForm = useCallback(() => {
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

        const formErrors = validateForm()
        if (formErrors.length > 0) {
            setErrors(formErrors)
            return
        }

        setErrors([])
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
                    .filter(item => item.name.trim() && Number(item.calories) > 0)
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
        errors,
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
