'use client'

import { useState, useEffect } from 'react'
import { FoodItem } from '@/lib/types'
import { getFoodItems } from '@/lib/getData'
import { FoodAutocomplete } from '../components/FoodAutocomplete'
import { Button } from '../components/ui/button'

export default function AdminPage() {
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [calories, setCalories] = useState('')
    const [newName, setNewName] = useState('')
    const [newCalories, setNewCalories] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        loadFoodItems()
    }, [])

    const loadFoodItems = async () => {
        try {
            const items = await getFoodItems()
            setAllFoodItems(items)
        } catch (error) {
            console.error('Failed to load food items:', error)
        }
    }

    const handleFoodSelect = (name: string, cal: string) => {
        const food = allFoodItems.find(f => f.meal_name === name && f.calories.toString() === cal.toString())
        if (food) {
            setSelectedFood(food)
            setNewName(food.meal_name)
            setNewCalories(food.calories.toString())
        }
    }

    // Use effect to automatically select food when both name and calories are set
    useEffect(() => {
        if (searchValue && calories) {
            const food = allFoodItems.find(f => 
                f.meal_name === searchValue && f.calories.toString() === calories.toString()
            )
            if (food && (!selectedFood || selectedFood.meal_name !== food.meal_name)) {
                setSelectedFood(food)
                setNewName(food.meal_name)
                setNewCalories(food.calories.toString())
            }
        }
    }, [searchValue, calories, allFoodItems, selectedFood])

    const handleSave = async () => {
        if (!selectedFood || !newName.trim() || !newCalories.trim()) {
            setMessage('Please fill in all fields')
            return
        }

        const caloriesNum = parseInt(newCalories)
        if (isNaN(caloriesNum) || caloriesNum <= 0) {
            setMessage('Please enter a valid calorie amount')
            return
        }

        setIsLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/caltrack/admin/update-meal', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldName: selectedFood.meal_name,
                    newName: newName.trim(),
                    newCalories: caloriesNum
                })
            })

            const result = await response.json()
            
            if (response.ok) {
                setMessage(`Successfully updated meal across ${result.affectedDates} dates`)
                setSelectedFood(null)
                setSearchValue('')
                setCalories('')
                setNewName('')
                setNewCalories('')
                setRefreshTrigger(prev => prev + 1) // Trigger refresh of autocomplete
                await loadFoodItems() // Refresh the local food list
            } else {
                setMessage(result.error || 'Failed to update meal')
            }
        } catch (error) {
            console.error('Error updating meal:', error)
            setMessage('Failed to update meal')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setSelectedFood(null)
        setSearchValue('')
        setCalories('')
        setNewName('')
        setNewCalories('')
        setMessage('')
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Admin - Edit Meal Data
                </h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search for meal to edit
                        </label>
                        <FoodAutocomplete
                            value={searchValue}
                            calories={calories}
                            onNameChange={setSearchValue}
                            onCaloriesChange={setCalories}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>

                    {selectedFood && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Editing: {selectedFood.meal_name} ({selectedFood.calories} cal)
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New meal name
                                    </label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Enter new meal name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New calories
                                    </label>
                                    <input
                                        type="number"
                                        value={newCalories}
                                        onChange={(e) => setNewCalories(e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Enter new calorie amount"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="bg-gray-600 hover:bg-gray-700"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`p-3 rounded ${
                            message.includes('Successfully') 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}