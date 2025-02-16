import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalorieListItem } from '../CalorieListItem'
import { formatDate } from '@/lib/dateUtils'
import { CalorieEntry } from '@/lib/types'
import { TARGET_CALORIES, MAX_TDEE_CALORIES } from '@/lib/calorieUtils'

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
        targetCalories: TARGET_CALORIES
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
        const { rerender } = render(<CalorieListItem {...defaultProps} />)
        
        // With calories under target, should use success color
        const caloriesElement = screen.getByText('800 calories')
        expect(caloriesElement.style.color).toBe('rgb(22, 163, 74)')
        
        // Rerender with calories over max TDEE
        rerender(<CalorieListItem {...defaultProps} totalCalories={MAX_TDEE_CALORIES} />)
        
        // Should now use danger color
        const updatedCaloriesElement = screen.getByText(`${MAX_TDEE_CALORIES} calories`)
        expect(updatedCaloriesElement.style.color).toBe('rgb(220, 38, 38)')
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