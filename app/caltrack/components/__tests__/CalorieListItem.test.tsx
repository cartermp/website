import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalorieListItem } from '../CalorieListItem'
import { formatDate } from '@/lib/dateUtils'
import { CalorieEntry } from '@/lib/types'
import { LOWER_TARGET, UPPER_TARGET, MAINTAIN_TARGET } from '@/lib/calorieUtils'

const mockEntries: CalorieEntry[] = [
    { date: '2024-01-01', meal_type: 'Breakfast', meal_name: 'Oatmeal', calories: 300 },
    { date: '2024-01-01', meal_type: 'Breakfast', meal_name: 'Banana', calories: 100 },
    { date: '2024-01-01', meal_type: 'Lunch', meal_name: 'Sandwich', calories: 400 },
]

describe('CalorieListItem', () => {
    const defaultProps = {
        date: '2024-01-01',
        entries: mockEntries,
        totalCalories: 800,
        targetCalories: UPPER_TARGET
    }

    it('renders basic information correctly', () => {
        render(<CalorieListItem {...defaultProps} />)
        
        // Check date is formatted and displayed
        expect(screen.getByText(formatDate('2024-01-01'))).toBeInTheDocument()
        
        // Check total calories are displayed
        expect(screen.getByText('800 calories')).toBeInTheDocument()
        
        // Check edit link is present
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Edit').closest('a')).toHaveAttribute('href', '/caltrack/edit/2024-01-01')
    })

    it('expands and collapses when clicked', () => {
        render(<CalorieListItem {...defaultProps} />)
        
        // Initially, meal details should not be visible
        expect(screen.queryByText('Oatmeal (300 cal)')).not.toBeInTheDocument()
        
        // Click to expand
        fireEvent.click(screen.getByText(formatDate('2024-01-01')).closest('button')!)
        
        // Check meal type headers and items are now visible
        expect(screen.getByText('Breakfast (400 cal)')).toBeInTheDocument()
        expect(screen.getByText('Lunch (400 cal)')).toBeInTheDocument()
        expect(screen.getByText('Oatmeal')).toBeInTheDocument()
        expect(screen.getByText('Banana')).toBeInTheDocument()
        expect(screen.getByText('Sandwich')).toBeInTheDocument()
        
        // Click again to collapse
        fireEvent.click(screen.getByText(formatDate('2024-01-01')).closest('button')!)
        
        // Verify items are hidden again
        expect(screen.queryByText('Breakfast (400 cal)')).not.toBeInTheDocument()
    })

    it('displays calories in correct color based on total vs target', () => {
        // Mock the dark mode detection
        const originalContains = document.documentElement.classList.contains;
        document.documentElement.classList.contains = jest.fn().mockReturnValue(false);
        
        const { rerender } = render(<CalorieListItem {...defaultProps} />)
        
        // With calories under target, should use a color
        const caloriesElement = screen.getByText('800 calories')
        expect(caloriesElement.style.color).toBeTruthy()
        
        // Test with calories over maintain target
        const maintainPlusCalories = MAINTAIN_TARGET + 100;
        rerender(<CalorieListItem {...defaultProps} totalCalories={maintainPlusCalories} />)
        
        // Should now use a different color
        const updatedCaloriesElement = screen.getByText(`${maintainPlusCalories} calories`)
        expect(updatedCaloriesElement.style.color).toBeTruthy()
        
        // Test with calories at lower target
        rerender(<CalorieListItem {...defaultProps} totalCalories={LOWER_TARGET} />)
        
        // Should use a color
        const lowerElement = screen.getByText(`${LOWER_TARGET} calories`)
        expect(lowerElement.style.color).toBeTruthy()
        
        // Restore original function
        document.documentElement.classList.contains = originalContains;
    })

    it('handles empty entries gracefully', () => {
        render(<CalorieListItem {...defaultProps} entries={[]} totalCalories={0} />)
        
        expect(screen.getByText('0 calories')).toBeInTheDocument()
        
        // Expand to check empty state
        fireEvent.click(screen.getByText(formatDate('2024-01-01')).closest('button')!)
        
        // Should still render without errors, but no meal types should be visible
        expect(screen.queryByText('Breakfast')).not.toBeInTheDocument()
        expect(screen.queryByText('Lunch')).not.toBeInTheDocument()
    })
}) 