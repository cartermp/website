import {
    calculateDailyEntries,
    calculateDailyAverage,
    groupEntriesByMealType,
    calculateMealTypeTotals,
    LOWER_TARGET,
    UPPER_TARGET,
    MAINTAIN_TARGET
} from '../calorieUtils'
import type { CalorieEntry } from '../types'

describe('calorieUtils', () => {
    const mockEntries: CalorieEntry[] = [
        { date: '2024-02-15', meal_type: 'Breakfast', meal_name: 'Oatmeal', calories: 300 },
        { date: '2024-02-15', meal_type: 'Lunch', meal_name: 'Sandwich', calories: 400 },
        { date: '2024-02-15', meal_type: 'Dinner', meal_name: 'Chicken', calories: 500 },
        { date: '2024-02-16', meal_type: 'Breakfast', meal_name: 'Toast', calories: 200 },
        { date: '2024-02-16', meal_type: 'Lunch', meal_name: 'Salad', calories: 300 }
    ]

    describe('calculateDailyEntries', () => {
        it('groups entries by date and calculates totals', () => {
            const dailyEntries = calculateDailyEntries(mockEntries)
            
            expect(dailyEntries).toHaveLength(2)
            
            const feb15 = dailyEntries.find(d => d.date === '2024-02-15')
            expect(feb15?.entries).toHaveLength(3)
            expect(feb15?.totalCalories).toBe(1200)
            
            const feb16 = dailyEntries.find(d => d.date === '2024-02-16')
            expect(feb16?.entries).toHaveLength(2)
            expect(feb16?.totalCalories).toBe(500)
        })

        it('handles empty array', () => {
            const dailyEntries = calculateDailyEntries([])
            expect(dailyEntries).toHaveLength(0)
        })
    })

    describe('calculateDailyAverage', () => {
        it('calculates average calories per day', () => {
            const dailyEntries = calculateDailyEntries(mockEntries)
            const average = calculateDailyAverage(dailyEntries)
            
            // (1200 + 500) / 2 = 850
            expect(average).toBe(850)
        })

        it('returns 0 for empty array', () => {
            expect(calculateDailyAverage([])).toBe(0)
        })
    })

    describe('groupEntriesByMealType', () => {
        it('groups entries by meal type', () => {
            const grouped = groupEntriesByMealType(mockEntries)
            
            expect(Object.keys(grouped)).toHaveLength(3) // Breakfast, Lunch, Dinner
            expect(grouped['Breakfast']).toHaveLength(2)
            expect(grouped['Lunch']).toHaveLength(2)
            expect(grouped['Dinner']).toHaveLength(1)
        })

        it('preserves entry data', () => {
            const grouped = groupEntriesByMealType(mockEntries)
            
            const breakfast = grouped['Breakfast'][0]
            expect(breakfast).toEqual({
                date: '2024-02-15',
                meal_type: 'Breakfast',
                meal_name: 'Oatmeal',
                calories: 300
            })
        })

        it('handles empty array', () => {
            const grouped = groupEntriesByMealType([])
            expect(Object.keys(grouped)).toHaveLength(0)
        })
    })

    describe('calculateMealTypeTotals', () => {
        it('calculates totals for each meal type', () => {
            const grouped = groupEntriesByMealType(mockEntries)
            const totals = calculateMealTypeTotals(grouped)
            
            expect(totals).toHaveLength(3)
            
            const breakfast = totals.find(t => t.type === 'Breakfast')
            expect(breakfast?.total).toBe(500) // 300 + 200
            
            const lunch = totals.find(t => t.type === 'Lunch')
            expect(lunch?.total).toBe(700) // 400 + 300
            
            const dinner = totals.find(t => t.type === 'Dinner')
            expect(dinner?.total).toBe(500) // 500
        })

        it('handles empty meal types', () => {
            const totals = calculateMealTypeTotals({})
            expect(totals).toHaveLength(0)
        })
    })

    describe('calorie constants', () => {
        it('defines target calorie ranges', () => {
            expect(LOWER_TARGET).toBe(2300)
            expect(UPPER_TARGET).toBe(2600)
            expect(MAINTAIN_TARGET).toBe(2900)
            expect(UPPER_TARGET).toBeGreaterThan(LOWER_TARGET)
            expect(MAINTAIN_TARGET).toBeGreaterThan(UPPER_TARGET)
        })
    })
}) 