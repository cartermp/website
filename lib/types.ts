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
    isExcluded?: boolean
}

export interface FoodItem {
    meal_name: string
    calories: number
}

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const
export type MealType = typeof MEAL_TYPES[number]

export interface DailyStats {
    date: string;
    total_calories: number;
    breakfast_calories: number;
    lunch_calories: number;
    dinner_calories: number;
    snacks_calories: number;
    is_excluded?: boolean;
}

export interface CalorieData {
    entries: CalorieEntry[];
    stats: DailyStats | null;
    overallAverage: number;
}
