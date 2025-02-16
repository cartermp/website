import React from 'react'
import { render, screen } from '@testing-library/react'
import { CalorieList } from '../CalorieList'
import { TARGET_CALORIES, MAX_TDEE_CALORIES } from '@/lib/calorieUtils'
import type { CalorieEntry, MealType } from '@/lib/types'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
            pathname: '/'
        }
    }
}))

// Mock the chart component since we're not testing it here
jest.mock('../CalorieTrendChart', () => ({
    CalorieTrendChart: () => <div data-testid="trend-chart" />
}))

// Mock the share button component since we're not testing it here
jest.mock('../ShareButton', () => ({
    ShareButton: ({ date }: { date: string }) => (
        <div data-testid="share-button" data-date={date}>Share Today's Report</div>
    )
}))

describe('CalorieList', () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

    const mockEntries: CalorieEntry[] = [
        // Today - high calories
        { date: today, meal_type: 'Breakfast' as MealType, meal_name: 'Oatmeal', calories: 300 },
        { date: today, meal_type: 'Lunch' as MealType, meal_name: 'Sandwich', calories: 500 },
        { date: today, meal_type: 'Dinner' as MealType, meal_name: 'Steak', calories: 800 },
        // Yesterday - low calories
        { date: yesterday, meal_type: 'Breakfast' as MealType, meal_name: 'Toast', calories: 200 },
        { date: yesterday, meal_type: 'Lunch' as MealType, meal_name: 'Salad', calories: 300 },
        { date: yesterday, meal_type: 'Dinner' as MealType, meal_name: 'Soup', calories: 400 },
        // Two days ago - medium calories
        { date: twoDaysAgo, meal_type: 'Breakfast' as MealType, meal_name: 'Eggs', calories: 400 },
        { date: twoDaysAgo, meal_type: 'Lunch' as MealType, meal_name: 'Burger', calories: 600 },
        { date: twoDaysAgo, meal_type: 'Dinner' as MealType, meal_name: 'Fish', calories: 500 }
    ]

    it('renders all main sections', () => {
        render(<CalorieList initialEntries={mockEntries} />)
        
        expect(screen.getByText('Target:')).toBeInTheDocument()
        expect(screen.getByText('7-Day Avg:')).toBeInTheDocument()
        expect(screen.getByText('vs Overall:')).toBeInTheDocument()
        expect(screen.getByText('Calorie Intake Trends')).toBeInTheDocument()
    })

    it('displays target calories correctly', () => {
        render(<CalorieList initialEntries={mockEntries} />)
        
        expect(screen.getByText(`${TARGET_CALORIES} calories`)).toBeInTheDocument()
    })

    it('calculates and displays 7-day average correctly', () => {
        render(<CalorieList initialEntries={mockEntries} />)
        
        // Total per day:
        // Today: 1600
        // Yesterday: 900
        // Two days ago: 1500
        // Average = 1333.33...
        const expectedAvg = Math.round((1600 + 900 + 1500) / 3)
        
        expect(screen.getByText(`${expectedAvg} cal`)).toBeInTheDocument()
    })

    it('shows 7-day average in green when below target', () => {
        const lowCalorieEntries: CalorieEntry[] = [
            { date: today, meal_type: 'Breakfast' as MealType, meal_name: 'Toast', calories: 200 },
            { date: today, meal_type: 'Lunch' as MealType, meal_name: 'Salad', calories: 300 }
        ]
        
        render(<CalorieList initialEntries={lowCalorieEntries} />)
        
        const avgValue = screen.getByText('500 cal')
        expect(avgValue).toHaveClass('text-green-600', 'dark:text-green-400')
    })

    it('shows 7-day average in red when above target', () => {
        const highCalorieEntries: CalorieEntry[] = [
            { date: today, meal_type: 'Breakfast' as MealType, meal_name: 'Pancakes', calories: 800 },
            { date: today, meal_type: 'Lunch' as MealType, meal_name: 'Burger', calories: 1000 },
            { date: today, meal_type: 'Dinner' as MealType, meal_name: 'Pizza', calories: 1200 }
        ]
        
        render(<CalorieList initialEntries={highCalorieEntries} />)
        
        const avgValue = screen.getByText('3000 cal')
        expect(avgValue).toHaveClass('text-red-600', 'dark:text-red-400')
    })

    it('calculates and displays trend percentage correctly', () => {
        render(<CalorieList initialEntries={mockEntries} />)
        
        // Recent average (3 days) = 1333.33
        // Overall average (3 days) = 1333.33
        // Trend = 0%
        const trendValue = screen.getByText('+0%')
        expect(trendValue).toHaveClass('text-gray-600', 'dark:text-gray-400')
    })

    it('shows positive trend in red', () => {
        const entries: CalorieEntry[] = [
            // Recent entries (first 7 days) - high calories (2000 per day)
            { date: '2025-02-16', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-15', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-14', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-13', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-12', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-11', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-10', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            // Older entries - low calories (500 per day)
            { date: '2025-02-09', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-08', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-07', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-06', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-05', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-04', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-03', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 }
        ]
        
        render(<CalorieList initialEntries={entries} />)
        
        // Recent average (7 days) = 2000
        // Overall average = 1250 (2000 * 7 + 500 * 7) / 14
        // Trend = ((2000 - 1250) / 1250) * 100 = +60%
        const trendValue = screen.getByText('+60%')
        expect(trendValue).toHaveClass('text-red-600')
    })

    it('shows negative trend in green', () => {
        const entries: CalorieEntry[] = [
            // Recent entries (first 7 days) - low calories (500 per day)
            { date: '2025-02-16', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-15', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-14', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-13', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-12', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-11', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            { date: '2025-02-10', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 500 },
            // Older entries - high calories (2000 per day)
            { date: '2025-02-09', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-08', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-07', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-06', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-05', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-04', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-03', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 }
        ]
        
        render(<CalorieList initialEntries={entries} />)
        
        // Recent average (7 days) = 500
        // Overall average = 1250 (500 * 7 + 2000 * 7) / 14
        // Trend = ((500 - 1250) / 1250) * 100 = -60%
        const trendValue = screen.getByText('-60%')
        expect(trendValue).toHaveClass('text-green-600')
    })

    it('handles empty entries gracefully', () => {
        render(<CalorieList initialEntries={[]} />)
        
        expect(screen.getByText('0 cal')).toBeInTheDocument()
        expect(screen.getByText('+0%')).toBeInTheDocument()
    })

    it('sorts entries by date in descending order', () => {
        render(<CalorieList initialEntries={mockEntries} />)
        
        // Check that dates are displayed in descending order
        const dates = screen.getAllByText(/February \d+, 2025/)
        expect(dates).toHaveLength(3)
        
        // The dates should be in descending order
        const dateTexts = dates.map(el => el.textContent)
        expect(dateTexts).toEqual([
            'February 16, 2025',
            'February 15, 2025',
            'February 14, 2025'
        ])
    })
}) 