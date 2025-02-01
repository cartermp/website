import type { CalorieEntry, DailyEntry } from './types'
import { groupEntriesByDate } from './dateUtils'

export function calculateDailyEntries(entries: CalorieEntry[]): DailyEntry[] {
    const entriesByDate = groupEntriesByDate(entries)

    return Object.entries(entriesByDate)
        .map(([date, dayEntries]) => ({
            date,
            entries: dayEntries,
            totalCalories: dayEntries.reduce((sum, entry) => sum + entry.calories, 0)
        }))
}

export function calculateDailyAverage(entries: DailyEntry[]): number {
    if (entries.length === 0) return 0
    return entries.reduce((sum, day) => sum + day.totalCalories, 0) / entries.length
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
        total: meals.reduce((sum, meal) => sum + meal.calories, 0)
    }))
}

export const TARGET_CALORIES = 2400
export const MAX_TDEE_CALORIES = 3500
