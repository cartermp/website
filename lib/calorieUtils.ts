import type { CalorieEntry, DailyEntry } from './types'
import { groupEntriesByDate } from './dateUtils'

export function calculateDailyEntries(entries: CalorieEntry[]): DailyEntry[] {
    const entriesByDate = groupEntriesByDate(entries)

    return Object.entries(entriesByDate)
        .map(([date, dayEntries]) => ({
            date,
            entries: dayEntries,
            totalCalories: Math.round(dayEntries.reduce((sum, entry) => sum + entry.calories, 0))
        }))
}

export function calculateDailyAverage(entries: DailyEntry[]): number {
    if (entries.length === 0) return 0
    const total = entries.reduce((sum, entry) => sum + entry.totalCalories, 0)
    return Math.round(total / entries.length)
}

export function groupEntriesByMealType(entries: CalorieEntry[]) {
    return entries.reduce((acc, entry) => {
        if (!acc[entry.meal_type]) {
            acc[entry.meal_type] = []
        }
        acc[entry.meal_type].push(entry)
        return acc
    }, {} as Record<string, CalorieEntry[]>)
}

export function calculateMealTypeTotals(mealsByType: Record<string, CalorieEntry[]>) {
    return Object.entries(mealsByType).map(([type, meals]) => ({
        type,
        total: Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0))
    }))
}

// Calculate statistics for a day compared to a range of days
export function calculateDayStats(dayEntries: CalorieEntry[], rangeEntries: CalorieEntry[]) {
    // Calculate daily totals for the range
    const dailyEntries = calculateDailyEntries(rangeEntries)
    const avgCalories = calculateDailyAverage(dailyEntries)
    
    // Calculate total for the specific day
    const dayTotal = Math.round(dayEntries.reduce((sum, entry) => sum + entry.calories, 0))
    
    // Calculate percentage difference from average
    const percentDiff = avgCalories ? ((dayTotal - avgCalories) / avgCalories) * 100 : 0
    
    // Calculate trend (are calories increasing or decreasing?)
    const trend = dailyEntries
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(day => day.totalCalories)
    
    // Calculate if this is the highest or lowest day
    const isHighest = dayTotal === Math.max(...dailyEntries.map(d => d.totalCalories))
    const isLowest = dayTotal === Math.min(...dailyEntries.map(d => d.totalCalories))
    
    // Calculate meal type distribution
    const dayMealTypes = groupEntriesByMealType(dayEntries)
    const rangeMealTypes = groupEntriesByMealType(rangeEntries)
    
    const mealTypeComparison = Object.entries(dayMealTypes).map(([type, meals]) => {
        const dayTotal = Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0))
        const rangeAvg = rangeMealTypes[type]
            ? Math.round(rangeMealTypes[type].reduce((sum, meal) => sum + meal.calories, 0) / dailyEntries.length)
            : 0
        return {
            type,
            dayTotal,
            rangeAvg,
            diff: dayTotal - rangeAvg
        }
    })

    return {
        dayTotal,
        avgCalories,
        percentDiff,
        trend,
        isHighest,
        isLowest,
        mealTypeComparison
    }
}

export const LOWER_TARGET = 2400
export const UPPER_TARGET = 2700
export const MAINTAIN_TARGET = 2800
