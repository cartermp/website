export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const
export type MealType = typeof MEAL_TYPES[number]
