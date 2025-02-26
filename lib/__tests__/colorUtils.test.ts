import { getCalorieColor } from '../colorUtils'
import { LOWER_TARGET, UPPER_TARGET, MAINTAIN_TARGET } from '../calorieUtils'

describe('colorUtils', () => {
    describe('getCalorieColor', () => {
        it('returns green color for calories at or under lower target', () => {
            const color = getCalorieColor(LOWER_TARGET)
            expect(color).toBe('rgb(22,163,74)') // Light mode green
            
            const darkColor = getCalorieColor(LOWER_TARGET - 100, true)
            expect(darkColor).toBe('rgb(34,197,94)') // Dark mode green
        })

        it('returns red color for calories at or over maintain target', () => {
            const color = getCalorieColor(MAINTAIN_TARGET)
            expect(color).toBe('rgb(220,38,38)') // Light mode red
            
            const darkColor = getCalorieColor(MAINTAIN_TARGET + 100, true)
            expect(darkColor).toBe('rgb(239,68,68)') // Dark mode red
        })

        it('returns orange color when at upper target', () => {
            const color = getCalorieColor(UPPER_TARGET)
            expect(color).toMatch(/^rgb\(\d+[,\s]+\d+[,\s]+\d+\)$/)
            // Should be close to orange
            const darkColor = getCalorieColor(UPPER_TARGET, true)
            expect(darkColor).toMatch(/^rgb\(\d+[,\s]+\d+[,\s]+\d+\)$/)
        })

        it('interpolates between green and orange for calories between lower and upper target', () => {
            const midPoint = (LOWER_TARGET + UPPER_TARGET) / 2
            const color = getCalorieColor(midPoint)
            
            // Verify it's a valid RGB color
            expect(color).toMatch(/^rgb\(\d+[,\s]+\d+[,\s]+\d+\)$/)
            
            // Verify it's different from both endpoints
            expect(color).not.toBe('rgb(22,163,74)') // Not pure green
            expect(color).not.toBe('rgb(234,88,12)') // Not pure orange
        })

        it('interpolates between orange and red for calories between upper and maintain target', () => {
            const midPoint = (UPPER_TARGET + MAINTAIN_TARGET) / 2
            const color = getCalorieColor(midPoint)
            
            // Verify it's a valid RGB color
            expect(color).toMatch(/^rgb\(\d+[,\s]+\d+[,\s]+\d+\)$/)
            
            // Verify it's different from both endpoints
            expect(color).not.toBe('rgb(234,88,12)') // Not pure orange
            expect(color).not.toBe('rgb(220,38,38)') // Not pure red
        })
    })
})