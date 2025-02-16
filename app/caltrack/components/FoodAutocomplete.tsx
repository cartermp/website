'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { getFoodItems } from '@/lib/getData'
import type { FoodItem } from '@/lib/types'

interface FoodAutocompleteProps {
    value: string
    calories: string | number
    onNameChange: (value: string) => void
    onCaloriesChange: (value: string) => void
    onKeyDown?: (e: React.KeyboardEvent) => void
    disabled?: boolean
    nameRef?: React.RefObject<HTMLInputElement>
    caloriesRef?: React.RefObject<HTMLInputElement>
}

const PLACEHOLDER = {
    LOADING: "Loading food items...",
    DEFAULT: "Click to see previous meals or type to search"
} as const

export function FoodAutocomplete({
    value,
    calories,
    onNameChange,
    onCaloriesChange,
    onKeyDown,
    disabled,
    nameRef,
    caloriesRef
}: FoodAutocompleteProps) {
    // State
    const [suggestions, setSuggestions] = useState<FoodItem[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // Refs
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Memoized filter function
    const filterSuggestions = useCallback((searchValue: string) => {
        const normalizedSearch = searchValue.toLowerCase()
        return searchValue
            ? allFoodItems.filter(item => 
                item.meal_name.toLowerCase().includes(normalizedSearch)
              )
            : allFoodItems
    }, [allFoodItems])

    // Load food items on mount
    useEffect(() => {
        let mounted = true

        const loadFoodItems = async () => {
            try {
                const items = await getFoodItems()
                if (mounted) {
                    setAllFoodItems(items)
                }
            } catch (error) {
                console.error('Failed to load food items:', error)
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        loadFoodItems()
        return () => { mounted = false }
    }, [])

    // Handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Event handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        onNameChange(inputValue)
        setSuggestions(filterSuggestions(inputValue))
        setShowSuggestions(true)
    }, [onNameChange, filterSuggestions])

    const handleSuggestionClick = useCallback((suggestion: FoodItem) => {
        onNameChange(suggestion.meal_name)
        onCaloriesChange(suggestion.calories.toString())
        setShowSuggestions(false)
    }, [onNameChange, onCaloriesChange])

    const handleFocus = useCallback(() => {
        setSuggestions(filterSuggestions(value))
        setShowSuggestions(true)
    }, [value, filterSuggestions])

    // Memoize the suggestions list to prevent unnecessary re-renders
    const suggestionsList = useMemo(() => (
        showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                {suggestions.map((suggestion, index) => (
                    <li
                        key={`${suggestion.meal_name}-${suggestion.calories}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
                    >
                        <span>{suggestion.meal_name}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {suggestion.calories} cal
                        </span>
                    </li>
                ))}
            </ul>
        )
    ), [suggestions, showSuggestions, handleSuggestionClick])

    return (
        <div ref={wrapperRef} className="relative flex-1">
            <input
                ref={nameRef}
                type="text"
                placeholder={isLoading ? PLACEHOLDER.LOADING : PLACEHOLDER.DEFAULT}
                value={value}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                onFocus={handleFocus}
                onClick={handleFocus}
                disabled={disabled || isLoading}
                className={`p-2 w-full text-base border rounded dark:bg-gray-800 dark:border-gray-700 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {suggestionsList}
        </div>
    )
} 