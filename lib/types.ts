export interface CalorieEntry {
    date: string
    meal_type: MealType
    meal_name: string
    calories: number
}

export interface MealItem {
    name: string
    calories: string | number
}

export interface MealGroup {
    type: MealType
    items: MealItem[]
}

export interface DailyEntry {
    date: string
    entries: CalorieEntry[]
    totalCalories: number
}

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const
export type MealType = typeof MEAL_TYPES[number]

