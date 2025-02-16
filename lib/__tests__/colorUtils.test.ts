import { getCalorieColor } from '../colorUtils'
import { TARGET_CALORIES, MAX_TDEE_CALORIES } from '../calorieUtils'

describe('colorUtils', () => {
    describe('getCalorieColor', () => {
        it('returns green color for calories under target', () => {
            const color = getCalorieColor(TARGET_CALORIES - 100)
            expect(color).toBe('rgb(22,163,74)') // Light mode green
            
            const darkColor = getCalorieColor(TARGET_CALORIES - 100, true)
            expect(darkColor).toBe('rgb(34,197,94)') // Dark mode green
        })

        it('returns red color for calories over max TDEE', () => {
            const color = getCalorieColor(MAX_TDEE_CALORIES + 100)
            expect(color).toBe('rgb(220,38,38)') // Light mode red
            
            const darkColor = getCalorieColor(MAX_TDEE_CALORIES + 100, true)
            expect(darkColor).toBe('rgb(239,68,68)') // Dark mode red
        })

        it('returns interpolated color for calories between target and max', () => {
            const midPoint = (TARGET_CALORIES + MAX_TDEE_CALORIES) / 2
            const color = getCalorieColor(midPoint)
            
            // Verify it's a valid RGB color (allowing for space or comma separation)
            expect(color).toMatch(/^rgb\(\d+[,\s]+\d+[,\s]+\d+\)$/)
            
            // Verify it's different from both endpoints
            expect(color).not.toBe('rgb(22,163,74)')
            expect(color).not.toBe('rgb(220,38,38)')
        })

        it('handles edge cases', () => {
            // At target calories
            expect(getCalorieColor(TARGET_CALORIES)).toBe('rgb(22,163,74)')
            expect(getCalorieColor(TARGET_CALORIES, true)).toBe('rgb(34,197,94)')
            
            // At max TDEE
            expect(getCalorieColor(MAX_TDEE_CALORIES)).toBe('rgb(220,38,38)')
            expect(getCalorieColor(MAX_TDEE_CALORIES, true)).toBe('rgb(239,68,68)')
        })
    })
}) 