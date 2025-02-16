import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatsSummary } from '../ui/stats-summary'
import { TARGET_CALORIES, MAX_TDEE_CALORIES } from '@/lib/calorieUtils'

describe('StatsSummary', () => {
    const defaultProps = {
        dayTotal: 2000,
        avgCalories: 2200,
        percentDiff: -9.1,
        isHighest: false,
        isLowest: false,
        mealTypeComparison: [
            {
                type: 'Breakfast',
                dayTotal: 500,
                rangeAvg: 550,
                diff: -50
            }
        ]
    }

    it('renders with all required props', () => {
        render(<StatsSummary {...defaultProps} />)
        
        // Check for main sections
        expect(screen.getByText('7-Day Avg:')).toBeInTheDocument()
        expect(screen.getByText('vs Average:')).toBeInTheDocument()
        expect(screen.getByText('Meal Type Analysis')).toBeInTheDocument()
    })

    it('displays 7-day average with correct color when below target', () => {
        const props = {
            ...defaultProps,
            avgCalories: TARGET_CALORIES - 200
        }
        render(<StatsSummary {...props} />)
        
        const avgValue = screen.getByText(`${Math.round(props.avgCalories)} cal`)
        expect(avgValue).toHaveClass('font-medium', 'text-green-600')
    })

    it('displays 7-day average with correct color when above target', () => {
        const props = {
            ...defaultProps,
            avgCalories: TARGET_CALORIES + 200
        }
        render(<StatsSummary {...props} />)
        
        const avgValue = screen.getByText(`${Math.round(props.avgCalories)} cal`)
        expect(avgValue).toHaveClass('font-medium', 'text-red-600')
    })

    it('displays 7-day average with correct color when above max TDEE', () => {
        const props = {
            ...defaultProps,
            avgCalories: MAX_TDEE_CALORIES + 100
        }
        render(<StatsSummary {...props} />)
        
        const avgValue = screen.getByText(`${Math.round(props.avgCalories)} cal`)
        expect(avgValue).toHaveClass('font-medium', 'text-red-600')
    })

    it('formats percentage differences correctly', () => {
        const props = {
            ...defaultProps,
            percentDiff: 15.5
        }
        render(<StatsSummary {...props} />)
        
        expect(screen.getByText('+15.5%')).toBeInTheDocument()
    })

    it('shows highest/lowest day badges when applicable', () => {
        const props = {
            ...defaultProps,
            isHighest: true,
            isLowest: true
        }
        render(<StatsSummary {...props} />)
        
        expect(screen.getByText('Highest Day')).toBeInTheDocument()
        expect(screen.getByText('Lowest Day')).toBeInTheDocument()
    })

    it('displays meal type comparisons with correct colors', () => {
        const props = {
            ...defaultProps,
            mealTypeComparison: [
                {
                    type: 'Breakfast',
                    dayTotal: 600,
                    rangeAvg: 500,
                    diff: 100
                },
                {
                    type: 'Lunch',
                    dayTotal: 400,
                    rangeAvg: 500,
                    diff: -100
                }
            ]
        }
        render(<StatsSummary {...props} />)
        
        // Check for positive difference (red)
        const positivePercent = screen.getByText('+20%')
        expect(positivePercent).toHaveClass('text-red-600')
        
        // Check for negative difference (green)
        const negativePercent = screen.getByText('-20%')
        expect(negativePercent).toHaveClass('text-green-600')
    })

    it('renders progress bars with correct widths', () => {
        const props = {
            ...defaultProps,
            mealTypeComparison: [
                {
                    type: 'Breakfast',
                    dayTotal: 750,
                    rangeAvg: 500,
                    diff: 250
                }
            ]
        }
        render(<StatsSummary {...props} />)
        
        // Progress bar should be at 100% since dayTotal is 150% of rangeAvg
        const progressBar = document.querySelector('.bg-purple-500')
        expect(progressBar).toHaveStyle({ width: '100%' })
    })
}) 