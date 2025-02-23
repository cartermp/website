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
        <div data-testid="share-button" data-date={date}>Share Today&apos;s Report</div>
    )
}))

describe('CalorieList', () => {
    const today = 'February 16, 2025'
    const yesterday = 'February 15, 2025'
    const twoDaysAgo = 'February 14, 2025'

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
        render(<CalorieList initialData={{ entries: mockEntries, overallAverage: 1500 }} />)
        
        expect(screen.getByText('Target:')).toBeInTheDocument()
        expect(screen.getByText('7 Day Avg:')).toBeInTheDocument()
        expect(screen.getByText('Overall Avg:')).toBeInTheDocument()
    })

    it('displays target calories correctly', () => {
        render(<CalorieList initialData={{ entries: mockEntries, overallAverage: 1500 }} />)
        
        expect(screen.getByText(`${TARGET_CALORIES} cal`)).toBeInTheDocument()
    })

    it('calculates and displays 7-day average correctly', () => {
        render(<CalorieList initialData={{ entries: mockEntries, overallAverage: 1500 }} />)
        
        // Total per day:
        // Today: 1600
        // Yesterday: 900
        // Two days ago: 1500
        // Average = 1333.33...
        expect(screen.getByText('1333 cal')).toBeInTheDocument()
    })

    it('shows low calories in green', () => {
        const lowCalorieEntries: CalorieEntry[] = [
            { date: today, meal_type: 'Breakfast' as MealType, meal_name: 'Toast', calories: 200 },
            { date: today, meal_type: 'Lunch' as MealType, meal_name: 'Salad', calories: 300 }
        ]
        
        render(<CalorieList initialData={{ entries: lowCalorieEntries, overallAverage: 1500 }} />)
        
        const avgValue = screen.getByText('500 cal')
        expect(avgValue).toHaveClass('text-green-600')
    })

    it('shows high calories in red', () => {
        const highCalorieEntries: CalorieEntry[] = [
            { date: today, meal_type: 'Breakfast' as MealType, meal_name: 'Pancakes', calories: 800 },
            { date: today, meal_type: 'Lunch' as MealType, meal_name: 'Burger', calories: 1000 },
            { date: today, meal_type: 'Dinner' as MealType, meal_name: 'Pizza', calories: 1200 }
        ]
        
        render(<CalorieList initialData={{ entries: highCalorieEntries, overallAverage: 1500 }} />)
        
        const avgValue = screen.getByText('3000 cal')
        expect(avgValue).toHaveClass('text-red-600')
    })

    it('calculates and displays trend percentage correctly', () => {
        render(<CalorieList initialData={{ entries: mockEntries, overallAverage: 1500 }} />)
        
        // Recent average (3 days) = 1333.33
        // Overall average = 1500
        // Trend = -11.1%
        expect(screen.getByText('-11.1%')).toBeInTheDocument()
    })

    it('handles empty entries gracefully', () => {
        render(<CalorieList initialData={{ entries: [], overallAverage: 1500 }} />)
        
        expect(screen.getByText('0 cal')).toBeInTheDocument()
        expect(screen.getByText('-100%')).toBeInTheDocument()
    })

    it('shows positive trend in red', () => {
        const entries: CalorieEntry[] = [
            // Recent entries (first 7 days) - high calories (2000 per day)
            { date: '2025-02-16', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 },
            { date: '2025-02-15', meal_type: 'Breakfast' as MealType, meal_name: 'Feast', calories: 2000 }
        ]

        render(<CalorieList initialData={{ entries, overallAverage: 1500 }} />)
        const trendElement = screen.getByText('+33.3%')
        expect(trendElement).toHaveClass('text-red-600')
    })

    it('shows negative trend in green', () => {
        const entries: CalorieEntry[] = [
            // Recent entries (first 7 days) - low calories (1000 per day)
            { date: '2025-02-16', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 1000 },
            { date: '2025-02-15', meal_type: 'Breakfast' as MealType, meal_name: 'Light', calories: 1000 }
        ]

        render(<CalorieList initialData={{ entries, overallAverage: 1500 }} />)
        const trendElement = screen.getByText('-33.3%')
        expect(trendElement).toHaveClass('text-green-600')
    })

    it('sorts entries by date in descending order', () => {
        render(<CalorieList initialData={{ entries: mockEntries, overallAverage: 1500 }} />)
        
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

    it('shows all stat displays', () => {
        render(<CalorieList initialData={{ entries: mockEntries, overallAverage: 1500 }} />)

        // Check for stat displays
        expect(screen.getByText('7 Day Avg:')).toBeInTheDocument()
        expect(screen.getByText('Overall Avg:')).toBeInTheDocument()
        expect(screen.getByText('7-Day Trend:')).toBeInTheDocument()
        expect(screen.getByText('Target:')).toBeInTheDocument()
    })
}) 